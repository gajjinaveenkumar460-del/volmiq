"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { safeNextPath } from "@/lib/auth/safeNextPath";
import { createClient } from "@/lib/supabase/client";
import "./login-motion.css";

type Mode = "signin" | "signup";

type AuthFormProps = {
  next?: string | null;
};

/**
 * Design 4 polished — dark editorial luxury.
 * Design 1 (bubbles): designs/design1/
 */
export function AuthForm({ next }: AuthFormProps) {
  const router = useRouter();
  const returnTo = safeNextPath(next, "/");

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError(null);
    setMessage(null);
  }

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
    <div className="login-d4">
      <div className="login-d4-atmosphere" aria-hidden>
        <div className="login-d4-glow-a" />
        <div className="login-d4-glow-b" />
        <div className="login-d4-sweep" />
        <div className="login-d4-grain" />
        <div className="login-d4-vignette" />
        <span className="login-d4-watermark">V</span>
      </div>

      <section className="login-d4-left">
        <div className="login-d4-brand-row">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/volmiq-mark.png" alt="" />
          <span>Volmiq</span>
        </div>

        <div className="login-d4-hero">
          <h1>
            Where curiosity
            <br />
            meets <em>clarity.</em>
          </h1>
          <i className="login-d4-rule" aria-hidden />
          <p>
            A refined space for serious aspirants — ask sharper questions, share
            real answers, grow with people who care.
          </p>
        </div>

        <div className="login-d4-meta">
          <div>
            <strong>Focus</strong>
            <span>UPSC · JEE · NEET · GATE · Careers</span>
          </div>
          <div>
            <strong>Promise</strong>
            <span>Real voices. Real answers.</span>
          </div>
        </div>

        <span className="login-d4-vline" aria-hidden />
      </section>

      <section className="login-d4-right">
        <div className="login-d4-topbar">
          <Link href="/" className="login-d4-topbar-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/volmiq-mark.png" alt="" />
            <span>Volmiq</span>
          </Link>
          <Link href="/" className="login-d4-explore">
            Explore
            <span aria-hidden>↗</span>
          </Link>
        </div>

        <div className="login-d4-form-block">
          <p className="login-d4-eyebrow">Member access</p>
          <h2>{mode === "signin" ? "Welcome back" : "Join Volmiq"}</h2>
          <p className="login-d4-lede">
            {mode === "signin"
              ? "Sign in with your email to continue your journey."
              : "Create an account — email and password, nothing noisy."}
          </p>
          {returnTo !== "/" && (
            <p className="login-d4-hint">
              After signing in you’ll return to finish what you were writing.
            </p>
          )}

          <div
            className="login-d4-modes"
            role="tablist"
            aria-label="Authentication mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signin"}
              onClick={() => switchMode("signin")}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              onClick={() => switchMode("signup")}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-d4-fields">
            <label className="login-d4-field">
              <span>Email</span>
              <div className="login-d4-input-wrap">
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="name@domain.com"
                />
              </div>
            </label>

            <label className="login-d4-field">
              <span>Password</span>
              <div className="login-d4-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  className="login-d4-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </label>

            {error && (
              <p className="login-d4-alert login-d4-alert-error" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="login-d4-alert login-d4-alert-ok" role="status">
                {message}
              </p>
            )}

            <button type="submit" disabled={loading} className="login-d4-submit">
              {loading
                ? "Please wait…"
                : mode === "signin"
                  ? "Enter Volmiq"
                  : "Create account"}
            </button>
          </form>

          <div className="login-d4-footer">
            <Link href="/">Continue as guest</Link>
            <span className="login-d4-footer-note">Encrypted session</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 4l16 16M9.9 9.9A3 3 0 0 0 14 14M10.7 5.2A10 10 0 0 1 12 5c5 0 9 4 10 7-.4 1.2-1.2 2.5-2.3 3.6M6.1 6.1C4.4 7.4 3.2 9 2 12c1 3 5 7 10 7 1.4 0 2.7-.3 3.9-.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
