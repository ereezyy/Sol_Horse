import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Function to check if Supabase is properly configured
export const checkSupabaseConnection = async () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return { success: false, message: 'Supabase credentials not found in environment variables' };
    }
    
    // Test the connection by fetching a single row from the public.players table
    const { data, error, status } = await supabase
      .from('players')
      .select('id')
      .limit(1);
    
    if (error && status !== 406) {
      throw error;
    }
    
    return { success: true, message: 'Supabase connection successful' };
  } catch (error) {
    console.error('Supabase connection failed:', error);
    return { 
      success: false, 
      message: 'Supabase connection failed', 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
};