export type Answer = {
  id: string;
  postId: string;
  authorName: string;
  /** Supabase Auth user id (null on older rows) */
  authorId?: string | null;
  body: string;
  createdAt: string;
  upvotes: number;
};

export type AnswerRow = {
  id: string;
  post_id: string;
  author_name: string;
  author_id?: string | null;
  body: string;
  created_at: string;
  upvotes: number;
};

/** Payload for creating an answer */
export type CreateAnswerInput = {
  postId: string;
  body: string;
  authorName?: string;
  authorId?: string | null;
};

/** Payload for updating own answer */
export type UpdateAnswerInput = {
  body: string;
};
