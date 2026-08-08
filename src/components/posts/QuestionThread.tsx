"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Answer } from "@/types/answer";
import { AnswerForm } from "@/components/posts/AnswerForm";
import { AnswerItem } from "@/components/posts/AnswerItem";
import { useAuth } from "@/components/providers/AuthProvider";
import { displayNameFromUser } from "@/lib/auth/displayName";
import { loginWithNext } from "@/lib/auth/safeNextPath";
import { draftKeys, saveDraft } from "@/lib/drafts";
import { createAnswer } from "@/lib/supabase/answers";
import { setAcceptedAnswer } from "@/lib/supabase/posts";

type QuestionThreadProps = {
  postId: string;
  postAuthorId?: string | null;
  initialAcceptedAnswerId?: string | null;
  initialAnswers: Answer[];
};

/** Accepted first, then highest score; newer first on ties. */
function sortAnswers(
  list: Answer[],
  acceptedId: string | null | undefined,
): Answer[] {
  return [...list].sort((a, b) => {
    if (acceptedId) {
      if (a.id === acceptedId && b.id !== acceptedId) return -1;
      if (b.id === acceptedId && a.id !== acceptedId) return 1;
    }
    if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

/**
 * Answers list + write-answer form + nested comments under each answer.
 */
export function QuestionThread({
  postId,
  postAuthorId,
  initialAcceptedAnswerId = null,
  initialAnswers,
}: QuestionThreadProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [acceptedAnswerId, setAcceptedId] = useState<string | null>(
    initialAcceptedAnswerId ?? null,
  );
  const [answers, setAnswers] = useState<Answer[]>(() =>
    sortAnswers(initialAnswers, initialAcceptedAnswerId),
  );

  const canAccept = Boolean(
    user && postAuthorId && user.id === postAuthorId,
  );

  /** @returns true if answer was saved to DB */
  async function handleAddAnswer(text: string): Promise<boolean> {
    if (!user) {
      saveDraft(draftKeys.answer(postId), { body: text });
      router.push(loginWithNext(`/p/${postId}`));
      return false;
    }

    const created = await createAnswer({
      postId,
      body: text,
      authorName: displayNameFromUser(user),
      authorId: user.id,
    });
    setAnswers((prev) => sortAnswers([...prev, created], acceptedAnswerId));
    return true;
  }

  function handleAnswerScoreChange(answerId: string, score: number) {
    setAnswers((prev) =>
      sortAnswers(
        prev.map((a) => (a.id === answerId ? { ...a, upvotes: score } : a)),
        acceptedAnswerId,
      ),
    );
  }

  function handleAnswerUpdated(updated: Answer) {
    setAnswers((prev) =>
      sortAnswers(
        prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)),
        acceptedAnswerId,
      ),
    );
  }

  function handleAnswerDeleted(answerId: string) {
    setAnswers((prev) => prev.filter((a) => a.id !== answerId));
    if (acceptedAnswerId === answerId) setAcceptedId(null);
  }

  async function handleToggleAccept(answerId: string) {
    const next = acceptedAnswerId === answerId ? null : answerId;
    const updated = await setAcceptedAnswer(postId, next);
    const id = updated.acceptedAnswerId ?? next;
    setAcceptedId(id);
    setAnswers((prev) => sortAnswers(prev, id));
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
        {canAccept && answers.length > 0 && (
          <p className="mt-1 text-[12px] text-[var(--muted)]">
            You asked this — accept the best answer when ready.
          </p>
        )}

        {answers.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">No answers yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {answers.map((a) => (
              <AnswerItem
                key={a.id}
                answer={a}
                isAccepted={acceptedAnswerId === a.id}
                canAccept={canAccept}
                onUpdated={handleAnswerUpdated}
                onDeleted={handleAnswerDeleted}
                onScoreChange={handleAnswerScoreChange}
                onToggleAccept={handleToggleAccept}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
