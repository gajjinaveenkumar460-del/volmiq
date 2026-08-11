"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Community } from "@/types/community";
import { useAuth } from "@/components/providers/AuthProvider";
import { IconArrowLeft, IconAsk, IconSend } from "@/components/ui/Icons";
import { RoomSelect } from "@/components/ui/RoomSelect";
import { displayNameFromUser } from "@/lib/auth/displayName";
import { loginWithNext } from "@/lib/auth/safeNextPath";
import {
  clearDraft,
  draftKeys,
  loadDraft,
  saveDraft,
  type AskDraft,
} from "@/lib/drafts";
import { getAllCommunities } from "@/lib/supabase/communities";
import { createPost } from "@/lib/supabase/posts";

export function AskForm() {
  const router = useRouter();
  const { user } = useAuth();
  const askKey = draftKeys.ask();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [communitySlug, setCommunitySlug] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    room?: string;
    title?: string;
  }>({});
  const [restored, setRestored] = useState(false);

  // Restore draft once (client)
  useEffect(() => {
    const draft = loadDraft<AskDraft>(askKey);
    if (!draft) {
      setRestored(true);
      return;
    }
    setTitle(draft.title ?? "");
    setBody(draft.body ?? "");
    if (draft.communitySlug) setCommunitySlug(draft.communitySlug);
    setRestored(true);
  }, [askKey]);

  // Keep draft warm while typing (covers Sign in from header too)
  useEffect(() => {
    if (!restored) return;
    if (!title.trim() && !body.trim()) return;
    saveDraft(askKey, {
      title,
      body,
      communitySlug,
    } satisfies AskDraft);
  }, [title, body, communitySlug, askKey, restored]);

  useEffect(() => {
    let cancelled = false;

    async function loadRooms() {
      setLoadingRooms(true);
      try {
        const list = await getAllCommunities();
        if (cancelled) return;
        setCommunities(list);
        setCommunitySlug((prev) => {
          if (prev && list.some((c) => c.slug === prev)) return prev;
          return list[0]?.slug ?? "";
        });
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load rooms");
      } finally {
        if (!cancelled) setLoadingRooms(false);
      }
    }

    loadRooms();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    const nextFields: { room?: string; title?: string } = {};
    if (!communitySlug) nextFields.room = "Please pick a room.";
    if (!trimmedTitle) nextFields.title = "Please write a title first.";
    setFieldErrors(nextFields);
    if (nextFields.room || nextFields.title) return;

    setSubmitting(true);
    setError(null);

    try {
      if (!user) {
        saveDraft(askKey, {
          title: trimmedTitle,
          body: trimmedBody,
          communitySlug,
        } satisfies AskDraft);
        router.push(loginWithNext("/ask"));
        return;
      }

      const created = await createPost({
        title: trimmedTitle,
        body: trimmedBody,
        communitySlug,
        authorName: displayNameFromUser(user),
        authorId: user.id,
      });

      clearDraft(askKey);
      setTitle("");
      setBody("");
      if (communities[0]) setCommunitySlug(communities[0].slug);

      router.push(`/p/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post question");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-[var(--purple)] no-underline transition hover:text-[var(--purple-deep)]"
      >
        <IconArrowLeft className="h-3.5 w-3.5 shrink-0" />
        <span>Back to feed</span>
      </Link>

      <form
        onSubmit={handleSubmit}
        className="vol-card p-5 sm:p-6"
      >
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-[var(--ink)]">
          <IconAsk className="h-5 w-5 shrink-0 text-[var(--purple)]" />
          <span>Ask a question</span>
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">
          Pick a room and write a clear title so others can answer.
        </p>
        {restored && (title || body) && (
          <p className="mt-2 text-[12px] font-medium text-[var(--purple)]">
            Draft restored — review and post when ready.
          </p>
        )}

        <div className="mt-5">
          <span className="block text-[12px] font-semibold text-[var(--ink)]">
            Room
          </span>
          <RoomSelect
            communities={communities}
            value={communitySlug}
            loading={loadingRooms}
            disabled={submitting}
            error={fieldErrors.room}
            onChange={(slug) => {
              setCommunitySlug(slug);
              setFieldErrors((f) => ({ ...f, room: undefined }));
            }}
          />
          {fieldErrors.room && (
            <p className="mt-1.5 text-[12px] font-medium text-red-600">
              {fieldErrors.room}
            </p>
          )}
        </div>

        <label className="mt-4 block text-[12px] font-semibold text-[var(--ink)]">
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setFieldErrors((f) => ({ ...f, title: undefined }));
            }}
            disabled={submitting}
            placeholder="e.g. What is AI in simple words?"
            className={[
              "mt-1.5 w-full rounded-xl border bg-[var(--paper)] px-3 py-2.5 text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:ring-2 focus:ring-[var(--purple)]/20 disabled:opacity-60",
              fieldErrors.title
                ? "border-red-400 focus:border-red-400"
                : "border-[var(--line)] focus:border-[var(--purple)]",
            ].join(" ")}
          />
          {fieldErrors.title && (
            <p className="mt-1.5 text-[12px] font-medium text-red-600">
              {fieldErrors.title}
            </p>
          )}
        </label>

        <label className="mt-4 block text-[12px] font-semibold text-[var(--ink)]">
          Details{" "}
          <span className="font-normal text-[var(--muted)]">(optional)</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={submitting}
            rows={5}
            placeholder="Add context, what you tried, or what you need…"
            className="mt-1.5 w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--purple)] focus:ring-2 focus:ring-[var(--purple)]/20 disabled:opacity-60"
          />
        </label>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={submitting || loadingRooms}
            className="vol-btn-primary inline-flex h-10 items-center gap-1.5 px-5 disabled:opacity-60"
          >
            <IconSend className="h-3.5 w-3.5" />
            {submitting ? "Posting…" : "Post question"}
          </button>
        </div>
      </form>
    </div>
  );
}
