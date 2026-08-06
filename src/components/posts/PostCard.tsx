import type { Post } from "@/types/post";
import Link from "next/link";

/**
 * One question card in the feed.
 */
export function PostCard({ post }: { post: Post }) {
  const answers = post.answerCount ?? 0;
  const comments = post.commentCount ?? 0;

  return (
    <Link
      href={`/p/${post.id}`}
      className="block text-inherit no-underline"
    >
      <article className="flex gap-4 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm shadow-[var(--purple)]/5 transition hover:border-[var(--line-strong)] hover:shadow-md hover:shadow-[var(--purple)]/8 sm:p-5">
        {/* Vote column */}
        <div className="flex w-10 shrink-0 flex-col items-center gap-1 pt-0.5">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--purple-soft)] hover:text-[var(--purple)]"
            aria-label="Upvote"
            onClick={(e) => e.preventDefault()}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <span className="text-sm font-bold tabular-nums text-[var(--purple)]">
            {post.upvotes}
          </span>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--purple-soft)] hover:text-[var(--purple)]"
            aria-label="Downvote"
            onClick={(e) => e.preventDefault()}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
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
        </div>
      </article>
    </Link>
  );
}

function ChevronUp({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 14 6-6 6 6" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 10 6 6 6-6" />
    </svg>
  );
}

/** Message square — answers */
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

/** Round bubble chat — comments */
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
