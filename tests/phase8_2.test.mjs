import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=(p)=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');

test('acesso corporativo publico aponta para rota dedicada de login',()=>{
  const shell=read('components/PublicShell.tsx');
  const history=read('app/historia/page.tsx');
  assert.match(shell,/href="\/acesso"[^>]*>.*Área corporativa/);
  assert.match(history,/href="\/acesso"[^>]*>Sou colaborador/);
  assert.match(read('app/acesso/page.tsx'),/AuthGate/);
});

test('simulador apresenta arvore completa de franquias e investimentos',()=>{
  const src=read('components/PublicSimulator.tsx');
  for(const label of ['Franquia Brasil','Franquia Internacional','Franquia 2x1 — Brasil x Europa','Master','Mini-Master','LocInvest','LocMillion','EUROLOC — LocInvest Espanha','Cotas — Locagora Europa + México']) assert.match(src,new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
});

test('portfolio publico possui paginas para os novos modelos do onboarding',()=>{
  const src=read('lib/public-products.ts');
  for(const slug of ['franquia-internacional','franquia-2x1','master','mini-master','locmillion','euroloc']) assert.match(src,new RegExp(`slug:"${slug}"`));
});
