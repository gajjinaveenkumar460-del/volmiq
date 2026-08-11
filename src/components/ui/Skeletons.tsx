/**
 * Loading placeholders — match real PostCard / detail / list layout
 * so the page doesn't flash empty while Supabase loads.
 */

export function SkeletonBar({
  className = "",
}: {
  className?: string;
}) {
  return <div className={`vol-skeleton ${className}`} aria-hidden />;
}

/** Room chips row */
export function ChipsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-2" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBar
          key={i}
          className="h-8 w-16 rounded-full sm:w-20"
        />
      ))}
    </div>
  );
}

/** One feed card placeholder (matches Nexora-style PostCard) */
export function PostCardSkeleton() {
  return (
    <article className="vol-card flex gap-1 overflow-hidden sm:gap-2" aria-hidden>
      <div className="flex w-12 shrink-0 flex-col items-center gap-2 py-4 sm:w-14 sm:py-5">
        <SkeletonBar className="h-7 w-7 rounded-lg" />
        <SkeletonBar className="h-4 w-6" />
        <SkeletonBar className="h-7 w-7 rounded-lg" />
      </div>
      <div className="min-w-0 flex-1 py-4 pr-4 sm:py-5 sm:pr-5">
        <div className="flex flex-wrap items-center gap-2">
          <SkeletonBar className="h-5 w-20 rounded-full" />
          <SkeletonBar className="h-3.5 w-28" />
        </div>
        <SkeletonBar className="mt-3 h-5 w-[88%]" />
        <SkeletonBar className="mt-2 h-4 w-full" />
        <SkeletonBar className="mt-1.5 h-4 w-3/4" />
        <div className="mt-3 flex gap-4">
          <SkeletonBar className="h-3.5 w-20" />
          <SkeletonBar className="h-3.5 w-24" />
        </div>
      </div>
    </article>
  );
}

export function PostCardListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Loading">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Home feed: chips + cards */
export function HomeFeedSkeleton() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3" role="status">
      <span className="sr-only">Loading feed…</span>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <ChipsSkeleton count={5} />
        <SkeletonBar className="h-8 w-28 rounded-full" />
      </div>
      <PostCardListSkeleton count={4} />
    </div>
  );
}

/** Question detail article + answer blocks */
export function PostDetailSkeleton() {
  return (
    <div className="mx-auto max-w-2xl" role="status" aria-label="Loading question">
      <span className="sr-only">Loading question…</span>
      <SkeletonBar className="h-4 w-28" />

      <article className="vol-card mt-4 p-5 sm:p-7">
        <div className="flex flex-wrap gap-2">
          <SkeletonBar className="h-5 w-20 rounded-full" />
          <SkeletonBar className="h-4 w-24" />
        </div>
        <SkeletonBar className="mt-4 h-7 w-[92%]" />
        <SkeletonBar className="mt-2 h-7 w-2/3" />
        <SkeletonBar className="mt-3 h-3.5 w-40" />
        <div className="mt-5 border-t border-[var(--line)] pt-5 space-y-2">
          <SkeletonBar className="h-4 w-full" />
          <SkeletonBar className="h-4 w-full" />
          <SkeletonBar className="h-4 w-5/6" />
          <SkeletonBar className="h-4 w-4/5" />
        </div>
        <div className="mt-6 flex items-center gap-3 border-t border-[var(--line)] pt-4">
          <SkeletonBar className="h-7 w-7 rounded-lg" />
          <SkeletonBar className="h-4 w-8" />
          <SkeletonBar className="h-7 w-7 rounded-lg" />
        </div>
      </article>

      <div className="mt-8">
        <SkeletonBar className="h-5 w-28" />
        <div className="vol-card mt-4 p-4 sm:p-5">
          <SkeletonBar className="h-4 w-32" />
          <SkeletonBar className="mt-3 h-20 w-full rounded-xl" />
          <div className="mt-3 flex justify-end">
            <SkeletonBar className="h-9 w-28 rounded-full" />
          </div>
        </div>
        <ul className="mt-3 flex flex-col gap-3">
          <AnswerCardSkeleton />
          <AnswerCardSkeleton />
        </ul>
      </div>
    </div>
  );
}

export function AnswerCardSkeleton() {
  return (
    <li className="vol-card list-none p-4" aria-hidden>
      <SkeletonBar className="h-3.5 w-36" />
      <SkeletonBar className="mt-3 h-4 w-full" />
      <SkeletonBar className="mt-1.5 h-4 w-11/12" />
      <SkeletonBar className="mt-1.5 h-4 w-2/3" />
      <div className="mt-3 flex gap-2">
        <SkeletonBar className="h-7 w-7 rounded-lg" />
        <SkeletonBar className="h-4 w-8" />
        <SkeletonBar className="h-7 w-7 rounded-lg" />
      </div>
    </li>
  );
}

/** My answers list item */
export function AnswerListItemSkeleton() {
  return (
    <article className="vol-card p-4 sm:p-5" aria-hidden>
      <SkeletonBar className="h-3.5 w-32" />
      <SkeletonBar className="mt-3 h-4 w-full" />
      <SkeletonBar className="mt-1.5 h-4 w-4/5" />
      <SkeletonBar className="mt-3 h-3.5 w-28" />
    </article>
  );
}

export function AnswerListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Loading">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: count }).map((_, i) => (
        <AnswerListItemSkeleton key={i} />
      ))}
    </div>
  );
}

/** Nested comments under an answer */
export function CommentsSkeleton() {
  return (
    <div className="mt-2 space-y-3" role="status" aria-label="Loading comments">
      <span className="sr-only">Loading comments…</span>
      {[1, 2].map((i) => (
        <div key={i} className="space-y-1.5">
          <SkeletonBar className="h-3 w-28" />
          <SkeletonBar className="h-3.5 w-full" />
          <SkeletonBar className="h-3.5 w-3/4" />
        </div>
      ))}
    </div>
  );
}
