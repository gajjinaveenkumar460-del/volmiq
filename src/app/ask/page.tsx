import { AppShell } from "@/components/layout/AppShell";
import { AskForm } from "@/components/posts/AskForm";

export default function AskPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <AskForm />
      </div>
    </AppShell>
  );
}