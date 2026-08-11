import { AuthForm } from "@/components/auth/AuthForm";

/**
 * Full-bleed login — Design 4 polished (dark editorial).
 */
type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const { next } = await searchParams;
  return <AuthForm next={next} />;
}
