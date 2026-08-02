import type { Post, PostRow } from "@/types/post";

/**
 * Supabase posts row (snake_case) → app Post (camelCase)
 */
export function mapDbPost(row: PostRow): Post {
  return {
    id: row.id,
    communitySlug: row.community_slug,
    title: row.title,
    body: row.body ?? "",
    authorName: row.author_name,
    createdAt: row.created_at.slice(0, 10),
    upvotes: row.upvotes ?? 0,
  };
}

/**
 * Map many Supabase rows → Post[]
 */
export function mapDbPosts(rows: PostRow[] | null | undefined): Post[] {
  return (rows ?? []).map(mapDbPost);
}
