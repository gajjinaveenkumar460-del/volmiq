"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { loginWithNext } from "@/lib/auth/safeNextPath";

/**
 * Header auth cluster (after Ask):
 * - Logged out: [ Sign in ]
 * - Logged in:  [ @username ] [ Sign out ]
 */
export function AuthButton() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
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
        <Link
          href="/my-questions"
          className="inline-flex h-9 max-w-[7.5rem] items-center truncate rounded-full border border-[var(--line)] bg-[var(--purple-soft)]/60 px-3 text-[12px] font-semibold text-[var(--purple-deep)] no-underline transition hover:border-[var(--purple)]/40 hover:bg-[var(--purple-soft)]"
          title="My questions"
        >
          @{username}
        </Link>
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

  const signInHref =
    pathname === "/login" ? "/login" : loginWithNext(pathname || "/");

  return (
    <Link
      href={signInHref}
      className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--purple)]/30 bg-white px-3.5 text-[12px] font-semibold tracking-wide text-[var(--purple)] no-underline transition hover:border-[var(--purple)] hover:bg-[var(--purple-soft)]"
    >
      Sign in
    </Link>
  );
}
