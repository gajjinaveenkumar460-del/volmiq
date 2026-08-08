"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Community } from "@/types/community";
import { displayNameFromUser } from "@/lib/auth/displayName";
import { createClient } from "@/lib/supabase/client";
import { getAllCommunities } from "@/lib/supabase/communities";
import { createPost } from "@/lib/supabase/posts";

export function AskForm() {
  const router = useRouter();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [communitySlug, setCommunitySlug] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRooms() {
      setLoadingRooms(true);
      try {
        const list = await getAllCommunities();
        if (cancelled) return;
        setCommunities(list);
        if (list[0]) setCommunitySlug(list[0].slug);
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

    if (!trimmedTitle) {
      alert("Please write a title first.");
      return;
    }
    if (!communitySlug) {
      alert("Please pick a room.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const created = await createPost({
        title: trimmedTitle,
        body: trimmedBody,
        communitySlug,
        authorName: displayNameFromUser(user),
      });

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
    <>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--purple)] no-underline transition hover:text-[var(--purple-deep)]"
      >
        ← Back to feed
      </Link>

      <form
        onSubmit={handleSubmit}
        className="mt-4 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm shadow-[var(--purple)]/5 sm:p-6"
      >
        <h1 className="text-xl font-semibold tracking-tight text-[var(--ink)]">
          Ask a question
        </h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          Pick a room and write a clear title so others can answer.
        </p>

        <label className="mt-5 block text-[12px] font-semibold text-[var(--ink)]">
          Room
          <select
            value={communitySlug}
            onChange={(e) => setCommunitySlug(e.target.value)}
            disabled={submitting || loadingRooms || communities.length === 0}
            className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-[14px] text-[var(--ink)] outline-none focus:border-[var(--purple)] focus:ring-2 focus:ring-[var(--purple)]/20 disabled:opacity-60"
          >
            {communities.length === 0 && (
              <option value="">
                {loadingRooms ? "Loading rooms…" : "No rooms"}
              </option>
            )}
            {communities.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block text-[12px] font-semibold text-[var(--ink)]">
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
            placeholder="e.g. What is AI in simple words?"
            className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--purple)] focus:ring-2 focus:ring-[var(--purple)]/20 disabled:opacity-60"
          />
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
            className="rounded-full bg-[var(--purple)] px-5 py-2.5 text-[13px] font-semibold tracking-wide text-white shadow-sm shadow-[var(--purple)]/20 transition hover:bg-[var(--purple-deep)] disabled:opacity-60"
          >
            {submitting ? "Posting…" : "Post question"}
          </button>
        </div>
      </form>
    </>
  );
}
