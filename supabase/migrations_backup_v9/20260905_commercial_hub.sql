-- Locagora Central V9 — commercial persistence + private proposal files
-- Review/apply to the existing CENTRAL LOCAGORA V4 project.

create table if not exists public.commercial_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default current_app_user_id() references public.users(id) on delete restrict,
  lead_id uuid references public.leads(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  client jsonb not null default '{}'::jsonb,
  step text not null default 'client' check (step in ('client','solution','simulation','confirmation','proposal')),
  selected_product_route text not null default '',
  active_simulation_id uuid,
  status text not null default 'open' check (status in ('open','won','lost','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.commercial_simulations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.commercial_sessions(id) on delete cascade,
  user_id uuid not null default current_app_user_id() references public.users(id) on delete restrict,
  product_route text not null,
  product_name text not null,
  local_id bigint,
  capital numeric(14,2) not null default 0,
  monthly numeric(14,2) not null default 0,
  annual numeric(14,2) not null default 0,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  alter table public.commercial_sessions
    add constraint commercial_sessions_active_simulation_fk
    foreign key (active_simulation_id) references public.commercial_simulations(id) on delete set null;
exception when duplicate_object then null;
end $$;

create table if not exists public.commercial_proposals (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.commercial_sessions(id) on delete cascade,
  simulation_id uuid references public.commercial_simulations(id) on delete set null,
  user_id uuid not null default current_app_user_id() references public.users(id) on delete restrict,
  client jsonb not null default '{}'::jsonb,
  proposal jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','generated','sent','accepted','expired','cancelled')),
  pdf_path text,
  valid_until date,
  generated_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists commercial_sessions_user_idx on public.commercial_sessions(user_id, updated_at desc);
create index if not exists commercial_sessions_customer_idx on public.commercial_sessions(customer_id, updated_at desc);
create index if not exists commercial_simulations_session_idx on public.commercial_simulations(session_id, created_at desc);
create index if not exists commercial_proposals_session_idx on public.commercial_proposals(session_id, created_at desc);
create index if not exists commercial_proposals_user_idx on public.commercial_proposals(user_id, created_at desc);

alter table public.commercial_sessions enable row level security;
alter table public.commercial_simulations enable row level security;
alter table public.commercial_proposals enable row level security;

drop policy if exists commercial_sessions_scope on public.commercial_sessions;
create policy commercial_sessions_scope on public.commercial_sessions
for all using (
  user_id = current_app_user_id()
  or user_has_permission('LEADS_VIEW_ALL')
  or user_has_permission('PORTFOLIO_VIEW_ALL')
) with check (
  user_id = current_app_user_id()
  or user_has_permission('LEADS_VIEW_ALL')
  or user_has_permission('PORTFOLIO_MANAGE')
);

drop policy if exists commercial_simulations_scope on public.commercial_simulations;
create policy commercial_simulations_scope on public.commercial_simulations
for all using (
  user_id = current_app_user_id()
  or user_has_permission('LEADS_VIEW_ALL')
  or user_has_permission('PORTFOLIO_VIEW_ALL')
) with check (
  user_id = current_app_user_id()
  or user_has_permission('LEADS_VIEW_ALL')
  or user_has_permission('PORTFOLIO_MANAGE')
);

drop policy if exists commercial_proposals_scope on public.commercial_proposals;
create policy commercial_proposals_scope on public.commercial_proposals
for all using (
  user_id = current_app_user_id()
  or user_has_permission('LEADS_VIEW_ALL')
  or user_has_permission('PORTFOLIO_VIEW_ALL')
) with check (
  user_id = current_app_user_id()
  or user_has_permission('LEADS_VIEW_ALL')
  or user_has_permission('PORTFOLIO_MANAGE')
);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('commercial-proposals','commercial-proposals',false,26214400,array['application/pdf'])
on conflict(id) do update set
  public=false,
  file_size_limit=26214400,
  allowed_mime_types=array['application/pdf'];

drop policy if exists commercial_proposal_files_select on storage.objects;
create policy commercial_proposal_files_select on storage.objects
for select using (
  bucket_id='commercial-proposals' and (
    (storage.foldername(name))[1]=auth.uid()::text
    or public.user_has_permission('LEADS_VIEW_ALL')
    or public.user_has_permission('PORTFOLIO_VIEW_ALL')
  )
);

drop policy if exists commercial_proposal_files_insert on storage.objects;
create policy commercial_proposal_files_insert on storage.objects
for insert with check (
  bucket_id='commercial-proposals'
  and (storage.foldername(name))[1]=auth.uid()::text
);

drop policy if exists commercial_proposal_files_update on storage.objects;
create policy commercial_proposal_files_update on storage.objects
for update using (
  bucket_id='commercial-proposals'
  and (storage.foldername(name))[1]=auth.uid()::text
) with check (
  bucket_id='commercial-proposals'
  and (storage.foldername(name))[1]=auth.uid()::text
);

drop policy if exists commercial_proposal_files_delete on storage.objects;
create policy commercial_proposal_files_delete on storage.objects
for delete using (
  bucket_id='commercial-proposals'
  and (storage.foldername(name))[1]=auth.uid()::text
);
