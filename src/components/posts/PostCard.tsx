import {  post, community } from "@/lib/seed";
import Link from "next/link";

/**
 * Static post card design only — no props, no seed, no loops.
 * Replace hardcoded text later when you wire data.
 */
export function PostCard({ post }: post) {
  return (
    <Link
      href={`/p/${post.id}`}
      className="block no-underline text-inherit"
    >
    <article className="flex gap-4 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm shadow-[var(--purple)]/5 transition hover:border-[var(--line-strong)] hover:shadow-md hover:shadow-[var(--purple)]/8 sm:p-5">
      {/* Vote column */}
      <div className="flex w-10 shrink-0 flex-col items-center gap-1 pt-0.5">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--purple-soft)] hover:text-[var(--purple)]"
          aria-label="Upvote"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold tabular-nums text-[var(--purple)]">
          24
        </span>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--purple-soft)] hover:text-[var(--purple)]"
          aria-label="Downvote"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[var(--purple-soft)] px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-[var(--purple)]">
            {post.communitySlug.toUpperCase()   }
          </span>
          <span className="text-[12px] text-[var(--muted)]">
            {post.author} · {post.createdAt}
          </span>
        </div>

        <h2 className="mt-2 text-[16px] font-semibold leading-snug tracking-tight text-[var(--ink)] sm:text-[17px]">
          {post.title}
        </h2>

        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[var(--muted)] sm:text-[14px]">
          {post.body}
        </p>

        <div className="mt-3 flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--muted)]">
            <ChatIcon className="h-3.5 w-3.5 text-[var(--purple-mid)]" />
            12 answers
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

function ChatIcon({ className }: { className?: string }) {
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
