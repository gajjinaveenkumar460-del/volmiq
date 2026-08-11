"use client";

import { useEffect, useState } from "react";
import { IconSend } from "@/components/ui/Icons";
import {
  clearDraft,
  loadDraft,
  saveDraft,
  type BodyDraft,
} from "@/lib/drafts";

type CommentFormProps = {
  placeholder?: string;
  submitLabel?: string;
  /**
   * Return true only if the comment was actually posted.
   * false = login redirect / cancelled — keep draft + text.
   */
  onSubmit: (body: string) => Promise<boolean>;
  onCancel?: () => void;
  compact?: boolean;
  /** sessionStorage key — restores draft after login */
  draftKey?: string;
};

export function CommentForm({
  placeholder = "Write a comment…",
  submitLabel = "Comment",
  onSubmit,
  onCancel,
  compact = false,
  draftKey,
}: CommentFormProps) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    if (!draftKey) return;
    const draft = loadDraft<BodyDraft>(draftKey);
    if (draft?.body) {
      setBody(draft.body);
      setRestored(true);
    }
  }, [draftKey]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) {
      setError("Please write a comment first.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (draftKey) {
        saveDraft(draftKey, { body: text });
      }
      const posted = await onSubmit(text);
      if (posted) {
        if (draftKey) clearDraft(draftKey);
        setBody("");
        setRestored(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "mt-2" : "mt-3"}>
      {restored && body && (
        <p className="mb-1 text-[11px] font-medium text-[var(--purple)]">
          Draft restored
        </p>
      )}
      <textarea
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          if (error) setError(null);
        }}
        disabled={submitting}
        rows={compact ? 2 : 3}
        placeholder={placeholder}
        className={[
          "w-full resize-y rounded-xl border bg-[var(--paper)] px-3 py-2 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:ring-2 focus:ring-[var(--purple)]/20 disabled:opacity-60",
          error
            ? "border-red-400 focus:border-red-400"
            : "border-[var(--line)] focus:border-[var(--purple)]",
        ].join(" ")}
      />
      {error && (
        <p className="mt-1 text-[12px] font-medium text-red-600">{error}</p>
      )}
      <div className="mt-2 flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-[var(--muted)] transition hover:bg-[var(--purple-soft)] hover:text-[var(--purple)]"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1 rounded-full bg-[var(--purple)] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[var(--purple-deep)] disabled:opacity-60"
        >
          <IconSend className="h-3 w-3" />
          {submitting ? "Posting…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
