import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const analytics=fs.readFileSync(new URL('../lib/analytics.ts',import.meta.url),'utf8');
const api=fs.readFileSync(new URL('../app/api/analytics/route.ts',import.meta.url),'utf8');
const simulator=fs.readFileSync(new URL('../components/PublicSimulator.tsx',import.meta.url),'utf8');
const migration=fs.readFileSync(new URL('../supabase/migrations/20260910_v14_phase6_analytics.sql',import.meta.url),'utf8');

test('fase 6 define contrato de eventos do funil',()=>{
  for(const name of ['public_simulator_viewed','public_simulation_calculated','public_lead_captured','commercial_notification_sent','crm_lead_status_changed']) assert.equal(analytics.includes(name),true);
});

test('analytics nao envia PII do formulario',()=>{
  assert.equal(api.includes('p_name'),false);
  assert.equal(api.includes('p_email'),false);
  assert.equal(api.includes('p_phone'),false);
  assert.equal(/\n\s*name\s+text/i.test(migration),false);
  assert.equal(/\n\s*email\s+text/i.test(migration),false);
  assert.equal(/\n\s*phone\s+text/i.test(migration),false);
});

test('simulador valida email completo antes do submit',()=>{
  assert.equal(simulator.includes('nome@empresa.com.br'),true);
  assert.equal(simulator.includes('public_lead_validation_failed'),true);
});
