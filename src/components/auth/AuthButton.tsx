"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { IconSignIn, IconSignOut, IconUser } from "@/components/ui/Icons";
import { loginWithNext } from "@/lib/auth/safeNextPath";

type AuthButtonProps = {
  /** Mobile: avatar + logout icons only (no @username chip) */
  compact?: boolean;
};

/**
 * Header auth cluster (after Ask).
 */
export function AuthButton({ compact = false }: AuthButtonProps) {
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
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[12px] text-[var(--muted)] sm:h-10 sm:min-w-[4.5rem] sm:w-auto sm:px-3">
        …
      </span>
    );
  }

  if (user) {
    const username =
      user.email?.split("@")[0] ?? user.email ?? "you";

    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Link
          href="/my"
          className={[
            "inline-flex items-center justify-center rounded-full border border-[var(--line)] bg-white text-[12px] font-semibold text-[var(--ink)] no-underline shadow-sm transition hover:border-[var(--purple)]/30 hover:bg-[var(--purple-soft)]",
            compact
              ? "h-9 w-9 sm:h-10 sm:w-auto sm:max-w-[8.5rem] sm:gap-1.5 sm:px-3"
              : "h-10 max-w-[8.5rem] gap-1.5 px-3",
          ].join(" ")}
          title={`@${username} — My activity`}
          aria-label={`My activity, @${username}`}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--violet,#7c3aed)] to-[var(--pink,#ec4899)] text-white">
            <IconUser className="h-3.5 w-3.5" />
          </span>
          <span
            className={
              compact ? "hidden truncate sm:inline" : "truncate"
            }
          >
            @{username}
          </span>
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className={[
            "inline-flex items-center justify-center rounded-full border border-[var(--line)] bg-white text-[12px] font-semibold tracking-wide text-[var(--ink-soft)] shadow-sm transition hover:border-[var(--line-strong)] hover:text-[var(--ink)]",
            compact
              ? "h-9 w-9 sm:h-10 sm:w-auto sm:gap-1.5 sm:px-3"
              : "h-10 gap-1.5 px-3",
          ].join(" ")}
          title="Sign out"
          aria-label="Sign out"
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
      className={[
        "inline-flex items-center justify-center rounded-full border border-[var(--purple)]/25 bg-white text-[12px] font-semibold tracking-wide text-[var(--purple)] no-underline shadow-sm transition hover:bg-[var(--purple-soft)]",
        compact
          ? "h-9 gap-1 px-2.5 sm:h-10 sm:gap-1.5 sm:px-3.5"
          : "h-10 gap-1.5 px-3.5",
      ].join(" ")}
    >
      <IconSignIn className="h-[18px] w-[18px] shrink-0 text-[#15803d]" />
      <span className={compact ? "hidden sm:inline" : undefined}>Sign in</span>
    </Link>
  );
}
