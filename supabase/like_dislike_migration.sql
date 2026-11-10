-- Switch votes from +/-1 scores to like / dislike.
-- Removes the numeric upvotes columns. Safe to re-run.
-- Run in Supabase → SQL Editor on the existing database.
begin;

alter table public.votes add column if not exists reaction text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'votes'
      and column_name = 'value'
  ) then
    execute $migration$
      update public.votes
      set reaction = case when value = 1 then 'like' else 'dislike' end
      where reaction is null
    $migration$;
  end if;
end;
$$;

update public.votes
set reaction = 'like'
where reaction is null;

alter table public.votes alter column reaction set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'votes_reaction_check'
      and conrelid = 'public.votes'::regclass
  ) then
    alter table public.votes
      add constraint votes_reaction_check check (reaction in ('like', 'dislike'));
  end if;
end;
$$;

alter table public.votes drop column if exists value;

drop function if exists public.cast_vote(text, uuid, smallint);
drop function if exists public.recompute_target_score(text, uuid);

alter table public.posts drop column if exists upvotes;
alter table public.answers drop column if exists upvotes;
alter table public.comments drop column if exists upvotes;

create or replace function public.cast_reaction(
  p_target_type text,
  p_target_id uuid,
  p_reaction text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  existing text;
  next_reaction text;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  if p_target_type not in ('post', 'answer', 'comment') then
    raise exception 'invalid target_type';
  end if;

  if p_reaction not in ('like', 'dislike') then
    raise exception 'invalid reaction';
  end if;

  select v.reaction into existing
  from public.votes v
  where v.user_id = uid
    and v.target_type = p_target_type
    and v.target_id = p_target_id;

  if existing is null then
    insert into public.votes (user_id, target_type, target_id, reaction)
    values (uid, p_target_type, p_target_id, p_reaction);
    next_reaction := p_reaction;
  elsif existing = p_reaction then
    delete from public.votes
    where user_id = uid
      and target_type = p_target_type
      and target_id = p_target_id;
    next_reaction := null;
  else
    update public.votes
    set reaction = p_reaction
    where user_id = uid
      and target_type = p_target_type
      and target_id = p_target_id;
    next_reaction := p_reaction;
  end if;

  return json_build_object('myReaction', next_reaction);
end;
$$;

grant execute on function public.cast_reaction(text, uuid, text) to authenticated;

commit;
