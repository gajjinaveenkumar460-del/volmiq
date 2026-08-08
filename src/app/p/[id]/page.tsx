import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { QuestionThread } from "@/components/posts/QuestionThread";
import { VoteButtons } from "@/components/posts/VoteButtons";
import { getAllCommunities } from "@/lib/supabase/communities";
import { getAnswersByPostId } from "@/lib/supabase/answers";
import { getPostById } from "@/lib/supabase/posts";
import type { Answer } from "@/types/answer";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;

  let post = null;
  try {
    post = await getPostById(id);
  } catch {
    post = null;
  }

  if (!post) {
    notFound();
  }

  let initialAnswers: Answer[] = [];
  try {
    initialAnswers = await getAnswersByPostId(post.id);
  } catch {
    initialAnswers = [];
  }

  let communityName: string | null = null;
  try {
    const communities = await getAllCommunities();
    communityName =
      communities.find((c) => c.slug === post.communitySlug)?.name ?? null;
  } catch {
    communityName = null;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--purple)] no-underline transition hover:text-[var(--purple-deep)]"
        >
          ← Back to feed
        </Link>

        <article className="mt-4 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm shadow-[var(--purple)]/5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[var(--purple-soft)] px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-[var(--purple)]">
              c/{post.communitySlug}
            </span>
            {communityName && (
              <span className="text-[12px] text-[var(--muted)]">
                {communityName}
              </span>
            )}
          </div>

          <h1 className="mt-3 text-xl font-semibold tracking-tight text-[var(--ink)] sm:text-2xl">
            {post.title}
          </h1>

          <p className="mt-2 text-[13px] text-[var(--muted)]">
            {post.authorName} · {post.createdAt}
          </p>

          <div className="mt-5 border-t border-[var(--line)] pt-5">
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-[var(--ink)]">
              {post.body}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-4 border-t border-[var(--line)] pt-4">
            <VoteButtons
              targetType="post"
              targetId={post.id}
              initialScore={post.upvotes}
              variant="inline"
            />
          </div>
        </article>

        <QuestionThread
          postId={post.id}
          initialAnswers={initialAnswers}
        />
      </div>
    </AppShell>
  );
}
