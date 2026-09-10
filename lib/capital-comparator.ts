export type BenchmarkKind = "renda_fixa" | "fii" | "imovel" | "outro";

export type CapitalBenchmark = {
  id: string;
  label: string;
  kind: BenchmarkKind;
  annualRate: number;
  taxOnGain: number;
  enabled: boolean;
};

export type Projection = {
  finalValue: number;
  grossGain: number;
  netGain: number;
  monthlyEquivalent: number;
};

export const DEFAULT_BENCHMARKS: CapitalBenchmark[] = [
  { id: "cdi-cdb", label: "CDI / CDB", kind: "renda_fixa", annualRate: 0, taxOnGain: 15, enabled: true },
  { id: "tesouro-selic", label: "Tesouro Selic", kind: "renda_fixa", annualRate: 0, taxOnGain: 15, enabled: true },
  { id: "ipca", label: "Tesouro IPCA+", kind: "renda_fixa", annualRate: 0, taxOnGain: 15, enabled: true },
  { id: "fii", label: "FII", kind: "fii", annualRate: 0, taxOnGain: 0, enabled: true },
  { id: "imovel", label: "Imóvel para renda", kind: "imovel", annualRate: 0, taxOnGain: 0, enabled: true },
];

export function projectAnnualRate(capital: number, annualRatePct: number, taxOnGainPct: number, months: number): Projection {
  const principal = Math.max(0, Number(capital) || 0);
  const annual = Math.max(-99.99, Number(annualRatePct) || 0) / 100;
  const tax = Math.min(100, Math.max(0, Number(taxOnGainPct) || 0)) / 100;
  const horizon = Math.max(1, Math.round(Number(months) || 1));
  const monthlyRate = Math.pow(1 + annual, 1 / 12) - 1;
  const grossFinal = principal * Math.pow(1 + monthlyRate, horizon);
  const grossGain = grossFinal - principal;
  const netGain = grossGain >= 0 ? grossGain * (1 - tax) : grossGain;
  const finalValue = principal + netGain;
  return { finalValue, grossGain, netGain, monthlyEquivalent: horizon ? netGain / horizon : 0 };
}

export function projectLocagora(capital: number, monthlyIncome: number, months: number, reinvest: boolean): Projection {
  const principal = Math.max(0, Number(capital) || 0);
  const monthly = Math.max(0, Number(monthlyIncome) || 0);
  const horizon = Math.max(1, Math.round(Number(months) || 1));
  if (!principal || !monthly) return { finalValue: principal, grossGain: 0, netGain: 0, monthlyEquivalent: 0 };
  if (!reinvest) {
    const gain = monthly * horizon;
    return { finalValue: principal + gain, grossGain: gain, netGain: gain, monthlyEquivalent: monthly };
  }
  const monthlyYield = monthly / principal;
  const finalValue = principal * Math.pow(1 + monthlyYield, horizon);
  const gain = finalValue - principal;
  return { finalValue, grossGain: gain, netGain: gain, monthlyEquivalent: gain / horizon };
}
