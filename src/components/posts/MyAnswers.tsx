"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Answer } from "@/types/answer";
import { AnswerListSkeleton } from "@/components/ui/Skeletons";
import { useAuth } from "@/components/providers/AuthProvider";
import { loginWithNext } from "@/lib/auth/safeNextPath";
import { getAnswersByAuthorId } from "@/lib/supabase/answers";

/**
 * Logged-in user's answers (author_id = session user).
 */
export function MyAnswers() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [answers, setAnswers] = useState<Answer[]>([]);
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
          router.replace(loginWithNext("/my-answers"));
          return;
        }

        const list = await getAnswersByAuthorId(user.id);
        if (!cancelled) setAnswers(list);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load answers");
          setAnswers([]);
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
          My answers
        </h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          Answers you wrote while signed in.
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-[12px] font-semibold">
          <Link
            href="/my-questions"
            className="text-[var(--muted)] no-underline hover:text-[var(--purple)]"
          >
            Questions
          </Link>
          <span className="text-[var(--purple)]">Answers</span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">Could not load: {error}</p>
      )}

      {showSkeleton && <AnswerListSkeleton count={3} />}

      {!showSkeleton && !error && answers.length === 0 && (
        <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm shadow-[var(--purple)]/5">
          <p className="text-sm text-[var(--muted)]">
            You haven’t answered any questions yet (or older answers have no
            author id).
          </p>
          <Link
            href="/"
            className="mt-3 inline-flex rounded-full bg-[var(--purple)] px-4 py-2 text-[12px] font-semibold text-white no-underline transition hover:bg-[var(--purple-deep)]"
          >
            Browse questions
          </Link>
        </div>
      )}

      {!showSkeleton &&
        !error &&
        answers.map((a) => (
          <article
            key={a.id}
            className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm shadow-[var(--purple)]/5 sm:p-5"
          >
            <p className="text-[12px] text-[var(--muted)]">
              {a.createdAt} · ↑ {a.upvotes}
            </p>
            <p className="mt-2 line-clamp-4 text-[14px] leading-relaxed text-[var(--ink)]">
              {a.body}
            </p>
            <Link
              href={`/p/${a.postId}`}
              className="mt-3 inline-flex text-[12px] font-semibold text-[var(--purple)] no-underline hover:text-[var(--purple-deep)]"
            >
              View question →
            </Link>
          </article>
        ))}
    </div>
  );
}
