import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ecqijtbyfgbwczjvncbk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjcWlqdGJ5Zmdid2N6anZuY2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMTc0MjAsImV4cCI6MjA4MTc5MzQyMH0.zV8X49FEj-9uDmJl2BDlBnil6Zd3z3_WRsotnR2A3_w';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
