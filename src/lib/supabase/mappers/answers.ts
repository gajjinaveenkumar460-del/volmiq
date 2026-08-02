import type { Answer, AnswerRow } from "@/types/answer";

export function mapDbAnswer(row: AnswerRow): Answer {
  return {
    id: row.id,
    postId: row.post_id,
    authorName: row.author_name,
    body: row.body,
    createdAt: row.created_at.slice(0, 10),
    upvotes: row.upvotes ?? 0,
  };
}

export function mapDbAnswers(rows: AnswerRow[] | null | undefined): Answer[] {
  return (rows ?? []).map(mapDbAnswer);
}
