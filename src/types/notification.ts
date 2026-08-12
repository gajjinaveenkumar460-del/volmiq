export type NotificationType =
  | "answer_on_question"
  | "comment_on_answer"
  | "reply_to_comment";

export type AppNotification = {
  id: string;
  userId: string;
  actorId: string | null;
  actorName: string | null;
  type: NotificationType;
  postId: string;
  answerId: string | null;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export type NotificationRow = {
  id: string;
  user_id: string;
  actor_id: string | null;
  actor_name: string | null;
  type: string;
  post_id: string;
  answer_id: string | null;
  body: string;
  read_at: string | null;
  created_at: string;
};
