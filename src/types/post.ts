/** App-level question model (camelCase) */
export type Post = {
  id: string;
  communitySlug: string;
  title: string;
  body: string;
  authorName: string;
  /** Supabase Auth user id (null on older rows) */
  authorId?: string | null;
  createdAt: string;
  upvotes: number;
  /** Number of answers on this question (from DB aggregate) */
  answerCount?: number;
  /** Number of comments across all answers (from DB aggregate) */
  commentCount?: number;
};

/** Supabase posts table row (snake_case) */
export type PostRow = {
  id: string;
  community_slug: string;
  title: string;
  body: string;
  author_name: string;
  author_id?: string | null;
  upvotes: number;
  created_at: string;
};

/**
 * Post row plus nested count payloads from Supabase embeds.
 * Shape depends on select(): answers(comments(count))
 */
export type PostRowWithCounts = PostRow & {
  answers?: Array<{
    comments?: Array<{ count: number | string }>;
  }>;
};

/** Payload for creating a post (no id / timestamps yet) */
export type CreatePostInput = {
  title: string;
  body: string;
  communitySlug: string;
  authorName?: string;
  authorId?: string | null;
};
