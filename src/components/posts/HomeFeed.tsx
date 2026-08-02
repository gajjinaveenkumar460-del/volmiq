"use client";

import { useEffect, useState } from "react";
import type { Community } from "@/types/community";
import type { Post } from "@/types/post";
import { PostCard } from "@/components/posts/PostCard";
import { getAllCommunities } from "@/lib/supabase/communities";
import { getAllPosts } from "@/lib/supabase/posts";

export function HomeFeed() {
  const [selectedCommunity, setSelectedCommunity] = useState<string>("all");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [dbPosts, setDbPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [postsList, communitiesList] = await Promise.all([
          getAllPosts(),
          getAllCommunities(),
        ]);
        if (cancelled) return;
        setDbPosts(postsList);
        setCommunities(communitiesList);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load feed");
        setDbPosts([]);
        setCommunities([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const visiblePosts =
    selectedCommunity === "all"
      ? dbPosts
      : dbPosts.filter((p) => p.communitySlug === selectedCommunity);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3">
      <div className="mb-1 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedCommunity("all")}
          className={
            selectedCommunity === "all"
              ? "rounded-full bg-[var(--purple)] px-3 py-1.5 text-[12px] font-semibold text-white"
              : "rounded-full bg-[var(--purple-soft)] px-3 py-1.5 text-[12px] font-semibold text-[var(--purple)]"
          }
        >
          All
        </button>

        {communities.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCommunity(c.slug)}
            className={
              selectedCommunity === c.slug
                ? "rounded-full bg-[var(--purple)] px-3 py-1.5 text-[12px] font-semibold text-white"
                : "rounded-full bg-[var(--purple-soft)] px-3 py-1.5 text-[12px] font-semibold text-[var(--purple)]"
            }
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading && (
        <p className="text-sm text-[var(--muted)]">Loading questions…</p>
      )}

      {error && (
        <p className="text-sm text-red-600">Could not load posts: {error}</p>
      )}

      {!loading && !error && visiblePosts.length === 0 && (
        <p className="text-sm text-[var(--muted)]">No posts in this room yet.</p>
      )}

      {!loading &&
        visiblePosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
    </div>
  );
}
