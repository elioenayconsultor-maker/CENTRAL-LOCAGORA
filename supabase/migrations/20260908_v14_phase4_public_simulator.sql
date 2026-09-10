-- Locagora Central V14 — Fase 4: simulador público e captura vinculada
-- Migration aditiva. Não altera contratos das tabelas comerciais existentes.
create table if not exists public.commercial_public_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  source text not null default 'public_simulator',
  product_interest text not null default 'locinvest',
  status text not null default 'new' check(status in ('new','contacted','qualified','converted','archived')),
  consent_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.commercial_public_simulations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.commercial_public_leads(id) on delete cascade,
  premise_version_id uuid not null references public.commercial_premise_versions(id),
  premise_version integer not null,
  premise_snapshot jsonb not null,
  product_route text not null,
  product_name text not null,
  channel text not null default 'public' check(channel='public'),
  scenario text not null default 'published' check(scenario='published'),
  inputs jsonb not null default '{}'::jsonb,
  outputs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists commercial_public_leads_created_idx on public.commercial_public_leads(created_at desc);
create index if not exists commercial_public_simulations_lead_idx on public.commercial_public_simulations(lead_id,created_at desc);

alter table public.commercial_public_leads enable row level security;
alter table public.commercial_public_simulations enable row level security;

create policy "commercial team reads public leads" on public.commercial_public_leads
for select to authenticated using (public.has_commercial_role(array['admin','gestor','closer','visualizacao']));
create policy "commercial team reads public simulations" on public.commercial_public_simulations
for select to authenticated using (public.has_commercial_role(array['admin','gestor','closer','visualizacao']));

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

  return jsonb_build_object('lead_id',v_lead_id,'simulation_id',v_simulation_id);
end;$$;

revoke all on function public.capture_public_commercial_simulation(text,text,text,boolean,text,text,uuid,integer,jsonb,jsonb) from public;
grant execute on function public.capture_public_commercial_simulation(text,text,text,boolean,text,text,uuid,integer,jsonb,jsonb) to anon,authenticated;
