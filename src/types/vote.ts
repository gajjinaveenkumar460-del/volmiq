export type VoteTargetType = "post" | "answer" | "comment";

/** The current user's optional reaction to a target. */
export type MyReaction = "like" | "dislike" | null;

export type VoteRow = {
  id: string;
  user_id: string;
  target_type: VoteTargetType;
  target_id: string;
  reaction: Exclude<MyReaction, null>;
  created_at: string;
};
