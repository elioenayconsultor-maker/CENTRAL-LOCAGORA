export type LocPlanKey = "start" | "premium" | "exclusive";

export interface LocPlan {
  key: LocPlanKey; label: string; min: number; max: number; baseQty: number; basePrice: number;
  bike: number; fee: number; fees: number[]; appropriation: number; income: number;
}
export interface LocVariant extends LocPlan { qty:number; cost:number; monthly:number; }
export interface LocRecommendation { motos:number; cost:number; monthly:number; items:LocVariant[]; state:0|1|2; }
export interface LocProjectionRow { year:number; monthly:number; annual:number; returnBikes:number; newFleet:number; renewalWorking:number; yearFlow:number; accumulated:number; }

export const LOC_PLANS: Record<LocPlanKey, LocPlan> = {
  start:{key:"start",label:"Start",min:1,max:2,baseQty:1,basePrice:30598,bike:21999,fee:8999,fees:[8999,7999,6999],appropriation:1000,income:410},
  premium:{key:"premium",label:"Premium",min:3,max:4,baseQty:3,basePrice:74296,bike:20999,fee:9999,fees:[9999,9499,8999],appropriation:0,income:430},
  exclusive:{key:"exclusive",label:"Exclusive",min:5,max:6,baseQty:6,basePrice:137594,bike:19999,fee:14000,fees:[14000,13500,13000],appropriation:0,income:470}
};
export const LOC_OPERATION={grossPerBike:1797,opPerBike:671.34,insurancePerBike:169.90,accountingPerBike:143.76,netPerBike:812};
export function variantCost(plan:LocPlan,qty:number){const d=qty-plan.baseQty;return plan.basePrice+d*plan.bike+(plan.key==="start"&&d>0?d*plan.appropriation:0)}
export function allVariants(plans:Record<LocPlanKey,LocPlan>=LOC_PLANS){const r:LocVariant[]=[];(Object.keys(LOC_PLANS) as LocPlanKey[]).forEach(k=>{const p=plans[k];for(let q=p.min;q<=p.max;q++)r.push({...p,qty:q,cost:variantCost(p,q),monthly:q*p.income})});return r}
export function enumeratePackages(capital:number,plans:Record<LocPlanKey,LocPlan>=LOC_PLANS){return allVariants(plans).filter(v=>v.cost<=capital).sort((a,b)=>a.cost-b.cost)}
export function recommendLocInvest(rawCapital:number,plans:Record<LocPlanKey,LocPlan>=LOC_PLANS):LocRecommendation{
 const capital=Math.max(0,Number(rawCapital)||0),variants=allVariants(plans),maxK=Math.ceil(capital/1000);type B=LocRecommendation|null;const dp:B[][]=Array.from({length:maxK+1},()=>[null,null,null]);dp[0][0]={motos:0,cost:0,monthly:0,items:[],state:0};
 const better=(a:LocRecommendation,b:LocRecommendation|null)=>!b||a.motos>b.motos||(a.motos===b.motos&&a.monthly>b.monthly)||(a.motos===b.motos&&a.monthly===b.monthly&&a.cost>b.cost);
 for(let k=0;k<=maxK;k++)for(let s=0;s<3;s++){const cur=dp[k][s];if(!cur)continue;for(const v of variants){const st=v.key==="start",ex=v.key==="exclusive";if((s===1&&ex)||(s===2&&st))continue;let ns:0|1|2=s as 0|1|2;if(st)ns=1;if(ex)ns=2;const c:LocRecommendation={motos:cur.motos+v.qty,cost:cur.cost+v.cost,monthly:cur.monthly+v.monthly,items:[...cur.items,v],state:ns};if(c.cost>capital)continue;const nk=Math.ceil(c.cost/1000);if(nk<=maxK&&better(c,dp[nk][ns]))dp[nk][ns]=c}}
 let best:LocRecommendation={motos:0,cost:0,monthly:0,items:[],state:0};for(const b of dp)for(const i of b)if(i&&better(i,best))best=i;return best
}
export function groupRecommendation(items:LocVariant[]){const m=new Map<string,LocVariant&{count:number}>();items.forEach(v=>{const id=`${v.key}-${v.qty}`,e=m.get(id);if(e)e.count++;else m.set(id,{...v,count:1})});return [...m.values()]}
export function calculateLocInvest(capital:number,_workingPerBike=0,plans:Record<LocPlanKey,LocPlan>=LOC_PLANS,operation=LOC_OPERATION){
 const recommendation=recommendLocInvest(capital,plans),groups=groupRecommendation(recommendation.items),qty=recommendation.motos,invested=recommendation.cost,monthly=recommendation.monthly,annual=monthly*12,working=0,totalWithWorking=invested;
 const bikesValue=recommendation.items.reduce((s,v)=>s+v.qty*v.bike,0),fees=recommendation.items.reduce((s,v)=>s+v.fee,0),appropriation=recommendation.items.reduce((s,v)=>s+(v.key==="start"?Math.max(0,v.qty-v.baseQty):0)*v.appropriation,0);
 const gross=qty*operation.grossPerBike,op=qty*operation.opPerBike,insurance=qty*operation.insurancePerBike,accounting=qty*operation.accountingPerBike,expenses=op+insurance+accounting,net=qty*operation.netPerBike,locagora=Math.max(0,net-monthly);
 return {capital,recommendation,groups,qty,invested,monthly,annual,working,totalWithWorking,bikesValue,fees,appropriation,leftover:Math.max(0,capital-invested),workingGap:capital-invested,gross,op,insurance,accounting,expenses,net,locagora,roiAnnual:invested?annual/invested*100:0,rentMonthly:invested?monthly/invested*100:0,bikeRentMonthly:bikesValue?monthly/bikesValue*100:0}
}
export function projectLocInvest(capital:number,ipcaPct=4.64,renewalWorkingPerBike=600,plans:Record<LocPlanKey,LocPlan>=LOC_PLANS,operation=LOC_OPERATION){const base=calculateLocInvest(capital,0,plans,operation),q=base.qty,monthly0=base.monthly,ipca=ipcaPct/100,renewalWorking=q*renewalWorkingPerBike,bikesValue=base.bikesValue;let accumulated=0,accumulatedIncome=0,accumulatedReturns=0;const rows:LocProjectionRow[]=[];for(let year=1;year<=12;year++){const monthly=monthly0*Math.pow(1+ipca,year-1),annual=monthly*12;accumulatedIncome+=annual;const cycle=[3,6,9,12].includes(year),returnBikes=cycle?bikesValue:0,newFleet=[3,6,9].includes(year)?bikesValue:0,renewal=[3,6,9].includes(year)?renewalWorking:0;accumulatedReturns+=returnBikes;const yearFlow=annual+returnBikes-newFleet-renewal;accumulated+=yearFlow;rows.push({year,monthly,annual,returnBikes,newFleet,renewalWorking:renewal,yearFlow,accumulated})}return{initial:base.invested,accumulatedIncome,accumulatedReturns,netAfterRenewals:accumulated,rows}}

/** IR regressivo de renda fixa no Brasil conforme prazo da aplicação. */
export function fixedIncomeIrRate(days:number){if(days<=180)return 22.5;if(days<=360)return 20;if(days<=720)return 17.5;return 15}
/** Resultado líquido de um aporte único com capitalização composta e IR somente sobre o ganho. */
export function compoundFixedIncome(capital:number,annualRatePct:number,years=1){const n=Math.max(0,years),grossFV=capital*Math.pow(1+annualRatePct/100,n),grossGain=Math.max(0,grossFV-capital),days=Math.round(n*365),irRate=fixedIncomeIrRate(days),tax=grossGain*irRate/100,netGain=grossGain-tax;return{grossFV,grossGain,irRate,tax,netGain,netFV:capital+netGain,netRate:capital?netGain/capital*100:0}}
export function compareLocInvest(capital:number,selicPct=14,cdiPct=13.9,_irPct=15,plans:Record<LocPlanKey,LocPlan>=LOC_PLANS,workingPerBike=0,years=1){const base=calculateLocInvest(capital,workingPerBike,plans),benchmarkCapital=capital||base.invested,selic=compoundFixedIncome(benchmarkCapital,selicPct,years),cdi=compoundFixedIncome(benchmarkCapital,cdiPct,years);return[
 {label:"LocInvest — renda líquida",capital:base.invested,annual:base.annual,rate:base.invested?base.annual/base.invested*100:0,note:"Imposto debitado na fonte; renda apresentada líquida."},
 {label:"Selic de referência",capital:benchmarkCapital,annual:selic.netGain,rate:selic.netRate,note:`Juros compostos; IR regressivo de ${selic.irRate.toLocaleString("pt-BR")}% sobre o rendimento.`},
 {label:"CDI / renda fixa",capital:benchmarkCapital,annual:cdi.netGain,rate:cdi.netRate,note:`Juros compostos; IR regressivo de ${cdi.irRate.toLocaleString("pt-BR")}% sobre o rendimento.`}
]}
