import type {
  Answer,
  AnswerRow,
  CreateAnswerInput,
  UpdateAnswerInput,
} from "@/types/answer";
import { supabase } from "@/lib/supabase/client";
import { mapDbAnswer, mapDbAnswers } from "@/lib/supabase/mappers/answers";

/**
 * Fetch answers for a question (post id).
 * Highest score first; newer first on ties.
 */
export async function getAnswersByPostId(postId: string): Promise<Answer[]> {
  const { data, error } = await supabase
    .from("answers")
    .select("*")
    .eq("post_id", postId)
    .order("upvotes", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return mapDbAnswers(data as AnswerRow[] | null);
}

/**
 * Insert an answer and return the created row as app Answer.
 */
export async function createAnswer(input: CreateAnswerInput): Promise<Answer> {
  const { data, error } = await supabase
    .from("answers")
    .insert({
      post_id: input.postId,
      body: input.body,
      author_name: input.authorName ?? "You",
      author_id: input.authorId ?? null,
      upvotes: 0,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const answer = mapDbAnswer(data as AnswerRow);

  // Optional email to question author (no-op without Resend + service role)
  void import("@/lib/supabase/notifications").then(({ requestAnswerEmailNotification }) =>
    requestAnswerEmailNotification({
      postId: answer.postId,
      answerId: answer.id,
    }),
  );

  return answer;
}

/**
 * Update own answer body. RLS: author_id = auth.uid().
 */
export async function updateAnswer(
  id: string,
  input: UpdateAnswerInput,
): Promise<Answer> {
  const body = input.body.trim();
  if (!body) {
    throw new Error("Answer cannot be empty");
  }

  const { data, error } = await supabase
    .from("answers")
    .update({ body })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDbAnswer(data as AnswerRow);
}

/**
 * Delete own answer. Uses delete_own_answer RPC when present.
 */
export async function deleteAnswer(id: string): Promise<void> {
  const rpc = await supabase.rpc("delete_own_answer", { p_answer_id: id });

  if (!rpc.error) return;

  const missingFn =
    rpc.error.code === "PGRST202" ||
    /function .*delete_own_answer/i.test(rpc.error.message) ||
    /could not find/i.test(rpc.error.message);

  if (!missingFn) {
    throw new Error(rpc.error.message);
  }

  const { error } = await supabase.from("answers").delete().eq("id", id);
  if (error) {
    throw new Error(
      `${error.message} — If this answer has comments, run the delete_own_answer SQL in Supabase.`,
    );
  }
}

/**
 * Answers written by a given auth user (newest first).
 */
export async function getAnswersByAuthorId(
  authorId: string,
): Promise<Answer[]> {
  const id = authorId.trim();
  if (!id) return [];

  const { data, error } = await supabase
    .from("answers")
    .select("*")
    .eq("author_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return mapDbAnswers(data as AnswerRow[] | null);
}
