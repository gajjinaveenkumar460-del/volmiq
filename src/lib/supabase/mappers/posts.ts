import type { Post, PostRow, PostRowWithCounts } from "@/types/post";

/**
 * Supabase posts row (snake_case) → app Post (camelCase)
 */
export function mapDbPost(row: PostRow | PostRowWithCounts): Post {
  const answerCount = countAnswers(row);
  const commentCount = countComments(row);

  return {
    id: row.id,
    communitySlug: row.community_slug,
    title: row.title,
    body: row.body ?? "",
    authorName: row.author_name,
    createdAt: row.created_at.slice(0, 10),
    upvotes: row.upvotes ?? 0,
    answerCount,
    commentCount,
  };
}

/**
 * Map many Supabase rows → Post[]
 */
export function mapDbPosts(
  rows: Array<PostRow | PostRowWithCounts> | null | undefined,
): Post[] {
  return (rows ?? []).map(mapDbPost);
}

function countAnswers(row: PostRow | PostRowWithCounts): number {
  if (!("answers" in row) || !Array.isArray(row.answers)) return 0;
  return row.answers.length;
}

function countComments(row: PostRow | PostRowWithCounts): number {
  if (!("answers" in row) || !Array.isArray(row.answers)) return 0;

  let total = 0;
  for (const answer of row.answers) {
    const raw = answer.comments?.[0]?.count;
    total += typeof raw === "string" ? parseInt(raw, 10) || 0 : raw ?? 0;
  }
  return total;
}
