-- Fonte primária: Associação Brasileira de Franchising (ABF)
-- Ranking das 50 Maiores Redes de Franquias Associadas à ABF por Número de Operações — 2025.
-- https://abf.com.br/abf-revela-setor-de-franquias-mais-robusto/
-- Atualiza somente métricas efetivamente publicadas pela fonte. Indicadores econômicos sem fonte permanecem NULL/N/D.

with verified(brand_name, ranking_position, operations_2025, operations_2024, growth_pct) as (
  values
    ('Cacau Show',1,4713,4661,1.1::numeric),
    ('O Boticário',2,3898,3746,4.1),
    ('McDonald''s',3,2774,2704,2.6),
    ('Colchões Ortobom',4,2387,2387,0.0),
    ('Lubrax +',5,1632,1685,-3.1),
    ('AM/PM',6,1539,1450,6.1),
    ('BR Mania',7,1517,1402,8.2),
    ('Óticas Carol',8,1408,1408,0.0),
    ('CVC Brasil',9,1361,1196,13.8),
    ('Oggi Sorvetes',10,1312,1109,18.3),
    ('Chilli Beans',11,1253,1236,1.4),
    ('Burger King Brasil',12,1225,1238,-1.1),
    ('Shell Select',13,1220,1264,-3.5),
    ('Óticas Diniz',14,1205,1179,2.2),
    ('Odontocompany',15,1153,1577,-26.9)
)
update public.commercial_franchise_benchmarks b
set ranking_position = v.ranking_position,
    abf_operations = v.operations_2025,
    abf_previous_operations = v.operations_2024,
    abf_growth_pct = v.growth_pct,
    average_net_openings_per_month = round((v.operations_2025 - v.operations_2024)::numeric / 12, 2),
    abf_ranking_year = 2025,
    source_name = 'ABF — Ranking das 50 Maiores Franquias 2025',
    source_url = 'https://abf.com.br/abf-revela-setor-de-franquias-mais-robusto/',
    source_reference_date = '2026-03-06',
    selected_for_comparison = true,
    active = true,
    updated_at = now()
from verified v
where lower(b.brand_name) = lower(v.brand_name);
