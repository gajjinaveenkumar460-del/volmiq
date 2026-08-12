-- =========================================================
-- Volmiq — notifications (answers + comments)
-- Run in Supabase → SQL Editor (safe to re-run).
-- =========================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  actor_name text,
  type text not null default 'answer_on_question',
  post_id uuid not null references public.posts (id) on delete cascade,
  answer_id uuid references public.answers (id) on delete set null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Allow answer + comment notification types
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check
  check (type in (
    'answer_on_question',
    'comment_on_answer',
    'reply_to_comment'
  ));

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id)
  where read_at is null;

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------- Answer on question ----------
create or replace function public.notify_question_author_on_answer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  q_author uuid;
  q_title text;
  actor text;
begin
  select p.author_id, p.title
    into q_author, q_title
  from public.posts p
  where p.id = new.post_id;

  if q_author is null then
    return new;
  end if;

  if new.author_id is not null and new.author_id = q_author then
    return new;
  end if;

  actor := coalesce(nullif(trim(new.author_name), ''), 'Someone');

  insert into public.notifications (
    user_id, actor_id, actor_name, type, post_id, answer_id, body
  ) values (
    q_author,
    new.author_id,
    actor,
    'answer_on_question',
    new.post_id,
    new.id,
    actor || ' answered your question: ' || left(coalesce(q_title, 'Untitled'), 100)
  );

  return new;
end;
$$;

drop trigger if exists answers_notify_question_author on public.answers;
create trigger answers_notify_question_author
  after insert on public.answers
  for each row
  execute function public.notify_question_author_on_answer();

-- ---------- Comment on answer / reply to comment ----------
create or replace function public.notify_on_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ans_author uuid;
  ans_post uuid;
  parent_author uuid;
  actor text;
  snippet text;
begin
  actor := coalesce(nullif(trim(new.author_name), ''), 'Someone');
  snippet := left(coalesce(new.body, ''), 80);

  select a.author_id, a.post_id
    into ans_author, ans_post
  from public.answers a
  where a.id = new.answer_id;

  if ans_post is null then
    return new;
  end if;

  -- Reply to a comment → notify parent comment author
  if new.parent_id is not null then
    select c.author_id into parent_author
    from public.comments c
    where c.id = new.parent_id;

    if parent_author is not null
       and (new.author_id is null or new.author_id <> parent_author) then
      insert into public.notifications (
        user_id, actor_id, actor_name, type, post_id, answer_id, body
      ) values (
        parent_author,
        new.author_id,
        actor,
        'reply_to_comment',
        ans_post,
        new.answer_id,
        actor || ' replied to your comment: ' || snippet
      );
    end if;
  else
    -- Top-level comment on an answer → notify answer author
    if ans_author is not null
       and (new.author_id is null or new.author_id <> ans_author) then
      insert into public.notifications (
        user_id, actor_id, actor_name, type, post_id, answer_id, body
      ) values (
        ans_author,
        new.author_id,
        actor,
        'comment_on_answer',
        ans_post,
        new.answer_id,
        actor || ' commented on your answer: ' || snippet
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists comments_notify_on_insert on public.comments;
create trigger comments_notify_on_insert
  after insert on public.comments
  for each row
  execute function public.notify_on_comment();
