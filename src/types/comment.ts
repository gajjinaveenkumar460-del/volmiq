export type Comment = {
  id: string;
  answerId: string;
  parentId: string | null;
  authorName: string;
  body: string;
  createdAt: string;
  upvotes: number;
  children?: Comment[]; // filled when we build a tree
};

export type CommentRow = {
  id: string;
  answer_id: string;
  parent_id: string | null;
  author_name: string;
  body: string;
  created_at: string;
  upvotes: number;
};

export type CreateCommentInput = {
  answerId: string;
  parentId?: string | null; // null = on the answer
  body: string;
  authorName?: string;
};