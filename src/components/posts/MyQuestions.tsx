"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Post } from "@/types/post";
import { PostCard } from "@/components/posts/PostCard";
import { PostCardListSkeleton } from "@/components/ui/Skeletons";
import {
  IconAnswers,
  IconArrowLeft,
  IconQuestions,
} from "@/components/ui/Icons";
import { useAuth } from "@/components/providers/AuthProvider";
import { loginWithNext } from "@/lib/auth/safeNextPath";
import { getPostsByAuthorId } from "@/lib/supabase/posts";

/**
 * Logged-in user's questions (author_id = session user).
 */
export function MyQuestions() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        if (!user) {
          router.replace(loginWithNext("/my-questions"));
          return;
        }

        const list = await getPostsByAuthorId(user.id);
        if (!cancelled) setPosts(list);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load questions");
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
  }, [user, authLoading, router]);

  const showSkeleton = authLoading || loading;

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
          <IconQuestions className="h-6 w-6 shrink-0 text-[var(--purple)]" />
          <span>My questions</span>
        </h1>

        <p className="text-[13px] leading-relaxed text-[var(--muted)]">
          Questions you posted while signed in.
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-4 text-[12px] font-semibold">
          <span className="inline-flex items-center gap-1.5 text-[var(--purple)]">
            <IconQuestions className="h-3.5 w-3.5 shrink-0" />
            Questions
          </span>
          <Link
            href="/my-answers"
            className="inline-flex items-center gap-1.5 text-[var(--muted)] no-underline hover:text-[var(--purple)]"
          >
            <IconAnswers className="h-3.5 w-3.5 shrink-0" />
            Answers
          </Link>
        </div>
      </header>

      {error && (
        <p className="text-sm text-red-600">Could not load: {error}</p>
      )}

      {showSkeleton && <PostCardListSkeleton count={3} />}

      {!showSkeleton && !error && posts.length === 0 && (
        <div className="vol-card p-5">
          <p className="text-sm text-[var(--muted)]">
            You haven’t posted any questions yet (or older posts have no
            author id).
          </p>
          <Link
            href="/ask"
            className="vol-btn-primary mt-3 inline-flex h-10 px-4 no-underline"
          >
            Ask a question
          </Link>
        </div>
      )}

      {!showSkeleton &&
        !error &&
        posts.map((post) => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
