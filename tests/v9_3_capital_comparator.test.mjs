import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=p=>fs.readFileSync(p,"utf8");
test("V9.3 adiciona comparador à Central",()=>{
  const central=read("app/central/page.tsx");
  assert.match(central,/CapitalOpportunityComparator/);
  assert.match(central,/page==="capital"/);
});
test("V9.3 navegação desktop e mobile expõe o comparador",()=>{
  assert.match(read("components/Sidebar.tsx"),/Comparador de Capital/);
  assert.match(read("components/MobileNav.tsx"),/Comparador de Capital/);
  assert.match(read("components/AppHeader.tsx"),/Comparador de Oportunidades de Capital/);
});
test("V9.3 não embute taxa externa como verdade de mercado",()=>{
  const lib=read("lib/capital-comparator.ts");
  const rates=[...lib.matchAll(/annualRate:\s*([0-9.]+)/g)].map(x=>Number(x[1]));
  assert.ok(rates.length>=5);
  assert.ok(rates.every(x=>x===0));
});
test("V9.3 importa cenário da Jornada quando disponível",()=>{
  const c=read("components/CapitalOpportunityComparator.tsx");
  assert.match(c,/locagora_commercial_state_v2/);
  assert.match(c,/Usar simulação da Jornada/);
});
test("V9.3 mantém aviso de premissas e não recomendação",()=>{
  const c=read("components/CapitalOpportunityComparator.tsx");
  assert.match(c,/não recomendação de investimento/i);
  assert.match(c,/taxas externas não são atualizadas automaticamente/i);
});
