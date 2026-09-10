import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=(p)=>fs.readFileSync(new URL(`../${p}`, import.meta.url),'utf8');

test('email corporativo vem do usuario autenticado',()=>{
 const src=read('lib/consultant-profile.ts');
 assert.match(src,/supabase\.auth\.getUser\(\)/);
 assert.match(src,/authEmail \|\| String\(row\.email/);
});

test('gate exibe email do acesso como somente leitura',()=>{
 const src=read('components/ConsultantProfileGate.tsx');
 assert.match(src,/getAuthenticatedCorporateEmail/);
 assert.match(src,/value=\{email\} readOnly/);
});

test('foto da proposta fica sem moldura quando existe imagem',()=>{
 const src=read('components/ProposalConsultantIdentity.tsx');
 const css=read('components/ProposalConsultantIdentity.module.css');
 assert.match(src,/className=\{styles\.photo\}/);
 assert.match(css,/\.photo\{[^}]*border:0!important/);
 assert.match(css,/border-radius:0!important/);
 assert.match(css,/object-fit:contain/);
});

test('fallback com iniciais continua legivel sem foto',()=>{
 const src=read('components/ProposalConsultantIdentity.tsx');
 assert.match(src,/avatarFallback/);
});
