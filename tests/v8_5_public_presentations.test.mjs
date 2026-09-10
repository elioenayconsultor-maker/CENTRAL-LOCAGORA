import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration=fs.readFileSync('supabase/migrations/20260912_v14_v8_5_public_presentations.sql','utf8');
const gallery=fs.readFileSync('components/PublicProductGallery.tsx','utf8');
const admin=fs.readFileSync('components/PublicPresentationAdmin.tsx','utf8');

test('v8.5 cria apresentacoes publicas com status e dez slots iniciais',()=>{
  assert.match(migration,/commercial_public_presentations/);
  assert.match(migration,/draft','published','paused','archived/);
  assert.match(migration,/generate_series\(1,10\)/);
});

test('portal publico possui tela cheia e contador de paginas',()=>{
  assert.match(gallery,/requestFullscreen/);
  assert.match(gallery,/Página \{index\+1\} de \{count\}/);
  assert.match(gallery,/status!=="published"/);
});

test('admin gerencia adicionar excluir reordenar e substituir paginas',()=>{
  assert.match(admin,/Adicionar página/);
  assert.match(admin,/Excluir apresentação/);
  assert.match(admin,/Substituir/);
  assert.match(admin,/move\(page/);
});
