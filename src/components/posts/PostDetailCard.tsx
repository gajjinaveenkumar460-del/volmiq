"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Community } from "@/types/community";
import type { Post } from "@/types/post";
import { VoteButtons } from "@/components/posts/VoteButtons";
import { useAuth } from "@/components/providers/AuthProvider";
import { deletePost, updatePost } from "@/lib/supabase/posts";

type PostDetailCardProps = {
  initialPost: Post;
  communityName: string | null;
  communities: Community[];
};

/**
 * Question body on detail page + Edit / Delete for the author only.
 */
export function PostDetailCard({
  initialPost,
  communityName: initialCommunityName,
  communities,
}: PostDetailCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState(initialPost);
  const isOwner = Boolean(
    user && post.authorId && user.id === post.authorId,
  );
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialPost.title);
  const [body, setBody] = useState(initialPost.body);
  const [communitySlug, setCommunitySlug] = useState(initialPost.communitySlug);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const communityName =
    communities.find((c) => c.slug === post.communitySlug)?.name ??
    initialCommunityName;

  function startEdit() {
    setTitle(post.title);
    setBody(post.body);
    setCommunitySlug(post.communitySlug);
    setError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      alert("Please write a title first.");
      return;
    }
    if (!communitySlug) {
      alert("Please pick a room.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const updated = await updatePost(post.id, {
        title: trimmedTitle,
        body: body.trim(),
        communitySlug,
      });
      setPost({
        ...post,
        ...updated,
        answerCount: post.answerCount,
        commentCount: post.commentCount,
      });
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    const ok = window.confirm(
      "Delete this question? Answers and comments under it may also be removed. This cannot be undone.",
    );
    if (!ok) return;

    setBusy(true);
    setError(null);
    try {
      await deletePost(post.id);
      router.push("/my-questions");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setBusy(false);
    }
  }

  return (
    <article className="mt-4 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm shadow-[var(--purple)]/5 sm:p-7">
      {!editing ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-[var(--purple-soft)] px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-[var(--purple)]">
                c/{post.communitySlug}
              </span>
              {communityName && (
                <span className="text-[12px] text-[var(--muted)]">
                  {communityName}
                </span>
              )}
            </div>

            {isOwner && (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={startEdit}
                  disabled={busy}
                  className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-[12px] font-semibold text-[var(--ink)] transition hover:border-[var(--purple)]/40 hover:bg-[var(--purple-soft)]/50 hover:text-[var(--purple)] disabled:opacity-60"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={busy}
                  className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                >
                  {busy ? "…" : "Delete"}
                </button>
              </div>
            )}
          </div>

          <h1 className="mt-3 text-xl font-semibold tracking-tight text-[var(--ink)] sm:text-2xl">
            {post.title}
          </h1>

          <p className="mt-2 text-[13px] text-[var(--muted)]">
            {post.authorName} · {post.createdAt}
          </p>

          <div className="mt-5 border-t border-[var(--line)] pt-5">
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-[var(--ink)]">
              {post.body}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-4 border-t border-[var(--line)] pt-4">
            <VoteButtons
              targetType="post"
              targetId={post.id}
              initialScore={post.upvotes}
              variant="inline"
            />
          </div>
        </>
      ) : (
        <form onSubmit={handleSave}>
          <h2 className="text-[15px] font-semibold text-[var(--ink)]">
            Edit question
          </h2>

          <label className="mt-4 block text-[12px] font-semibold text-[var(--ink)]">
            Room
            <select
              value={communitySlug}
              onChange={(e) => setCommunitySlug(e.target.value)}
              disabled={busy || communities.length === 0}
              className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-[14px] text-[var(--ink)] outline-none focus:border-[var(--purple)] focus:ring-2 focus:ring-[var(--purple)]/20 disabled:opacity-60"
            >
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
              disabled={busy}
              className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-[14px] text-[var(--ink)] outline-none focus:border-[var(--purple)] focus:ring-2 focus:ring-[var(--purple)]/20 disabled:opacity-60"
            />
          </label>

          <label className="mt-4 block text-[12px] font-semibold text-[var(--ink)]">
            Details
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={busy}
              rows={5}
              className="mt-1.5 w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-[14px] text-[var(--ink)] outline-none focus:border-[var(--purple)] focus:ring-2 focus:ring-[var(--purple)]/20 disabled:opacity-60"
            />
          </label>

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={busy}
              className="rounded-full px-4 py-2 text-[12px] font-semibold text-[var(--muted)] transition hover:bg-[var(--purple-soft)] hover:text-[var(--purple)] disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-[var(--purple)] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[var(--purple-deep)] disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {isOwner && !editing && (
        <p className="mt-3 text-[11px] text-[var(--muted)]">
          You own this question.{" "}
          <Link
            href="/my-questions"
            className="font-semibold text-[var(--purple)] no-underline hover:text-[var(--purple-deep)]"
          >
            My questions
          </Link>
        </p>
      )}
    </article>
  );
}
