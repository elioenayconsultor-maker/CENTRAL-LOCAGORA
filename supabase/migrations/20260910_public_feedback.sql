create table if not exists public.commercial_public_feedback (
 id uuid primary key default gen_random_uuid(),
 name text,
 email text,
 category text not null default 'sugestao',
 message text not null check (char_length(message) between 5 and 3000),
 page_path text,
 status text not null default 'new' check (status in ('new','reviewed','archived')),
 created_at timestamptz not null default now()
);
alter table public.commercial_public_feedback enable row level security;
drop policy if exists commercial_public_feedback_insert on public.commercial_public_feedback;
create policy commercial_public_feedback_insert on public.commercial_public_feedback for insert to anon, authenticated with check (true);
drop policy if exists commercial_public_feedback_admin_read on public.commercial_public_feedback;
create policy commercial_public_feedback_admin_read on public.commercial_public_feedback for select to authenticated using (current_app_role() = any(array['ADMIN'::user_role,'GESTOR'::user_role]));
