"use client";

import type { Post } from "@/types/post";
import Link from "next/link";
import { VoteButtons } from "@/components/posts/VoteButtons";
import {
  IconAnswers,
  IconComments,
  IconRoom,
  IconUser,
} from "@/components/ui/Icons";

/**
 * Nexora-style feed card — soft white card, vote rail, pastel room chip.
 */
export function PostCard({ post }: { post: Post }) {
  const answers = post.answerCount ?? 0;
  const comments = post.commentCount ?? 0;

  return (
    <article className="vol-card group flex gap-1 overflow-hidden p-0 sm:gap-2">
      <div className="flex w-12 shrink-0 flex-col items-center py-4 sm:w-14 sm:py-5">
        <VoteButtons
          targetType="post"
          targetId={post.id}
          initialScore={post.upvotes}
          variant="column"
        />
      </div>

      <Link
        href={`/p/${post.id}`}
        className="min-w-0 flex-1 py-4 pr-4 text-inherit no-underline sm:py-5 sm:pr-5"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--purple-soft)] px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-[var(--purple)]">
            <IconRoom className="h-3 w-3" />
            {post.communitySlug}
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] text-[var(--muted)]">
            <IconUser className="h-3 w-3" />
            {post.authorName}
            <span className="text-[var(--line-strong)]">·</span>
            {post.createdAt}
          </span>
        </div>

        <h2 className="mt-2 text-[16px] font-bold leading-snug tracking-[-0.02em] text-[var(--ink)] transition group-hover:text-[var(--purple-deep)] sm:text-[17px]">
          {post.title}
        </h2>

        {post.body ? (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[var(--muted)] sm:text-[14px]">
            {post.body}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--ink-soft)]">
            <IconAnswers className="h-3.5 w-3.5 text-[var(--purple)]" />
            {answers} {answers === 1 ? "answer" : "answers"}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--ink-soft)]">
            <IconComments className="h-3.5 w-3.5 text-[var(--pink,#ec4899)]" />
            {comments} {comments === 1 ? "comment" : "comments"}
          </span>
        </div>
      </Link>
    </article>
  );
}
