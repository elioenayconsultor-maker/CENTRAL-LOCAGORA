export type IncomeProfile = "fixed" | "variable" | "entrepreneur";
export type JourneyStep = "client" | "solution" | "simulation" | "confirmation" | "comparison" | "proposal";

export interface ClientProfile {
  name: string;
  phone: string;
  capital: number;
  goal: string;
  income: string;
  priority: string;
  notes: string;
}

export interface Product {
  route: string;
  name: string;
  category: string;
  min: number;
  profiles: IncomeProfile[];
  description: string;
}

export interface Simulation {
  id: number;
  remoteId?: string;
  name: string;
  sourceRoute: string;
  capital: number;
  monthly: number;
  annual?: number;
  details?: Record<string, unknown>;
  updatedAt?: string;
}

export type ComparisonScenarioType =
  | "product"
  | "cdi_cdb"
  | "tesouro_selic"
  | "tesouro_ipca_plus"
  | "fii"
  | "rental_property"
  | "custom";

export interface ComparisonSnapshot {
  scenarioId?: string;
  scenarioType: ComparisonScenarioType;
  label: string;
  productSlug?: string;
  benchmarkKey?: string;
  capital: number;
  grossMonthlyIncome?: number;
  netMonthlyIncome?: number;
  annualReturnPct?: number;
  horizonMonths: number;
  reinvestment: boolean;
  grossFinalValue?: number;
  taxAmount: number;
  netFinalValue: number;
  netGain: number;
  accumulatedReturnPct: number;
  monthlyEquivalent: number;
  taxationSnapshot?: Record<string, unknown>;
  assumptionsSnapshot?: Record<string, unknown>;
  sourceName?: string;
  sourceReferenceDate?: string;
  selectedAt: string;
}

export interface ProposalNarrative {
  opportunityTitle: string;
  opportunityText: string;
  operationSummary: string;
  financialNarrative: string;
  scaleNarrative: string;
  executiveSummary: string;
  closingText: string;
}

export interface ProposalState {
  title: string;
  date: string;
  validityDays: number;
  orientation: "landscape" | "portrait";
  extraInfo: string;
  consultant: string;
  consultantPhone: string;
  consultantEmail?: string;
  consultantPhoto?: string;
  remoteId?: string;
  aiNarrative?: ProposalNarrative;
  aiGeneratedAt?: string;
}

export interface CommercialState {
  version: 2;
  step: JourneyStep;
  client: ClientProfile;
  selectedProductRoute: string;
  selectedPresentationId: string | null;
  activeSimulationId: number | null;
  selectedComparisonScenarioId: string | null;
  comparisonSnapshot: ComparisonSnapshot | null;
  simulations: Simulation[];
  proposal: ProposalState;
}
