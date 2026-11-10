import type { MyReaction, VoteTargetType } from "@/types/vote";
import { createClient } from "@/lib/supabase/client";

/**
 * Live Supabase still stores votes.value as 1 or -1 and exposes cast_vote.
 * After supabase/like_dislike_migration.sql, rows use reaction and cast_reaction.
 * One probe per page load picks the shape so the feed does not 400 on every card.
 */
type VoteStore = "reaction" | "value";

let storePromise: Promise<VoteStore> | null = null;

function reactionFromRaw(raw: unknown): MyReaction {
  if (raw === "like" || raw === "dislike") return raw;
  const score = typeof raw === "string" ? Number(raw) : raw;
  if (score === 1) return "like";
  if (score === -1) return "dislike";
  return null;
}

function missingRpc(message: string, name: string) {
  return (
    message.includes(name) &&
    /schema cache|could not find the function/i.test(message)
  );
}

async function voteStore(): Promise<VoteStore> {
  if (!storePromise) {
    storePromise = (async () => {
      const supabase = createClient();
      const legacy = await supabase.from("votes").select("value").limit(1);
      if (!legacy.error) return "value";

      const named = await supabase.from("votes").select("reaction").limit(1);
      if (!named.error) return "reaction";

      throw new Error(legacy.error.message);
    })().catch((err) => {
      storePromise = null;
      throw err;
    });
  }

  return storePromise;
}

async function readReactions(
  targetType: VoteTargetType,
  targetIds: string[],
  userId: string,
): Promise<Record<string, MyReaction>> {
  const out: Record<string, MyReaction> = {};
  if (!userId || targetIds.length === 0) return out;

  const supabase = createClient();
  const store = await voteStore();
  const column = store === "reaction" ? "reaction" : "value";
  const { data, error } = await supabase
    .from("votes")
    .select(`target_id, ${column}`)
    .eq("user_id", userId)
    .eq("target_type", targetType)
    .in("target_id", targetIds);

  if (error) {
    throw new Error(error.message);
  }

  for (const row of data ?? []) {
    const record = row as { target_id?: string; reaction?: unknown; value?: unknown };
    if (!record.target_id) continue;
    out[record.target_id] = reactionFromRaw(
      store === "reaction" ? record.reaction : record.value,
    );
  }

  return out;
}

/**
 * Toggle a like or dislike for one target.
 * Selecting the current reaction again removes it; selecting the other switches it.
 */
export async function castReaction(
  targetType: VoteTargetType,
  targetId: string,
  reaction: Exclude<MyReaction, null>,
): Promise<MyReaction> {
  const supabase = createClient();
  let store = await voteStore();

  if (store === "reaction") {
    const { data, error } = await supabase.rpc("cast_reaction", {
      p_target_type: targetType,
      p_target_id: targetId,
      p_reaction: reaction,
    });

    if (error && missingRpc(error.message, "cast_reaction")) {
      storePromise = Promise.resolve("value");
      store = "value";
    } else if (error) {
      throw new Error(error.message);
    } else {
      const result = data as { myReaction?: unknown } | null;
      return reactionFromRaw(result?.myReaction);
    }
  }

  const { data, error } = await supabase.rpc("cast_vote", {
    p_target_type: targetType,
    p_target_id: targetId,
    p_value: reaction === "like" ? 1 : -1,
  });

  if (error && missingRpc(error.message, "cast_vote")) {
    storePromise = Promise.resolve("reaction");
    const retry = await supabase.rpc("cast_reaction", {
      p_target_type: targetType,
      p_target_id: targetId,
      p_reaction: reaction,
    });
    if (retry.error) throw new Error(retry.error.message);
    const result = retry.data as { myReaction?: unknown } | null;
    return reactionFromRaw(result?.myReaction);
  }

  if (error) {
    throw new Error(error.message);
  }

  const result = data as { myVote?: unknown } | null;
  return reactionFromRaw(result?.myVote);
}

/**
 * Current user's reaction for one target (null if none).
 * Caller passes the auth user id already loaded by AuthProvider.
 */
export async function getMyReaction(
  targetType: VoteTargetType,
  targetId: string,
  userId: string,
): Promise<MyReaction> {
  const found = await readReactions(targetType, [targetId], userId);
  return found[targetId] ?? null;
}

/**
 * Map of targetId → myReaction for many rows (e.g. a question page).
 */
export async function getMyReactions(
  targetType: VoteTargetType,
  targetIds: string[],
  userId: string,
): Promise<Record<string, MyReaction>> {
  return readReactions(targetType, targetIds, userId);
}
