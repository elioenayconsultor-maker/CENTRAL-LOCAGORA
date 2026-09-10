-- Locagora Central V14 — V8: governança, auditoria e operação
-- Migration aditiva e idempotente. Não altera contratos comerciais existentes.

create table if not exists public.commercial_audit_log (
  id bigint generated always as identity primary key,
  action text not null,
  entity_type text not null,
  entity_id text,
  actor_user_id uuid references auth.users(id),
  actor_email text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists commercial_audit_log_created_idx on public.commercial_audit_log(created_at desc);
create index if not exists commercial_audit_log_entity_idx on public.commercial_audit_log(entity_type,entity_id,created_at desc);
alter table public.commercial_audit_log enable row level security;

do $$ begin
  create policy "admins read commercial audit" on public.commercial_audit_log
  for select to authenticated using (public.has_commercial_role(array['admin','gestor']));
exception when duplicate_object then null; end $$;

-- A autorização administrativa passa a reconhecer a membership V14 e mantém
-- compatibilidade com commercial_admins legado.
create or replace function public.is_commercial_admin()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(
    select 1 from public.commercial_memberships m
    where m.auth_user_id=auth.uid() and m.active and m.role='admin'
  ) or exists(
    select 1 from public.commercial_admins a where a.user_id=auth.uid()
  );
$$;
grant execute on function public.is_commercial_admin() to authenticated;

-- Evita que o bootstrap continue disponível depois que houver qualquer admin.
create or replace function public.can_claim_commercial_admin()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select not exists(
    select 1 from public.commercial_memberships where active and role='admin'
  ) and not exists(select 1 from public.commercial_admins);
$$;
grant execute on function public.can_claim_commercial_admin() to authenticated;

-- Auditoria automática para alterações críticas feitas diretamente pelo app.
create or replace function public.log_commercial_governance_change()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.commercial_audit_log(action,entity_type,entity_id,actor_user_id,actor_email,metadata)
  values(
    tg_op || '_' || tg_table_name,
    tg_table_name,
    coalesce((to_jsonb(new)->>'id'),(to_jsonb(new)->>'key'),(to_jsonb(new)->>'singleton'),(to_jsonb(old)->>'id'),(to_jsonb(old)->>'key')),
    auth.uid(),
    lower(coalesce(auth.jwt()->>'email','')),
    jsonb_build_object(
      'old_status',to_jsonb(old)->>'status',
      'new_status',to_jsonb(new)->>'status',
      'old_enabled',to_jsonb(old)->>'enabled',
      'new_enabled',to_jsonb(new)->>'enabled'
    )
  );
  return coalesce(new,old);
end;$$;

do $$ begin
  create trigger commercial_premise_versions_audit_v8 after insert or update on public.commercial_premise_versions for each row execute function public.log_commercial_governance_change();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger commercial_notification_config_audit_v8 after update on public.commercial_lead_notification_config for each row execute function public.log_commercial_governance_change();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger commercial_settings_audit_v8 after insert or update on public.commercial_settings for each row execute function public.log_commercial_governance_change();
exception when duplicate_object then null; end $$;
