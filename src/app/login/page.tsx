import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AuthForm } from "@/components/auth/AuthForm";

/**
 * Auth screen: logo header only — no sidebar, search, Ask, or Sign in.
 * Full-viewport form (no page scroll).
 */
type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const { next } = await searchParams;

  return (
    <AppShell
      showSidebar={false}
      showSearch={false}
      showHeaderActions={false}
      mainClassName="relative z-[1] min-w-0 w-full flex-1 overflow-hidden p-0"
    >
      <Suspense fallback={<div className="login-viewport" />}>
        <AuthForm next={next} />
      </Suspense>
    </AppShell>
  );
}
