"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { MyReaction, VoteTargetType } from "@/types/vote";
import { useAuth } from "@/components/providers/AuthProvider";
import { useProvidedVote } from "@/components/posts/MyVotesProvider";
import {
  IconThumbsDown,
  IconThumbsUp,
} from "@/components/ui/Icons";
import { loginWithNext } from "@/lib/auth/safeNextPath";
import { castReaction, getMyReaction } from "@/lib/supabase/votes";

type VoteButtonsProps = {
  targetType: VoteTargetType;
  targetId: string;
  /** "column" = feed card; "inline" = answer / comment / detail */
  variant?: "column" | "inline";
  className?: string;
};

export function VoteButtons({
  targetType,
  targetId,
  variant = "column",
  className = "",
}: VoteButtonsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const providedVote = useProvidedVote(targetType, targetId);
  const [myReaction, setMyReaction] = useState<MyReaction>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const votedLocally = useRef(false);

  useEffect(() => {
    votedLocally.current = false;
  }, [targetType, targetId]);

  const userId = user?.id;

  useEffect(() => {
    if (providedVote === undefined) return;
    if (votedLocally.current) return;
    setMyReaction(providedVote);
  }, [providedVote, targetType, targetId]);

  useEffect(() => {
    if (providedVote !== undefined) return;

    let cancelled = false;

    async function loadMine() {
      if (!userId) {
        if (!cancelled) setMyReaction(null);
        return;
      }
      try {
        const reaction = await getMyReaction(targetType, targetId, userId);
        if (!cancelled) setMyReaction(reaction);
      } catch {
        if (!cancelled) setMyReaction(null);
      }
    }

    loadMine();
    return () => {
      cancelled = true;
    };
  }, [providedVote, targetType, targetId, userId]);

  async function handleReaction(
    reaction: Exclude<MyReaction, null>,
    e?: React.MouseEvent,
  ) {
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
    setError(null);
    try {
      const updatedReaction = await castReaction(targetType, targetId, reaction);
      votedLocally.current = true;
      setMyReaction(updatedReaction);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vote failed");
    } finally {
      setBusy(false);
    }
  }

  const likeActive = myReaction === "like";
  const dislikeActive = myReaction === "dislike";

  const btnBase =
    "flex items-center justify-center rounded-lg border border-transparent text-[var(--muted)] transition disabled:opacity-60";

  const likeBtnClass = likeActive
    ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
    : "hover:bg-[var(--paper)] hover:text-[var(--ink)]";

  const dislikeBtnClass = dislikeActive
    ? "bg-red-100 text-red-600 ring-1 ring-red-200 hover:bg-red-100"
    : "hover:bg-[var(--paper)] hover:text-[var(--ink)]";

  if (variant === "inline") {
    return (
      <div className={`inline-flex flex-col items-start gap-1 ${className}`}>
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            disabled={busy}
            onClick={(e) => handleReaction("like", e)}
            aria-label="Like"
            aria-pressed={likeActive}
            className={`${btnBase} ${likeBtnClass} h-7 w-7`}
          >
            <IconThumbsUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={(e) => handleReaction("dislike", e)}
            aria-label="Dislike"
            aria-pressed={dislikeActive}
            className={`${btnBase} ${dislikeBtnClass} h-7 w-7`}
          >
            <IconThumbsDown className="h-3.5 w-3.5" />
          </button>
        </div>
        {error && (
          <p className="max-w-[12rem] text-[11px] font-medium leading-snug text-red-600">
            {error}
          </p>
        )}
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
        onClick={(e) => handleReaction("like", e)}
        aria-label="Like"
        aria-pressed={likeActive}
        className={`${btnBase} ${likeBtnClass} h-8 w-8`}
      >
        <IconThumbsUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={(e) => handleReaction("dislike", e)}
        aria-label="Dislike"
        aria-pressed={dislikeActive}
        className={`${btnBase} ${dislikeBtnClass} h-8 w-8`}
      >
        <IconThumbsDown className="h-4 w-4" />
      </button>
      {error && (
        <p className="mt-0.5 max-w-[2.75rem] text-center text-[9px] font-medium leading-tight text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
