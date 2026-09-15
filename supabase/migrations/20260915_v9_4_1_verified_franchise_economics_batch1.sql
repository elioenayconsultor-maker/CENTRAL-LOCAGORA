-- Benchmark econômico verificável — lote 1.
-- Fonte: Portal do Franchising / ABF, páginas mantidas com dados informados pelas próprias redes.
-- Somente campos explicitamente publicados são preenchidos; demais indicadores permanecem NULL/N/D.

update public.commercial_franchise_benchmarks set
  initial_investment_min=64900, initial_investment_max=310000,
  payback_months_min=14, payback_months_max=24,
  source_name='Portal do Franchising / ABF — dados informados pela Cacau Show',
  source_url='https://franquias.portaldofranchising.com.br/franquia-cacau-show-valor/',
  source_reference_date='2026-08-31', selected_for_comparison=true, updated_at=now()
where brand_name='Cacau Show';

update public.commercial_franchise_benchmarks set
  initial_investment_min=245000, initial_investment_max=975000,
  source_name='Portal do Franchising / ABF — dados informados pela AM/PM',
  source_url='https://franquias.portaldofranchising.com.br/franquia-am-pm-ipiranga/',
  source_reference_date='2026-03-19', selected_for_comparison=true, updated_at=now()
where brand_name='AM/PM';

update public.commercial_franchise_benchmarks set
  initial_investment_min=295000, initial_investment_max=585000,
  payback_months_min=24, payback_months_max=48,
  average_monthly_revenue=135000,
  source_name='Portal do Franchising / ABF — dados informados pela BR Mania',
  source_url='https://franquias.portaldofranchising.com.br/franquia-br-mania-conveniencia/',
  source_reference_date='2026-01-14', selected_for_comparison=true, updated_at=now()
where brand_name='BR Mania';

update public.commercial_franchise_benchmarks set
  initial_investment_min=228900, initial_investment_max=450000,
  payback_months_min=18, payback_months_max=24,
  source_name='Portal do Franchising / ABF — dados informados pela Óticas Carol',
  source_url='https://franquias.portaldofranchising.com.br/franquia-oticas-carol',
  source_reference_date='2026-08-05', selected_for_comparison=true, updated_at=now()
where brand_name='Óticas Carol';

update public.commercial_franchise_benchmarks set
  initial_investment_min=110000, initial_investment_max=190000,
  implementation_months_min=1.5, implementation_months_max=1.5,
  payback_months_min=12, payback_months_max=24,
  source_name='Portal do Franchising / ABF — dados informados pela Oggi Sorvetes',
  source_url='https://franquias.portaldofranchising.com.br/franquia-oggi-sorvetes/',
  source_reference_date='2026-09-11', selected_for_comparison=true, updated_at=now()
where brand_name='Oggi Sorvetes';

update public.commercial_franchise_benchmarks set
  initial_investment_min=180000, initial_investment_max=350000,
  payback_months_min=12, payback_months_max=18,
  average_profit_margin_pct=17.5, initial_team_size=4,
  source_name='Portal do Franchising / ABF — dados informados pela Óticas Diniz',
  source_url='https://franquias.portaldofranchising.com.br/franquia-oticas-diniz-oculos',
  source_reference_date='2026-08-31', selected_for_comparison=true, updated_at=now()
where brand_name='Óticas Diniz';

-- Valores de investimento encontrados no catálogo atual do Portal do Franchising/ABF.
-- Não preenchemos payback/faturamento sem página específica que os sustente.
update public.commercial_franchise_benchmarks set initial_investment_min=100000, initial_investment_max=340000, updated_at=now() where brand_name='Colchões Ortobom';
update public.commercial_franchise_benchmarks set initial_investment_min=80000, initial_investment_max=340000, updated_at=now() where brand_name='CVC Brasil';
update public.commercial_franchise_benchmarks set initial_investment_min=168000, initial_investment_max=280000, updated_at=now() where brand_name='Chilli Beans';
update public.commercial_franchise_benchmarks set initial_investment_min=235000, initial_investment_max=400000, updated_at=now() where brand_name='Shell Select';
