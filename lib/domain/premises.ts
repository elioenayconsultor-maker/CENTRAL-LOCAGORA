import { DEFAULT_COMMERCIAL_CONFIG, normalizeCommercialConfig, type CommercialConfig } from "@/lib/commercial-config";

export type PremiseStatus = "draft" | "review" | "published" | "archived";
export type PremiseVersion = {
  id: string;
  version: number;
  status: PremiseStatus;
  config: CommercialConfig;
  createdAt: string;
  publishedAt: string | null;
  createdBy: string | null;
  notes: string | null;
};
export type PremiseSnapshot = Pick<PremiseVersion,"id"|"version"|"config"|"publishedAt">;

export function normalizePremises(raw: unknown): CommercialConfig { return normalizeCommercialConfig(raw); }
export function validatePremises(raw: unknown): {ok:true;value:CommercialConfig}|{ok:false;errors:string[]} {
  const value = normalizePremises(raw);
  const errors: string[] = [];
  const positive=(label:string,n:number)=>{ if(!Number.isFinite(n)||n<0)errors.push(`${label} deve ser um número não negativo.`); };
  Object.entries(value.locinvest).forEach(([key,p])=>{ positive(`LocInvest ${key}: moto`,p.bike); positive(`LocInvest ${key}: renda`,p.income); if(!p.feeOptions.length)errors.push(`LocInvest ${key}: informe ao menos uma taxa.`); });
  Object.entries(value.euroloc).forEach(([key,p])=>{ positive(`EuroLoc ${key}: renda`,p.income); if(!p.feeOptions.length)errors.push(`EuroLoc ${key}: informe ao menos uma taxa.`); });
  positive("LocMillion total",value.locmillion.total); positive("Franquia Nacional: moto",value.franchiseNational.bikeValue); positive("Franquia Internacional: câmbio",value.franchiseInternational.fx);
  return errors.length ? {ok:false,errors} : {ok:true,value};
}
export function defaultPremises(): CommercialConfig { return structuredClone(DEFAULT_COMMERCIAL_CONFIG); }
export function snapshotPremises(version: PremiseVersion): PremiseSnapshot { return {id:version.id,version:version.version,config:structuredClone(version.config),publishedAt:version.publishedAt}; }
