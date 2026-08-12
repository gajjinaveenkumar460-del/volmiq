import { createBrowserClient } from "@supabase/ssr";

function getBrowserEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL and a key (NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) in .env.local",
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

/**
 * Browser client for Client Components (uses cookies via @supabase/ssr).
 * Call createClient() in components when you need a fresh instance;
 * `supabase` is a shared browser client for existing data helpers.
 */
export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = getBrowserEnv();
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/** Shared browser client — keeps current imports working */
export const supabase = createClient();
