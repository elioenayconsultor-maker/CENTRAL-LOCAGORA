export type IncomeProfile = "fixed" | "variable" | "entrepreneur";
export type JourneyStep = "client" | "solution" | "simulation" | "confirmation" | "proposal";

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
  activeSimulationId: number | null;
  simulations: Simulation[];
  proposal: ProposalState;
}
