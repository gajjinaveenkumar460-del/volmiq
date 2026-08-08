"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Post } from "@/types/post";
import { PostCard } from "@/components/posts/PostCard";
import { searchPosts } from "@/lib/supabase/posts";

export function SearchResults() {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!q) {
        setPosts([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const list = await searchPosts(q);
        if (!cancelled) setPosts(list);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Search failed");
          setPosts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [q]);

  if (!q) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--ink)]">
          Search
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Type a word in the header and press Enter to find questions.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex text-[13px] font-semibold text-[var(--purple)] no-underline hover:text-[var(--purple-deep)]"
        >
          ← Back to feed
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3">
      <div className="mb-1">
        <Link
          href="/"
          className="inline-flex text-[13px] font-semibold text-[var(--purple)] no-underline hover:text-[var(--purple-deep)]"
        >
          ← Back to feed
        </Link>
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-[var(--ink)]">
          Results for “{q}”
        </h1>
        {!loading && !error && (
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            {posts.length} {posts.length === 1 ? "question" : "questions"}
          </p>
        )}
      </div>

      {loading && (
        <p className="text-sm text-[var(--muted)]">Searching…</p>
      )}

      {error && (
        <p className="text-sm text-red-600">Could not search: {error}</p>
      )}

      {!loading && !error && posts.length === 0 && (
        <p className="text-sm text-[var(--muted)]">
          No questions matched. Try another word or{" "}
          <Link
            href="/ask"
            className="font-semibold text-[var(--purple)] no-underline hover:text-[var(--purple-deep)]"
          >
            ask a new one
          </Link>
          .
        </p>
      )}

      {!loading &&
        !error &&
        posts.map((post) => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
