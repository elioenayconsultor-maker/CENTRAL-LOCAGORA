-- Locagora Central V14 — Fase 6: analytics sem PII desnecessária
-- Migration aditiva. Não altera contratos das fases anteriores.

create table if not exists public.commercial_analytics_events (
  id bigint generated always as identity primary key,
  event_name text not null check(event_name in (
    'public_simulator_viewed','public_premises_loaded','public_premises_unavailable',
    'public_simulation_calculated','public_simulation_failed','public_lead_submit_started',
    'public_lead_validation_failed','public_lead_captured','public_lead_capture_failed',
    'commercial_notification_sent','commercial_notification_failed','commercial_notification_not_configured',
    'crm_pipeline_viewed','crm_lead_status_changed'
  )),
  session_id text not null check(length(session_id) between 8 and 80),
  route text,
  product_route text,
  premise_version integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists commercial_analytics_events_created_idx on public.commercial_analytics_events(created_at desc);
create index if not exists commercial_analytics_events_name_created_idx on public.commercial_analytics_events(event_name,created_at desc);
alter table public.commercial_analytics_events enable row level security;

create policy "commercial team reads analytics" on public.commercial_analytics_events
for select to authenticated using (public.has_commercial_role(array['admin','gestor','closer','visualizacao']));

create or replace function public.track_commercial_analytics_event(
  p_event_name text,p_session_id text,p_route text default null,p_product_route text default null,
  p_premise_version integer default null,p_metadata jsonb default '{}'::jsonb
) returns void
language plpgsql security definer set search_path=public as $$
begin
  if p_event_name not in (
    'public_simulator_viewed','public_premises_loaded','public_premises_unavailable',
    'public_simulation_calculated','public_simulation_failed','public_lead_submit_started',
    'public_lead_validation_failed','public_lead_captured','public_lead_capture_failed',
    'commercial_notification_sent','commercial_notification_failed','commercial_notification_not_configured',
    'crm_pipeline_viewed','crm_lead_status_changed'
  ) then raise exception 'invalid_analytics_event'; end if;
  if length(trim(coalesce(p_session_id,''))) < 8 then raise exception 'invalid_analytics_session'; end if;
  insert into public.commercial_analytics_events(event_name,session_id,route,product_route,premise_version,metadata)
  values(p_event_name,left(trim(p_session_id),80),nullif(left(trim(coalesce(p_route,'')),120),''),nullif(left(trim(coalesce(p_product_route,'')),80),''),p_premise_version,coalesce(p_metadata,'{}'::jsonb));
end;$$;
revoke all on function public.track_commercial_analytics_event(text,text,text,text,integer,jsonb) from public;
grant execute on function public.track_commercial_analytics_event(text,text,text,text,integer,jsonb) to anon,authenticated;
