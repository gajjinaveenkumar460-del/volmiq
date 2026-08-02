import type { CreatePostInput, Post, PostRow } from "@/types/post";
import { supabase } from "@/lib/supabase/client";
import { mapDbPost, mapDbPosts } from "@/lib/supabase/mappers/posts";

/**
 * Fetch all questions from Supabase, newest first.
 * Returns app-level Post[] (camelCase).
 */
export async function getAllPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // Client has no generated Database types yet — assert row shape, then map
  return mapDbPosts(data as PostRow[] | null);
}

/**
 * Fetch one question by id (uuid from Supabase).
 * Returns null if not found.
 */
export async function getPostById(id: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;
  return mapDbPost(data as PostRow);
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

  return mapDbPost(data as PostRow);
}
