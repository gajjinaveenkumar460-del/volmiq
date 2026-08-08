"use client";

import { useState } from "react";
import type { Answer } from "@/types/answer";
import { AnswerComments } from "@/components/posts/AnswerComments";
import { VoteButtons } from "@/components/posts/VoteButtons";
import { useAuth } from "@/components/providers/AuthProvider";
import { deleteAnswer, updateAnswer } from "@/lib/supabase/answers";

type AnswerItemProps = {
  answer: Answer;
  isAccepted: boolean;
  /** Question author can accept / unaccept */
  canAccept: boolean;
  onUpdated: (answer: Answer) => void;
  onDeleted: (answerId: string) => void;
  onScoreChange: (answerId: string, score: number) => void;
  onToggleAccept: (answerId: string) => Promise<void>;
};

/**
 * One answer card: body, votes, accept, owner edit/delete, comments.
 */
export function AnswerItem({
  answer,
  isAccepted,
  canAccept,
  onUpdated,
  onDeleted,
  onScoreChange,
  onToggleAccept,
}: AnswerItemProps) {
  const { user } = useAuth();
  const isOwner = Boolean(
    user && answer.authorId && user.id === answer.authorId,
  );

  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(answer.body);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setBody(answer.body);
    setError(null);
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) {
      alert("Please write an answer first.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const updated = await updateAnswer(answer.id, { body: text });
      onUpdated(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    const ok = window.confirm(
      "Delete this answer? Comments under it may also be removed. This cannot be undone.",
    );
    if (!ok) return;

    setBusy(true);
    setError(null);
    try {
      await deleteAnswer(answer.id);
      onDeleted(answer.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setBusy(false);
    }
  }

  async function handleAccept() {
    setBusy(true);
    setError(null);
    try {
      await onToggleAccept(answer.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update accept");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li
      className={
        isAccepted
          ? "rounded-2xl border-2 border-[var(--purple)] bg-white p-4 shadow-sm shadow-[var(--purple)]/10"
          : "rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm shadow-[var(--purple)]/5"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[12px] text-[var(--muted)]">
            {answer.authorName} · {answer.createdAt}
          </p>
          {isAccepted && (
            <span className="inline-flex items-center rounded-full bg-[var(--purple-soft)] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[var(--purple)] uppercase">
              Accepted
            </span>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {canAccept && !editing && (
            <button
              type="button"
              onClick={handleAccept}
              disabled={busy}
              className={
                isAccepted
                  ? "rounded-full border border-[var(--purple)] bg-[var(--purple-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--purple)] disabled:opacity-60"
                  : "rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--ink)] transition hover:border-[var(--purple)]/40 hover:bg-[var(--purple-soft)]/50 hover:text-[var(--purple)] disabled:opacity-60"
              }
            >
              {isAccepted ? "Unaccept" : "Accept"}
            </button>
          )}
          {isOwner && !editing && (
            <>
              <button
                type="button"
                onClick={startEdit}
                disabled={busy}
                className="rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--ink)] transition hover:border-[var(--purple)]/40 hover:bg-[var(--purple-soft)]/50 hover:text-[var(--purple)] disabled:opacity-60"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="rounded-full border border-red-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                {busy ? "…" : "Delete"}
              </button>
            </>
          )}
        </div>
      </div>

      {!editing ? (
        <p className="mt-2 text-[14px] leading-relaxed whitespace-pre-wrap text-[var(--ink)]">
          {answer.body}
        </p>
      ) : (
        <form onSubmit={handleSave} className="mt-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={busy}
            rows={4}
            className="w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-[14px] text-[var(--ink)] outline-none focus:border-[var(--purple)] focus:ring-2 focus:ring-[var(--purple)]/20 disabled:opacity-60"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={busy}
              className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-[var(--muted)] transition hover:bg-[var(--purple-soft)] hover:text-[var(--purple)] disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-[var(--purple)] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[var(--purple-deep)] disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {!editing && (
        <div className="mt-3">
          <VoteButtons
            targetType="answer"
            targetId={answer.id}
            initialScore={answer.upvotes}
            variant="inline"
            onScoreChange={(score) => onScoreChange(answer.id, score)}
          />
        </div>
      )}

      <AnswerComments answerId={answer.id} />
    </li>
  );
}
