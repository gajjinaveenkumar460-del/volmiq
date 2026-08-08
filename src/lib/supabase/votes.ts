import type {
  CastVoteResult,
  MyVote,
  VoteTargetType,
} from "@/types/vote";
import { createClient } from "@/lib/supabase/client";

/**
 * Cast upvote (+1) or downvote (-1).
 * Same value again = remove vote. Opposite = switch.
 * Returns updated score + this user's vote (0 if cleared).
 */
export async function castVote(
  targetType: VoteTargetType,
  targetId: string,
  value: 1 | -1,
): Promise<CastVoteResult> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("cast_vote", {
    p_target_type: targetType,
    p_target_id: targetId,
    p_value: value,
  });

  if (error) {
    throw new Error(error.message);
  }

  const row = data as { score: number; myVote: number };
  const myVote = (row.myVote ?? 0) as MyVote;

  return {
    score: Number(row.score) || 0,
    myVote: myVote === 1 || myVote === -1 ? myVote : 0,
  };
}

/**
 * Current user's vote for one target (0 if none / not logged in).
 */
export async function getMyVote(
  targetType: VoteTargetType,
  targetId: string,
): Promise<MyVote> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const { data, error } = await supabase
    .from("votes")
    .select("value")
    .eq("user_id", user.id)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return 0;
  const v = data.value as number;
  return v === 1 || v === -1 ? v : 0;
}

/**
 * Map of targetId → myVote for many rows (e.g. feed).
 */
export async function getMyVotes(
  targetType: VoteTargetType,
  targetIds: string[],
): Promise<Record<string, MyVote>> {
  const out: Record<string, MyVote> = {};
  if (targetIds.length === 0) return out;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return out;

  const { data, error } = await supabase
    .from("votes")
    .select("target_id, value")
    .eq("user_id", user.id)
    .eq("target_type", targetType)
    .in("target_id", targetIds);

  if (error) {
    throw new Error(error.message);
  }

  for (const row of data ?? []) {
    const v = row.value as number;
    out[row.target_id as string] =
      v === 1 || v === -1 ? v : 0;
  }

  return out;
}
