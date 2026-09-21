/* Motor isolado de homologação: não altera planos, contratos ou banco de dados. */
export interface LocInvestProjection36Input {
  signedAt: string; // YYYY-MM-DD; marco contratual
  quantity: number;
  bikeCapitalCents: number;
  initialFeesCents: number;
  monthlyIncomePerBikeCents: number;
  estimatedAnnualIpcaPct: number;
  firstPaymentMonth: number; // 1..36; exige confirmação da regra dos 45 dias
}
export interface LocInvestProjectionMonth {
  month: number;
  cycle: 1;
  monthlyIncomeCents: number;
  capitalReturnCents: number;
  cashFlowCents: number;
  accumulatedCashFlowCents: number;
}
export interface LocInvestProjection36 {
  initialOutflowCents: number;
  totalIncomeCents: number;
  returnedBikeCapitalCents: number;
  totalReceiptsCents: number;
  finalCashBalanceCents: number;
  months: LocInvestProjectionMonth[];
  renewalAutomatic: false;
  disclaimer: string;
}
const integerNonnegative = (value: number) => Number.isSafeInteger(value) && value >= 0;
export function projectLocInvest36(input: LocInvestProjection36Input): LocInvestProjection36 {
  const { signedAt, quantity, bikeCapitalCents, initialFeesCents, monthlyIncomePerBikeCents, estimatedAnnualIpcaPct, firstPaymentMonth } = input;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(signedAt) || !Number.isFinite(Date.parse(`${signedAt}T00:00:00Z`)) || new Date(`${signedAt}T00:00:00Z`).toISOString().slice(0, 10) !== signedAt) throw new Error('Data de assinatura inválida.');
  if (!Number.isSafeInteger(quantity) || quantity < 1 || ![bikeCapitalCents, initialFeesCents, monthlyIncomePerBikeCents].every(integerNonnegative)) throw new Error('Quantidade e valores monetários inválidos.');
  if (!Number.isFinite(estimatedAnnualIpcaPct) || estimatedAnnualIpcaPct <= -100 || estimatedAnnualIpcaPct > 100) throw new Error('IPCA estimado inválido.');
  if (!Number.isInteger(firstPaymentMonth) || firstPaymentMonth < 1 || firstPaymentMonth > 36) throw new Error('Primeiro mês de pagamento inválido.');
  const initialOutflowCents = bikeCapitalCents + initialFeesCents;
  if (!Number.isSafeInteger(initialOutflowCents)) throw new Error('Valor monetário excede o limite seguro.');
  let accumulatedCashFlowCents = -initialOutflowCents;
  let totalIncomeCents = 0;
  const months: LocInvestProjectionMonth[] = [];
  for (let month = 1; month <= 36; month++) {
    const annualMultiplier = Math.pow(1 + estimatedAnnualIpcaPct / 100, Math.floor((month - 1) / 12));
    const monthlyIncomeCents = month >= firstPaymentMonth ? Math.round(quantity * monthlyIncomePerBikeCents * annualMultiplier) : 0;
    const capitalReturnCents = month === 36 ? bikeCapitalCents : 0;
    const cashFlowCents = monthlyIncomeCents + capitalReturnCents;
    accumulatedCashFlowCents += cashFlowCents;
    totalIncomeCents += monthlyIncomeCents;
    if (![monthlyIncomeCents, cashFlowCents, accumulatedCashFlowCents, totalIncomeCents].every(Number.isSafeInteger)) throw new Error('Resultado monetário excede o limite seguro.');
    months.push({ month, cycle: 1, monthlyIncomeCents, capitalReturnCents, cashFlowCents, accumulatedCashFlowCents });
  }
  const totalReceiptsCents = totalIncomeCents + bikeCapitalCents;
  if (!Number.isSafeInteger(totalReceiptsCents)) throw new Error('Resultado monetário excede o limite seguro.');
  return { initialOutflowCents, totalIncomeCents, returnedBikeCapitalCents: bikeCapitalCents, totalReceiptsCents, finalCashBalanceCents: accumulatedCashFlowCents, months, renewalAutomatic: false, disclaimer: 'Projeção ilustrativa sujeita a condições contratuais e premissas comerciais. Capital devolvido não é lucro. IPCA estimado não é índice realizado.' };
}
