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
      console.error('Supabase query failed:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Handle specific error types
      if (error.code === 'PGRST301' || error.message?.includes('JWT expired') || error.message?.includes('JWT')) {
        return {
          success: false,
          message: 'Authentication failed - Invalid or expired API key. Please check your Supabase credentials.',
          isConfigError: true
        };
      }
      
      if (error.code === 'PGRST116') {
        return {
          success: false,
          message: 'Database table not found - Database schema may not be properly set up.',
          isConfigError: true
        };
      }
      
      if (error.code === 'PGRST000') {
        return {
          success: false,
          message: 'Database connection failed - Unable to reach Supabase database.',
          isConfigError: false
        };
      }
      
      // Generic error with more details
      const errorMessage = error.message || 'Unknown database error';
      const errorCode = error.code || 'UNKNOWN';
      const errorHint = error.hint ? ` Hint: ${error.hint}` : '';
      
      throw new Error(`Supabase query failed: ${errorMessage} (Code: ${errorCode})${errorHint}`);
    }
    
    console.info('Supabase connection successful - Database is accessible');
    return { success: true, message: 'Supabase connection successful' };
  } catch (error) {
    console.error('Supabase connection failed:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Handle network errors
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return { 
          success: false, 
          message: 'Network error - Unable to connect to Supabase. Check your internet connection and Supabase URL.', 
          error: error.message,
          isConfigError: false
        };
      }
      
      if (error.message.includes('Failed to fetch')) {
        return { 
          success: false, 
          message: 'Connection timeout - Supabase server is unreachable. Verify your Supabase URL and try again.', 
          error: error.message,
          isConfigError: false
        };
      }
      
      if (error.message.includes('Invalid API key') || error.message.includes('401')) {
        return { 
          success: false, 
          message: 'Authentication failed - Invalid Supabase API key. Please check your credentials in the .env file.', 
          error: error.message,
          isConfigError: true
        };
      }
    }
    
    return { 
      success: false, 
      message: 'Supabase connection failed - Please check your configuration and try again. Running in demo mode.', 
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