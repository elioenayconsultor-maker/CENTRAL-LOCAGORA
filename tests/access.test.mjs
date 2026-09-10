import test from 'node:test';import assert from 'node:assert/strict';
const matrix={admin:['premises.publish','users.manage'],gestor:['premises.publish'],closer:['crm.write'],visualizacao:['crm.read']};
test('papéis de menor privilégio não publicam premissas',()=>{assert.equal(matrix.closer.includes('premises.publish'),false);assert.equal(matrix.visualizacao.includes('premises.publish'),false)});
test('somente admin gerencia usuários',()=>{assert.equal(matrix.admin.includes('users.manage'),true);assert.equal(matrix.gestor.includes('users.manage'),false)});
