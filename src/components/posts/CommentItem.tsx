"use client";

import { useState } from "react";
import type { Comment } from "@/types/comment";
import { CommentForm } from "@/components/posts/CommentForm";
import { VoteButtons } from "@/components/posts/VoteButtons";

type CommentItemProps = {
  comment: Comment;
  answerId: string;
  depth?: number;
  onReply: (parentId: string, body: string) => Promise<void>;
};

const MAX_REPLY_DEPTH = 4;

/**
 * Thread UI (completely different approach):
 * - Parent list owns ONE continuous vertical spine (2px, rounded ends)
 * - Each child only adds a short horizontal stub into the comment
 * - Soft rounded join at the L using a small corner piece (no SVG paths)
 */
export function CommentItem({
  comment,
  answerId,
  depth = 0,
  onReply,
}: CommentItemProps) {
  const [showReply, setShowReply] = useState(false);
  const [childrenOpen, setChildrenOpen] = useState(true);
  const children = comment.children ?? [];
  const canReply = depth < MAX_REPLY_DEPTH;
  const hasChildren = children.length > 0;

  return (
    <div className={depth === 0 ? "pt-3" : ""}>
      <CommentBody
        comment={comment}
        canReply={canReply}
        showReply={showReply}
        setShowReply={setShowReply}
        hasChildren={hasChildren}
        childrenOpen={childrenOpen}
        setChildrenOpen={setChildrenOpen}
        onReply={onReply}
      />

      {hasChildren && childrenOpen && (
        <div className="relative mt-1 ml-2">
          <span
            className="pointer-events-none absolute top-0 bottom-3 left-[7px] w-[2px] rounded-full bg-[var(--purple-soft)]"
            aria-hidden
          />

          <ul className="relative">
            {children.map((child, index) => (
              <li key={child.id} className="relative pl-5">
                <span
                  className="pointer-events-none absolute top-3 left-[7px] z-[1] h-[2px] w-[12px] bg-[var(--purple-soft)]"
                  aria-hidden
                />
                <span
                  className="pointer-events-none absolute top-3 left-[7px] z-[2] h-[8px] w-[8px] -translate-y-[6px] rounded-bl-[7px] border-b-2 border-l-2 border-[var(--purple-soft)] bg-white"
                  aria-hidden
                />

                {index === children.length - 1 && (
                  <span
                    className="pointer-events-none absolute top-[14px] bottom-0 left-[6px] z-[1] w-[4px] bg-white"
                    aria-hidden
                  />
                )}

                <CommentItem
                  comment={child}
                  answerId={answerId}
                  depth={depth + 1}
                  onReply={onReply}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CommentBody({
  comment,
  canReply,
  showReply,
  setShowReply,
  hasChildren,
  childrenOpen,
  setChildrenOpen,
  onReply,
}: {
  comment: Comment;
  canReply: boolean;
  showReply: boolean;
  setShowReply: (v: boolean | ((p: boolean) => boolean)) => void;
  hasChildren: boolean;
  childrenOpen: boolean;
  setChildrenOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  onReply: (parentId: string, body: string) => Promise<void>;
}) {
  return (
    <>
      <p className="text-[11px] text-[var(--muted)]">
        {comment.authorName} · {comment.createdAt}
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink)]">
        {comment.body}
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-3">
        <VoteButtons
          targetType="comment"
          targetId={comment.id}
          initialScore={comment.upvotes}
          variant="inline"
        />
        {canReply && (
          <button
            type="button"
            onClick={() => setShowReply((v) => !v)}
            className="text-[11px] font-semibold text-[var(--muted)] transition hover:text-[var(--purple)]"
          >
            {showReply ? "Cancel" : "Reply"}
          </button>
        )}
        {hasChildren && (
          <button
            type="button"
            onClick={() => setChildrenOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--purple)] transition hover:text-[var(--purple-deep)]"
            aria-expanded={childrenOpen}
          >
            <ChevronTiny
              className={`h-3 w-3 transition-transform ${childrenOpen ? "rotate-90" : ""}`}
            />
            {childrenOpen
              ? "Collapse"
              : `Expand ${comment.children!.length} ${comment.children!.length === 1 ? "reply" : "replies"}`}
          </button>
        )}
      </div>

      {showReply && (
        <CommentForm
          compact
          placeholder="Write a reply…"
          submitLabel="Reply"
          onCancel={() => setShowReply(false)}
          onSubmit={async (body) => {
            await onReply(comment.id, body);
            setShowReply(false);
          }}
        />
      )}
    </>
  );
}

function ChevronTiny({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
