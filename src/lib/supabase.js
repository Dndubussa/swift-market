import { createBrowserClient } from '@supabase/ssr';
import { loggerService } from './services/loggerService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Validate Supabase configuration
 * @throws {Error} If required environment variables are missing
 */
function validateSupabaseConfig() {
  const errors = [];

  if (!supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not configured');
  } else if (!supabaseUrl.startsWith('https://')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL');
  }

  if (!supabaseAnonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured');
  } else if (supabaseAnonKey.length < 20) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid');
  }

  if (errors.length > 0) {
    const message = `Supabase configuration errors:\n- ${errors.join('\n- ')}\n\nPlease check CONFIGURATION.md for setup instructions.`;
    loggerService.critical('Supabase configuration validation failed', new Error(message), {
      operation: 'supabase_init',
      errors
    });
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Supabase is not properly configured');
    } else {
      console.warn(message);
    }
  }
}

// Validate configuration on import
if (typeof window !== 'undefined') {
  // Client-side validation
  validateSupabaseConfig();
}

/**
 * Browser client for Supabase
 * Used in client components for authentication and data fetching
 */
export const supabase = createBrowserClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

/**
 * Helper to create a client (alias for compatibility)
 */
export function createClient() {
  return supabase;
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * Get Supabase project URL
 */
export function getSupabaseUrl() {
  return supabaseUrl;
}

/**
 * Get Edge Function URL
 * @param {string} functionName - Name of the edge function
 */
export function getEdgeFunctionUrl(functionName) {
  if (!supabaseUrl) return null;
  return `${supabaseUrl}/functions/v1/${functionName}`;
}
