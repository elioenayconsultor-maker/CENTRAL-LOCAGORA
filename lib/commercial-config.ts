import { LOC_PLANS } from "./locinvest";
import { EUROLOC_PLANS } from "./euroloc";
import { LOCMILLION } from "./locmillion";
import { NATIONAL_FRANCHISE } from "./franquia-nacional";
import { INTERNATIONAL_FRANCHISE } from "./franquia-internacional";
import { MINI_MASTER } from "./mini-master";
import { MASTER_REGIONAL } from "./master-regional";
import { PRODUCTS } from "./products";

type LocInvestAdminPlan={bike:number;feeOptions:number[];income:number;appropriation:number};
type EuroLocAdminPlan={feeOptions:number[];income:number};
export type CommercialConfig={
  locinvest:{start:LocInvestAdminPlan;premium:LocInvestAdminPlan;exclusive:LocInvestAdminPlan};
  euroloc:{start:EuroLocAdminPlan;exclusive:EuroLocAdminPlan;premium:EuroLocAdminPlan;black:EuroLocAdminPlan};
  locmillion:{total:number;adm:number;activation:number;assetBase:number;bikes:number;monthly:number;unitValue:number};
  franchiseNational:{feeOptions:number[];bikeValue:number;intermediationPerBike:number;workingPerBike:number;rentalPerBike:number;royaltyPct:number};
  franchiseInternational:{feeOptions:number[];fx:number};
  miniMaster:{fee:number;structure:number;capacity:number};
  masterRegional:{referenceInvestment:number};
};
export const DEFAULT_COMMERCIAL_CONFIG:CommercialConfig={
  locinvest:{
    start:{bike:LOC_PLANS.start.bike,feeOptions:[...LOC_PLANS.start.fees],income:LOC_PLANS.start.income,appropriation:LOC_PLANS.start.appropriation},
    premium:{bike:LOC_PLANS.premium.bike,feeOptions:[...LOC_PLANS.premium.fees],income:LOC_PLANS.premium.income,appropriation:LOC_PLANS.premium.appropriation},
    exclusive:{bike:LOC_PLANS.exclusive.bike,feeOptions:[...LOC_PLANS.exclusive.fees],income:LOC_PLANS.exclusive.income,appropriation:LOC_PLANS.exclusive.appropriation}
  },
  euroloc:{
    start:{feeOptions:[...EUROLOC_PLANS.start.fees],income:EUROLOC_PLANS.start.income},
    exclusive:{feeOptions:[...EUROLOC_PLANS.exclusive.fees],income:EUROLOC_PLANS.exclusive.income},
    premium:{feeOptions:[...EUROLOC_PLANS.premium.fees],income:EUROLOC_PLANS.premium.income},
    black:{feeOptions:[...EUROLOC_PLANS.black.fees],income:EUROLOC_PLANS.black.income}
  },
  locmillion:{total:LOCMILLION.total,adm:LOCMILLION.adm,activation:LOCMILLION.activation,assetBase:LOCMILLION.assetBase,bikes:LOCMILLION.bikes,monthly:LOCMILLION.monthly,unitValue:LOCMILLION.unitValue},
  franchiseNational:{feeOptions:[...NATIONAL_FRANCHISE.feeOptions],bikeValue:NATIONAL_FRANCHISE.bikeValue,intermediationPerBike:NATIONAL_FRANCHISE.intermediationPerBike,workingPerBike:NATIONAL_FRANCHISE.workingPerBike,rentalPerBike:NATIONAL_FRANCHISE.rentalPerBike,royaltyPct:NATIONAL_FRANCHISE.royaltyPct},
  franchiseInternational:{feeOptions:[...INTERNATIONAL_FRANCHISE.feeOptions],fx:INTERNATIONAL_FRANCHISE.fx},
  miniMaster:{fee:MINI_MASTER.fee,structure:MINI_MASTER.structure,capacity:MINI_MASTER.capacity},
  masterRegional:{referenceInvestment:MASTER_REGIONAL.referenceInvestment}
};
type UnknownRecord = Record<string, unknown>;
const asRecord=(value:unknown):UnknownRecord=>value&&typeof value==="object"?(value as UnknownRecord):{};
const num=(value:unknown,fallback:number)=>Number.isFinite(Number(value))?Number(value):fallback;
const nums=(value:unknown,fallback:number[])=>{const out=Array.isArray(value)?value.map(Number).filter(Number.isFinite):[];return out.length?out:fallback;};
const plan=(raw:UnknownRecord,d:LocInvestAdminPlan):LocInvestAdminPlan=>({bike:num(raw.bike,d.bike),feeOptions:nums(raw.feeOptions,d.feeOptions),income:num(raw.income,d.income),appropriation:num(raw.appropriation,d.appropriation)});
const euroPlan=(raw:UnknownRecord,d:EuroLocAdminPlan):EuroLocAdminPlan=>({feeOptions:nums(raw.feeOptions,d.feeOptions),income:num(raw.income,d.income)});

export function normalizeCommercialConfig(raw:unknown):CommercialConfig{
  const input=asRecord(raw); const d=DEFAULT_COMMERCIAL_CONFIG;
  const li=asRecord(input.locinvest), eu=asRecord(input.euroloc), lm=asRecord(input.locmillion);
  const fn=asRecord(input.franchiseNational), fi=asRecord(input.franchiseInternational), mm=asRecord(input.miniMaster), mr=asRecord(input.masterRegional);
  return {
    locinvest:{start:plan(asRecord(li.start),d.locinvest.start),premium:plan(asRecord(li.premium),d.locinvest.premium),exclusive:plan(asRecord(li.exclusive),d.locinvest.exclusive)},
    euroloc:{start:euroPlan(asRecord(eu.start),d.euroloc.start),exclusive:euroPlan(asRecord(eu.exclusive),d.euroloc.exclusive),premium:euroPlan(asRecord(eu.premium),d.euroloc.premium),black:euroPlan(asRecord(eu.black),d.euroloc.black)},
    locmillion:{total:num(lm.total,d.locmillion.total),adm:num(lm.adm,d.locmillion.adm),activation:num(lm.activation,d.locmillion.activation),assetBase:num(lm.assetBase,d.locmillion.assetBase),bikes:num(lm.bikes,d.locmillion.bikes),monthly:num(lm.monthly,d.locmillion.monthly),unitValue:num(lm.unitValue,d.locmillion.unitValue)},
    franchiseNational:{feeOptions:nums(fn.feeOptions,d.franchiseNational.feeOptions),bikeValue:num(fn.bikeValue,d.franchiseNational.bikeValue),intermediationPerBike:num(fn.intermediationPerBike,d.franchiseNational.intermediationPerBike),workingPerBike:num(fn.workingPerBike,d.franchiseNational.workingPerBike),rentalPerBike:num(fn.rentalPerBike,d.franchiseNational.rentalPerBike),royaltyPct:num(fn.royaltyPct,d.franchiseNational.royaltyPct)},
    franchiseInternational:{feeOptions:nums(fi.feeOptions,d.franchiseInternational.feeOptions),fx:num(fi.fx,d.franchiseInternational.fx)},
    miniMaster:{fee:num(mm.fee,d.miniMaster.fee),structure:num(mm.structure,d.miniMaster.structure),capacity:num(mm.capacity,d.miniMaster.capacity)},
    masterRegional:{referenceInvestment:num(mr.referenceInvestment,d.masterRegional.referenceInvestment)}
  };
}
export function applyCommercialConfig(raw:unknown){
  const c=normalizeCommercialConfig(raw);
  (Object.keys(c.locinvest) as Array<keyof typeof c.locinvest>).forEach(key=>{const src=c.locinvest[key];Object.assign(LOC_PLANS[key],{bike:src.bike,fees:[...src.feeOptions],fee:src.feeOptions[0]??0,income:src.income,appropriation:src.appropriation});});
  (Object.keys(c.euroloc) as Array<keyof typeof c.euroloc>).forEach(key=>{EUROLOC_PLANS[key].fees.splice(0,EUROLOC_PLANS[key].fees.length,...c.euroloc[key].feeOptions);EUROLOC_PLANS[key].income=c.euroloc[key].income;});
  Object.assign(LOCMILLION,c.locmillion);
  NATIONAL_FRANCHISE.feeOptions.splice(0,NATIONAL_FRANCHISE.feeOptions.length,...c.franchiseNational.feeOptions);
  Object.assign(NATIONAL_FRANCHISE,{bikeValue:c.franchiseNational.bikeValue,intermediationPerBike:c.franchiseNational.intermediationPerBike,workingPerBike:c.franchiseNational.workingPerBike,rentalPerBike:c.franchiseNational.rentalPerBike,royaltyPct:c.franchiseNational.royaltyPct});
  INTERNATIONAL_FRANCHISE.feeOptions.splice(0,INTERNATIONAL_FRANCHISE.feeOptions.length,...c.franchiseInternational.feeOptions); INTERNATIONAL_FRANCHISE.fx=c.franchiseInternational.fx;
  Object.assign(MINI_MASTER,c.miniMaster,{totalInvestment:c.miniMaster.fee+c.miniMaster.structure}); MASTER_REGIONAL.referenceInvestment=c.masterRegional.referenceInvestment;
  const minByRoute:Record<string,number>={locinvest:Math.min(...Object.values(LOC_PLANS).map(p=>p.bike+(p.fees[0]??p.fee)+p.appropriation)),euroloc:24999+(EUROLOC_PLANS.start.fees[0]??0)+600,locmillion:LOCMILLION.total,"franq-n":(NATIONAL_FRANCHISE.feeOptions[0]??0)+NATIONAL_FRANCHISE.bikeValue+NATIONAL_FRANCHISE.intermediationPerBike+NATIONAL_FRANCHISE.workingPerBike,"franq-i":INTERNATIONAL_FRANCHISE.feeOptions[0]??0,mini:MINI_MASTER.totalInvestment,master:MASTER_REGIONAL.referenceInvestment};
  PRODUCTS.forEach(p=>{if(minByRoute[p.route])p.min=minByRoute[p.route];}); return c;
}
