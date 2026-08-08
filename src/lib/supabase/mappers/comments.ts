import type { Comment, CommentRow } from "@/types/comment";

/**
 * Supabase comments row → app Comment (flat; no children yet)
 */
export function mapDbComment(row: CommentRow): Comment {
  return {
    id: row.id,
    answerId: row.answer_id,
    parentId: row.parent_id,
    authorName: row.author_name,
    authorId: row.author_id ?? null,
    body: row.body ?? "",
    createdAt: row.created_at.slice(0, 10),
    upvotes: row.upvotes ?? 0,
  };
}

export function mapDbComments(
  rows: CommentRow[] | null | undefined,
): Comment[] {
  return (rows ?? []).map(mapDbComment);
}
