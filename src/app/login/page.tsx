import { AppShell } from "@/components/layout/AppShell";
import { AuthForm } from "@/components/auth/AuthForm";

/**
 * Auth screen: logo header only — no sidebar, search, Ask, or Sign in.
 * Logo links home.
 */
export default function LoginPage() {
  return (
    <AppShell
      showSidebar={false}
      showSearch={false}
      showHeaderActions={false}
    >
      <AuthForm />
    </AppShell>
  );
}
