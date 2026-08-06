"use client";

import { useCallback, useEffect, useState } from "react";
import type { Comment } from "@/types/comment";
import { CommentForm } from "@/components/posts/CommentForm";
import { CommentItem } from "@/components/posts/CommentItem";
import {
  buildCommentTree,
  createComment,
  getCommentsByAnswerId,
} from "@/lib/supabase/comments";

type AnswerCommentsProps = {
  answerId: string;
};

export function AnswerComments({ answerId }: AnswerCommentsProps) {
  const [tree, setTree] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  /** Whole comment section under an answer */
  const [sectionOpen, setSectionOpen] = useState(false);

  const reload = useCallback(async () => {
    const flat = await getCommentsByAnswerId(answerId);
    setTree(buildCommentTree(flat));
  }, [answerId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const flat = await getCommentsByAnswerId(answerId);
        if (!cancelled) {
          const next = buildCommentTree(flat);
          setTree(next);
          // Auto-expand if there are comments
          if (countComments(next) > 0) setSectionOpen(true);
        }
      } catch {
        if (!cancelled) setTree([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [answerId]);

  async function handleTopLevel(body: string) {
    await createComment({
      answerId,
      parentId: null,
      body,
      authorName: "You",
    });
    await reload();
    setShowForm(false);
    setSectionOpen(true);
  }

  async function handleReply(parentId: string, body: string) {
    await createComment({
      answerId,
      parentId,
      body,
      authorName: "You",
    });
    await reload();
    setSectionOpen(true);
  }

  const count = countComments(tree);

  return (
    <div className="mt-4 border-t border-[var(--line)] pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setSectionOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--muted)] transition hover:text-[var(--purple)]"
          aria-expanded={sectionOpen}
        >
          <ChevronTiny
            className={`h-3.5 w-3.5 text-[var(--purple)] transition-transform ${sectionOpen ? "rotate-90" : ""}`}
          />
          <BubbleIcon className="h-3.5 w-3.5 text-[var(--purple)]" />
          Comments {count > 0 ? `(${count})` : ""}
          <span className="font-medium text-[var(--muted)]/80">
            {sectionOpen ? "· collapse" : "· expand"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSectionOpen(true);
            setShowForm((v) => !v);
          }}
          className="text-[12px] font-semibold text-[var(--purple)] transition hover:text-[var(--purple-deep)]"
        >
          {showForm ? "Hide form" : "Add a comment"}
        </button>
      </div>

      {sectionOpen && (
        <div className="mt-2 animate-in fade-in">
          {showForm && (
            <CommentForm
              placeholder="Comment on this answer…"
              submitLabel="Comment"
              onCancel={() => setShowForm(false)}
              onSubmit={handleTopLevel}
            />
          )}

          {loading ? (
            <p className="mt-2 text-[12px] text-[var(--muted)]">
              Loading comments…
            </p>
          ) : tree.length === 0 ? (
            <p className="mt-2 text-[12px] text-[var(--muted)]">
              No comments yet. Correct mistakes or ask for clarity here.
            </p>
          ) : (
            <div className="mt-2 space-y-1">
              {tree.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  answerId={answerId}
                  onReply={handleReply}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function countComments(nodes: Comment[]): number {
  let n = 0;
  for (const c of nodes) {
    n += 1 + countComments(c.children ?? []);
  }
  return n;
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

function BubbleIcon({ className }: { className?: string }) {
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
