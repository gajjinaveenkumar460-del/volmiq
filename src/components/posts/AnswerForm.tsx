"use client";

import { useEffect, useState } from "react";
import { IconAnswers, IconSend } from "@/components/ui/Icons";
import {
  clearDraft,
  draftKeys,
  loadDraft,
  saveDraft,
  type BodyDraft,
} from "@/lib/drafts";

type AnswerFormProps = {
  postId: string;
  /**
   * Parent creates the answer (or saves draft + redirects to login).
   * Return true only if the answer was actually posted.
   */
  onAddAnswer: (text: string) => Promise<boolean>;
};

export function AnswerForm({ postId, onAddAnswer }: AnswerFormProps) {
  const key = draftKeys.answer(postId);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const draft = loadDraft<BodyDraft>(key);
    if (draft?.body) {
      setBody(draft.body);
      setRestored(true);
    }
  }, [key]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) {
      setError("Please write an answer first.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Save draft before parent runs (covers login redirect without clear)
      saveDraft(key, { body: text });
      const posted = await onAddAnswer(text);
      if (posted) {
        clearDraft(key);
        setBody("");
        setRestored(false);
      }
      // if !posted → login redirect; keep text + draft
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post answer");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="vol-card mt-6 p-4 sm:p-5"
      id="write-answer"
    >
      <h3 className="inline-flex items-center gap-2 text-[14px] font-bold tracking-tight text-[var(--ink)]">
        <IconAnswers className="h-4 w-4 text-[var(--purple)]" />
        Write an answer
      </h3>
      <p className="mt-1 text-[12px] text-[var(--muted)]">
        Share a clear, helpful reply to this question.
      </p>
      {restored && body && (
        <p className="mt-2 text-[12px] font-medium text-[var(--purple)]">
          Draft restored — review and post when ready.
        </p>
      )}

      <textarea
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          if (error) setError(null);
        }}
        disabled={submitting}
        rows={4}
        placeholder="Share a helpful answer…"
        className={[
          "mt-3 w-full resize-y rounded-xl border bg-[var(--paper)] px-3 py-2.5 text-[14px] text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:ring-2 focus:ring-[var(--purple)]/20 disabled:opacity-60",
          error
            ? "border-red-400 focus:border-red-400"
            : "border-[var(--line)] focus:border-[var(--purple)]",
        ].join(" ")}
      />

      {error && (
        <p className="mt-1.5 text-[12px] font-medium text-red-600">{error}</p>
      )}

      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="vol-btn-primary inline-flex h-9 items-center gap-1.5 px-4 disabled:opacity-60"
        >
          <IconSend className="h-3.5 w-3.5" />
          {submitting ? "Posting…" : "Post answer"}
        </button>
      </div>
    </form>
  );
}
