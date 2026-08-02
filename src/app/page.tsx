// import { HomeSplash } from "@/components/HomeSplash";
import { AppShell } from "@/components/layout/AppShell";
import { HomeFeed } from "@/components/posts/HomeFeed";

export default function HomePage() {
  return (
    <>
      {/* <HomeSplash /> */}
      <AppShell>
        <HomeFeed />
      </AppShell>
    </>
  );
}
