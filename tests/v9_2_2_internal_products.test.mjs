import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("components/Solutions.tsx", "utf8");

test("corporate products do not navigate to public /negocios routes", () => {
  assert.doesNotMatch(source, /href=["'`]\/negocios/);
  assert.doesNotMatch(source, /location\.href\s*=\s*["'`]\/negocios/);
  assert.doesNotMatch(source, /router\.push\([^)]*\/negocios/);
});

test("product cards keep navigation in component state", () => {
  assert.match(source, /onClick=\{\(\) => setSelectedId\(item\.id\)\}/);
  assert.match(source, /ABRIR NA CENTRAL/);
});

test("all canonical products are sourced from the registry", () => {
  assert.match(source, /PRODUCT_REGISTRY/);
  assert.match(source, /INVESTIMENTOS BRASIL E INTERNACIONAL/);
  assert.match(source, /FRANQUIAS BRASIL E INTERNACIONAL/);
});

test("assisted products remain in the authenticated journey", () => {
  assert.match(source, /startAssistedJourney/);
  assert.match(source, /Iniciar atendimento interno/);
  assert.match(source, /locagora_preselect_product_crm/);
});
