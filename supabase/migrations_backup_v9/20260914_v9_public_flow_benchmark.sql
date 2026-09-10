-- Central LOC V9 — fluxo público completo + inteligência competitiva
-- Migration aditiva; mantém autenticação, rotas e contratos anteriores.

alter table if exists public.commercial_public_simulations alter column premise_version_id drop not null;
alter table if exists public.commercial_public_simulations alter column premise_version drop not null;
alter table if exists public.commercial_public_simulations alter column premise_snapshot drop not null;
alter table if exists public.commercial_public_simulations drop constraint if exists commercial_public_simulations_scenario_check;
alter table if exists public.commercial_public_simulations add constraint commercial_public_simulations_scenario_check check (scenario in ('published','assisted','calculator'));

create or replace function public.capture_public_commercial_interest(
 p_name text,p_email text,p_phone text,p_consent boolean,
 p_product_route text,p_product_name text,p_mode text,p_simulation jsonb default '{}'::jsonb
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_lead uuid;v_sim uuid;v_notification uuid;v_recipient text;v_enabled boolean;v_has_sim boolean;
begin
 if not coalesce(p_consent,false) then raise exception 'consent_required'; end if;
 if length(trim(coalesce(p_name,'')))<2 or position('@' in coalesce(p_email,''))<2 or length(regexp_replace(coalesce(p_phone,''),'[^0-9]','','g'))<10 then raise exception 'invalid_lead'; end if;
 if length(trim(coalesce(p_product_route,'')))<1 or length(trim(coalesce(p_product_name,'')))<1 then raise exception 'invalid_product'; end if;
 insert into public.commercial_public_leads(name,email,phone,source,product_interest,consent_at)
 values(trim(p_name),lower(trim(p_email)),trim(p_phone),'public_v9',trim(p_product_route),now()) returning id into v_lead;
 v_has_sim := jsonb_typeof(coalesce(p_simulation,'{}'::jsonb))='object' and coalesce(p_simulation,'{}'::jsonb) <> '{}'::jsonb;
 if v_has_sim then
   insert into public.commercial_public_simulations(lead_id,premise_version_id,premise_version,premise_snapshot,product_route,product_name,channel,scenario,inputs,outputs)
   values(v_lead,null,null,null,trim(p_product_route),trim(p_product_name),'public','calculator',
     jsonb_build_object('capital',coalesce((p_simulation->>'capital')::numeric,0),'sourceRoute',p_simulation->>'sourceRoute'),
     jsonb_build_object('name',p_simulation->>'name','monthly',coalesce((p_simulation->>'monthly')::numeric,0),'annual',coalesce((p_simulation->>'annual')::numeric,0),'details',coalesce(p_simulation->'details','{}'::jsonb)))
   returning id into v_sim;
 end if;
 select enabled,lower(trim(recipient_email)) into v_enabled,v_recipient from public.commercial_lead_notification_config where singleton=true;
 if coalesce(v_enabled,false) and position('@' in coalesce(v_recipient,''))>1 then
   insert into public.commercial_lead_notifications(lead_id,simulation_id,recipient_email)
   values(v_lead,v_sim,v_recipient) returning id into v_notification;
 end if;
 return jsonb_build_object('lead_id',v_lead,'simulation_id',v_sim,'notification_id',v_notification,'mode',p_mode);
end;$$;
revoke all on function public.capture_public_commercial_interest(text,text,text,boolean,text,text,text,jsonb) from public;
grant execute on function public.capture_public_commercial_interest(text,text,text,boolean,text,text,text,jsonb) to anon,authenticated;

-- Notificações podem existir para leads sem simulação matemática (simulação assistida).
alter table if exists public.commercial_lead_notifications alter column simulation_id drop not null;

create table if not exists public.commercial_benchmark_entities (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique,
 name text not null,
 entity_type text not null default 'reference' check(entity_type in ('competitor','reference','locagora')),
 category text not null default 'Marca de referência',
 description text not null default '',
 official_url text,
 reclame_aqui_url text,
 notes text,
 featured boolean not null default false,
 status text not null default 'active' check(status in ('active','paused')),
 source_level text not null default 'analysis_locagora' check(source_level in ('official','public_source','estimate','analysis_locagora')),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),updated_by uuid references auth.users(id)
);
alter table public.commercial_benchmark_entities enable row level security;
drop policy if exists "benchmark public read" on public.commercial_benchmark_entities;
create policy "benchmark public read" on public.commercial_benchmark_entities for select using(status='active' or public.is_commercial_admin());
drop policy if exists "benchmark admin manage" on public.commercial_benchmark_entities;
create policy "benchmark admin manage" on public.commercial_benchmark_entities for all using(public.is_commercial_admin()) with check(public.is_commercial_admin());

create table if not exists public.commercial_benchmark_snapshots (
 id uuid primary key default gen_random_uuid(),entity_id uuid not null references public.commercial_benchmark_entities(id) on delete cascade,
 source_name text not null default 'Reclame Aqui',source_url text,period_start date,period_end date,captured_at timestamptz not null default now(),
 reputation text,score numeric(4,2),resolution_pct numeric(5,2),answered_pct numeric(5,2),would_return_pct numeric(5,2),consumer_score numeric(4,2),complaints integer,
 source_level text not null default 'public_source' check(source_level in ('official','public_source','estimate','analysis_locagora')),confidence numeric(4,3) not null default .9 check(confidence>=0 and confidence<=1),notes text
);
create index if not exists benchmark_snapshots_entity_period_idx on public.commercial_benchmark_snapshots(entity_id,period_end desc,captured_at desc);
alter table public.commercial_benchmark_snapshots enable row level security;
drop policy if exists "benchmark snapshots public read" on public.commercial_benchmark_snapshots;
create policy "benchmark snapshots public read" on public.commercial_benchmark_snapshots for select using(true);
drop policy if exists "benchmark snapshots admin manage" on public.commercial_benchmark_snapshots;
create policy "benchmark snapshots admin manage" on public.commercial_benchmark_snapshots for all using(public.is_commercial_admin()) with check(public.is_commercial_admin());

create table if not exists public.commercial_benchmark_radar (
 entity_id uuid primary key references public.commercial_benchmark_entities(id) on delete cascade,
 reputation numeric(4,1) not null default 5,scale numeric(4,1) not null default 5,brand numeric(4,1) not null default 5,expansion numeric(4,1) not null default 5,customer_experience numeric(4,1) not null default 5,
 learning_notes text[] not null default array[]::text[],updated_at timestamptz not null default now(),updated_by uuid references auth.users(id),
 check(reputation between 0 and 10 and scale between 0 and 10 and brand between 0 and 10 and expansion between 0 and 10 and customer_experience between 0 and 10)
);
alter table public.commercial_benchmark_radar enable row level security;
drop policy if exists "benchmark radar public read" on public.commercial_benchmark_radar;
create policy "benchmark radar public read" on public.commercial_benchmark_radar for select using(true);
drop policy if exists "benchmark radar admin manage" on public.commercial_benchmark_radar;
create policy "benchmark radar admin manage" on public.commercial_benchmark_radar for all using(public.is_commercial_admin()) with check(public.is_commercial_admin());

insert into public.commercial_benchmark_entities(slug,name,entity_type,category,reclame_aqui_url,featured,source_level) values
('o-boticario','O Boticário','reference','Franquia / varejo','https://www.reclameaqui.com.br/empresa/o-boticario/',true,'public_source'),
('cacau-show','Cacau Show','reference','Franquia / alimentação','https://www.reclameaqui.com.br/empresa/cacau-show/',true,'public_source'),
('kopenhagen','Kopenhagen','reference','Franquia / alimentação','https://www.reclameaqui.com.br/empresa/kopenhagen/',false,'public_source'),
('chiquinho-sorvetes','Chiquinho Sorvetes','reference','Franquia / alimentação','https://www.reclameaqui.com.br/empresa/chiquinho-sorvetes/',false,'public_source')
on conflict(slug) do nothing;

insert into public.commercial_benchmark_snapshots(entity_id,source_name,source_url,period_start,period_end,reputation,score,resolution_pct,source_level,confidence,notes)
select id,'Reclame Aqui',reclame_aqui_url,'2026-03-01','2026-08-31',null,
 case slug when 'o-boticario' then 7.2 when 'cacau-show' then 6.6 when 'kopenhagen' then 7.5 when 'chiquinho-sorvetes' then 4.0 end,
 case slug when 'o-boticario' then 76.6 when 'cacau-show' then 66.2 when 'kopenhagen' then 74.7 when 'chiquinho-sorvetes' then 29.6 end,
 'public_source',.95,'Snapshot de referência V9 informado para o período 01/03/2026–31/08/2026.'
from public.commercial_benchmark_entities where slug in ('o-boticario','cacau-show','kopenhagen','chiquinho-sorvetes')
and not exists(select 1 from public.commercial_benchmark_snapshots s where s.entity_id=commercial_benchmark_entities.id and s.period_start='2026-03-01' and s.period_end='2026-08-31');

insert into public.commercial_benchmark_radar(entity_id,reputation,scale,brand,expansion,customer_experience,learning_notes)
select id,
 case slug when 'o-boticario' then 8 when 'cacau-show' then 7 when 'kopenhagen' then 8 when 'chiquinho-sorvetes' then 5 else 6 end,
 case slug when 'o-boticario' then 10 when 'cacau-show' then 10 when 'kopenhagen' then 8 when 'chiquinho-sorvetes' then 8 else 6 end,
 case slug when 'o-boticario' then 10 when 'cacau-show' then 9 when 'kopenhagen' then 9 when 'chiquinho-sorvetes' then 7 else 6 end,
 case slug when 'o-boticario' then 9 when 'cacau-show' then 10 when 'kopenhagen' then 8 when 'chiquinho-sorvetes' then 9 else 6 end,
 case slug when 'o-boticario' then 8 when 'cacau-show' then 7 when 'kopenhagen' then 8 when 'chiquinho-sorvetes' then 4 else 6 end,
 case slug when 'o-boticario' then array['Consistência de marca em escala','Governança de experiência do cliente'] when 'cacau-show' then array['Expansão com forte presença de marca','Capilaridade e comunicação comercial'] when 'kopenhagen' then array['Posicionamento premium','Padronização de experiência'] else array['Monitorar reputação durante ciclos de expansão','Relacionar crescimento com experiência do cliente'] end
from public.commercial_benchmark_entities where slug in ('o-boticario','cacau-show','kopenhagen','chiquinho-sorvetes') on conflict(entity_id) do nothing;
