"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Answer } from "@/types/answer";
import { AnswerListSkeleton } from "@/components/ui/Skeletons";
import {
  IconAnswers,
  IconArrowLeft,
  IconArrowRight,
  IconQuestions,
} from "@/components/ui/Icons";
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
          <IconAnswers className="h-6 w-6 shrink-0 text-[var(--purple)]" />
          <span>My answers</span>
        </h1>

        <p className="text-[13px] leading-relaxed text-[var(--muted)]">
          Answers you wrote while signed in.
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-4 text-[12px] font-semibold">
          <Link
            href="/my-questions"
            className="inline-flex items-center gap-1.5 text-[var(--muted)] no-underline hover:text-[var(--purple)]"
          >
            <IconQuestions className="h-3.5 w-3.5 shrink-0" />
            Questions
          </Link>
          <span className="inline-flex items-center gap-1.5 text-[var(--purple)]">
            <IconAnswers className="h-3.5 w-3.5 shrink-0" />
            Answers
          </span>
        </div>
      </header>

      {error && (
        <p className="text-sm text-red-600">Could not load: {error}</p>
      )}

      {showSkeleton && <AnswerListSkeleton count={3} />}

      {!showSkeleton && !error && answers.length === 0 && (
        <div className="vol-card p-5">
          <p className="text-sm text-[var(--muted)]">
            You haven’t answered any questions yet (or older answers have no
            author id).
          </p>
          <Link
            href="/"
            className="vol-btn-primary mt-3 inline-flex h-10 px-4 no-underline"
          >
            Browse questions
          </Link>
        </div>
      )}

      {!showSkeleton &&
        !error &&
        answers.map((a) => (
          <article key={a.id} className="vol-card p-4 sm:p-5">
            <p className="text-[12px] text-[var(--muted)]">
              {a.createdAt} · ↑ {a.upvotes}
            </p>
            <p className="mt-2 line-clamp-4 text-[14px] leading-relaxed text-[var(--ink)]">
              {a.body}
            </p>
            <Link
              href={`/p/${a.postId}`}
              className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--purple)] no-underline hover:text-[var(--purple-deep)]"
            >
              View question
              <IconArrowRight className="h-3.5 w-3.5" />
            </Link>
          </article>
        ))}
    </div>
  );
}
