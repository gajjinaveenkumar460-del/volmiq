import type {
  Comment,
  CommentRow,
  CreateCommentInput,
  UpdateCommentInput,
} from "@/types/comment";
import { supabase } from "@/lib/supabase/client";
import { mapDbComment, mapDbComments } from "@/lib/supabase/mappers/comments";

/**
 * Flat comments for one answer, oldest first.
 */
export async function getCommentsByAnswerId(
  answerId: string,
): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("answer_id", answerId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return mapDbComments(data as CommentRow[] | null);
}

/**
 * Flat comments for many answers (one query for a question page).
 */
export async function getCommentsForAnswers(
  answerIds: string[],
): Promise<Comment[]> {
  if (answerIds.length === 0) return [];

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .in("answer_id", answerIds)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return mapDbComments(data as CommentRow[] | null);
}

/**
 * Insert a comment or reply; returns the created Comment (flat).
 */
export async function createComment(
  input: CreateCommentInput,
): Promise<Comment> {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      answer_id: input.answerId,
      parent_id: input.parentId ?? null,
      body: input.body,
      author_name: input.authorName ?? "You",
      author_id: input.authorId ?? null,
      upvotes: 0,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDbComment(data as CommentRow);
}

/**
 * Update own comment body. RLS: author_id = auth.uid().
 */
export async function updateComment(
  id: string,
  input: UpdateCommentInput,
): Promise<Comment> {
  const body = input.body.trim();
  if (!body) {
    throw new Error("Comment cannot be empty");
  }

  const { data, error } = await supabase
    .from("comments")
    .update({ body })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDbComment(data as CommentRow);
}

/**
 * Delete own comment. Uses delete_own_comment RPC when present.
 */
export async function deleteComment(id: string): Promise<void> {
  const rpc = await supabase.rpc("delete_own_comment", { p_comment_id: id });

  if (!rpc.error) return;

  const missingFn =
    rpc.error.code === "PGRST202" ||
    /function .*delete_own_comment/i.test(rpc.error.message) ||
    /could not find/i.test(rpc.error.message);

  if (!missingFn) {
    throw new Error(rpc.error.message);
  }

  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) {
    throw new Error(
      `${error.message} — If this comment has replies, run the delete_own_comment SQL in Supabase.`,
    );
  }
}

/**
 * Turn a flat comment list into a tree via parentId → children.
 * Returns only root comments (parentId === null).
 */
export function buildCommentTree(flat: Comment[]): Comment[] {
  const map = new Map<string, Comment>();

  for (const c of flat) {
    map.set(c.id, { ...c, children: [] });
  }

  const roots: Comment[] = [];

  for (const c of map.values()) {
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children!.push(c);
    } else {
      // top-level on the answer, or orphan if parent missing
      roots.push(c);
    }
  }

  return roots;
}

/**
 * Group flat comments by answerId, each value a tree of roots.
 */
export function groupCommentsByAnswer(
  flat: Comment[],
): Map<string, Comment[]> {
  const byAnswer = new Map<string, Comment[]>();

  for (const c of flat) {
    const list = byAnswer.get(c.answerId) ?? [];
    list.push(c);
    byAnswer.set(c.answerId, list);
  }

  const trees = new Map<string, Comment[]>();
  for (const [answerId, list] of byAnswer) {
    trees.set(answerId, buildCommentTree(list));
  }

  return trees;
}
