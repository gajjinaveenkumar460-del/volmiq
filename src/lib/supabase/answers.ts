import type { Answer, AnswerRow, CreateAnswerInput } from "@/types/answer";
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

  return mapDbAnswer(data as AnswerRow);
}
