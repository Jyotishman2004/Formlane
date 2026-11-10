-- Formlane database setup. Run this once in the Supabase SQL Editor.

-- Forms belong to the user who made them.
create table public.forms (
  id text primary key,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null default '',
  description text not null default '',
  questions jsonb not null default '[]'::jsonb,
  theme jsonb not null,
  settings jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index forms_owner_id_idx on public.forms (owner_id);

create table public.responses (
  id uuid primary key default gen_random_uuid(),
  form_id text not null references public.forms (id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now()
);
create index responses_form_id_idx on public.responses (form_id, submitted_at desc);

alter table public.forms enable row level security;
alter table public.responses enable row level security;

-- Owners have full control of their own forms.
create policy "Owners can read their forms" on public.forms
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "Owners can create forms" on public.forms
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "Owners can update their forms" on public.forms
  for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "Owners can delete their forms" on public.forms
  for delete to authenticated using (owner_id = (select auth.uid()));

-- Owners can see and delete responses to their forms. Nobody inserts directly;
-- respondents go through submit_response(), which checks the form is open.
create policy "Owners can read responses" on public.responses
  for select to authenticated
  using (exists (select 1 from public.forms f where f.id = form_id and f.owner_id = (select auth.uid())));
create policy "Owners can delete responses" on public.responses
  for delete to authenticated
  using (exists (select 1 from public.forms f where f.id = form_id and f.owner_id = (select auth.uid())));

-- Why a form can't take responses right now, or null if it's open.
create or replace function public.form_closed_reason(f public.forms)
returns text
language sql
stable
set search_path = ''
as $$
  select case
    when coalesce((f.settings->>'acceptingResponses')::boolean, true) = false
      then 'This form is no longer accepting responses.'
    when nullif(f.settings->>'closeAt', '') is not null and (f.settings->>'closeAt')::timestamptz < now()
      then 'This form has closed.'
    when nullif(f.settings->>'maxResponses', '') is not null
      and (select count(*) from public.responses r where r.form_id = f.id) >= (f.settings->>'maxResponses')::int
      then 'This form has reached its response limit.'
    else null
  end;
$$;

-- Public, read-only view of one form for the people filling it in.
create or replace function public.get_public_form(p_id text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', f.id, 'title', f.title, 'description', f.description,
    'questions', f.questions, 'theme', f.theme, 'settings', f.settings,
    'createdAt', f.created_at, 'updatedAt', f.updated_at,
    'closedReason', public.form_closed_reason(f)
  )
  from public.forms f
  where f.id = p_id;
$$;

-- The only way to add a response. Refuses if the form is closed.
create or replace function public.submit_response(p_form_id text, p_answers jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  f public.forms;
  reason text;
  new_id uuid;
begin
  select * into f from public.forms where id = p_form_id for update;
  if not found then
    raise exception 'Form not found';
  end if;
  reason := public.form_closed_reason(f);
  if reason is not null then
    raise exception '%', reason;
  end if;
  if jsonb_typeof(p_answers) <> 'object' or pg_column_size(p_answers) > 200000 then
    raise exception 'Invalid answers';
  end if;
  insert into public.responses (form_id, answers) values (p_form_id, p_answers) returning id into new_id;
  return new_id;
end;
$$;

revoke all on function public.form_closed_reason(public.forms) from public, anon, authenticated;
revoke all on function public.get_public_form(text) from public;
revoke all on function public.submit_response(text, jsonb) from public;
grant execute on function public.get_public_form(text) to anon, authenticated;
grant execute on function public.submit_response(text, jsonb) to anon, authenticated;
