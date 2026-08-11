"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Post } from "@/types/post";
import { PostCard } from "@/components/posts/PostCard";
import { IconArrowLeft, IconSearch } from "@/components/ui/Icons";
import { PostCardListSkeleton } from "@/components/ui/Skeletons";
import { searchPosts } from "@/lib/supabase/posts";

export function SearchResults() {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(Boolean(q));
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
      <div className="mx-auto flex max-w-2xl flex-col gap-2">
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-[var(--ink)]">
          <IconSearch className="h-5 w-5 shrink-0 text-[var(--purple)]" />
          <span>Search</span>
        </h1>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          Type a word in the header and press Enter to find questions.
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-[var(--purple)] no-underline hover:text-[var(--purple-deep)]"
        >
          <IconArrowLeft className="h-3.5 w-3.5 shrink-0" />
          <span>Back to feed</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <header className="flex flex-col gap-2">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-[var(--purple)] no-underline hover:text-[var(--purple-deep)]"
        >
          <IconArrowLeft className="h-3.5 w-3.5 shrink-0" />
          <span>Back to feed</span>
        </Link>
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-[var(--ink)] sm:text-2xl">
          <IconSearch className="h-6 w-6 shrink-0 text-[var(--purple)]" />
          <span>Results for “{q}”</span>
        </h1>
        {!loading && !error && (
          <p className="text-[13px] text-[var(--muted)]">
            {posts.length} {posts.length === 1 ? "question" : "questions"}
          </p>
        )}
      </header>

      {error && (
        <p className="text-sm text-red-600">Could not search: {error}</p>
      )}

      {loading && <PostCardListSkeleton count={3} />}

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
