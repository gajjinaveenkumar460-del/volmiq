"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { safeNextPath } from "@/lib/auth/safeNextPath";
import { createClient } from "@/lib/supabase/client";
import "./login-motion.css";

/** Snapshot: Login Design 1 (bubbles + glass card). Restore by copying to src/components/auth/. */

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
    <div className="login-viewport">
      {/* Fixed full-screen ambient — clearly animated */}
      <div className="login-ambient" aria-hidden>
        <div className="login-ambient-wash" />
        <span className="login-blob login-blob-a" />
        <span className="login-blob login-blob-b" />
        <span className="login-blob login-blob-c" />
        <span className="login-blob login-blob-d" />
        <span className="login-blob login-blob-e" />
        <span className="login-blob login-blob-f" />
        <span className="login-bubble login-bubble-1" />
        <span className="login-bubble login-bubble-2" />
        <span className="login-bubble login-bubble-3" />
        <span className="login-bubble login-bubble-4" />
        <span className="login-bubble login-bubble-5" />
        <span className="login-bubble login-bubble-6" />
        <span className="login-bubble login-bubble-7" />
        <span className="login-bubble login-bubble-8" />
        <div className="login-particles">
          <span className="login-particle" />
          <span className="login-particle" />
          <span className="login-particle" />
          <span className="login-particle" />
          <span className="login-particle" />
          <span className="login-particle" />
          <span className="login-particle" />
          <span className="login-particle" />
          <span className="login-particle" />
          <span className="login-particle" />
        </div>
      </div>

      <div className="login-stage">
        <form onSubmit={handleSubmit} className="login-card">
          <div className="login-mark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/volmiq-mark.png" alt="" aria-hidden />
            <p className="login-wordmark">VOLMIQ</p>
          </div>

          <h1 className="login-title">
            {mode === "signin" ? "Welcome back" : "Join Volmiq"}
          </h1>
          <p className="login-sub">
            {mode === "signin"
              ? "Sign in to ask, answer, and grow with the community."
              : "Create an account with email and password."}
          </p>
          {returnTo !== "/" && (
            <p className="login-hint">
              After sign-in you’ll return to continue what you were writing.
            </p>
          )}

          <div className="login-fields">
            <label className="login-field">
              <span className="login-field-label">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="you@example.com"
              />
            </label>

            <label className="login-field">
              <span className="login-field-label">Password</span>
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
                placeholder="••••••••"
              />
            </label>

            {error && (
              <p className="login-alert login-alert-error" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="login-alert login-alert-ok" role="status">
                {message}
              </p>
            )}

            <button type="submit" disabled={loading} className="login-submit">
              {loading
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </div>

          <p className="login-switch">
            {mode === "signin" ? (
              <>
                No account?{" "}
                <button
                  type="button"
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

        <p className="login-continue">
          <Link href="/">
            Continue without signing in
            <span aria-hidden>→</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
