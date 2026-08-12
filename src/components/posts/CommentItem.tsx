"use client";

import { useEffect, useState } from "react";
import type { Comment } from "@/types/comment";
import { CommentForm } from "@/components/posts/CommentForm";
import { VoteButtons } from "@/components/posts/VoteButtons";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  IconChevronRight,
  IconEdit,
  IconReply,
  IconTrash,
  IconUser,
} from "@/components/ui/Icons";
import { draftKeys, hasDraft } from "@/lib/drafts";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteComment, updateComment } from "@/lib/supabase/comments";

type CommentItemProps = {
  comment: Comment;
  answerId: string;
  depth?: number;
  onReply: (parentId: string, body: string) => Promise<boolean>;
  /** Parent reloads tree after edit/delete */
  onChanged: () => Promise<void> | void;
};

const MAX_REPLY_DEPTH = 4;

/**
 * Thread UI with owner edit/delete on comments.
 */
export function CommentItem({
  comment,
  answerId,
  depth = 0,
  onReply,
  onChanged,
}: CommentItemProps) {
  const replyDraftKey = draftKeys.comment(answerId, comment.id);
  const [showReply, setShowReply] = useState(false);
  const [childrenOpen, setChildrenOpen] = useState(true);
  const children = comment.children ?? [];
  const canReply = depth < MAX_REPLY_DEPTH;
  const hasChildren = children.length > 0;

  useEffect(() => {
    if (hasDraft(replyDraftKey)) setShowReply(true);
  }, [replyDraftKey]);

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
        onChanged={onChanged}
        replyDraftKey={replyDraftKey}
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
                  className="pointer-events-none absolute top-3 left-[7px] z-[2] h-[8px] w-[8px] -translate-y-[6px] rounded-bl-[7px] border-b-2 border-l-2 border-[var(--purple-mid)]/40 bg-[var(--surface)]"
                  aria-hidden
                />

                {index === children.length - 1 && (
                  <span
                    className="pointer-events-none absolute top-[14px] bottom-0 left-[6px] z-[1] w-[4px] bg-[var(--surface)]"
                    aria-hidden
                  />
                )}

                <CommentItem
                  comment={child}
                  answerId={answerId}
                  depth={depth + 1}
                  onReply={onReply}
                  onChanged={onChanged}
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
  onChanged,
  replyDraftKey,
}: {
  comment: Comment;
  canReply: boolean;
  showReply: boolean;
  setShowReply: (v: boolean | ((p: boolean) => boolean)) => void;
  hasChildren: boolean;
  childrenOpen: boolean;
  setChildrenOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  onReply: (parentId: string, body: string) => Promise<boolean>;
  onChanged: () => Promise<void> | void;
  replyDraftKey: string;
}) {
  const { user } = useAuth();
  const isOwner = Boolean(
    user && comment.authorId && user.id === comment.authorId,
  );

  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(comment.body);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function startEdit() {
    setBody(comment.body);
    setError(null);
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) {
      setError("Please write a comment first.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await updateComment(comment.id, { body: text });
      setEditing(false);
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteConfirmed() {
    setBusy(true);
    setError(null);
    try {
      await deleteComment(comment.id);
      setConfirmDelete(false);
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)]">
          <IconUser className="h-3 w-3" />
          {comment.authorName} · {comment.createdAt}
        </p>
        {isOwner && !editing && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={startEdit}
              disabled={busy}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--muted)] transition hover:text-[var(--purple)] disabled:opacity-60"
            >
              <IconEdit className="h-3 w-3" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              disabled={busy}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 transition hover:text-red-700 disabled:opacity-60"
            >
              <IconTrash className="h-3 w-3" />
              Delete
            </button>
          </div>
        )}
      </div>

      {!editing ? (
        <p className="mt-1 text-[13px] leading-relaxed whitespace-pre-wrap text-[var(--ink)]">
          {comment.body}
        </p>
      ) : (
        <form onSubmit={handleSave} className="mt-1">
          <textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              if (error) setError(null);
            }}
            disabled={busy}
            rows={2}
            className={[
              "w-full resize-y rounded-xl border bg-[var(--paper)] px-3 py-2 text-[13px] text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--purple)]/20 disabled:opacity-60",
              error
                ? "border-red-400 focus:border-red-400"
                : "border-[var(--line)] focus:border-[var(--purple)]",
            ].join(" ")}
          />
          {error && (
            <p className="mt-1 text-[12px] font-medium text-red-600">{error}</p>
          )}
          <div className="mt-1.5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
              disabled={busy}
              className="text-[11px] font-semibold text-[var(--muted)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-[var(--purple)] px-2.5 py-1 text-[11px] font-semibold text-white disabled:opacity-60"
            >
              {busy ? "…" : "Save"}
            </button>
          </div>
        </form>
      )}

      {error && !editing && (
        <p className="mt-1 text-[12px] font-medium text-red-600">{error}</p>
      )}

      {!editing && (
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
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--muted)] transition hover:text-[var(--purple)]"
            >
              <IconReply className="h-3 w-3" />
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
              <IconChevronRight
                className={`h-3 w-3 transition-transform ${childrenOpen ? "rotate-90" : ""}`}
              />
              {childrenOpen
                ? "Collapse"
                : `Expand ${comment.children!.length} ${comment.children!.length === 1 ? "reply" : "replies"}`}
            </button>
          )}
        </div>
      )}

      {showReply && (
        <CommentForm
          compact
          draftKey={replyDraftKey}
          placeholder="Write a reply…"
          submitLabel="Reply"
          onCancel={() => setShowReply(false)}
          onSubmit={async (text) => {
            const posted = await onReply(comment.id, text);
            if (posted) setShowReply(false);
            return posted;
          }}
        />
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this comment?"
        description="Replies under it may also be removed. This cannot be undone."
        confirmLabel="Delete comment"
        busy={busy}
        onCancel={() => {
          if (!busy) setConfirmDelete(false);
        }}
        onConfirm={handleDeleteConfirmed}
      />
    </>
  );
}


