import { AppShell } from "@/components/layout/AppShell";
import { AuthForm } from "@/components/auth/AuthForm";

/**
 * Auth screen: logo header only — no sidebar, search, Ask, or Sign in.
 * Logo links home.
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
    >
      <AuthForm next={next} />
    </AppShell>
  );
}
