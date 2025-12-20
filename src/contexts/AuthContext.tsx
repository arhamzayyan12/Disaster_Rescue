import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
    id: string
    name: string
    email: string
    role: 'victim' | 'volunteer'
    createdAt: string
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<boolean>
    signup: (userData: SignupData) => Promise<boolean>
    logout: () => void
    updateProfile: (userData: Partial<User>) => void
    loading: boolean
}

export interface SignupData {
    name: string
    email: string
    password: string
    role: 'victim' | 'volunteer'
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
            name: supabaseUser.user_metadata?.name || 'User',
            email: supabaseUser.email || '',
            role: supabaseUser.user_metadata?.role || 'victim',
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

    const signup = async (userData: SignupData): Promise<boolean> => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        name: userData.name,
                        role: userData.role
                    }
                }
            })

            if (error) throw error

            if (data.user) {
                setUser(mapUser(data.user))
                return true
            }
            return false
        } catch (error) {
            console.error('Signup failed:', error)
            return false
        }
    }

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) throw error

            if (data.user) {
                setUser(mapUser(data.user))
                return true
            }
            return false
        } catch (error) {
            console.error('Login failed:', error)
            return false
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

    const updateProfile = async (userData: Partial<User>) => {
        if (!user) return

        try {
            const { data, error } = await supabase.auth.updateUser({
                data: {
                    name: userData.name,
                    role: userData.role
                }
            })

            if (error) throw error

            if (data.user) {
                setUser(mapUser(data.user))
            }
        } catch (error) {
            console.error('Update profile failed:', error)
        }
    }

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile,
        loading
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
