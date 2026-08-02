/** App-level question model (camelCase) */
export type Post = {
  id: string;
  communitySlug: string;
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
  upvotes: number;
};

/** Supabase posts table row (snake_case) */
export type PostRow = {
  id: string;
  community_slug: string;
  title: string;
  body: string;
  author_name: string;
  upvotes: number;
  created_at: string;
};

/** Payload for creating a post (no id / timestamps yet) */
export type CreatePostInput = {
  title: string;
  body: string;
  communitySlug: string;
  authorName?: string;
};