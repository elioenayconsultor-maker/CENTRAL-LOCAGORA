-- O comparador comercial deve exibir automaticamente as franquias ativas.
-- Os indicadores econômicos continuam N/D quando não houver fonte cadastrada;
-- esta migração elimina a necessidade de marcar cada rede manualmente no ADM.
update public.commercial_franchise_benchmarks
set selected_for_comparison = true,
    updated_at = now()
where active = true;
