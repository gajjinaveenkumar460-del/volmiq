"use client";

import type { ReactNode } from "react";
import { PostsProvider } from "@/components/posts/PostsProvider";

/** Root client providers — survive navigation between pages */
export function AppProviders({ children }: { children: ReactNode }) {
  return <PostsProvider>{children}</PostsProvider>;
}
