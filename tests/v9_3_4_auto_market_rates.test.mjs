import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const route = await readFile(new URL("../app/api/market-reference-rates/route.ts", import.meta.url), "utf8");
const comparator = await readFile(new URL("../components/CapitalOpportunityComparator.tsx", import.meta.url), "utf8");

test("V9.3.4 usa séries oficiais do BCB para Selic, CDI e IPCA 12m", () => {
  assert.match(route, /latest\(1178/);
  assert.match(route, /latest\(4389/);
  assert.match(route, /latest\(13522/);
  assert.match(route, /Banco Central do Brasil/);
});

test("comparador carrega referências automáticas e preserva IPCA+ composto", () => {
  assert.match(comparator, /\/api\/market-reference-rates/);
  assert.match(comparator, /official_live_api/);
  assert.match(comparator, /IPCA_PLUS_REAL/);
  assert.match(comparator, /\(1\+Number\(ipca\)\/100\)\*\(1\+Number\(ipcaReal\)\/100\)-1/);
  assert.match(comparator, /IPCA_PLUS_EFFECTIVE/);
});

test("FII e imóvel continuam como premissas administrativas sem taxa inventada", () => {
  assert.match(comparator, /FII_DY/);
  assert.match(comparator, /PROPERTY_RENT_YIELD/);
  assert.match(comparator, /Premissa ADM/);
});
