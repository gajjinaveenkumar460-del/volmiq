"use client";

import type { ReactNode } from "react";

/**
 * Root client providers.
 * PostsProvider removed — posts come from Supabase only.
 * Add AuthProvider etc. here later when needed.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
