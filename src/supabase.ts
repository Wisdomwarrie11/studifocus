import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = "https://strogenqruolpqdbitob.supabase.co";
  const supabaseAnonKey = "sb_publishable_ohMiJ8dJjT3OuI8HUw09Sw_Srm7VSPS";

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL and Anon Key are missing. Supabase features will be disabled.');
    return null;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    return null;
  }
};

// Proxy to handle cases where supabase is used directly
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    const instance = getSupabase();
    if (!instance) {
      return () => {
        console.warn(`Supabase is not initialized. Cannot access ${String(prop)}`);
        return Promise.reject(new Error('Supabase not initialized'));
      };
    }
    return (instance as any)[prop];
  }
});
