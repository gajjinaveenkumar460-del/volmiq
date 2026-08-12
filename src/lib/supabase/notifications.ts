import type {
  AppNotification,
  NotificationRow,
} from "@/types/notification";
import { supabase } from "@/lib/supabase/client";

function mapRow(row: NotificationRow): AppNotification {
  const type =
    row.type === "comment_on_answer" || row.type === "reply_to_comment"
      ? row.type
      : "answer_on_question";

  return {
    id: row.id,
    userId: row.user_id,
    actorId: row.actor_id,
    actorName: row.actor_name,
    type,
    postId: row.post_id,
    answerId: row.answer_id,
    body: row.body,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

/**
 * Latest notifications for the signed-in user (newest first).
 */
export async function getMyNotifications(
  limit = 20,
): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return ((data as NotificationRow[] | null) ?? []).map(mapRow);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .is("read_at", null);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Best-effort email for "someone answered you".
 * Requires API env keys; never throws to caller.
 */
export async function requestAnswerEmailNotification(input: {
  postId: string;
  answerId: string;
}): Promise<void> {
  try {
    await fetch("/api/notifications/answer-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    // ignore — in-app notification still works via DB trigger
  }
}
