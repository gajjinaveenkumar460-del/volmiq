"use client";

import { useState } from "react";
import { communities, posts } from "@/lib/seed";
import { PostCard } from "@/components/posts/PostCard";
import { usePosts } from "@/components/posts/PostsProvider";

export function HomeFeed() {
  const { extraPosts } = usePosts();
  const [selectedCommunity, setSelectedCommunity] = useState<string>("all");

  // User-created questions first, then seed
  const allPosts = [...extraPosts, ...posts];

  const visiblePosts =
    selectedCommunity === "all"
      ? allPosts
      : allPosts.filter((p) => p.communitySlug === selectedCommunity);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3">
      {/* chips */}
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

      {/* posts */}
      {visiblePosts.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No posts in this room yet.</p>
      ) : (
        visiblePosts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}
