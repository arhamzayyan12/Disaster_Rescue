import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
    id: string
    name: string
    email: string
    avatarUrl?: string
    role: 'victim' | 'volunteer'
    createdAt: string
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    signInWithGoogle: () => Promise<void>
    logout: () => Promise<void>
    loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    // Map Supabase user to our internal User interface
    const mapUser = (supabaseUser: SupabaseUser | null): User | null => {
        if (!supabaseUser) return null
        return {
            id: supabaseUser.id,
            name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || 'User',
            email: supabaseUser.email || '',
            avatarUrl: supabaseUser.user_metadata?.avatar_url,
            // Default to volunteer if not specified, user can toggle in dashboard
            role: supabaseUser.user_metadata?.role || 'volunteer',
            createdAt: supabaseUser.created_at
        }
    }

    useEffect(() => {
        // Check active sessions and sets the user
        const getSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession()
            if (error) {
                console.error('Error fetching session:', error)
            }
            setUser(mapUser(session?.user || null))
            setLoading(false)
        }

        getSession()

        // Listen for changes on auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(mapUser(session?.user || null))
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                    redirectTo: window.location.origin, // Redirects back to the current domain
                },
            })
            if (error) throw error
        } catch (error) {
            console.error('Google login failed:', error)
            throw error
        }
    }

    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            setUser(null)
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        signInWithGoogle,
        logout,
        loading
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
