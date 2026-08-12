import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * Optional email: "Someone answered your question".
 * Needs SUPABASE_SERVICE_ROLE_KEY + RESEND_API_KEY (and RESEND_FROM).
 * Without those keys, returns 204 and does nothing (in-app still works).
 */
export async function POST(request: Request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const resendFrom =
    process.env.RESEND_FROM ?? "Volmiq <onboarding@resend.dev>";

  if (!serviceKey || !resendKey) {
    return new NextResponse(null, { status: 204 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json({ error: "Missing Supabase URL" }, { status: 500 });
  }

  let body: { postId?: string; answerId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const postId = body.postId?.trim();
  const answerId = body.answerId?.trim();
  if (!postId || !answerId) {
    return NextResponse.json({ error: "postId and answerId required" }, { status: 400 });
  }

  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: answer, error: answerErr } = await admin
    .from("answers")
    .select("id, post_id, author_id, author_name, body")
    .eq("id", answerId)
    .single();

  if (answerErr || !answer || answer.post_id !== postId) {
    return NextResponse.json({ error: "Answer not found" }, { status: 404 });
  }

  if (answer.author_id && answer.author_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: post, error: postErr } = await admin
    .from("posts")
    .select("id, title, author_id")
    .eq("id", postId)
    .single();

  if (postErr || !post?.author_id) {
    return new NextResponse(null, { status: 204 });
  }

  if (post.author_id === user.id) {
    return new NextResponse(null, { status: 204 });
  }

  const { data: authorUser, error: authorErr } =
    await admin.auth.admin.getUserById(post.author_id);

  const to = authorUser?.user?.email;
  if (authorErr || !to) {
    return new NextResponse(null, { status: 204 });
  }

  const actor = (answer.author_name as string)?.trim() || "Someone";
  const title = (post.title as string) || "your question";
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    new URL(request.url).origin;
  const link = `${origin}/p/${postId}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFrom,
      to: [to],
      subject: `${actor} answered your question on Volmiq`,
      html: `
        <p><strong>${escapeHtml(actor)}</strong> answered your question:</p>
        <p><em>${escapeHtml(title)}</em></p>
        <p><a href="${link}">View the answer on Volmiq</a></p>
      `,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Resend error:", text);
    return NextResponse.json({ error: "Email send failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
