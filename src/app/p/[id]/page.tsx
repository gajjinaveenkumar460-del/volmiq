import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PostDetailCard } from "@/components/posts/PostDetailCard";
import { QuestionThread } from "@/components/posts/QuestionThread";
import { getAllCommunities } from "@/lib/supabase/communities";
import { getAnswersByPostId } from "@/lib/supabase/answers";
import { getPostById } from "@/lib/supabase/posts";
import type { Answer } from "@/types/answer";
import type { Community } from "@/types/community";

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

  let communities: Community[] = [];
  let communityName: string | null = null;
  try {
    communities = await getAllCommunities();
    communityName =
      communities.find((c) => c.slug === post.communitySlug)?.name ?? null;
  } catch {
    communities = [];
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

        <PostDetailCard
          initialPost={post}
          communityName={communityName}
          communities={communities}
        />

        <QuestionThread
          postId={post.id}
          initialAnswers={initialAnswers}
        />
      </div>
    </AppShell>
  );
}
