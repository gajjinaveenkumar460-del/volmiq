"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Answer } from "@/types/answer";
import type { Post } from "@/types/post";
import { PostCard } from "@/components/posts/PostCard";
import {
  IconAnswers,
  IconArrowLeft,
  IconArrowRight,
  IconAsk,
  IconQuestions,
  IconUser,
} from "@/components/ui/Icons";
import { useAuth } from "@/components/providers/AuthProvider";
import { loginWithNext } from "@/lib/auth/safeNextPath";
import { getAnswersByAuthorId } from "@/lib/supabase/answers";
import { getPostsByAuthorId } from "@/lib/supabase/posts";

type Filter = "all" | "questions" | "answers";

type TimelineItem =
  | { kind: "question"; at: string; post: Post }
  | { kind: "answer"; at: string; answer: Answer };

/**
 * Single “My activity” hub — questions + answers with filter tabs.
 */
export function MyActivity() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
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
          router.replace(loginWithNext("/my"));
          return;
        }

        const [q, a] = await Promise.all([
          getPostsByAuthorId(user.id),
          getAnswersByAuthorId(user.id),
        ]);
        if (!cancelled) {
          setPosts(q);
          setAnswers(a);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load activity");
          setPosts([]);
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

  const timeline = useMemo(() => {
    const items: TimelineItem[] = [
      ...posts.map((post) => ({
        kind: "question" as const,
        at: post.createdAt,
        post,
      })),
      ...answers.map((answer) => ({
        kind: "answer" as const,
        at: answer.createdAt,
        answer,
      })),
    ];
    items.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
    if (filter === "questions") return items.filter((i) => i.kind === "question");
    if (filter === "answers") return items.filter((i) => i.kind === "answer");
    return items;
  }, [posts, answers, filter]);

  const showSkeleton = authLoading || loading;
  const username = user?.email?.split("@")[0] ?? "you";

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Profile-style header */}
      <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow-card)]">
        <div
          className="h-24 sm:h-28"
          style={{
            background:
              "linear-gradient(135deg, #ede9fe 0%, #fce7f3 50%, #fff7ed 100%)",
          }}
        />
        <div className="relative px-5 pb-5 sm:px-6">
          <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-3.5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-[var(--violet)] to-[var(--pink)] text-white shadow-md sm:h-[4.5rem] sm:w-[4.5rem]">
                <IconUser className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <div className="pb-0.5">
                <p className="text-[11px] font-semibold tracking-wide text-[var(--muted)] uppercase">
                  Your activity
                </p>
                <h1 className="text-xl font-bold tracking-tight text-[var(--ink)] sm:text-2xl">
                  @{username}
                </h1>
              </div>
            </div>
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-[var(--purple)] no-underline hover:text-[var(--purple-deep)]"
            >
              <IconArrowLeft className="h-3.5 w-3.5" />
              Back to feed
            </Link>
          </div>

          <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-[var(--muted)]">
            Questions you asked and answers you wrote — all in one place.
          </p>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard
              label="Questions"
              value={showSkeleton ? "—" : posts.length}
              icon={<IconQuestions className="h-4 w-4" />}
              active={filter === "questions"}
              onClick={() => setFilter("questions")}
            />
            <StatCard
              label="Answers"
              value={showSkeleton ? "—" : answers.length}
              icon={<IconAnswers className="h-4 w-4" />}
              active={filter === "answers"}
              onClick={() => setFilter("answers")}
            />
            <StatCard
              label="Total"
              value={showSkeleton ? "—" : posts.length + answers.length}
              icon={<IconUser className="h-4 w-4" />}
              active={filter === "all"}
              onClick={() => setFilter("all")}
              className="col-span-2 sm:col-span-1"
            />
          </div>
        </div>
      </section>

      {/* Filter bar — high-contrast segmented control */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="inline-flex rounded-full border border-[var(--line-strong)] bg-[var(--purple-soft)] p-1 shadow-sm"
          role="tablist"
          aria-label="Filter activity"
        >
          {(
            [
              ["all", "All"],
              ["questions", "Questions"],
              ["answers", "Answers"],
            ] as const
          ).map(([id, label]) => {
            const selected = filter === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setFilter(id)}
                className={[
                  "min-w-[4.75rem] rounded-full px-4 py-2 text-[13px] font-bold tracking-tight transition",
                  selected
                    ? "text-white shadow-md shadow-[var(--purple)]/30"
                    : "text-[var(--purple-deep)] hover:bg-white/70",
                ].join(" ")}
                style={
                  selected
                    ? {
                        background:
                          "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)",
                      }
                    : undefined
                }
              >
                {label}
              </button>
            );
          })}
        </div>

        <Link
          href="/ask"
          className="vol-btn-primary inline-flex h-9 items-center gap-1.5 px-4 text-[12px] no-underline"
        >
          <IconAsk className="h-3.5 w-3.5" />
          Ask a question
        </Link>
      </div>

      {/* Content */}
      <div className="mt-4 flex flex-col gap-3">
        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
            Could not load: {error}
          </p>
        )}

        {showSkeleton && <ActivitySkeleton />}

        {!showSkeleton && !error && timeline.length === 0 && (
          <div className="vol-card flex flex-col items-start gap-3 p-6 sm:p-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--purple-soft)] text-[var(--purple)]">
              {filter === "answers" ? (
                <IconAnswers className="h-5 w-5" />
              ) : (
                <IconQuestions className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[var(--ink)]">
                {filter === "answers"
                  ? "No answers yet"
                  : filter === "questions"
                    ? "No questions yet"
                    : "Nothing here yet"}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">
                {filter === "answers"
                  ? "Browse the feed and help someone with a clear answer."
                  : "Post your first question to start building your activity."}
              </p>
            </div>
            <Link
              href={filter === "answers" ? "/" : "/ask"}
              className="vol-btn-primary inline-flex h-10 px-4 no-underline"
            >
              {filter === "answers" ? "Browse questions" : "Ask a question"}
            </Link>
          </div>
        )}

        {!showSkeleton &&
          !error &&
          timeline.map((item) =>
            item.kind === "question" ? (
              <div key={`q-${item.post.id}`} className="relative">
                <TypeBadge type="question" />
                <PostCard post={item.post} />
              </div>
            ) : (
              <AnswerActivityCard
                key={`a-${item.answer.id}`}
                answer={item.answer}
              />
            ),
          )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  active,
  onClick,
  className = "",
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border-2 px-3.5 py-3 text-left transition",
        active
          ? "border-[var(--purple)] bg-[var(--purple-soft)] shadow-md shadow-[var(--purple)]/15"
          : "border-[var(--line)] bg-white hover:border-[var(--purple)]/25 hover:bg-[var(--paper)]",
        className,
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex items-center gap-1.5 text-[11px] font-bold",
          active ? "text-[var(--purple-deep)]" : "text-[var(--muted)]",
        ].join(" ")}
      >
        {icon}
        {label}
      </span>
      <p
        className={[
          "mt-1 text-2xl font-extrabold tracking-tight",
          active ? "text-[var(--purple-deep)]" : "text-[var(--ink)]",
        ].join(" ")}
      >
        {value}
      </p>
    </button>
  );
}

function TypeBadge({ type }: { type: "question" | "answer" }) {
  const isQ = type === "question";
  return (
    <span
      className={[
        "mb-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
        isQ
          ? "bg-[var(--purple-soft)] text-[var(--purple-deep)]"
          : "bg-[#fce7f3] text-[#be185d]",
      ].join(" ")}
    >
      {isQ ? (
        <IconQuestions className="h-3 w-3" />
      ) : (
        <IconAnswers className="h-3 w-3" />
      )}
      {isQ ? "Question" : "Answer"}
    </span>
  );
}

function AnswerActivityCard({ answer }: { answer: Answer }) {
  return (
    <article className="vol-card relative p-4 sm:p-5">
      <TypeBadge type="answer" />
      <p className="mt-1.5 text-[12px] text-[var(--muted)]">
        {answer.createdAt} · ↑ {answer.upvotes}
      </p>
      <p className="mt-2 line-clamp-4 text-[14px] leading-relaxed text-[var(--ink)]">
        {answer.body}
      </p>
      <Link
        href={`/p/${answer.postId}`}
        className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--purple)] no-underline hover:text-[var(--purple-deep)]"
      >
        View question
        <IconArrowRight className="h-3.5 w-3.5" />
      </Link>
    </article>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div key={i} className="vol-card p-5">
          <div className="vol-skeleton h-3 w-16" />
          <div className="vol-skeleton mt-3 h-4 w-3/4 max-w-[16rem]" />
          <div className="vol-skeleton mt-2 h-3 w-full" />
          <div className="vol-skeleton mt-1.5 h-3 w-5/6" />
        </div>
      ))}
    </div>
  );
}
