"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

/**
 * Header auth cluster (after Ask):
 * - Logged out: [ Sign in ]
 * - Logged in:  [ @username ] [ Sign out ]
 */
export function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <span className="inline-flex h-9 min-w-[4.5rem] items-center justify-center rounded-full border border-transparent px-3 text-[12px] text-[var(--muted)]">
        …
      </span>
    );
  }

  if (user) {
    const username =
      user.email?.split("@")[0] ?? user.email ?? "you";

    return (
      <div className="flex items-center gap-2">
        <span
          className="inline-flex h-9 max-w-[7.5rem] items-center truncate rounded-full border border-[var(--line)] bg-[var(--purple-soft)]/60 px-3 text-[12px] font-semibold text-[var(--purple-deep)]"
          title={user.email ?? undefined}
        >
          @{username}
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--line)] bg-white px-3.5 text-[12px] font-semibold tracking-wide text-[var(--ink)] transition hover:border-[var(--purple)]/40 hover:bg-[var(--purple-soft)]/50 hover:text-[var(--purple)]"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--purple)]/30 bg-white px-3.5 text-[12px] font-semibold tracking-wide text-[var(--purple)] no-underline transition hover:border-[var(--purple)] hover:bg-[var(--purple-soft)]"
    >
      Sign in
    </Link>
  );
}
