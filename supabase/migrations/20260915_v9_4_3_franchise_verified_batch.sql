-- Benchmark econômico: preencher apenas valores suportados por fonte pública identificável.
-- Portal do Franchising/ABF: dados são fornecidos pelas próprias marcas associadas.

update public.commercial_franchise_benchmarks set
 initial_investment_min=64900, initial_investment_max=310000,
 payback_months_min=14, payback_months_max=24,
 source_name='Portal do Franchising / ABF — Cacau Show',
 source_url='https://franquias.portaldofranchising.com.br/franquia-cacau-show-valor/',
 source_reference_date='2026-08-31', selected_for_comparison=true, updated_at=now()
where brand_name='Cacau Show';

update public.commercial_franchise_benchmarks set
 initial_investment_min=228900, initial_investment_max=450000,
 payback_months_min=18, payback_months_max=24,
 source_name='Portal do Franchising / ABF — Óticas Carol',
 source_url='https://franquias.portaldofranchising.com.br/franquia-oticas-carol',
 source_reference_date='2026-08-05', selected_for_comparison=true, updated_at=now()
where brand_name='Óticas Carol';

update public.commercial_franchise_benchmarks set
 initial_investment_min=295000, initial_investment_max=585000,
 payback_months_min=24, payback_months_max=48, average_monthly_revenue=135000,
 source_name='Portal do Franchising / ABF — BR Mania',
 source_url='https://franquias.portaldofranchising.com.br/franquia-br-mania-conveniencia/',
 source_reference_date='2026-01-14', selected_for_comparison=true, updated_at=now()
where brand_name='BR Mania';

update public.commercial_franchise_benchmarks set
 initial_investment_min=110000, initial_investment_max=190000,
 payback_months_min=12, payback_months_max=24,
 implementation_months_min=1.5, implementation_months_max=1.5,
 source_name='Portal do Franchising / ABF — Oggi Sorvetes',
 source_url='https://franquias.portaldofranchising.com.br/franquia-oggi-sorvetes/',
 source_reference_date='2026-09-11', selected_for_comparison=true, updated_at=now()
where brand_name='Oggi Sorvetes';

update public.commercial_franchise_benchmarks set
 initial_investment_min=180000, initial_investment_max=350000,
 payback_months_min=12, payback_months_max=18,
 average_profit_margin_pct=17.5, initial_team_size=4,
 source_name='Portal do Franchising / ABF — Óticas Diniz',
 source_url='https://franquias.portaldofranchising.com.br/franquia-oticas-diniz-oculos',
 source_reference_date='2026-08-31', selected_for_comparison=true, updated_at=now()
where brand_name='Óticas Diniz';

-- Faixas de investimento publicadas nas listagens correntes do Portal do Franchising/ABF.
update public.commercial_franchise_benchmarks set initial_investment_min=245000,initial_investment_max=975000,source_name='Portal do Franchising / ABF — AM/PM',source_url='https://franquias.portaldofranchising.com.br/franquia-de-emporios-mercados-e-lojas-de-conveniencia/',source_reference_date='2026-09-15',selected_for_comparison=true,updated_at=now() where brand_name='AM/PM';
update public.commercial_franchise_benchmarks set initial_investment_min=235000,initial_investment_max=400000,source_name='Portal do Franchising / ABF — Shell Select',source_url='https://franquias.portaldofranchising.com.br/franquia-alimentacao/',source_reference_date='2026-09-15',selected_for_comparison=true,updated_at=now() where brand_name='Shell Select';
update public.commercial_franchise_benchmarks set initial_investment_min=168000,initial_investment_max=280000,source_name='Portal do Franchising / ABF — Chilli Beans',source_url='https://franquias.portaldofranchising.com.br/franquia-de-a-a-z-com-a-letra-c/',source_reference_date='2026-09-15',selected_for_comparison=true,updated_at=now() where brand_name='Chilli Beans';
update public.commercial_franchise_benchmarks set initial_investment_min=2200000,initial_investment_max=5000000,source_name='Portal do Franchising / ABF — Burger King Brasil',source_url='https://franquias.portaldofranchising.com.br/franquia-burger-king-valor/',source_reference_date='2025-12-26',selected_for_comparison=true,updated_at=now() where brand_name='Burger King Brasil';
update public.commercial_franchise_benchmarks set initial_investment_min=358000,initial_investment_max=641000,source_name='Portal do Franchising / ABF — OdontoCompany',source_url='https://franquias.portaldofranchising.com.br/franquia-loja/',source_reference_date='2026-09-15',selected_for_comparison=true,updated_at=now() where brand_name='Odontocompany';

-- McDonald's: a página ABF corrente informa investimento a partir de R$ 2,7 milhões; teto/payback não são preenchidos sem fonte equivalente.
update public.commercial_franchise_benchmarks set
 initial_investment_min=2700000, initial_investment_max=null,
 source_name='Portal do Franchising / ABF — McDonald’s',
 source_url='https://franquias.portaldofranchising.com.br/franquia-mcdonalds-valor/',
 source_reference_date='2026-08-10', selected_for_comparison=true, updated_at=now()
where brand_name='McDonald''s';

-- Lubrax+: fonte oficial Vibra. A página oficial publica taxa e payback, mas não investimento total atual.
update public.commercial_franchise_benchmarks set
 payback_months_min=24, payback_months_max=36,
 source_name='Vibra — Quero abrir um Lubrax+',
 source_url='https://vibraenergia.com.br/quero-abrir-um-lubrax',
 source_reference_date='2026-09-15', selected_for_comparison=true, updated_at=now()
where brand_name='Lubrax +';

-- O Boticário permanece com investimento N/D: listagem ABF corrente informa 'Sob Consulta'.
update public.commercial_franchise_benchmarks set
 initial_investment_min=null, initial_investment_max=null,
 source_name='Portal do Franchising / ABF — O Boticário (investimento sob consulta)',
 source_url='https://franquias.portaldofranchising.com.br/franquia-loja/',
 source_reference_date='2026-09-15', selected_for_comparison=true, updated_at=now()
where brand_name='O Boticário';
