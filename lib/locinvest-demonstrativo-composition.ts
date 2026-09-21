import { LOC_PLANS, type LocPlan, type LocPlanKey, type LocVariant } from './locinvest';
import { buildLocInvestDemonstrativo, type LocInvestDemonstrativo, type LocInvestIpcaYear, type LocInvestMonth, type LocInvestYear } from './locinvest-demonstrativo-144';

/** One contract per individual LocInvest; never infer buyback or renewal prices from bike value. */
export interface LocInvestContractPackage {
  plan: LocPlanKey;
  quantity: number;
  repurchasePerBike: number;
  renewalBikeCost: number;
  renewalWorkingPerBike: number;
}
export interface LocInvestCompositionInput {
  packages: LocInvestContractPackage[];
  ipca: LocInvestIpcaYear[];
  renewAtCycles: boolean;
  plans?: Record<LocPlanKey, LocPlan>;
}
export interface LocInvestCompositionDemonstrativo extends Omit<LocInvestDemonstrativo, 'plan'> {
  packages: LocInvestDemonstrativo[];
}
const cents = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

/** Convert the calculator's actual recommendation, preserving every package and its quantity. */
export function contractsFromLocInvestItems(
  items: ReadonlyArray<Pick<LocVariant, 'key' | 'qty'>>,
  terms: (item: Pick<LocVariant, 'key' | 'qty'>, index: number) => Pick<LocInvestContractPackage, 'repurchasePerBike' | 'renewalBikeCost' | 'renewalWorkingPerBike'>
): LocInvestContractPackage[] {
  return items.map((item, index) => ({ plan: item.key, quantity: item.qty, ...terms(item, index) }));
}

/** Aggregate cash flows, not percentages or payback months. Recompute payback on consolidated cash. */
export function buildLocInvestCompositionDemonstrativo(input: LocInvestCompositionInput): LocInvestCompositionDemonstrativo {
  if (!input.packages.length) throw new Error('Informe pelo menos um pacote LocInvest.');
  const packages = input.packages.map(item => buildLocInvestDemonstrativo({
    ...item, ipca: input.ipca, renewAtCycles: input.renewAtCycles, plans: input.plans ?? LOC_PLANS
  }));
  const sum = (values: number[]) => cents(values.reduce((total, value) => total + value, 0));
  const initialInvestment = sum(packages.map(item => item.initialInvestment));
  const quantity = sum(packages.map(item => item.quantity));
  const monthlyBaseIncome = sum(packages.map(item => item.monthlyBaseIncome));
  let accumulatedCashFlow = -initialInvestment;
  let paybackMonth: number | null = null;
  const months: LocInvestMonth[] = Array.from({ length: 144 }, (_, index) => {
    const entries = packages.map(item => item.months[index]);
    const first = entries[0];
    const income = sum(entries.map(item => item.income));
    const repurchase = sum(entries.map(item => item.repurchase));
    const renewalFleet = sum(entries.map(item => item.renewalFleet));
    const renewalWorking = sum(entries.map(item => item.renewalWorking));
    const netCashFlow = cents(income + repurchase - renewalFleet - renewalWorking);
    accumulatedCashFlow = cents(accumulatedCashFlow + netCashFlow);
    if (paybackMonth === null && accumulatedCashFlow >= 0) paybackMonth = first.month;
    return {
      month: first.month, year: first.year, cycle: first.cycle,
      ipcaRatePct: first.ipcaRatePct, ipcaSource: first.ipcaSource,
      income, repurchase, renewalFleet, renewalWorking, netCashFlow,
      accumulatedCashFlow,
      recoveredCapital: cents(Math.min(initialInvestment, Math.max(0, initialInvestment + accumulatedCashFlow))),
      capitalOutstanding: cents(Math.max(0, -accumulatedCashFlow))
    };
  });
  const years: LocInvestYear[] = Array.from({ length: 12 }, (_, index) => {
    const slice = months.slice(index * 12, (index + 1) * 12);
    const last = slice[11];
    const total = (key: 'income' | 'repurchase' | 'renewalFleet' | 'renewalWorking' | 'netCashFlow') => sum(slice.map(item => item[key]));
    return {
      year: index + 1, ipcaRatePct: last.ipcaRatePct, ipcaSource: last.ipcaSource,
      income: total('income'), repurchase: total('repurchase'),
      renewalFleet: total('renewalFleet'), renewalWorking: total('renewalWorking'),
      netCashFlow: total('netCashFlow'), accumulatedCashFlow: last.accumulatedCashFlow,
      recoveredCapital: last.recoveredCapital, capitalOutstanding: last.capitalOutstanding
    };
  });
  return {
    packages, quantity, initialInvestment, monthlyBaseIncome, months, years,
    totalIncome: sum(packages.map(item => item.totalIncome)),
    totalRepurchase: sum(packages.map(item => item.totalRepurchase)),
    totalRenewal: sum(packages.map(item => item.totalRenewal)),
    netCashFlow: accumulatedCashFlow, paybackMonth
  };
}
