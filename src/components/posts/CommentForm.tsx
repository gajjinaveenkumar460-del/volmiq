"use client";

import { useState } from "react";

type CommentFormProps = {
  placeholder?: string;
  submitLabel?: string;
  onSubmit: (body: string) => Promise<void>;
  onCancel?: () => void;
  compact?: boolean;
};

export function CommentForm({
  placeholder = "Write a comment…",
  submitLabel = "Comment",
  onSubmit,
  onCancel,
  compact = false,
}: CommentFormProps) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) {
      alert("Please write a comment first.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(text);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "mt-2" : "mt-3"}>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={submitting}
        rows={compact ? 2 : 3}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--purple)] focus:ring-2 focus:ring-[var(--purple)]/20 disabled:opacity-60"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
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
          className="rounded-full bg-[var(--purple)] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[var(--purple-deep)] disabled:opacity-60"
        >
          {submitting ? "Posting…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
