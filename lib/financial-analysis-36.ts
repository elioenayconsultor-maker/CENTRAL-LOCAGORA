import type { Simulation } from "./types";

type Month = { month: number; operatingCash: number; reinvestment: number; clientCash: number; accumulatedCash: number; netPosition: number };
export type FinancialAnalysis36 = { available: true; source: string; assumptions: string[]; months: Month[]; totalClientCash: number; roiPct: number; paybackMonth: number | null; monthlyReturnPct: number | null } | { available: false; reason: string };

/** Only use documented, monthly cash-flow snapshots; do not convert DRE profit or an average monthly income into cash flow. */
export function analyzeFinancial36(simulation: Simulation): FinancialAnalysis36 {
  const details = simulation.details || {};
  const snapshot = details.dreEvolution as { rows?: unknown; mode?: unknown; horizonMonths?: unknown } | undefined;
  if (!snapshot || !Array.isArray(snapshot.rows) || snapshot.rows.length < 36) return { available: false, reason: "Fluxo de caixa mensal documentado não disponível para este produto. Não é possível calcular ROI de caixa e payback com segurança." };
  if (Number(snapshot.horizonMonths) !== 36) return { available: false, reason: "O demonstrativo de origem não possui horizonte confirmado de 36 meses." };
  const capital = Number(simulation.capital);
  if (!Number.isFinite(capital) || capital <= 0) return { available: false, reason: "Capital inicial inválido." };
  let accumulatedCash = 0;
  let paybackMonth: number | null = null;
  const months: Month[] = [];
  for (let index = 0; index < 36; index++) {
    const source = snapshot.rows[index] as Record<string, unknown>;
    const month = Number(source.month), operatingCash = Number(source.operatingResult), reinvestment = Number(source.reinvestmentContribution), clientCash = Number(source.availableToClient);
    if (month !== index + 1 || ![operatingCash, reinvestment, clientCash].every(Number.isFinite) || Math.abs(operatingCash - reinvestment - clientCash) > 0.02) return { available: false, reason: `Dados mensais incompletos ou inconsistentes no mês ${index + 1}.` };
    accumulatedCash += clientCash;
    if (paybackMonth === null && accumulatedCash >= capital) paybackMonth = month;
    months.push({ month, operatingCash, reinvestment, clientCash, accumulatedCash, netPosition: accumulatedCash - capital });
  }
  const totalClientCash = accumulatedCash;
  return { available: true, source: "Snapshot DRE de 36 meses salvo na simulação", assumptions: ["Fluxo de caixa: valores disponibilizados ao cliente no demonstrativo mensal; reinvestimentos não são distribuídos.", "Capital inicial considerado integralmente no mês zero.", "Venda de ativos, valor residual, tributos adicionais e reinvestimentos recuperáveis não incluídos sem fluxo de recebimento documentado.", "ROI de caixa = (distribuições recebidas − capital inicial) ÷ capital inicial; não representa retorno patrimonial total.", "Payback = primeiro mês em que as distribuições acumuladas alcançam o capital inicial; não é break-even operacional.", "Cenários conservador e otimista indisponíveis até existirem premissas quantitativas específicas, fixas e documentadas por produto."], months, totalClientCash, roiPct: (totalClientCash / capital - 1) * 100, paybackMonth, monthlyReturnPct: null };
}
