import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create and export Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
});

// Function to check if Supabase is properly configured
export const checkSupabaseConnection = async () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase credentials not found in environment variables');
      return { 
        success: false, 
        message: 'Using local data mode - Supabase credentials not configured',
        isConfigError: true
      };
    }
    
    // Test the connection with a lightweight query
    const { error } = await supabase.from('players').select('count', { count: 'exact', head: true });
    
    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }
    
    return { success: true, message: 'Supabase connection successful' };
  } catch (error) {
    console.error('Supabase connection failed:', error);
    return { 
      success: false, 
      message: 'Unable to connect to Supabase. Using local data mode.', 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
};

// Helper function to determine if we should use local data
export const isUsingLocalData = async (): Promise<boolean> => {
  const connectionResult = await checkSupabaseConnection();
  return !connectionResult.success;
};