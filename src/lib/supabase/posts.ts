import type { CreatePostInput, Post, PostRow, PostRowWithCounts } from "@/types/post";
import { supabase } from "@/lib/supabase/client";
import { mapDbPost, mapDbPosts } from "@/lib/supabase/mappers/posts";

/** Embed answers + comment counts for feed cards */
const POST_SELECT_WITH_COUNTS = `
  *,
  answers (
    comments (count)
  )
`;

/**
 * Fetch all questions from Supabase, newest first.
 * Includes answerCount and commentCount.
 */
export async function getAllPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT_WITH_COUNTS)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return mapDbPosts(data as PostRowWithCounts[] | null);
}

/**
 * Fetch one question by id (uuid from Supabase).
 * Returns null if not found.
 */
export async function getPostById(id: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT_WITH_COUNTS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;
  return mapDbPost(data as PostRowWithCounts);
}

/**
 * Insert a question into Supabase and return the created Post.
 */
export async function createPost(input: CreatePostInput): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      title: input.title,
      body: input.body,
      community_slug: input.communitySlug,
      author_name: input.authorName ?? "You",
      upvotes: 0,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const post = mapDbPost(data as PostRow);
  return { ...post, answerCount: 0, commentCount: 0 };
}
