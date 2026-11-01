import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;
let clientPromise: Promise<SupabaseClient> | null = null;

// Fallback config placeholder for local testing without network
const DEFAULT_URL = 'https://placeholder.supabase.co';
const DEFAULT_ANON_KEY = 'public-anon-key-placeholder';

/**
 * Loads Supabase public configuration at runtime from the backend server or window.__CONFIG__.
 * Crucial Rule: Never hardcode or inline JWT tokens into client bundles, preserving zero-secret compliance.
 */
export async function getSupabase(): Promise<SupabaseClient> {
  if (cachedClient) {
    return cachedClient;
  }

  if (clientPromise) {
    return clientPromise;
  }

  clientPromise = (async () => {
    let url = DEFAULT_URL;
    let key = DEFAULT_ANON_KEY;

    try {
      const winConfig = (window as any)?.__JAANCH_CONFIG__;
      if (winConfig?.supabaseUrl && winConfig?.supabaseAnonKey) {
        url = winConfig.supabaseUrl;
        key = winConfig.supabaseAnonKey;
      } else {
        const res = await fetch('/api/config');
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.supabaseUrl && json?.data?.supabaseAnonKey) {
            url = json.data.supabaseUrl;
            key = json.data.supabaseAnonKey;
          }
        }
      }
    } catch {
      // In offline tests or when server is unavailable, fallback to default placeholder
    }

    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    return cachedClient;
  })();

  return clientPromise;
}

/**
 * Synchronous client proxy forwarding auth calls to the dynamically initialized client.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: keyof SupabaseClient) {
    if (prop === 'auth') {
      return {
        async getSession() {
          const client = await getSupabase();
          return client.auth.getSession();
        },
        async getUser(token?: string) {
          const client = await getSupabase();
          return client.auth.getUser(token);
        },
        async signInWithPassword(credentials: any) {
          const client = await getSupabase();
          return client.auth.signInWithPassword(credentials);
        },
        async signUp(credentials: any) {
          const client = await getSupabase();
          return client.auth.signUp(credentials);
        },
        async signOut() {
          const client = await getSupabase();
          return client.auth.signOut();
        },
        onAuthStateChange(callback: any) {
          let subscription: any = null;
          getSupabase().then((client) => {
            subscription = client.auth.onAuthStateChange(callback).data.subscription;
          });
          return {
            data: {
              subscription: {
                unsubscribe: () => {
                  subscription?.unsubscribe();
                },
              },
            },
          };
        },
      };
    }

    return async (...args: any[]) => {
      const client = await getSupabase();
      return (client as any)[prop](...args);
    };
  },
});
