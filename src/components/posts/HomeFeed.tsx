"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Community } from "@/types/community";
import type { Post } from "@/types/post";
import { PostCard } from "@/components/posts/PostCard";
import {
  ChipsSkeleton,
  PostCardListSkeleton,
} from "@/components/ui/Skeletons";
import {
  IconAsk,
  IconClock,
  IconFlame,
  IconLayers,
  IconRoom,
} from "@/components/ui/Icons";
import { getAllCommunities } from "@/lib/supabase/communities";
import { getAllPosts, type FeedSort } from "@/lib/supabase/posts";

const PASTEL = [
  "bg-violet-100 text-violet-700",
  "bg-pink-100 text-pink-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-800",
  "bg-emerald-100 text-emerald-700",
  "bg-fuchsia-100 text-fuchsia-700",
];

export function HomeFeed() {
  const [selectedCommunity, setSelectedCommunity] = useState<string>("all");
  const [sort, setSort] = useState<FeedSort>("hot");
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
          getAllPosts(sort),
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
  }, [sort]);

  const visiblePosts =
    selectedCommunity === "all"
      ? dbPosts
      : dbPosts.filter((p) => p.communitySlug === selectedCommunity);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      {/* Rooms + sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex min-h-9 max-w-full flex-wrap gap-2">
          {loading && communities.length === 0 ? (
            <ChipsSkeleton count={5} />
          ) : (
            <>
              <button
                type="button"
                onClick={() => setSelectedCommunity("all")}
                className={
                  selectedCommunity === "all"
                    ? "vol-chip vol-chip-active gap-1.5"
                    : "vol-chip vol-chip-idle gap-1.5"
                }
              >
                <IconLayers className="h-3.5 w-3.5" />
                All
              </button>

              {communities.map((c, i) => {
                const active = selectedCommunity === c.slug;
                const pastel = PASTEL[i % PASTEL.length];
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCommunity(c.slug)}
                    className={
                      active
                        ? "vol-chip vol-chip-active gap-1.5"
                        : `vol-chip gap-1.5 border-0 ${pastel}`
                    }
                  >
                    <IconRoom className="h-3.5 w-3.5 opacity-80" />
                    {c.name}
                  </button>
                );
              })}
            </>
          )}
        </div>

        <div className="flex gap-0.5 rounded-full border border-[var(--line)] bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setSort("hot")}
            disabled={loading}
            className={
              sort === "hot"
                ? "inline-flex items-center gap-1 rounded-full bg-[var(--purple-soft)] px-3 py-1.5 text-[11px] font-semibold text-[var(--purple)]"
                : "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-60"
            }
          >
            <IconFlame className="h-3.5 w-3.5" />
            Hot
          </button>
          <button
            type="button"
            onClick={() => setSort("new")}
            disabled={loading}
            className={
              sort === "new"
                ? "inline-flex items-center gap-1 rounded-full bg-[var(--purple-soft)] px-3 py-1.5 text-[11px] font-semibold text-[var(--purple)]"
                : "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-60"
            }
          >
            <IconClock className="h-3.5 w-3.5" />
            New
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">Could not load posts: {error}</p>
      )}

      {loading && <PostCardListSkeleton count={4} />}

      {!loading && !error && visiblePosts.length === 0 && (
        <div className="vol-card p-8 text-center">
          <p className="text-sm text-[var(--muted)]">
            No posts in this room yet.
          </p>
          <Link
            href="/ask"
            className="vol-btn-primary mt-4 inline-flex h-10 gap-1.5 px-4 no-underline"
          >
            <IconAsk className="h-3.5 w-3.5" />
            Be the first to ask
          </Link>
        </div>
      )}

      {!loading &&
        !error &&
        visiblePosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
    </div>
  );
}
