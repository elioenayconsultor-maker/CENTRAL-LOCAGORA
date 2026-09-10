import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(here, "..", "components", "Solutions.tsx"), "utf8");

test("produto interno abre apresentação antes da simulação", () => {
  assert.match(source, /type ProductStage = "presentation" \| "simulation"/);
  assert.match(source, /setStage\("presentation"\)/);
  assert.match(source, /VER APRESENTAÇÃO/);
});

test("material e PDF continuam disponíveis dentro da área do colaborador", () => {
  assert.match(source, /PublicProductGallery/);
  assert.match(source, /getPublicProduct\(product\.primaryPublicSlug\)/);
});

test("simulação é etapa posterior e possui retorno para apresentação", () => {
  assert.match(source, /Ir para simulação/);
  assert.match(source, /Voltar à apresentação/);
  assert.match(source, /onBack=\{\(\) => setStage\("presentation"\)\}/);
});

test("produto sem calculadora permanece em atendimento interno", () => {
  assert.match(source, /Iniciar atendimento interno/);
  assert.match(source, /startAssistedJourney\(product\)/);
});
