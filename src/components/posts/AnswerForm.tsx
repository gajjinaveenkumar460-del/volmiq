"use client";

import { useState } from "react";

type AnswerFormProps = {
  postId: string;
  /** Parent (QuestionThread) appends the answer to the list */
  onAddAnswer: (text: string) => void;
};

export function AnswerForm({ postId, onAddAnswer }: AnswerFormProps) {
  const [body, setBody] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) {
      alert("Please write an answer first.");
      return;
    }

    onAddAnswer(text);
    console.log("Answer added", { postId, body: text });
    setBody("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm shadow-[var(--purple)]/5 sm:p-5"
      id="write-answer"
    >
      <h3 className="text-[14px] font-semibold tracking-tight text-[var(--ink)]">
        Write an answer
      </h3>
      <p className="mt-1 text-[12px] text-[var(--muted)]">
        Share a clear, helpful reply to this question.
      </p>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="Share a helpful answer…"
        className="mt-3 w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-[14px] text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--purple)] focus:ring-2 focus:ring-[var(--purple)]/20"
      />

      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          className="rounded-full bg-[var(--purple)] px-4 py-2 text-[12px] font-semibold tracking-wide text-white shadow-sm shadow-[var(--purple)]/20 transition hover:bg-[var(--purple-deep)]"
        >
          Post answer
        </button>
      </div>
    </form>
  );
}
