"use client";

import type { Post } from "@/types/post";
import Link from "next/link";
import { VoteButtons } from "@/components/posts/VoteButtons";

/**
 * One question card in the feed.
 */
export function PostCard({ post }: { post: Post }) {
  const answers = post.answerCount ?? 0;
  const comments = post.commentCount ?? 0;

  return (
    <article className="flex gap-4 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm shadow-[var(--purple)]/5 transition hover:border-[var(--line-strong)] hover:shadow-md hover:shadow-[var(--purple)]/8 sm:p-5">
      <VoteButtons
        targetType="post"
        targetId={post.id}
        initialScore={post.upvotes}
        variant="column"
      />

      <Link
        href={`/p/${post.id}`}
        className="min-w-0 flex-1 text-inherit no-underline"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[var(--purple-soft)] px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-[var(--purple)]">
            c/{post.communitySlug}
          </span>
          <span className="text-[12px] text-[var(--muted)]">
            {post.authorName} · {post.createdAt}
          </span>
        </div>

        <h2 className="mt-2 text-[16px] font-semibold leading-snug tracking-tight text-[var(--ink)] sm:text-[17px]">
          {post.title}
        </h2>

        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[var(--muted)] sm:text-[14px]">
          {post.body}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--muted)]">
            <AnswersIcon className="h-3.5 w-3.5 text-[var(--purple-mid)]" />
            {answers} {answers === 1 ? "answer" : "answers"}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--muted)]">
            <BubbleChatIcon className="h-3.5 w-3.5 text-[var(--purple)]" />
            {comments} {comments === 1 ? "comment" : "comments"}
          </span>
        </div>
      </Link>
    </article>
  );
}

function AnswersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BubbleChatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </svg>
  );
}
