"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { MyVote, VoteTargetType } from "@/types/vote";
import { useAuth } from "@/components/providers/AuthProvider";
import { loginWithNext } from "@/lib/auth/safeNextPath";
import { castVote, getMyVote } from "@/lib/supabase/votes";

type VoteButtonsProps = {
  targetType: VoteTargetType;
  targetId: string;
  initialScore: number;
  /** "column" = feed card; "inline" = answer / comment / detail */
  variant?: "column" | "inline";
  className?: string;
  /** Called after a successful vote with the new score */
  onScoreChange?: (score: number) => void;
};

export function VoteButtons({
  targetType,
  targetId,
  initialScore,
  variant = "column",
  className = "",
  onScoreChange,
}: VoteButtonsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [score, setScore] = useState(initialScore);
  const [myVote, setMyVote] = useState<MyVote>(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setScore(initialScore);
  }, [initialScore, targetId]);

  useEffect(() => {
    let cancelled = false;

    async function loadMine() {
      if (!user) {
        if (!cancelled) setMyVote(0);
        return;
      }
      try {
        const v = await getMyVote(targetType, targetId);
        if (!cancelled) setMyVote(v);
      } catch {
        if (!cancelled) setMyVote(0);
      }
    }

    loadMine();
    return () => {
      cancelled = true;
    };
  }, [targetType, targetId, user]);

  async function handleVote(value: 1 | -1, e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    if (busy) return;

    if (!user) {
      const next =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/";
      router.push(loginWithNext(next));
      return;
    }

    setBusy(true);
    try {
      const result = await castVote(targetType, targetId, value);
      setScore(result.score);
      setMyVote(result.myVote);
      onScoreChange?.(result.score);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Vote failed");
    } finally {
      setBusy(false);
    }
  }

  const upActive = myVote === 1;
  const downActive = myVote === -1;

  if (variant === "inline") {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        <button
          type="button"
          disabled={busy}
          onClick={(e) => handleVote(1, e)}
          aria-label="Upvote"
          aria-pressed={upActive}
          className={
            upActive
              ? "flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--purple-soft)] text-[var(--purple)] disabled:opacity-60"
              : "flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--purple-soft)] hover:text-[var(--purple)] disabled:opacity-60"
          }
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <span className="min-w-[1.5rem] text-center text-[12px] font-bold tabular-nums text-[var(--purple)]">
          {score}
        </span>
        <button
          type="button"
          disabled={busy}
          onClick={(e) => handleVote(-1, e)}
          aria-label="Downvote"
          aria-pressed={downActive}
          className={
            downActive
              ? "flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--purple-soft)] text-[var(--purple)] disabled:opacity-60"
              : "flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--purple-soft)] hover:text-[var(--purple)] disabled:opacity-60"
          }
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex w-10 shrink-0 flex-col items-center gap-1 pt-0.5 ${className}`}
    >
      <button
        type="button"
        disabled={busy}
        onClick={(e) => handleVote(1, e)}
        aria-label="Upvote"
        aria-pressed={upActive}
        className={
          upActive
            ? "flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--purple-soft)] text-[var(--purple)] disabled:opacity-60"
            : "flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--purple-soft)] hover:text-[var(--purple)] disabled:opacity-60"
        }
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <span className="text-sm font-bold tabular-nums text-[var(--purple)]">
        {score}
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={(e) => handleVote(-1, e)}
        aria-label="Downvote"
        aria-pressed={downActive}
        className={
          downActive
            ? "flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--purple-soft)] text-[var(--purple)] disabled:opacity-60"
            : "flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--purple-soft)] hover:text-[var(--purple)] disabled:opacity-60"
        }
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}

function ChevronUp({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 14 6-6 6 6" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 10 6 6 6-6" />
    </svg>
  );
}
