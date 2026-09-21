import { LOC_PLANS, type LocPlanKey, type LocPlan } from './locinvest';

/** Projeção ilustrativa: taxas Focus são expectativas, não IPCA realizado. */
export interface LocInvestIpcaYear { year: number; ratePct: number; source: string; kind: 'focus' | 'assumption' | 'actual'; }
export interface LocInvestDemonstrativoInput {
  plan: LocPlanKey;
  quantity: number;
  ipca: LocInvestIpcaYear[];
  repurchasePerBike: number;
  renewalBikeCost: number;
  renewalWorkingPerBike: number;
  renewAtCycles: boolean;
  /** Corrige apenas a primeira recompra (mês 36) pelo IPCA composto dos anos 1, 2 e 3. */
  adjustFirstRepurchaseByIpca?: boolean;
  /** Reinveste integralmente a primeira recompra corrigida na frota substituta. */
  reinvestFirstRepurchase?: boolean;
  plans?: Record<LocPlanKey, LocPlan>;
}
export interface LocInvestMonth {
  month: number; year: number; cycle: number; ipcaRatePct: number; ipcaSource: string;
  income: number; repurchase: number; renewalFleet: number; renewalWorking: number;
  netCashFlow: number; accumulatedCashFlow: number; recoveredCapital: number; capitalOutstanding: number;
}
export interface LocInvestYear {
  year: number; ipcaRatePct: number; ipcaSource: string; income: number; repurchase: number;
  renewalFleet: number; renewalWorking: number; netCashFlow: number;
  accumulatedCashFlow: number; recoveredCapital: number; capitalOutstanding: number;
}
export interface LocInvestDemonstrativo {
  plan: LocPlanKey; quantity: number; initialInvestment: number; monthlyBaseIncome: number;
  months: LocInvestMonth[]; years: LocInvestYear[]; totalIncome: number;
  totalRepurchase: number; totalRenewal: number; netCashFlow: number;
  paybackMonth: number | null;
}
const money = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100;
const valid = (v: number) => Number.isFinite(v) && v >= 0;

export function buildLocInvestDemonstrativo(input: LocInvestDemonstrativoInput): LocInvestDemonstrativo {
  const plans = input.plans ?? LOC_PLANS;
  const plan = plans[input.plan];
  if (!plan || !Number.isInteger(input.quantity) || input.quantity < plan.min || input.quantity > plan.max) throw new Error('Plano ou quantidade inválidos para LocInvest.');
  if (input.ipca.length !== 12 || input.ipca.some((p, i) => p.year !== i + 1 || !Number.isFinite(p.ratePct) || p.ratePct <= -100 || !p.source.trim())) throw new Error('Informe 12 taxas anuais de IPCA com origem identificada, em ordem.');
  if (![input.repurchasePerBike, input.renewalBikeCost, input.renewalWorkingPerBike].every(valid)) throw new Error('Recompra e renovação exigem valores contratuais explícitos não negativos.');
  if (input.reinvestFirstRepurchase && (!input.adjustFirstRepurchaseByIpca || !input.renewAtCycles)) throw new Error('Reinvestimento da primeira recompra exige correção pelo IPCA e renovação habilitada.');
  const investment = money(plan.basePrice + (input.quantity - plan.baseQty) * plan.bike + (input.plan === 'start' ? Math.max(0, input.quantity - plan.baseQty) * plan.appropriation : 0));
  const baseIncome = input.quantity * plan.income;
  const firstRepurchaseFactor = input.adjustFirstRepurchaseByIpca ? input.ipca.slice(0, 3).reduce((factor, item) => factor * (1 + item.ratePct / 100), 1) : 1;
  const months: LocInvestMonth[] = [];
  let cash = -investment;
  let incomeTotal = 0;
  let repurchaseTotal = 0;
  let renewalTotal = 0;
  let paybackMonth: number | null = null;
  let annualMultiplier = 1;
  for (let year = 1; year <= 12; year++) {
    if (year > 1) annualMultiplier *= 1 + input.ipca[year - 1].ratePct / 100;
    for (let m = 1; m <= 12; m++) {
      const month = (year - 1) * 12 + m;
      const active = input.renewAtCycles || month <= 36;
      const income = active ? money(baseIncome * annualMultiplier) : 0;
      const endCycle = active && month % 36 === 0;
      const repurchase = endCycle ? money(input.quantity * input.repurchasePerBike * (month === 36 ? firstRepurchaseFactor : 1)) : 0;
      const renew = endCycle && month < 144 && input.renewAtCycles;
      const renewalFleet = renew ? (month === 36 && input.reinvestFirstRepurchase ? repurchase : money(input.quantity * input.renewalBikeCost)) : 0;
      const renewalWorking = renew ? money(input.quantity * input.renewalWorkingPerBike) : 0;
      const netCashFlow = money(income + repurchase - renewalFleet - renewalWorking);
      cash = money(cash + netCashFlow);
      incomeTotal = money(incomeTotal + income);
      repurchaseTotal = money(repurchaseTotal + repurchase);
      renewalTotal = money(renewalTotal + renewalFleet + renewalWorking);
      if (paybackMonth === null && cash >= 0) paybackMonth = month;
      months.push({ month, year, cycle: Math.ceil(month / 36), ipcaRatePct: input.ipca[year - 1].ratePct,
        ipcaSource: input.ipca[year - 1].source, income, repurchase, renewalFleet, renewalWorking,
        netCashFlow, accumulatedCashFlow: cash, recoveredCapital: money(Math.min(investment, Math.max(0, investment + cash))),
        capitalOutstanding: money(Math.max(0, -cash)) });
    }
  }
  const years: LocInvestYear[] = Array.from({ length: 12 }, (_, index) => {
    const slice = months.slice(index * 12, (index + 1) * 12);
    const last = slice[11];
    const sum = (key: 'income' | 'repurchase' | 'renewalFleet' | 'renewalWorking' | 'netCashFlow') => money(slice.reduce((s, row) => s + row[key], 0));
    return { year: index + 1, ipcaRatePct: input.ipca[index].ratePct, ipcaSource: input.ipca[index].source,
      income: sum('income'), repurchase: sum('repurchase'), renewalFleet: sum('renewalFleet'),
      renewalWorking: sum('renewalWorking'), netCashFlow: sum('netCashFlow'),
      accumulatedCashFlow: last.accumulatedCashFlow, recoveredCapital: last.recoveredCapital,
      capitalOutstanding: last.capitalOutstanding };
  });
  return { plan: input.plan, quantity: input.quantity, initialInvestment: investment,
    monthlyBaseIncome: baseIncome, months, years, totalIncome: incomeTotal, totalRepurchase: repurchaseTotal,
    totalRenewal: renewalTotal, netCashFlow: cash, paybackMonth };
}
