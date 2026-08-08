"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Answer } from "@/types/answer";
import { AnswerForm } from "@/components/posts/AnswerForm";
import { AnswerComments } from "@/components/posts/AnswerComments";
import { VoteButtons } from "@/components/posts/VoteButtons";
import { displayNameFromUser } from "@/lib/auth/displayName";
import { createAnswer } from "@/lib/supabase/answers";
import { createClient } from "@/lib/supabase/client";

type QuestionThreadProps = {
  postId: string;
  initialAnswers: Answer[];
};

/**
 * Answers list + write-answer form + nested comments under each answer.
 */
export function QuestionThread({
  postId,
  initialAnswers,
}: QuestionThreadProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers);

  async function handleAddAnswer(text: string) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const created = await createAnswer({
      postId,
      body: text,
      authorName: displayNameFromUser(user),
      authorId: user.id,
    });
    setAnswers((prev) => [...prev, created]);
  }

  return (
    <div>
      <AnswerForm postId={postId} onAddAnswer={handleAddAnswer} />

      <section className="mt-8">
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--ink)]">
          Answers{" "}
          <span className="font-medium text-[var(--muted)]">
            ({answers.length})
          </span>
        </h2>

        {answers.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">No answers yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {answers.map((a) => (
              <li
                key={a.id}
                className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm shadow-[var(--purple)]/5"
              >
                <p className="text-[12px] text-[var(--muted)]">
                  {a.authorName} · {a.createdAt}
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink)]">
                  {a.body}
                </p>
                <div className="mt-3">
                  <VoteButtons
                    targetType="answer"
                    targetId={a.id}
                    initialScore={a.upvotes}
                    variant="inline"
                  />
                </div>

                <AnswerComments answerId={a.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
