import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy initialization of Supabase client (server-side only)
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  if (typeof window === "undefined") {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables.",
      );
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseInstance;
  }

  throw new Error(
    "Supabase client can only be used on the server side. Use API routes instead.",
  );
}

const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

// =============================================
// WAITLIST
// =============================================

export interface WaitlistEntry {
  id: string;
  name: string;
  twitter_handle: string;
  email: string;
  dream_conversation: string | null;
  heard_from: string;
  notes: string | null;
  created_at: string;
}

export async function joinWaitlist(entry: {
  name: string;
  twitter_handle: string;
  email: string;
  dream_conversation?: string | null;
  heard_from: string;
  notes?: string | null;
}): Promise<{ data: WaitlistEntry | null; duplicate: boolean }> {
  const handle = entry.twitter_handle.toLowerCase().replace(/^@/, "");
  const email = entry.email.toLowerCase().trim();

  // Check for existing entry by email or twitter handle
  const { data: existing } = await supabase
    .from("waitlist")
    .select("id")
    .or(`email.eq.${email},twitter_handle.ilike.${handle}`)
    .limit(1);

  if (existing && existing.length > 0) {
    return { data: null, duplicate: true };
  }

  const { data, error } = await supabase
    .from("waitlist")
    .insert({
      name: entry.name.trim(),
      twitter_handle: handle,
      email,
      dream_conversation: entry.dream_conversation?.trim() || null,
      heard_from: entry.heard_from,
      notes: entry.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error("joinWaitlist error:", error);
    return { data: null, duplicate: false };
  }

  return { data, duplicate: false };
}
