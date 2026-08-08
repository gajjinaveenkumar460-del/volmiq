"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { safeNextPath } from "@/lib/auth/safeNextPath";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

type AuthFormProps = {
  /** Return path after sign-in (already from ?next=) */
  next?: string | null;
};

export function AuthForm({ next }: AuthFormProps) {
  const router = useRouter();
  const returnTo = safeNextPath(next, "/");

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const trimmedEmail = email.trim();

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnTo)}`,
          },
        });
        if (signUpError) throw signUpError;
        setMessage(
          "Account created. If email confirmation is on, check your inbox; otherwise you can sign in now.",
        );
        setMode("signin");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (signInError) throw signInError;
        router.push(returnTo);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm shadow-[var(--purple)]/5 sm:p-6"
      >
        <h1 className="text-xl font-semibold tracking-tight text-[var(--ink)]">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          {mode === "signin"
            ? "Welcome back to Volmiq."
            : "Join with email and password."}
        </p>
        {returnTo !== "/" && (
          <p className="mt-2 text-[12px] text-[var(--purple)]">
            After sign-in you’ll return to continue what you were writing.
          </p>
        )}

        <label className="mt-5 block text-[12px] font-semibold text-[var(--ink)]">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-[14px] text-[var(--ink)] outline-none focus:border-[var(--purple)] focus:ring-2 focus:ring-[var(--purple)]/20 disabled:opacity-60"
          />
        </label>

        <label className="mt-4 block text-[12px] font-semibold text-[var(--ink)]">
          Password
          <input
            type="password"
            required
            minLength={6}
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-[14px] text-[var(--ink)] outline-none focus:border-[var(--purple)] focus:ring-2 focus:ring-[var(--purple)]/20 disabled:opacity-60"
          />
        </label>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {message && (
          <p className="mt-3 text-sm text-[var(--purple)]">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-full bg-[var(--purple)] px-5 py-2.5 text-[13px] font-semibold tracking-wide text-white shadow-sm shadow-[var(--purple)]/20 transition hover:bg-[var(--purple-deep)] disabled:opacity-60"
        >
          {loading
            ? "Please wait…"
            : mode === "signin"
              ? "Sign in"
              : "Sign up"}
        </button>

        <p className="mt-4 text-center text-[13px] text-[var(--muted)]">
          {mode === "signin" ? (
            <>
              No account?{" "}
              <button
                type="button"
                className="font-semibold text-[var(--purple)]"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setMessage(null);
                }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="font-semibold text-[var(--purple)]"
                onClick={() => {
                  setMode("signin");
                  setError(null);
                  setMessage(null);
                }}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </form>

      <p className="mt-5 text-center text-[13px] text-[var(--muted)]">
        <Link
          href="/"
          className="font-semibold text-[var(--purple)] no-underline hover:text-[var(--purple-deep)]"
        >
          Continue without signing in
        </Link>
      </p>
    </div>
  );
}
