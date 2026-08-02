export type Answer = {
  id: string;
  postId: string;
  authorName: string;
  body: string;
  createdAt: string;
  upvotes: number;
};

export type AnswerRow = {
  id: string;
  post_id: string;
  author_name: string;
  body: string;
  created_at: string;
  upvotes: number;
};

/** Payload for creating an answer */
export type CreateAnswerInput = {
  postId: string;
  body: string;
  authorName?: string;
};
