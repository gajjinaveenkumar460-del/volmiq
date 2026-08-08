export type VoteTargetType = "post" | "answer" | "comment";

/** User's vote on a target: +1 up, -1 down, 0 none */
export type MyVote = -1 | 0 | 1;

export type CastVoteResult = {
  score: number;
  myVote: MyVote;
};

export type VoteRow = {
  id: string;
  user_id: string;
  target_type: VoteTargetType;
  target_id: string;
  value: -1 | 1;
  created_at: string;
};
