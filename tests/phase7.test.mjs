import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=(p)=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');

test('fase 7 adiciona retorno a central em admin crm e analytics',()=>{
  assert.match(read('components/AdminPanel.tsx'),/Voltar à Central Comercial/);
  assert.match(read('components/CommercialCRM.tsx'),/Voltar à Central Comercial/);
  assert.match(read('components/AnalyticsDashboard.tsx'),/Voltar à Central Comercial/);
});

test('sidebar possui rolagem propria',()=>{
  const css=read('app/globals.css');
  assert.match(css,/\.sidebar\{overflow-y:auto/);
});

test('simulador exige orientacao de modelo e explica franquia versus investimento',()=>{
  const src=read('components/PublicSimulator.tsx');
  assert.match(src,/Qual modelo você quer avaliar\?/);
  assert.match(src,/Quero operar uma franquia/);
  assert.match(src,/Quero investir em ativos/);
  assert.match(src,/Não significa rentabilidade garantida/);
});

test('historico e locnews possuem fallback visual para imagens',()=>{
  assert.match(read('components/History.tsx'),/onError=.*locagora-story\/historia\.jpg/);
  assert.match(read('components/News.tsx'),/onError=.*fallbackImage/);
});
