import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
async function moduleFrom(path){const source=fs.readFileSync(path,'utf8');const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))}
const access=await moduleFrom('lib/corporate-access.ts');
const urls=await moduleFrom('lib/intranet.ts');
test('todos os setores aprovados têm os módulos da intranet',()=>{for(const department of Object.keys(access.DEPARTMENT_LABELS)){const pages=access.allowedCorporatePages({department,access_profile:'COLABORADOR'});for(const page of ['announcements','documents','directory'])assert.ok(pages.includes(page),department+': '+page)}});
test('usuário sem perfil não recebe módulos internos',()=>assert.deepEqual(access.allowedCorporatePages(null),['home']));
test('RH e Jurídico não recebem simuladores comerciais por padrão',()=>{for(const department of ['RH','JURIDICO'])assert.ok(!access.allowedCorporatePages({department}).includes('solutions'))});
test('links de documentos rejeitam esquemas executáveis e credenciais',()=>{for(const value of ['javascript:alert(1)','data:text/html,x','http://example.com','https://user:password@example.com','invalid'])assert.equal(urls.safeDocumentUrl(value),null);assert.equal(urls.safeDocumentUrl(' https://example.com/manual '),'https://example.com/manual')});
test('primeiro acesso não cadastra usuários sem aprovação',()=>{const source=fs.readFileSync('app/api/auth/first-access/route.ts','utf8');assert.ok(source.includes('approval_required'));assert.ok(!source.includes('access_self_preregistered'));assert.ok(!source.includes('.insert({\n          name: nameFromEmail'))});
