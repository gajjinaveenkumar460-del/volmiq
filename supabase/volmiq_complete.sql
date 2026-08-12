-- =========================================================
-- Volmiq — complete Supabase setup (safe to re-run)
-- Run in Supabase → SQL Editor once (or after cloning).
-- =========================================================

-- ---------- author_id on content tables ----------
alter table public.posts
  add column if not exists author_id uuid references auth.users (id) on delete set null;

alter table public.answers
  add column if not exists author_id uuid references auth.users (id) on delete set null;

alter table public.comments
  add column if not exists author_id uuid references auth.users (id) on delete set null;

-- ---------- accepted answer ----------
alter table public.posts
  add column if not exists accepted_answer_id uuid
  references public.answers (id) on delete set null;

-- ---------- votes ----------
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  target_type text not null check (target_type in ('post', 'answer', 'comment')),
  target_id uuid not null,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create index if not exists votes_target_idx
  on public.votes (target_type, target_id);

-- ---------- recompute score ----------
create or replace function public.recompute_target_score(
  p_target_type text,
  p_target_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  s integer;
begin
  select coalesce(sum(value), 0)::integer into s
  from public.votes
  where target_type = p_target_type
    and target_id = p_target_id;

  if p_target_type = 'post' then
    update public.posts set upvotes = s where id = p_target_id;
  elsif p_target_type = 'answer' then
    update public.answers set upvotes = s where id = p_target_id;
  elsif p_target_type = 'comment' then
    update public.comments set upvotes = s where id = p_target_id;
  else
    raise exception 'invalid target_type: %', p_target_type;
  end if;

  return s;
end;
$$;

-- ---------- cast_vote RPC ----------
create or replace function public.cast_vote(
  p_target_type text,
  p_target_id uuid,
  p_value smallint
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  existing smallint;
  next_value smallint;
  score integer;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  if p_target_type not in ('post', 'answer', 'comment') then
    raise exception 'invalid target_type';
  end if;

  if p_value not in (-1, 1) then
    raise exception 'invalid value';
  end if;

  select v.value into existing
  from public.votes v
  where v.user_id = uid
    and v.target_type = p_target_type
    and v.target_id = p_target_id;

  if existing is null then
    insert into public.votes (user_id, target_type, target_id, value)
    values (uid, p_target_type, p_target_id, p_value);
    next_value := p_value;
  elsif existing = p_value then
    delete from public.votes
    where user_id = uid
      and target_type = p_target_type
      and target_id = p_target_id;
    next_value := 0;
  else
    update public.votes
    set value = p_value
    where user_id = uid
      and target_type = p_target_type
      and target_id = p_target_id;
    next_value := p_value;
  end if;

  score := public.recompute_target_score(p_target_type, p_target_id);

  return json_build_object(
    'score', score,
    'myVote', next_value
  );
end;
$$;

grant execute on function public.cast_vote(text, uuid, smallint) to authenticated;
grant execute on function public.recompute_target_score(text, uuid) to authenticated;

-- ---------- delete own post (with children) ----------
create or replace function public.delete_own_post(p_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  owner uuid;
  ans_ids uuid[];
begin
  if uid is null then raise exception 'not authenticated'; end if;

  select author_id into owner from public.posts where id = p_post_id;
  if owner is null then raise exception 'post not found'; end if;
  if owner is distinct from uid then raise exception 'not the author'; end if;

  select coalesce(array_agg(id), '{}') into ans_ids
  from public.answers where post_id = p_post_id;

  if array_length(ans_ids, 1) is not null then
    delete from public.votes
    where target_type = 'comment'
      and target_id in (select id from public.comments where answer_id = any (ans_ids));

    delete from public.comments where answer_id = any (ans_ids);

    delete from public.votes
    where target_type = 'answer' and target_id = any (ans_ids);

    delete from public.answers where post_id = p_post_id;
  end if;

  delete from public.votes
  where target_type = 'post' and target_id = p_post_id;

  delete from public.posts where id = p_post_id;
end;
$$;

grant execute on function public.delete_own_post(uuid) to authenticated;

-- ---------- delete own answer ----------
create or replace function public.delete_own_answer(p_answer_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  owner uuid;
begin
  if uid is null then raise exception 'not authenticated'; end if;

  select author_id into owner from public.answers where id = p_answer_id;
  if owner is null then raise exception 'answer not found'; end if;
  if owner is distinct from uid then raise exception 'not the author'; end if;

  delete from public.votes
  where target_type = 'comment'
    and target_id in (select id from public.comments where answer_id = p_answer_id);

  delete from public.comments where answer_id = p_answer_id;

  delete from public.votes
  where target_type = 'answer' and target_id = p_answer_id;

  -- clear accept if this answer was accepted
  update public.posts
  set accepted_answer_id = null
  where accepted_answer_id = p_answer_id;

  delete from public.answers where id = p_answer_id;
end;
$$;

grant execute on function public.delete_own_answer(uuid) to authenticated;

-- ---------- delete own comment (+ nested replies) ----------
create or replace function public.delete_own_comment(p_comment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  owner uuid;
  ids uuid[];
begin
  if uid is null then raise exception 'not authenticated'; end if;

  select author_id into owner from public.comments where id = p_comment_id;
  if owner is null then raise exception 'comment not found'; end if;
  if owner is distinct from uid then raise exception 'not the author'; end if;

  with recursive tree as (
    select id from public.comments where id = p_comment_id
    union all
    select c.id from public.comments c
    inner join tree t on c.parent_id = t.id
  )
  select coalesce(array_agg(id), array[p_comment_id]) into ids from tree;

  delete from public.votes
  where target_type = 'comment' and target_id = any (ids);

  delete from public.comments where id = any (ids);
end;
$$;

grant execute on function public.delete_own_comment(uuid) to authenticated;

-- ---------- RLS ----------
alter table public.communities enable row level security;
alter table public.posts enable row level security;
alter table public.answers enable row level security;
alter table public.comments enable row level security;
alter table public.votes enable row level security;

-- communities: public read
drop policy if exists "communities_select_all" on public.communities;
create policy "communities_select_all"
  on public.communities for select
  to anon, authenticated
  using (true);

-- posts
drop policy if exists "posts_select_all" on public.posts;
drop policy if exists "posts_insert_own" on public.posts;
drop policy if exists "posts_update_own" on public.posts;
drop policy if exists "posts_delete_own" on public.posts;

create policy "posts_select_all"
  on public.posts for select
  to anon, authenticated
  using (true);

create policy "posts_insert_own"
  on public.posts for insert
  to authenticated
  with check (auth.uid() is not null and author_id = auth.uid());

create policy "posts_update_own"
  on public.posts for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "posts_delete_own"
  on public.posts for delete
  to authenticated
  using (author_id = auth.uid());

-- answers
drop policy if exists "answers_select_all" on public.answers;
drop policy if exists "answers_insert_own" on public.answers;
drop policy if exists "answers_update_own" on public.answers;
drop policy if exists "answers_delete_own" on public.answers;

create policy "answers_select_all"
  on public.answers for select
  to anon, authenticated
  using (true);

create policy "answers_insert_own"
  on public.answers for insert
  to authenticated
  with check (auth.uid() is not null and author_id = auth.uid());

create policy "answers_update_own"
  on public.answers for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "answers_delete_own"
  on public.answers for delete
  to authenticated
  using (author_id = auth.uid());

-- comments
drop policy if exists "comments_select_all" on public.comments;
drop policy if exists "comments_insert_own" on public.comments;
drop policy if exists "comments_update_own" on public.comments;
drop policy if exists "comments_delete_own" on public.comments;

create policy "comments_select_all"
  on public.comments for select
  to anon, authenticated
  using (true);

create policy "comments_insert_own"
  on public.comments for insert
  to authenticated
  with check (auth.uid() is not null and author_id = auth.uid());

create policy "comments_update_own"
  on public.comments for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "comments_delete_own"
  on public.comments for delete
  to authenticated
  using (author_id = auth.uid());

-- votes
drop policy if exists "votes_select_authenticated" on public.votes;
drop policy if exists "votes_insert_own" on public.votes;
drop policy if exists "votes_update_own" on public.votes;
drop policy if exists "votes_delete_own" on public.votes;

create policy "votes_select_authenticated"
  on public.votes for select
  to authenticated
  using (true);

create policy "votes_insert_own"
  on public.votes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "votes_update_own"
  on public.votes for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "votes_delete_own"
  on public.votes for delete
  to authenticated
  using (auth.uid() = user_id);


-- See also: notifications.sql (answer notifications for question authors)

