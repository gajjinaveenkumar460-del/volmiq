"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AppNotification } from "@/types/notification";
import { useAuth } from "@/components/providers/AuthProvider";
import { IconBell } from "@/components/ui/Icons";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/supabase/notifications";

/**
 * Header bell — answers on your questions, comments on your answers, replies to you.
 */
export function NotificationBell() {
  const { user, loading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      setUnread(0);
      return;
    }
    try {
      setError(null);
      const [list, count] = await Promise.all([
        getMyNotifications(15),
        getUnreadNotificationCount(),
      ]);
      setItems(list);
      setUnread(count);
    } catch (e) {
      // Table may not exist yet until SQL is run
      setError(e instanceof Error ? e.message : "Could not load");
      setItems([]);
      setUnread(0);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void refresh();
    if (!user) return;

    const id = window.setInterval(() => {
      void refresh();
    }, 45000);
    return () => window.clearInterval(id);
  }, [user, authLoading, refresh]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (authLoading || !user) return null;

  async function handleOpen() {
    setOpen((v) => !v);
    if (!open) {
      setLoading(true);
      await refresh();
      setLoading(false);
    }
  }

  async function handleClickItem(n: AppNotification) {
    try {
      if (!n.readAt) {
        await markNotificationRead(n.id);
        setUnread((c) => Math.max(0, c - 1));
        setItems((prev) =>
          prev.map((x) =>
            x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x,
          ),
        );
      }
    } catch {
      // still navigate
    }
    setOpen(false);
  }

  async function handleMarkAll() {
    try {
      await markAllNotificationsRead();
      setUnread(0);
      setItems((prev) =>
        prev.map((x) => ({
          ...x,
          readAt: x.readAt ?? new Date().toISOString(),
        })),
      );
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={handleOpen}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--ink)] shadow-sm transition hover:border-[var(--purple)]/30 hover:bg-[var(--purple-soft)] sm:h-10 sm:w-10"
        aria-label={
          unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
        }
        aria-expanded={open}
      >
        <IconBell className="h-[18px] w-[18px] text-[var(--purple-deep)]" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className={[
            "z-[80] overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-xl shadow-[var(--ink)]/15",
            // Mobile: fixed panel under 2-row header (search sits below top bar)
            "fixed top-[7rem] right-3 left-3",
            // Desktop: dropdown under the bell
            "sm:absolute sm:top-auto sm:right-0 sm:left-auto sm:mt-2 sm:w-[22rem]",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] px-3.5 py-2.5">
            <p className="min-w-0 truncate text-[13px] font-bold text-[var(--ink)]">
              Notifications
            </p>
            {unread > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="shrink-0 text-[11px] font-semibold text-[var(--purple)] hover:text-[var(--purple-deep)]"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[min(22rem,55vh)] overflow-y-auto overscroll-contain">
            {loading && (
              <p className="px-3.5 py-6 text-center text-[13px] text-[var(--muted)]">
                Loading…
              </p>
            )}
            {!loading && error && (
              <p className="px-3.5 py-4 text-[12px] leading-relaxed break-words text-[var(--muted)]">
                Could not load notifications. Run{" "}
                <code className="rounded bg-[var(--paper)] px-1 text-[11px]">
                  supabase/notifications.sql
                </code>{" "}
                in the Supabase SQL editor if you haven’t yet.
              </p>
            )}
            {!loading && !error && items.length === 0 && (
              <p className="px-3.5 py-6 text-center text-[13px] text-[var(--muted)]">
                No notifications yet. You’ll see when someone answers your
                questions or comments on your answers.
              </p>
            )}
            {!loading &&
              !error &&
              items.map((n) => (
                <Link
                  key={n.id}
                  href={`/p/${n.postId}`}
                  onClick={() => handleClickItem(n)}
                  className={[
                    "block border-b border-[var(--line)] px-3.5 py-3 no-underline transition last:border-0 hover:bg-[var(--paper)]",
                    !n.readAt ? "bg-[var(--purple-soft)]/50" : "bg-white",
                  ].join(" ")}
                >
                  <p className="text-[13px] leading-snug font-medium break-words text-[var(--ink)]">
                    {n.body}
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--muted)]">
                    {formatWhen(n.createdAt)}
                    {!n.readAt ? " · New" : ""}
                  </p>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatWhen(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso.slice(0, 10);
  }
}
