"use client";

import { useEffect, useId, useRef } from "react";
import { IconTrash } from "@/components/ui/Icons";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  /** Confirm button label */
  confirmLabel?: string;
  cancelLabel?: string;
  /** While async delete runs */
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Accessible modal confirm — replaces window.confirm for destructive actions.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[var(--ink)]/40 backdrop-blur-[3px]"
        aria-label="Close dialog"
        disabled={busy}
        onClick={() => {
          if (!busy) onCancel();
        }}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative z-10 w-full max-w-[400px] overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-2xl shadow-[var(--ink)]/20"
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <IconTrash className="h-5 w-5" />
            </span>
            <div className="min-w-0 pt-0.5">
              <h2
                id={titleId}
                className="text-[16px] font-bold tracking-tight text-[var(--ink)]"
              >
                {title}
              </h2>
              <p
                id={descId}
                className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]"
              >
                {description}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              ref={cancelRef}
              type="button"
              disabled={busy}
              onClick={onCancel}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--line)] bg-white px-4 text-[13px] font-semibold text-[var(--ink)] transition hover:bg-[var(--paper)] disabled:opacity-60"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onConfirm}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-red-600 px-4 text-[13px] font-semibold text-white shadow-sm shadow-red-600/25 transition hover:bg-red-700 disabled:opacity-60"
            >
              <IconTrash className="h-3.5 w-3.5" />
              {busy ? "Deleting…" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
