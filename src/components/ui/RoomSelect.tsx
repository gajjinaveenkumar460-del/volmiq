"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Community } from "@/types/community";
import { IconChevronDown, IconRoom } from "@/components/ui/Icons";

type RoomSelectProps = {
  communities: Community[];
  value: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  /** id for label association */
  id?: string;
};

/**
 * Custom room picker — full-width, skin-matched, mobile-friendly.
 * Replaces native <select> which ignores most CSS on option lists.
 */
export function RoomSelect({
  communities,
  value,
  onChange,
  disabled = false,
  loading = false,
  error,
  id: idProp,
}: RoomSelectProps) {
  const autoId = useId();
  const listId = idProp ?? autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selected = communities.find((c) => c.slug === value) ?? null;
  const isDisabled = disabled || loading || communities.length === 0;

  useEffect(() => {
    if (!open) return;

    function onDocPointer(e: MouseEvent | TouchEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocPointer);
    document.addEventListener("touchstart", onDocPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocPointer);
      document.removeEventListener("touchstart", onDocPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(slug: string) {
    onChange(slug);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative mt-1.5 w-full">
      <button
        type="button"
        id={listId}
        disabled={isDisabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${listId}-list`}
        onClick={() => {
          if (!isDisabled) setOpen((v) => !v);
        }}
        className={[
          "flex w-full min-h-11 items-center gap-2.5 rounded-xl border bg-white px-3 py-2.5 text-left text-[14px] outline-none transition",
          "focus-visible:ring-2 focus-visible:ring-[var(--purple)]/20",
          "disabled:cursor-not-allowed disabled:opacity-60",
          error
            ? "border-red-400 focus-visible:border-red-400"
            : open
              ? "border-[var(--purple)] shadow-sm shadow-[var(--purple)]/10"
              : "border-[var(--line)] hover:border-[var(--line-strong)]",
        ].join(" ")}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--purple-soft)] text-[var(--purple)]">
          <IconRoom className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1 truncate font-medium text-[var(--ink)]">
          {loading
            ? "Loading rooms…"
            : selected
              ? selected.name
              : communities.length === 0
                ? "No rooms"
                : "Select a room"}
        </span>
        <IconChevronDown
          className={[
            "h-4 w-4 shrink-0 text-[var(--muted)] transition-transform",
            open ? "rotate-180 text-[var(--purple)]" : "",
          ].join(" ")}
        />
      </button>

      {open && !isDisabled && (
        <ul
          id={`${listId}-list`}
          role="listbox"
          aria-labelledby={listId}
          className="absolute z-50 mt-1.5 max-h-[min(16rem,50vh)] w-full overflow-y-auto overscroll-contain rounded-xl border border-[var(--line)] bg-white py-1.5 shadow-lg shadow-[var(--purple)]/12"
        >
          {communities.map((c) => {
            const isSelected = c.slug === value;
            return (
              <li key={c.id} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => pick(c.slug)}
                  className={[
                    "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[14px] transition",
                    isSelected
                      ? "bg-[var(--purple-soft)] font-semibold text-[var(--purple-deep)]"
                      : "font-medium text-[var(--ink)] hover:bg-[var(--paper)]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                      isSelected
                        ? "bg-white text-[var(--purple)] shadow-sm"
                        : "bg-[var(--paper)] text-[var(--muted)]",
                    ].join(" ")}
                  >
                    <IconRoom className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                  {isSelected && (
                    <span className="text-[11px] font-semibold text-[var(--purple)]">
                      Selected
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
