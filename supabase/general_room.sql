-- Add the General room. Safe to re-run.
-- Run in Supabase → SQL Editor.
insert into public.communities (slug, name, description, member_count)
select
  'general',
  'General',
  'Ask anything that does not belong to one exam or career room.',
  0
where not exists (
  select 1 from public.communities where slug = 'general'
);
