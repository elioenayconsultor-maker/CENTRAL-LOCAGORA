import { EUROLOC_PLANS, type EuroLocPlanKey } from "@/lib/euroloc";

export type EuroLocCommercialKey="start"|"premium"|"exclusive";

export function euroLocKeyForQty(qty:number):EuroLocCommercialKey{
  const q=Math.max(1,Math.min(6,Math.round(Number(qty)||1)));
  if(q<=2)return "start";
  if(q<=4)return "premium";
  return "exclusive";
}

export function splitEuroLocQuantity(rawQty:number){
  let remaining=Math.max(1,Math.round(Number(rawQty)||1));
  const chunks:number[]=[];
  while(remaining>6){chunks.push(6);remaining-=6;}
  if(remaining>0)chunks.push(remaining);
  return chunks;
}

export function composeEuroLocByQuantity({
  qty:rawQty,bikeValue,workingPerBike,feeByPlan,customIncome
}:{
  qty:number;
  bikeValue:number;
  workingPerBike:number;
  feeByPlan:Record<EuroLocPlanKey,number>;
  customIncome:number|null;
}){
  const chunks=splitEuroLocQuantity(rawQty);
  const items=chunks.map(qty=>{
    const key=euroLocKeyForQty(qty) as EuroLocPlanKey;
    const plan=EUROLOC_PLANS[key];
    const fee=Math.max(0,Number(feeByPlan[key]??plan.fees[0])||0);
    const income=customIncome===null?plan.income:Math.max(0,Number(customIncome)||0);
    const assets=qty*Math.max(0,Number(bikeValue)||0);
    const working=qty*Math.max(0,Number(workingPerBike)||0);
    const total=assets+fee+working;
    return {key,label:plan.label,qty,fee,income,assets,working,total,monthly:qty*income};
  });
  const qty=items.reduce((s,i)=>s+i.qty,0);
  const fee=items.reduce((s,i)=>s+i.fee,0);
  const assets=items.reduce((s,i)=>s+i.assets,0);
  const working=items.reduce((s,i)=>s+i.working,0);
  const total=items.reduce((s,i)=>s+i.total,0);
  const monthly=items.reduce((s,i)=>s+i.monthly,0);
  const annual=monthly*12;
  const label=items.map(i=>`${i.label} (${i.qty})`).join(" + ");
  return {key:items[items.length-1].key,label,qty,fee,assets,working,total,income:qty?monthly/qty:0,monthly,annual,refund:0,roiMonthly:total?monthly/total*100:0,roiAnnual:total?annual/total*100:0,items,productCount:chunks.length,chunks};
}
