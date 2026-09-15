alter table public.commercial_franchise_benchmarks
  add column if not exists abf_operations integer,
  add column if not exists abf_previous_operations integer,
  add column if not exists abf_growth_pct numeric(8,2),
  add column if not exists average_net_openings_per_month numeric(10,2),
  add column if not exists abf_ranking_year integer,
  add column if not exists abf_segment text;

comment on column public.commercial_franchise_benchmarks.average_net_openings_per_month is
  'Média líquida mensal de novas operações calculada pela diferença entre operações ABF do ano atual e anterior / 12. Não representa franquias vendidas.';

-- Dados públicos ABF: Ranking das 50 Maiores Franquias 2025 por número de operações.
-- Não preencher indicadores econômicos que a ABF não publica neste ranking.
insert into public.commercial_franchise_benchmarks
  (brand_name, segment, active, selected_for_comparison, source_name, source_reference_date,
   abf_operations, abf_previous_operations, abf_growth_pct, average_net_openings_per_month, abf_ranking_year, abf_segment)
values
  ('Havaianas','Moda',true,true,'ABF — Ranking das 50 Maiores Franquias 2025','2026-03-04',574,574,0.0,0.0,2025,'Moda'),
  ('5àsec','Limpeza e Conservação',true,true,'ABF — Ranking das 50 Maiores Franquias 2025','2026-03-04',617,578,6.7,3.25,2025,'Limpeza e Conservação'),
  ('Oggi Sorvetes','Alimentação',true,true,'ABF — Ranking das 50 Maiores Franquias 2025','2026-03-04',1312,1109,18.3,16.92,2025,'Alimentação')
on conflict (brand_name) do update set
  segment=excluded.segment,
  active=true,
  selected_for_comparison=true,
  source_name=excluded.source_name,
  source_reference_date=excluded.source_reference_date,
  abf_operations=excluded.abf_operations,
  abf_previous_operations=excluded.abf_previous_operations,
  abf_growth_pct=excluded.abf_growth_pct,
  average_net_openings_per_month=excluded.average_net_openings_per_month,
  abf_ranking_year=excluded.abf_ranking_year,
  abf_segment=excluded.abf_segment;
