import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { MyVotesProvider } from "@/components/posts/MyVotesProvider";
import { PostDetailCard } from "@/components/posts/PostDetailCard";
import { QuestionThread } from "@/components/posts/QuestionThread";
import { IconArrowLeft } from "@/components/ui/Icons";
import { getAllCommunities } from "@/lib/supabase/communities";
import { getPostThread } from "@/lib/supabase/posts";
import type { Community } from "@/types/community";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [thread, communities] = await Promise.all([
    getPostThread(id).catch(() => null),
    getAllCommunities().catch(() => [] as Community[]),
  ]);

  if (!thread) {
    notFound();
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
