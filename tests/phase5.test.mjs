import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const migration=fs.readFileSync('supabase/migrations/20260909_v14_phase5_crm_notifications.sql','utf8');
const route=fs.readFileSync('app/api/public-simulation/route.ts','utf8');
test('fase 5 preserva captura e adiciona auditoria de notificacao',()=>{assert.match(migration,/commercial_lead_notifications/);assert.match(migration,/commercial_lead_notifications/);assert.match(route,/sendCommercialLeadEmail/);assert.match(route,/createAdminClient/)});
test('destino de lead e configuravel e nao hardcoded no frontend',()=>{assert.match(migration,/commercial_lead_notification_config/);assert.equal(route.includes('comercial@'),false);assert.equal(fs.readFileSync('components/PublicSimulator.tsx','utf8').includes('comercial@'),false)});
test('crm possui atividades e tarefas vinculadas ao lead',()=>{assert.match(migration,/commercial_lead_activities/);assert.match(migration,/commercial_lead_tasks/)});
