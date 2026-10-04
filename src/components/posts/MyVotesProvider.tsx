"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getMyVotes } from "@/lib/supabase/votes";
import type { MyVote, VoteTargetType } from "@/types/vote";

type VoteMap = Record<string, MyVote>;

const MyVotesContext = createContext<VoteMap | null>(null);

function voteKey(targetType: VoteTargetType, targetId: string) {
  return `${targetType}:${targetId}`;
}

function fill(
  into: VoteMap,
  targetType: VoteTargetType,
  votes: Record<string, MyVote>,
) {
  for (const [id, value] of Object.entries(votes)) {
    into[voteKey(targetType, id)] = value;
  }
}

/**
 * One vote lookup for the whole question (post + answers + comments).
 * Vote buttons read this instead of each calling Auth.
 */
export function MyVotesProvider({
  postId,
  answerIds,
  commentIds,
  children,
}: {
  postId: string;
  answerIds: string[];
  commentIds: string[];
  children: ReactNode;
}) {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [votes, setVotes] = useState<VoteMap>({});
  const answerKey = answerIds.join("\0");
  const commentKey = commentIds.join("\0");

  useEffect(() => {
    if (!userId) {
      setVotes({});
      return;
    }

    let cancelled = false;
    const answers = answerKey ? answerKey.split("\0") : [];
    const comments = commentKey ? commentKey.split("\0") : [];

    Promise.all([
      getMyVotes("post", [postId], userId),
      getMyVotes("answer", answers, userId),
      getMyVotes("comment", comments, userId),
    ])
      .then(([postVotes, answerVotes, commentVotes]) => {
        if (cancelled) return;
        const next: VoteMap = {};
        fill(next, "post", postVotes);
        fill(next, "answer", answerVotes);
        fill(next, "comment", commentVotes);
        setVotes(next);
      })
      .catch(() => {
        if (!cancelled) setVotes({});
      });

    return () => {
      cancelled = true;
    };
  }, [userId, postId, answerKey, commentKey]);

  const value = useMemo(() => votes, [votes]);

  return (
    <MyVotesContext.Provider value={value}>{children}</MyVotesContext.Provider>
  );
}

export function useProvidedVote(
  targetType: VoteTargetType,
  targetId: string,
): MyVote | undefined {
  const votes = useContext(MyVotesContext);
  if (!votes) return undefined;
  return votes[voteKey(targetType, targetId)] ?? 0;
}
