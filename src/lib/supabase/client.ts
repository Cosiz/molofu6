import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || url.trim() === '' || url === 'placeholder' || url.includes('your_supabase') || !url.startsWith('http')) {
      console.warn('[Molofu6] Supabase env vars not set — running in demo mode');
      return null;
    }
    _client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return _client;
}

// Legacy export for existing code
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    if (!client) {
      // Return no-op for demo mode
      if (prop === 'auth') {
        return {
          signInWithOtp: async () => ({ data: { session: null }, error: null }),
          verifyOtp: async () => ({ data: { user: null }, error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
          signOut: async () => ({ error: null }),
        };
      }
      if (prop === 'from') {
        return () => ({
          select: () => ({ data: [], error: null, eq: () => ({ data: [], error: null }) }),
          insert: () => ({ data: null, error: null, select: () => ({ single: () => ({ data: null, error: null }) }) }),
          update: () => ({ eq: () => ({ data: null, error: null }) }),
          delete: () => ({ eq: () => ({ data: null, error: null }) }),
        });
      }
      return () => ({ data: null, error: null });
    }
    return (client as any)?.[prop];
  },
});