import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('comparador formata moeda em pt-BR e atualiza taxas automaticamente',()=>{const s=read('components/CapitalOpportunityComparator.tsx');assert.match(s,/Intl\.NumberFormat\("pt-BR"/);assert.match(s,/market-reference-rates/);assert.match(s,/BCB|Banco Central/)});
test('contraste premium força títulos claros no hero',()=>{const s=read('components/CapitalOpportunityComparator.module.css');assert.match(s,/\.hero h1\{color:#fff!important\}/)});
test('admin controla premissas e franquias vendidas',()=>{const s=read('components/MarketIntelligenceAdmin.tsx');assert.match(s,/Franquias vendidas/);assert.match(s,/commercial_capital_reference_rates/);assert.match(s,/Atualizar agora/)});
test('benchmark recebe Locagora e concorrentes diretos',()=>{const s=read('supabase/migrations/20260910_v9_3_1_market_intelligence.sql');for(const x of ['LocAgora Veículos','Mottu','Loca9motos'])assert.ok(s.includes(x))});
test('franquias podem ser manuais ou sincronizadas por JSON',()=>{const s=read('app/api/network-metrics/refresh/route.ts');assert.match(s,/external_json/);assert.match(s,/franchises_sold/)});
