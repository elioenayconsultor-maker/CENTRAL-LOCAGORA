import { LOC_PLANS, type LocPlanKey, type LocPlan } from './locinvest';

/** Taxas futuras são premissas, não preços garantidos. */
export interface LocInvestIpcaYear { year: number; ratePct: number; source: string; kind: 'focus' | 'assumption' | 'actual'; }
export interface LocInvestDemonstrativoInput {
  plan: LocPlanKey; quantity: number; ipca: LocInvestIpcaYear[];
  /** Valor efetivamente pago por cada moto no ciclo inicial. */
  repurchasePerBike: number;
  /** Mantido para compatibilidade: o preço futuro é calculado sobre a frota anterior pelo IPCA. */
  renewalBikeCost: number;
  renewalWorkingPerBike: number; renewAtCycles: boolean;
  /** Opções legadas não alteram a regra contratual: recompra pelo preço pago. */
  adjustFirstRepurchaseByIpca?: boolean; reinvestFirstRepurchase?: boolean;
  /** No mês 144, renovar novamente ou encerrar com a recompra. */
  renewAtMonth144?: boolean;
  plans?: Record<LocPlanKey, LocPlan>;
}
export interface LocInvestMonth {
  month: number; year: number; cycle: number; ipcaRatePct: number; ipcaSource: string;
  income: number; repurchase: number; renewalFleet: number; renewalWorking: number;
  additionalContribution: number; forecast: boolean;
  netCashFlow: number; accumulatedCashFlow: number; recoveredCapital: number; capitalOutstanding: number;
}
export interface LocInvestYear {
  year: number; ipcaRatePct: number; ipcaSource: string; income: number; repurchase: number;
  renewalFleet: number; renewalWorking: number; additionalContribution: number;
  netCashFlow: number; accumulatedCashFlow: number; recoveredCapital: number; capitalOutstanding: number;
}
export interface LocInvestDemonstrativo {
  plan: LocPlanKey; quantity: number; initialInvestment: number; monthlyBaseIncome: number;
  months: LocInvestMonth[]; years: LocInvestYear[]; totalIncome: number;
  totalRepurchase: number; totalRenewal: number; totalAdditionalContribution: number;
  netCashFlow: number; paybackMonth: number | null;
  forecastNote: string;
}
const money = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100;
const valid = (v: number) => Number.isFinite(v) && v >= 0;
const forecastNote = '* Valores futuros das motocicletas e aportes adicionais são previsões baseadas no IPCA informado, não preços garantidos.';

export function buildLocInvestDemonstrativo(input: LocInvestDemonstrativoInput): LocInvestDemonstrativo {
  const plans = input.plans ?? LOC_PLANS;
  const plan = plans[input.plan];
  if (!plan || !Number.isInteger(input.quantity) || input.quantity < plan.min || input.quantity > plan.max) throw new Error('Plano ou quantidade inválidos para LocInvest.');
  if (input.ipca.length !== 12 || input.ipca.some((p, i) => p.year !== i + 1 || !Number.isFinite(p.ratePct) || p.ratePct <= -100 || !p.source.trim())) throw new Error('Informe 12 taxas anuais de IPCA com origem identificada, em ordem.');
  if (![input.repurchasePerBike, input.renewalBikeCost, input.renewalWorkingPerBike].every(valid)) throw new Error('Recompra e renovação exigem valores explícitos não negativos.');
  const investment = money(plan.basePrice + (input.quantity - plan.baseQty) * plan.bike + (input.plan === 'start' ? Math.max(0, input.quantity - plan.baseQty) * plan.appropriation : 0));
  const baseIncome = input.quantity * plan.income;
  const months: LocInvestMonth[] = [];
  let cash = -investment;
  let incomeTotal = 0;
  let repurchaseTotal = 0;
  let renewalTotal = 0;
  let contributionTotal = 0;
  let paybackMonth: number | null = null;
  let annualMultiplier = 1;
  let fleetCost = money(input.quantity * input.repurchasePerBike);
  for (let year = 1; year <= 12; year++) {
    if (year > 1) annualMultiplier *= 1 + input.ipca[year - 1].ratePct / 100;
    for (let m = 1; m <= 12; m++) {
      const month = (year - 1) * 12 + m;
      const active = input.renewAtCycles || month <= 36;
      const income = active ? money(baseIncome * annualMultiplier) : 0;
      const endCycle = active && month % 36 === 0;
      const repurchase = endCycle ? fleetCost : 0;
      const renew = endCycle && input.renewAtCycles && (month < 144 || input.renewAtMonth144 === true);
      const factor = renew ? input.ipca.slice(year - 3, year).reduce((result, entry) => result * (1 + entry.ratePct / 100), 1) : 1;
      const renewalFleet = renew ? money(fleetCost * factor) : 0;
      const renewalWorking = renew ? money(input.quantity * input.renewalWorkingPerBike) : 0;
      const additionalContribution = renew ? money(Math.max(0, renewalFleet - repurchase) + renewalWorking) : 0;
      const netCashFlow = money(income + repurchase - renewalFleet - renewalWorking);
      cash = money(cash + netCashFlow);
      incomeTotal = money(incomeTotal + income);
      repurchaseTotal = money(repurchaseTotal + repurchase);
      renewalTotal = money(renewalTotal + renewalFleet + renewalWorking);
      contributionTotal = money(contributionTotal + additionalContribution);
      if (renew) fleetCost = renewalFleet;
      if (paybackMonth === null && cash >= 0) paybackMonth = month;
      months.push({ month, year, cycle: Math.ceil(month / 36), ipcaRatePct: input.ipca[year - 1].ratePct,
        ipcaSource: input.ipca[year - 1].source, income, repurchase, renewalFleet, renewalWorking,
        additionalContribution, forecast: renew, netCashFlow, accumulatedCashFlow: cash,
        recoveredCapital: money(Math.min(investment, Math.max(0, investment + cash))), capitalOutstanding: money(Math.max(0, -cash)) });
    }
  }
  const years: LocInvestYear[] = Array.from({ length: 12 }, (_, index) => {
    const slice = months.slice(index * 12, (index + 1) * 12);
    const last = slice[11];
    const sum = (key: 'income' | 'repurchase' | 'renewalFleet' | 'renewalWorking' | 'additionalContribution' | 'netCashFlow') => money(slice.reduce((s, row) => s + row[key], 0));
    return { year: index + 1, ipcaRatePct: input.ipca[index].ratePct, ipcaSource: input.ipca[index].source,
      income: sum('income'), repurchase: sum('repurchase'), renewalFleet: sum('renewalFleet'),
      renewalWorking: sum('renewalWorking'), additionalContribution: sum('additionalContribution'), netCashFlow: sum('netCashFlow'),
      accumulatedCashFlow: last.accumulatedCashFlow, recoveredCapital: last.recoveredCapital,
      capitalOutstanding: last.capitalOutstanding };
  });
  return { plan: input.plan, quantity: input.quantity, initialInvestment: investment,
    monthlyBaseIncome: baseIncome, months, years, totalIncome: incomeTotal, totalRepurchase: repurchaseTotal,
    totalRenewal: renewalTotal, totalAdditionalContribution: contributionTotal,
    netCashFlow: cash, paybackMonth, forecastNote };
}
