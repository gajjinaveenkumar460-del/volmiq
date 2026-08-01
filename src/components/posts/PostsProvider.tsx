"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { post } from "@/lib/seed";

/** What any child can read/use */
type PostsContextValue = {
  /** Questions the user added this session (not in seed.ts) */
  extraPosts: post[];
  /** Add one question to the list */
  addPost: (newPost: post) => void;
};

const PostsContext = createContext<PostsContextValue | null>(null);

/**
 * Wraps part of the app so Ask + Home share extraPosts.
 * (You will wrap AppShell with this in Step 2.)
 */
export function PostsProvider({ children }: { children: ReactNode }) {
  const [extraPosts, setExtraPosts] = useState<post[]>([]);

  const addPost = useCallback((newPost: post) => {
    // newest first
    setExtraPosts((prev) => [newPost, ...prev]);
  }, []);

  const value = useMemo(
    () => ({ extraPosts, addPost }),
    [extraPosts, addPost],
  );

  return (
    <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
  );
}

/**
 * Hook used in AskForm / HomeFeed later.
 * Must be used under <PostsProvider>.
 */
export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) {
    throw new Error("usePosts must be used inside <PostsProvider>");
  }
  return ctx;
}