-- V9.3.1: comparativos financeiros, métrica de franquias e concorrentes RA.
create table if not exists public.commercial_capital_reference_rates (
 reference_key text primary key,
 label text not null,
 annual_rate numeric(8,3) not null default 0,
 tax_on_gain numeric(6,3) not null default 0,
 source_label text,
 source_url text,
 active boolean not null default true,
 sort_order integer not null default 0,
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id)
);
alter table public.commercial_capital_reference_rates enable row level security;
drop policy if exists "capital refs signed read" on public.commercial_capital_reference_rates;
create policy "capital refs signed read" on public.commercial_capital_reference_rates for select to authenticated using(true);
drop policy if exists "capital refs admin manage" on public.commercial_capital_reference_rates;
create policy "capital refs admin manage" on public.commercial_capital_reference_rates for all to authenticated using(public.is_commercial_admin()) with check(public.is_commercial_admin());
insert into public.commercial_capital_reference_rates(reference_key,label,annual_rate,tax_on_gain,source_label,source_url,sort_order) values
 ('cdi-cdb','CDI / CDB',0,15,'Banco Central do Brasil • CDI SGS 4389','https://dadosabertos.bcb.gov.br/',10),
 ('tesouro-selic','Tesouro Selic',0,15,'Banco Central do Brasil • Selic SGS 1178','https://dadosabertos.bcb.gov.br/',20),
 ('ipca','Tesouro IPCA+',0,15,'Premissa publicada pelo ADM',null,30),
 ('fii','FII',0,0,'Premissa publicada pelo ADM',null,40),
 ('imovel','Imóvel para renda',0,0,'Premissa publicada pelo ADM',null,50)
on conflict(reference_key) do nothing;

create table if not exists public.commercial_network_metrics (
 metric_key text primary key,
 label text not null,
 value numeric(14,2) not null default 0,
 source_mode text not null default 'manual' check(source_mode in ('manual','external_json')),
 source_url text,
 last_auto_sync_at timestamptz,
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id)
);
alter table public.commercial_network_metrics enable row level security;
drop policy if exists "network metrics signed read" on public.commercial_network_metrics;
create policy "network metrics signed read" on public.commercial_network_metrics for select to authenticated using(true);
drop policy if exists "network metrics admin manage" on public.commercial_network_metrics;
create policy "network metrics admin manage" on public.commercial_network_metrics for all to authenticated using(public.is_commercial_admin()) with check(public.is_commercial_admin());
insert into public.commercial_network_metrics(metric_key,label,value,source_mode) values ('franchises_sold','Franquias vendidas',0,'manual') on conflict(metric_key) do nothing;

-- Concorrentes diretos / Locagora no Reclame Aqui (snapshot 01/03/2026–31/08/2026).
insert into public.commercial_benchmark_entities(slug,name,entity_type,category,description,official_url,reclame_aqui_url,featured,source_level,status) values
 ('locagora','LocAgora Veículos','locagora','Locação de motos / franquias','Marca Locagora para acompanhamento de reputação e comparação setorial.','https://locagora.com.br','https://www.reclameaqui.com.br/empresa/locagora-veiculos/',true,'public_source','active'),
 ('mottu','Mottu','competitor','Locação de motos','Concorrente direto no mercado de locação de motocicletas.','https://mottu.com.br','https://www.reclameaqui.com.br/empresa/mottu/',true,'public_source','active'),
 ('loca9motos','Loca9motos','competitor','Locação de motos','Concorrente direto no mercado de locação de motocicletas.','https://loca9motos.com.br','https://www.reclameaqui.com.br/empresa/loca9motos/',true,'public_source','active')
on conflict(slug) do update set name=excluded.name,entity_type=excluded.entity_type,category=excluded.category,description=excluded.description,official_url=excluded.official_url,reclame_aqui_url=excluded.reclame_aqui_url,featured=excluded.featured,source_level=excluded.source_level,status='active',updated_at=now();

insert into public.commercial_benchmark_snapshots(entity_id,source_name,source_url,period_start,period_end,reputation,score,resolution_pct,answered_pct,would_return_pct,consumer_score,complaints,source_level,confidence,notes)
select e.id,'Reclame Aqui',e.reclame_aqui_url,'2026-03-01','2026-08-31',
 case e.slug when 'locagora' then 'Bom' when 'loca9motos' then 'Regular' else 'Não recomendada' end,
 case e.slug when 'locagora' then 7.3 when 'loca9motos' then 6.5 else null end,
 case e.slug when 'locagora' then 74.4 when 'loca9motos' then 75.5 when 'mottu' then 8.0 end,
 case e.slug when 'locagora' then 99.7 when 'loca9motos' then 96.3 when 'mottu' then 0 end,
 case e.slug when 'locagora' then 61.3 when 'loca9motos' then 44.2 else null end,
 case e.slug when 'locagora' then 6.12 when 'loca9motos' then 4.79 else null end,
 case e.slug when 'locagora' then 617 when 'loca9motos' then 405 when 'mottu' then 3726 end,
 'public_source',.98,'Snapshot V9.3.1 validado no Reclame Aqui para 01/03/2026–31/08/2026.'
from public.commercial_benchmark_entities e where e.slug in ('locagora','mottu','loca9motos')
and not exists(select 1 from public.commercial_benchmark_snapshots s where s.entity_id=e.id and s.period_start='2026-03-01' and s.period_end='2026-08-31');
