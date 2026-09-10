import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = p => fs.readFileSync(p, "utf8");

test("primeiro acesso exige senha definitiva antes da Central", () => {
  const auth = read("components/AuthGate.tsx");
  assert.match(auth, /activation_required === true/);
  assert.match(auth, /\/account\/update-password/);
});

test("senha definitiva usa politica minima e nao aceita senha de ativacao", () => {
  const page = read("app/account/update-password/page.tsx");
  const policy = read("lib/first-access.ts");
  assert.match(policy, /MIN_PERMANENT_PASSWORD_LENGTH = 10/);
  assert.match(policy, /hasLetter/);
  assert.match(policy, /hasNumber/);
  assert.match(page, /DEFAULT_ACTIVATION_PASSWORD/);
});

test("senha concluida remove flag de ativacao e segue para perfil", () => {
  const page = read("app/account/update-password/page.tsx");
  assert.match(page, /activation_required: false/);
  assert.match(page, /Continuar para meu perfil/);
  assert.match(page, /window\.location\.href = "\/central"/);
});

test("perfil profissional e identificado como etapa 2 de 2", () => {
  const gate = read("components/ConsultantProfileGate.tsx");
  assert.match(gate, /ETAPA 2 DE 2/);
  assert.match(gate, /Nome completo/);
  assert.match(gate, /Celular \/ WhatsApp/);
  assert.match(gate, /Foto do consultor \(opcional\)/);
});
