"use client";

import type { ComparisonScenarioType, ComparisonSnapshot, Simulation } from "./types";
import { createClient } from "./supabase/client";
import { getCurrentAppUser } from "./commercial-repository";
import { resolveProductIdentity } from "./product-registry";

export type FinancialProfile = {
  product_slug: string;
  product_name: string;
  product_group: "investment" | "franchise";
  income_basis: "gross" | "net" | "configurable";
  taxation_model: string;
  tax_rate_pct: number | null;
  default_term_months: number | null;
  allow_reinvestment: boolean;
  settings: Record<string, unknown>;
};

export type MarketAssumption = {
  assumption_key: string;
  label: string;
  value: number | null;
  value_unit: string;
  source_name: string | null;
  source_url: string | null;
  reference_date: string | null;
  metadata: Record<string, unknown>;
};

export async function loadProductFinancialProfile(route: string) {
  const identity = resolveProductIdentity(route);
  const slug = identity?.primaryPublicSlug || route;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("commercial_product_financial_profiles")
    .select("product_slug,product_name,product_group,income_basis,taxation_model,tax_rate_pct,default_term_months,allow_reinvestment,settings")
    .eq("product_slug", slug)
    .eq("active", true)
    .maybeSingle();
  return error ? null : (data as FinancialProfile | null);
}

export async function loadMarketAssumptions() {
  const { data, error } = await createClient()
    .from("commercial_market_assumptions")
    .select("assumption_key,label,value,value_unit,source_name,source_url,reference_date,metadata")
    .eq("active", true);
  return error ? [] : ((data || []) as MarketAssumption[]);
}

export async function persistComparisonScenario(input: {
  simulation: Simulation;
  scenarioType: ComparisonScenarioType;
  benchmarkKey?: string;
  label: string;
  horizonMonths: number;
  reinvestment: boolean;
  annualReturnPct?: number;
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
}): Promise<ComparisonSnapshot> {
  const sessionId = localStorage.getItem("locagora_commercial_session_id");
  const user = await getCurrentAppUser();
  const identity = resolveProductIdentity(input.simulation.sourceRoute);
  const snapshot: ComparisonSnapshot = {
    scenarioType: input.scenarioType,
    label: input.label,
    productSlug: input.scenarioType === "product" ? (identity?.primaryPublicSlug || input.simulation.sourceRoute) : undefined,
    benchmarkKey: input.benchmarkKey,
    capital: input.simulation.capital,
    grossMonthlyIncome: input.simulation.monthly,
    netMonthlyIncome: input.simulation.monthly,
    annualReturnPct: input.annualReturnPct,
    horizonMonths: input.horizonMonths,
    reinvestment: input.reinvestment,
    grossFinalValue: input.grossFinalValue,
    taxAmount: input.taxAmount,
    netFinalValue: input.netFinalValue,
    netGain: input.netGain,
    accumulatedReturnPct: input.accumulatedReturnPct,
    monthlyEquivalent: input.monthlyEquivalent,
    taxationSnapshot: input.taxationSnapshot,
    assumptionsSnapshot: input.assumptionsSnapshot,
    sourceName: input.sourceName,
    sourceReferenceDate: input.sourceReferenceDate,
    selectedAt: new Date().toISOString(),
  };

  if (!sessionId || !user) return snapshot;
  const payload = {
    session_id: sessionId,
    simulation_id: input.simulation.remoteId || null,
    user_id: user.id,
    scenario_type: input.scenarioType,
    product_slug: snapshot.productSlug || null,
    benchmark_key: input.benchmarkKey || null,
    capital: snapshot.capital,
    gross_monthly_income: snapshot.grossMonthlyIncome || 0,
    net_monthly_income: snapshot.netMonthlyIncome || 0,
    annual_return_pct: snapshot.annualReturnPct ?? null,
    horizon_months: snapshot.horizonMonths,
    reinvestment: snapshot.reinvestment,
    gross_final_value: snapshot.grossFinalValue ?? snapshot.netFinalValue,
    tax_amount: snapshot.taxAmount,
    net_final_value: snapshot.netFinalValue,
    net_gain: snapshot.netGain,
    accumulated_return_pct: snapshot.accumulatedReturnPct,
    taxation_snapshot: snapshot.taxationSnapshot || {},
    assumptions_snapshot: snapshot.assumptionsSnapshot || {},
    calculation_snapshot: snapshot,
    selected: false,
  };
  const { data, error } = await createClient().from("commercial_comparison_scenarios").insert(payload).select("id").single();
  if (error || !data) return snapshot;
  const { error: selectError } = await createClient().rpc("commercial_select_comparison_scenario", { p_scenario_id: data.id });
  if (selectError) return snapshot;
  return { ...snapshot, scenarioId: data.id };
}
