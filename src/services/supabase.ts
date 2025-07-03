import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are properly configured (not placeholder values)
const hasValidCredentials = () => {
  return supabaseUrl && 
         supabaseAnonKey && 
         supabaseUrl.includes('supabase.co');
};

// Create Supabase client only if we have valid credentials
export const supabase = (() => {
  try {
    if (!hasValidCredentials()) {
      console.warn('Using demo mode: Supabase credentials missing or invalid');
      return null;
    }
    
    // Prepend https:// if not present
    const formattedUrl = supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`;
    
    return createClient(formattedUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      }
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
})();

// Function to check if Supabase is properly configured and connected
export const checkSupabaseConnection = async () => {
  try {
    // First check if we have valid credentials
    if (!hasValidCredentials()) {
      console.warn('Supabase credentials missing or invalid - using demo mode');
      return { 
        success: false, 
        message: 'Supabase not configured - running in demo mode',
        isConfigError: true
      };
    }

    if (!supabase) {
      return { 
        success: false, 
        message: 'Supabase client not initialized - running in demo mode',
        isConfigError: true
      };
    }
    
    // Test the connection with a lightweight query
    const { error } = await supabase.from('players').select('id', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase query failed:', error);
      
      // Handle specific error types
      if (error.message?.includes('Invalid API key') || error.message?.includes('JWT')) {
        return {
          success: false,
          message: 'Invalid Supabase API key - check your credentials',
          isConfigError: true
        };
      }
      
      throw new Error(`Supabase query failed: ${error.message} (${error.code || 'unknown'})`);
    }
    
    console.info('Supabase connection successful - Database is accessible');
    return { success: true, message: 'Supabase connection successful' };
  } catch (error) {
    console.error('Supabase connection failed:', error);
    return { 
      success: false, 
      message: 'Unable to connect to Supabase - running in demo mode', 
      error: error instanceof Error ? error.message : String(error),
      isConfigError: false
    };
  }
};

// Helper function to determine if we should use local data
export const isUsingLocalData = async (): Promise<boolean> => {
  const connectionResult = await checkSupabaseConnection();
  return !connectionResult.success;
};

// Helper function to safely execute Supabase operations
export const safeSupabaseOperation = async <T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> => {
  if (!supabase || !(await isUsingLocalData() === false)) {
    return fallback;
  }
  
  try {
    return await operation();
  } catch (error) {
    console.error('Supabase operation failed, using fallback:', error);
    return fallback;
  }
};