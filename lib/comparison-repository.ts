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

type LiveRate = { annualRate: number; date: string; source: string; sourceUrl: string };
type LiveRatePayload = {
  ok: boolean;
  selic?: LiveRate | null;
  cdi?: LiveRate | null;
  ipca12m?: LiveRate | null;
  ipcaPlusReal?: LiveRate | null;
  fii12m?: LiveRate | null;
  propertyRentalYield?: LiveRate | null;
  updatedAt?: string;
};

const financialSlugByCanonicalId: Record<string,string> = {
  locinvest: "locinvest",
  euroloc: "locinvest-europa",
  locmillion: "locmillion",
  locinternacional: "cotas-internacionais",
  franquia_nacional: "exclusive-brasil",
  exclusive_internacional: "exclusive-internacional",
  franquia_internacional_2x1: "exclusive-2x1",
  mini_master: "mini-master",
  master_regional: "master",
};

function financialSlug(route:string){
  const identity=resolveProductIdentity(route);
  return identity ? (financialSlugByCanonicalId[identity.id] || identity.primaryPublicSlug) : route;
}

function isoDate(value: string) {
  const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : value;
}

function liveAssumption(key: string, label: string, rate: LiveRate): MarketAssumption {
  return {
    assumption_key: key,
    label,
    value: rate.annualRate,
    value_unit: "pct_aa",
    source_name: rate.source,
    source_url: rate.sourceUrl,
    reference_date: isoDate(rate.date),
    metadata: { origin: "automatic_market_reference", fetchedAt: new Date().toISOString() },
  };
}

export async function loadProductFinancialProfile(route: string) {
  const slug = financialSlug(route);
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
  const supabasePromise = createClient()
    .from("commercial_market_assumptions")
    .select("assumption_key,label,value,value_unit,source_name,source_url,reference_date,metadata")
    .eq("active", true);

  const livePromise = fetch("/api/market-reference-rates", { cache: "no-store" })
    .then(async response => response.ok ? await response.json() as LiveRatePayload : null)
    .catch(() => null);

  const [{ data, error }, live] = await Promise.all([supabasePromise, livePromise]);
  const stored = error ? [] : ((data || []) as MarketAssumption[]);
  if (!live?.ok) return stored;

  const automatic: MarketAssumption[] = [];
  if (live.cdi) automatic.push(liveAssumption("CDI", "CDI anualizado", live.cdi));
  if (live.selic) automatic.push(liveAssumption("SELIC", "Selic anualizada", live.selic));
  if (live.ipca12m) automatic.push(liveAssumption("IPCA", "IPCA acumulado em 12 meses", live.ipca12m));
  if (live.ipcaPlusReal) automatic.push(liveAssumption("IPCA_PLUS_REAL", "Tesouro IPCA+ • taxa real de mercado", live.ipcaPlusReal));
  if (live.fii12m) automatic.push(liveAssumption("FII_DY", "FII • IFIX retorno total 12 meses", live.fii12m));
  if (live.propertyRentalYield) automatic.push(liveAssumption("PROPERTY_RENT_YIELD", "Imóvel residencial • rental yield", live.propertyRentalYield));

  const liveKeys = new Set(automatic.map(row => row.assumption_key));
  return [...stored.filter(row => !liveKeys.has(row.assumption_key)), ...automatic];
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
  const snapshot: ComparisonSnapshot = {
    scenarioType: input.scenarioType,
    label: input.label,
    productSlug: input.scenarioType === "product" ? financialSlug(input.simulation.sourceRoute) : undefined,
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
