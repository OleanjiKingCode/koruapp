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

  // Check for existing entry by email
  const { data: byEmail, error: emailCheckError } = await supabase
    .from("waitlist")
    .select("id")
    .eq("email", email)
    .limit(1);

  if (emailCheckError) {
    console.error("joinWaitlist email check error:", emailCheckError);
    throw new Error(emailCheckError.message);
  }

  if (byEmail && byEmail.length > 0) {
    return { data: null, duplicate: true };
  }

  // Check for existing entry by twitter handle
  const { data: byHandle } = await supabase
    .from("waitlist")
    .select("id")
    .ilike("twitter_handle", handle)
    .limit(1);

  if (byHandle && byHandle.length > 0) {
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
    // Unique constraint violation = duplicate that slipped through race condition
    if (error.code === "23505") {
      return { data: null, duplicate: true };
    }
    console.error("joinWaitlist insert error:", error);
    throw new Error(error.message);
  }

  return { data, duplicate: false };
}
