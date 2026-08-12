"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { safeNextPath } from "@/lib/auth/safeNextPath";
import { createClient } from "@/lib/supabase/client";
import "./login-motion.css";

/** Login Design 1 — bubbles + glass card (active). */

type Mode = "signin" | "signup";

type AuthFormProps = {
  /** Return path after sign-in (already from ?next=) */
  next?: string | null;
};

export function AuthForm({ next }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeNextPath(next, "/");

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("error") === "auth") {
      setError("Google sign-in failed or was cancelled. Try again.");
    }
  }, [searchParams]);

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

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnTo)}`,
        },
      });
      if (oauthError) throw oauthError;
      // Browser redirects to Google; no further action
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Google sign-in failed. Enable Google in Supabase Auth → Providers.",
      );
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

          <div className="login-or" aria-hidden={false}>
            <span />
            <em>or</em>
            <span />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleGoogle}
            className="login-google"
          >
            <GoogleGlyph />
            Continue with Google
          </button>

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

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6.2 12 6.2c1.8 0 3 .7 3.7 1.4l2.5-2.4C16.7 3.8 14.6 3 12 3 6.9 3 2.8 7.1 2.8 12.2S6.9 21.4 12 21.4c5.2 0 8.6-3.6 8.6-8.7 0-.6-.1-1-.2-1.5H12z"
      />
    </svg>
  );
}
