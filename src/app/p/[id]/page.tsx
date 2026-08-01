import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { QuestionThread } from "@/components/posts/QuestionThread";
import { posts, communities, comments } from "@/lib/seed";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const post = posts.find((p) => p.id === id);

  if (!post) {
    notFound();
  }

  const postComments = comments.filter((c) => c.postId === post.id);
  const community = communities.find((c) => c.slug === post.communitySlug);

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
            {community && (
              <span className="text-[12px] text-[var(--muted)]">
                {community.name}
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
            <p className="text-[15px] leading-relaxed text-[var(--ink)] whitespace-pre-wrap">
              {post.body}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-4 border-t border-[var(--line)] pt-4">
            <span className="text-sm font-bold tabular-nums text-[var(--purple)]">
              ↑ {post.upvotes}
            </span>
          </div>
        </article>

        {/* Form + live answers (client state) */}
        <QuestionThread
          postId={post.id}
          initialAnswers={postComments}
        />
      </div>
    </AppShell>
  );
}
