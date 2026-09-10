-- Locagora Central V14 — Fase 5: closer/CRM/admin + notificações de leads
-- Migration aditiva. Preserva contratos existentes e amplia o fluxo da Fase 4.

create table if not exists public.commercial_lead_notification_config (
  singleton boolean primary key default true check (singleton),
  recipient_email text,
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

insert into public.commercial_lead_notification_config(singleton,recipient_email,enabled)
values(true,null,false) on conflict(singleton) do nothing;

alter table public.commercial_lead_notification_config enable row level security;
create policy "admin gestor reads lead notification config" on public.commercial_lead_notification_config
for select to authenticated using (public.has_commercial_role(array['admin','gestor']));
create policy "admin gestor updates lead notification config" on public.commercial_lead_notification_config
for update to authenticated using (public.has_commercial_role(array['admin','gestor']))
with check (public.has_commercial_role(array['admin','gestor']));

create table if not exists public.commercial_lead_notifications (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.commercial_public_leads(id) on delete cascade,
  simulation_id uuid not null references public.commercial_public_simulations(id) on delete cascade,
  recipient_email text not null,
  status text not null default 'pending' check(status in ('pending','sent','failed')),
  provider text not null default 'resend',
  provider_message_id text,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index if not exists commercial_lead_notifications_created_idx on public.commercial_lead_notifications(created_at desc);
create index if not exists commercial_lead_notifications_lead_idx on public.commercial_lead_notifications(lead_id,created_at desc);
alter table public.commercial_lead_notifications enable row level security;
create policy "commercial team reads lead notifications" on public.commercial_lead_notifications
for select to authenticated using (public.has_commercial_role(array['admin','gestor','closer','visualizacao']));

create table if not exists public.commercial_lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.commercial_public_leads(id) on delete cascade,
  activity_type text not null default 'note' check(activity_type in ('note','call','whatsapp','email','meeting','status')),
  note text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists commercial_lead_activities_lead_idx on public.commercial_lead_activities(lead_id,created_at desc);
alter table public.commercial_lead_activities enable row level security;
create policy "commercial team reads lead activities" on public.commercial_lead_activities
for select to authenticated using (public.has_commercial_role(array['admin','gestor','closer','visualizacao']));
create policy "closer team creates lead activities" on public.commercial_lead_activities
for insert to authenticated with check (public.has_commercial_role(array['admin','gestor','closer']) and created_by=auth.uid());

create table if not exists public.commercial_lead_tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.commercial_public_leads(id) on delete cascade,
  title text not null,
  due_at timestamptz,
  status text not null default 'open' check(status in ('open','done','cancelled')),
  assigned_to uuid references auth.users(id),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists commercial_lead_tasks_lead_idx on public.commercial_lead_tasks(lead_id,status,due_at);
alter table public.commercial_lead_tasks enable row level security;
create policy "commercial team reads lead tasks" on public.commercial_lead_tasks
for select to authenticated using (public.has_commercial_role(array['admin','gestor','closer','visualizacao']));
create policy "closer team creates lead tasks" on public.commercial_lead_tasks
for insert to authenticated with check (public.has_commercial_role(array['admin','gestor','closer']) and created_by=auth.uid());
create policy "closer team updates lead tasks" on public.commercial_lead_tasks
for update to authenticated using (public.has_commercial_role(array['admin','gestor','closer']))
with check (public.has_commercial_role(array['admin','gestor','closer']));

create policy "closer team updates public leads" on public.commercial_public_leads
for update to authenticated using (public.has_commercial_role(array['admin','gestor','closer']))
with check (public.has_commercial_role(array['admin','gestor','closer']));

create or replace function public.capture_public_commercial_simulation(
  p_name text,p_email text,p_phone text,p_consent boolean,
  p_product_route text,p_product_name text,p_premise_version_id uuid,p_premise_version integer,
  p_inputs jsonb,p_outputs jsonb
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare
  v_premise public.commercial_premise_versions;
  v_lead_id uuid;
  v_simulation_id uuid;
  v_notification_id uuid;
  v_recipient text;
  v_enabled boolean;
begin
  if not coalesce(p_consent,false) then raise exception 'consent_required'; end if;
  if length(trim(coalesce(p_name,''))) < 2 or position('@' in coalesce(p_email,'')) < 2 or length(regexp_replace(coalesce(p_phone,''),'[^0-9]','','g')) < 10 then
    raise exception 'invalid_lead';
  end if;
  if p_product_route <> 'locinvest' then raise exception 'product_not_publicly_approved'; end if;
  select * into v_premise from public.commercial_premise_versions
    where id=p_premise_version_id and version=p_premise_version and status='published';
  if v_premise.id is null then raise exception 'published_premise_required'; end if;

  insert into public.commercial_public_leads(name,email,phone,consent_at,product_interest)
  values(trim(p_name),lower(trim(p_email)),trim(p_phone),now(),p_product_route)
  returning id into v_lead_id;

  insert into public.commercial_public_simulations(
    lead_id,premise_version_id,premise_version,premise_snapshot,product_route,product_name,inputs,outputs
  ) values (
    v_lead_id,v_premise.id,v_premise.version,v_premise.config,p_product_route,p_product_name,coalesce(p_inputs,'{}'::jsonb),coalesce(p_outputs,'{}'::jsonb)
  ) returning id into v_simulation_id;

  select enabled,lower(trim(recipient_email)) into v_enabled,v_recipient
  from public.commercial_lead_notification_config where singleton=true;

  if coalesce(v_enabled,false) and position('@' in coalesce(v_recipient,'')) > 1 then
    insert into public.commercial_lead_notifications(lead_id,simulation_id,recipient_email)
    values(v_lead_id,v_simulation_id,v_recipient)
    returning id into v_notification_id;
  end if;

  return jsonb_build_object(
    'lead_id',v_lead_id,
    'simulation_id',v_simulation_id,
    'notification_id',v_notification_id,
    'notification_enabled',coalesce(v_enabled,false)
  );
end;$$;

revoke all on function public.capture_public_commercial_simulation(text,text,text,boolean,text,text,uuid,integer,jsonb,jsonb) from public;
grant execute on function public.capture_public_commercial_simulation(text,text,text,boolean,text,text,uuid,integer,jsonb,jsonb) to anon,authenticated;


create or replace function public.archive_commercial_premise_version(p_id uuid)
returns public.commercial_premise_versions language plpgsql security definer set search_path=public as $$
declare v public.commercial_premise_versions;
begin
  if not public.has_commercial_role(array['admin','gestor']) then raise exception 'forbidden'; end if;
  update public.commercial_premise_versions set status='archived',archived_at=now()
  where id=p_id and status in ('draft','review','published') returning * into v;
  if v.id is null then raise exception 'version_not_archivable'; end if;
  return v;
end;$$;
grant execute on function public.archive_commercial_premise_version(uuid) to authenticated;
