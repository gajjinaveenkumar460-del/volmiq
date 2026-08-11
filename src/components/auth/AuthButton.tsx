"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { IconSignIn, IconSignOut, IconUser } from "@/components/ui/Icons";
import { loginWithNext } from "@/lib/auth/safeNextPath";

/**
 * Header auth cluster (after Ask).
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
      <span className="inline-flex h-10 min-w-[4.5rem] items-center justify-center rounded-full px-3 text-[12px] text-[var(--muted)]">
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
          href="/my"
          className="inline-flex h-10 max-w-[8.5rem] items-center gap-1.5 truncate rounded-full border border-[var(--line)] bg-white px-3 text-[12px] font-semibold text-[var(--ink)] no-underline shadow-sm transition hover:border-[var(--purple)]/30 hover:bg-[var(--purple-soft)]"
          title="My activity"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--violet,#7c3aed)] to-[var(--pink,#ec4899)] text-white">
            <IconUser className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">@{username}</span>
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[var(--line)] bg-white px-3 text-[12px] font-semibold tracking-wide text-[var(--ink-soft)] shadow-sm transition hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
        >
          <IconSignOut className="h-[18px] w-[18px] shrink-0 text-[#b91c1c]" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    );
  }

  const signInHref =
    pathname === "/login" ? "/login" : loginWithNext(pathname || "/");

  return (
    <Link
      href={signInHref}
      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[var(--purple)]/25 bg-white px-3.5 text-[12px] font-semibold tracking-wide text-[var(--purple)] no-underline shadow-sm transition hover:bg-[var(--purple-soft)]"
    >
      <IconSignIn className="h-[18px] w-[18px] shrink-0 text-[#15803d]" />
      Sign in
    </Link>
  );
}
