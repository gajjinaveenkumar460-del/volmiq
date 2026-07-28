import { AppShell } from "@/components/layout/AppShell";
import { HomeFeed } from "@/components/posts/HomeFeed";

export default function HomePage() {
  return (
    <AppShell>
      <HomeFeed />
    </AppShell>
  );
}
