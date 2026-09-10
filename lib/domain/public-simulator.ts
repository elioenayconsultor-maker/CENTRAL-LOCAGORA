import type { PremiseSnapshot } from "@/lib/domain/premises";
import { calculateLocInvest, LOC_PLANS, type LocPlanKey } from "@/lib/locinvest";

export type PublicSimulationInput = { capital: number };
export type PublicSimulationOutput = {
  productRoute: "locinvest";
  productName: "LocInvest";
  scenario: "published";
  premiseVersionId: string;
  premiseVersion: number;
  capital: number;
  invested: number;
  monthly: number;
  annual: number;
  qty: number;
  leftover: number;
  plans: Array<{label:string;qty:number;count:number}>;
};

function plansFromSnapshot(snapshot:PremiseSnapshot){
  const source=snapshot.config.locinvest;
  const keys:LocPlanKey[]=["start","premium","exclusive"];
  return Object.fromEntries(keys.map(key=>{
    const base=LOC_PLANS[key];
    const next=source[key];
    return [key,{...base,bike:next.bike,fee:next.feeOptions[0]??0,fees:[...next.feeOptions],income:next.income,appropriation:next.appropriation}];
  })) as Record<LocPlanKey,typeof LOC_PLANS[LocPlanKey]>;
}

export function simulatePublicLocInvest(input:PublicSimulationInput,snapshot:PremiseSnapshot):PublicSimulationOutput{
  if(!snapshot.id || snapshot.id==="legacy-default" || snapshot.version<=0) throw new Error("published_premises_required");
  const capital=Math.max(0,Number(input.capital)||0);
  if(capital<=0) throw new Error("invalid_capital");
  const result=calculateLocInvest(capital,600,plansFromSnapshot(snapshot));
  if(!result.qty) throw new Error("capital_below_minimum");
  return {
    productRoute:"locinvest",productName:"LocInvest",scenario:"published",
    premiseVersionId:snapshot.id,premiseVersion:snapshot.version,capital,
    invested:result.invested,monthly:result.monthly,annual:result.annual,qty:result.qty,leftover:result.leftover,
    plans:result.groups.map(group=>({label:group.label,qty:group.qty,count:group.count}))
  };
}
