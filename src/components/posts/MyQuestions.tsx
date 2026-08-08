"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Post } from "@/types/post";
import { PostCard } from "@/components/posts/PostCard";
import { PostCardListSkeleton } from "@/components/ui/Skeletons";
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
    <div className="mx-auto flex max-w-2xl flex-col gap-3">
      <div className="mb-1">
        <Link
          href="/"
          className="inline-flex text-[13px] font-semibold text-[var(--purple)] no-underline hover:text-[var(--purple-deep)]"
        >
          ← Back to feed
        </Link>
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-[var(--ink)]">
          My questions
        </h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          Questions you posted while signed in.
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-[12px] font-semibold">
          <span className="text-[var(--purple)]">Questions</span>
          <Link
            href="/my-answers"
            className="text-[var(--muted)] no-underline hover:text-[var(--purple)]"
          >
            Answers
          </Link>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">Could not load: {error}</p>
      )}

      {showSkeleton && <PostCardListSkeleton count={3} />}

      {!showSkeleton && !error && posts.length === 0 && (
        <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm shadow-[var(--purple)]/5">
          <p className="text-sm text-[var(--muted)]">
            You haven’t posted any questions yet (or older posts have no
            author id).
          </p>
          <Link
            href="/ask"
            className="mt-3 inline-flex rounded-full bg-[var(--purple)] px-4 py-2 text-[12px] font-semibold text-white no-underline transition hover:bg-[var(--purple-deep)]"
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
