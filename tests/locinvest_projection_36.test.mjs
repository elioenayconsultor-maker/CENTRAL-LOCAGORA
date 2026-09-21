import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const source = fs.readFileSync('lib/locinvest-projection-36.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { projectLocInvest36 } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const base = { signedAt: '2026-09-21', quantity: 1, bikeCapitalCents: 2199900, initialFeesCents: 859900, monthlyIncomePerBikeCents: 41000, estimatedAnnualIpcaPct: 0, firstPaymentMonth: 2 };

test('36 months, first payment in month 2 and no automatic renewal', () => {
  const result = projectLocInvest36(base);
  assert.equal(result.months.length, 36);
  assert.equal(result.months[0].monthlyIncomeCents, 0);
  assert.equal(result.months[1].monthlyIncomeCents, 41000);
  assert.equal(result.totalIncomeCents, 35 * 41000);
  assert.equal(result.initialOutflowCents, 3059800);
  assert.equal(result.months[35].capitalReturnCents, 2199900);
  assert.equal(result.months.slice(0, 35).every(month => month.capitalReturnCents === 0), true);
  assert.equal(result.renewalAutomatic, false);
  assert.equal(result.finalCashBalanceCents, 35 * 41000 - 859900);
});

test('IPCA compounds only at months 13 and 25', () => {
  const result = projectLocInvest36({ ...base, firstPaymentMonth: 1, estimatedAnnualIpcaPct: 10 });
  assert.equal(result.months[11].monthlyIncomeCents, 41000);
  assert.equal(result.months[12].monthlyIncomeCents, 45100);
  assert.equal(result.months[23].monthlyIncomeCents, 45100);
  assert.equal(result.months[24].monthlyIncomeCents, 49610);
});

test('capital returned is separate from income and fees are not returned', () => {
  const result = projectLocInvest36({ ...base, quantity: 3, monthlyIncomePerBikeCents: 43000 });
  assert.equal(result.returnedBikeCapitalCents, base.bikeCapitalCents);
  assert.equal(result.totalReceiptsCents, result.totalIncomeCents + result.returnedBikeCapitalCents);
  assert.equal(result.finalCashBalanceCents, result.totalReceiptsCents - result.initialOutflowCents);
});

test('rejects invalid date, quantity, money, IPCA and payment month', () => {
  for (const change of [{ signedAt: '2026-02-30' }, { quantity: 0 }, { bikeCapitalCents: -1 }, { initialFeesCents: 0.5 }, { estimatedAnnualIpcaPct: -100 }, { estimatedAnnualIpcaPct: Infinity }, { firstPaymentMonth: 0 }, { firstPaymentMonth: 37 }]) {
    assert.throws(() => projectLocInvest36({ ...base, ...change }));
  }
});
