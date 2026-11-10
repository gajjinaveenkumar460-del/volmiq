import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { MyVotesProvider } from "@/components/posts/MyVotesProvider";
import { PostDetailCard } from "@/components/posts/PostDetailCard";
import { QuestionThread } from "@/components/posts/QuestionThread";
import { IconArrowLeft } from "@/components/ui/Icons";
import { getAllCommunities } from "@/lib/supabase/communities";
import { getPostThread, type PostThread } from "@/lib/supabase/posts";
import type { Community } from "@/types/community";

type PageProps = {
  params: Promise<{ id: string }>;
};

function isTransient(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /fetch failed|network|enotfound|econnreset|timed out|timeout/i.test(
    message,
  );
}

/**
 * A dropped database connection used to fall through to notFound(),
 * so every question looked like a missing page.
 */
async function loadThread(
  id: string,
): Promise<{ thread: PostThread | null; error: string | null }> {
  let last: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return { thread: await getPostThread(id), error: null };
    } catch (error) {
      last = error;
      if (!isTransient(error) || attempt === 2) break;
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }

  const message = last instanceof Error ? last.message : "";
  return {
    thread: null,
    error: isTransient(last)
      ? "Could not reach the database. Refresh and try again."
      : message || "Could not load this question.",
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [{ thread, error }, communities] = await Promise.all([
    loadThread(id),
    getAllCommunities().catch(() => [] as Community[]),
  ]);

  if (error || !thread) {
    if (!error) notFound();

    return (
      <AppShell>
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-[var(--purple)] no-underline transition hover:text-[var(--purple-deep)]"
          >
            <IconArrowLeft className="h-3.5 w-3.5 shrink-0" />
            <span>Back to feed</span>
          </Link>
          <div className="vol-card p-6">
            <p className="text-[15px] font-semibold text-[var(--ink)]">
              This question did not load.
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
              {error}
            </p>
            <Link
              href={`/p/${id}`}
              className="vol-btn-primary mt-4 inline-flex h-10 px-4 no-underline"
            >
              Try again
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const { post, answers, commentsByAnswerId } = thread;
  const communityName =
    communities.find((c) => c.slug === post.communitySlug)?.name ?? null;
  const commentIds = Object.values(commentsByAnswerId).flatMap((list) =>
    list.map((comment) => comment.id),
  );

  return (
    <AppShell>
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-[var(--purple)] no-underline transition hover:text-[var(--purple-deep)]"
        >
          <IconArrowLeft className="h-3.5 w-3.5 shrink-0" />
          <span>Back to feed</span>
        </Link>

        <MyVotesProvider
          postId={post.id}
          answerIds={answers.map((answer) => answer.id)}
          commentIds={commentIds}
        >
          <PostDetailCard
            initialPost={post}
            communityName={communityName}
            communities={communities}
          />

          <QuestionThread
            postId={post.id}
            postAuthorId={post.authorId}
            initialAcceptedAnswerId={post.acceptedAnswerId}
            initialAnswers={answers}
            initialCommentsByAnswerId={commentsByAnswerId}
          />
        </MyVotesProvider>
      </div>
    </AppShell>
  );
}
