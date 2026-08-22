import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

function getBrowserEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )?.trim();

  const missing: string[] = [];
  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) {
    missing.push(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)",
    );
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing ${missing.join(" and ")}. In Vercel → Settings → Environment Variables, add them for Production, then Deployments → Redeploy with “Use existing Build Cache” turned OFF.`,
    );
  }

  return { supabaseUrl: supabaseUrl!, supabaseAnonKey: supabaseAnonKey! };
}

/**
 * Browser client for Client Components (uses cookies via @supabase/ssr).
 */
export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = getBrowserEnv();
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/** Lazy shared client — avoids crashing at import time during builds */
let _supabase: SupabaseClient | null = null;

function getSharedClient(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient();
  }
  return _supabase;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSharedClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
