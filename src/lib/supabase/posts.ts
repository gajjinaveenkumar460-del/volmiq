import type {
  CreatePostInput,
  Post,
  PostRow,
  PostRowWithCounts,
  UpdatePostInput,
} from "@/types/post";
import { supabase } from "@/lib/supabase/client";
import { mapDbPost, mapDbPosts } from "@/lib/supabase/mappers/posts";

/** Embed answers + comment counts for feed cards */
const POST_SELECT_WITH_COUNTS = `
  *,
  answers (
    comments (count)
  )
`;

export type FeedSort = "new" | "hot";

/**
 * Fetch all questions from Supabase.
 * sort "new" = newest first; "hot" = highest score, then newest.
 * Includes answerCount and commentCount.
 */
export async function getAllPosts(sort: FeedSort = "new"): Promise<Post[]> {
  let query = supabase.from("posts").select(POST_SELECT_WITH_COUNTS);

  if (sort === "hot") {
    query = query
      .order("upvotes", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

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
      author_id: input.authorId ?? null,
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

/**
 * Update own question (title / body / room).
 * RLS should require author_id = auth.uid().
 */
export async function updatePost(
  id: string,
  input: UpdatePostInput,
): Promise<Post> {
  const title = input.title.trim();
  if (!title) {
    throw new Error("Title is required");
  }

  const { data, error } = await supabase
    .from("posts")
    .update({
      title,
      body: input.body.trim(),
      community_slug: input.communitySlug,
    })
    .eq("id", id)
    .select(POST_SELECT_WITH_COUNTS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDbPost(data as PostRowWithCounts);
}

/**
 * Delete own question.
 * Uses delete_own_post RPC when present (cleans answers/comments/votes).
 * Otherwise direct delete (works if FKs cascade or there are no children).
 */
export async function deletePost(id: string): Promise<void> {
  const rpc = await supabase.rpc("delete_own_post", { p_post_id: id });

  if (!rpc.error) return;

  // Function missing → try plain delete
  const missingFn =
    rpc.error.code === "PGRST202" ||
    /function .*delete_own_post/i.test(rpc.error.message) ||
    /could not find/i.test(rpc.error.message);

  if (!missingFn) {
    throw new Error(rpc.error.message);
  }

  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) {
    throw new Error(
      `${error.message} — If this post has answers, run the delete_own_post SQL in Supabase.`,
    );
  }
}

/**
 * Mark (or clear) the accepted answer on a question.
 * Only the post author can update (RLS). answerId must belong to this post.
 */
export async function setAcceptedAnswer(
  postId: string,
  answerId: string | null,
): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .update({ accepted_answer_id: answerId })
    .eq("id", postId)
    .select(POST_SELECT_WITH_COUNTS)
    .single();

  if (error) {
    throw new Error(
      error.message.includes("accepted_answer_id")
        ? `${error.message} — Run the accepted_answer_id SQL in Supabase.`
        : error.message,
    );
  }

  return mapDbPost(data as PostRowWithCounts);
}

/**
 * Questions authored by a given auth user id (newest first).
 * Older rows with null author_id will not appear.
 */
export async function getPostsByAuthorId(authorId: string): Promise<Post[]> {
  const id = authorId.trim();
  if (!id) return [];

  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT_WITH_COUNTS)
    .eq("author_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return mapDbPosts(data as PostRowWithCounts[] | null);
}

/**
 * Search questions by title or body (case-insensitive).
 * Empty / whitespace query → empty list.
 */
export async function searchPosts(query: string): Promise<Post[]> {
  const q = query.trim();
  if (!q) return [];

  // Avoid breaking PostgREST .or() filter syntax
  const safe = q.replace(/[%_,.()]/g, " ").trim();
  if (!safe) return [];

  // Quotes allow spaces in the pattern (PostgREST filter syntax)
  const pattern = `"%${safe}%"`;

  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT_WITH_COUNTS)
    .or(`title.ilike.${pattern},body.ilike.${pattern}`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return mapDbPosts(data as PostRowWithCounts[] | null);
}
