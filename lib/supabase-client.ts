import { createClient } from "@supabase/supabase-js";

// Client-side Supabase client for real-time subscriptions
// Uses public environment variables that are exposed to the browser

let supabaseClientInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "Supabase client-side credentials not found. Real-time features will be disabled."
    );
    return null;
  }

  supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  return supabaseClientInstance;
}

// Export type for the client
export type SupabaseClient = ReturnType<typeof createClient>;


