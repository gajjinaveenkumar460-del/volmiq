"use client";

import { useState } from "react";
import type { Answer } from "@/types/answer";
import { AnswerComments } from "@/components/posts/AnswerComments";
import { VoteButtons } from "@/components/posts/VoteButtons";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  IconCheckCircle,
  IconEdit,
  IconTrash,
  IconUser,
} from "@/components/ui/Icons";
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
      setError("Please write an answer first.");
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
          ? "vol-card list-none border-2 border-[var(--purple)] p-4 ring-1 ring-[var(--purple-soft)]"
          : "vol-card list-none p-4"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="inline-flex items-center gap-1 text-[12px] text-[var(--muted)]">
            <IconUser className="h-3 w-3" />
            {answer.authorName} · {answer.createdAt}
          </p>
          {isAccepted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[var(--violet,#7c3aed)] to-[var(--pink,#ec4899)] px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
              <IconCheckCircle className="h-3 w-3" />
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
                  ? "inline-flex items-center gap-1 rounded-full border border-[var(--purple)] bg-[var(--purple-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--purple)] disabled:opacity-60"
                  : "inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-semibold text-[var(--ink)] transition hover:border-[var(--purple)]/40 hover:bg-[var(--purple-soft)]/50 hover:text-[var(--purple)] disabled:opacity-60"
              }
            >
              <IconCheckCircle className="h-3.5 w-3.5" />
              {isAccepted ? "Unaccept" : "Accept"}
            </button>
          )}
          {isOwner && !editing && (
            <>
              <button
                type="button"
                onClick={startEdit}
                disabled={busy}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-semibold text-[var(--ink)] transition hover:border-[var(--purple)]/40 hover:bg-[var(--purple-soft)]/50 hover:text-[var(--purple)] disabled:opacity-60"
              >
                <IconEdit className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-[var(--surface)] px-2.5 py-1 text-[11px] font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                <IconTrash className="h-3.5 w-3.5" />
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
            onChange={(e) => {
              setBody(e.target.value);
              if (error) setError(null);
            }}
            disabled={busy}
            rows={4}
            className={[
              "w-full resize-y rounded-xl border bg-[var(--paper)] px-3 py-2.5 text-[14px] text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--purple)]/20 disabled:opacity-60",
              error
                ? "border-red-400 focus:border-red-400"
                : "border-[var(--line)] focus:border-[var(--purple)]",
            ].join(" ")}
          />
          {error && (
            <p className="mt-1.5 text-[12px] font-medium text-red-600">
              {error}
            </p>
          )}
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
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

      {error && !editing && (
        <p className="mt-2 text-[12px] font-medium text-red-600">{error}</p>
      )}

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
