alter table public.commercial_franchise_benchmarks
  add column if not exists franchise_fee_min numeric,
  add column if not exists franchise_fee_max numeric,
  add column if not exists installation_capital_min numeric,
  add column if not exists installation_capital_max numeric,
  add column if not exists working_capital_min numeric,
  add column if not exists working_capital_max numeric,
  add column if not exists royalties_pct numeric,
  add column if not exists advertising_fee_pct numeric;

comment on column public.commercial_franchise_benchmarks.franchise_fee_min is 'Taxa de franquia mínima divulgada pela fonte.';
comment on column public.commercial_franchise_benchmarks.installation_capital_min is 'Capital mínimo para instalação divulgado pela fonte.';
comment on column public.commercial_franchise_benchmarks.working_capital_min is 'Capital de giro mínimo divulgado pela fonte.';
comment on column public.commercial_franchise_benchmarks.royalties_pct is 'Royalty percentual quando a fonte publica base percentual comparável.';
comment on column public.commercial_franchise_benchmarks.advertising_fee_pct is 'Taxa de propaganda percentual quando publicada.';

-- Campos ficam NULL/N-D até que a própria rede/ABF publique a decomposição verificável.
-- Não inferir componentes a partir do investimento total.
