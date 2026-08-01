"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { communities } from "@/lib/seed";
import type { post } from "@/lib/seed";
import { usePosts } from "@/components/posts/PostsProvider";
import Link from "next/link";

export function AskForm() {
  const router = useRouter();
  const { addPost } = usePosts();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [communitySlug, setCommunitySlug] = useState(
    communities[0]?.slug ?? "upsc",
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle) {
      alert("Please write a title first.");
      return;
    }

    const newPost: post = {
      id: `local-${Date.now()}`,
      title: trimmedTitle,
      body: trimmedBody,
      communitySlug,
      authorName: "You",
      createdAt: new Date().toISOString().slice(0, 10),
      upvotes: 0,
    };

    addPost(newPost);

    setTitle("");
    setBody("");
    setCommunitySlug(communities[0]?.slug ?? "upsc");

    router.push("/");
  }

  return (
    <>
    <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--purple)] no-underline transition hover:text-[var(--purple-deep)]"
        >
          ← Back to feed
        </Link>

        <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm shadow-[var(--purple)]/5 sm:p-6"
    >
      <h1 className="text-xl font-semibold tracking-tight text-[var(--ink)]">
        Ask a question
      </h1>
      <p className="mt-1 text-[13px] text-[var(--muted)]">
        Pick a room and write a clear title so others can answer.
      </p>

      <label className="mt-5 block text-[12px] font-semibold text-[var(--ink)]">
        Room
        <select
          value={communitySlug}
          onChange={(e) => setCommunitySlug(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-[14px] text-[var(--ink)] outline-none focus:border-[var(--purple)] focus:ring-2 focus:ring-[var(--purple)]/20"
        >
          {communities.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block text-[12px] font-semibold text-[var(--ink)]">
        Title
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. What is AI in simple words?"
          className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--purple)] focus:ring-2 focus:ring-[var(--purple)]/20"
        />
      </label>

      <label className="mt-4 block text-[12px] font-semibold text-[var(--ink)]">
        Details{" "}
        <span className="font-normal text-[var(--muted)]">(optional)</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder="Add context, what you tried, or what you need…"
          className="mt-1.5 w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--purple)] focus:ring-2 focus:ring-[var(--purple)]/20"
        />
      </label>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          className="rounded-full bg-[var(--purple)] px-5 py-2.5 text-[13px] font-semibold tracking-wide text-white shadow-sm shadow-[var(--purple)]/20 transition hover:bg-[var(--purple-deep)]"
        >
          Post question
        </button>
      </div>
    </form>
    </>
    
  );
}
