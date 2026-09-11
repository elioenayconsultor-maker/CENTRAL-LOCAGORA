import { LOC_OPERATION, LOC_PLANS, groupRecommendation, variantCost, type LocPlan, type LocPlanKey, type LocVariant } from "@/lib/locinvest";

export function planKeyForLocInvestQty(qty:number):LocPlanKey {
  const q=Math.max(1,Math.min(6,Math.round(Number(qty)||1)));
  if(q<=2)return "start";
  if(q<=4)return "premium";
  return "exclusive";
}

export function splitLocInvestQuantity(rawQty:number){
  let remaining=Math.max(1,Math.round(Number(rawQty)||1));
  const chunks:number[]=[];
  while(remaining>6){chunks.push(6);remaining-=6;}
  if(remaining>0)chunks.push(remaining);
  return chunks;
}

export function composeLocInvestByQuantity(
  rawQty:number,
  plans:Record<LocPlanKey,LocPlan>=LOC_PLANS,
  operation=LOC_OPERATION
){
  const chunks=splitLocInvestQuantity(rawQty);
  const items:LocVariant[]=chunks.map(qty=>{
    const key=planKeyForLocInvestQty(qty);
    const plan=plans[key];
    return {...plan,qty,cost:variantCost(plan,qty),monthly:qty*plan.income};
  });
  const qty=items.reduce((s,v)=>s+v.qty,0);
  const invested=items.reduce((s,v)=>s+v.cost,0);
  const monthly=items.reduce((s,v)=>s+v.monthly,0);
  const annual=monthly*12;
  const groups=groupRecommendation(items);
  const bikesValue=items.reduce((s,v)=>s+v.qty*v.bike,0);
  const fees=items.reduce((s,v)=>s+v.fee,0);
  const appropriation=items.reduce((sum,v)=>sum+(v.key==="start"?Math.max(0,v.qty-v.baseQty)*v.appropriation:0),0);
  const gross=qty*operation.grossPerBike;
  const op=qty*operation.opPerBike;
  const insurance=qty*operation.insurancePerBike;
  const accounting=qty*operation.accountingPerBike;
  const expenses=op+insurance+accounting;
  const net=qty*operation.netPerBike;
  const locagora=Math.max(0,net-monthly);
  return {
    capital:invested,
    recommendation:{motos:qty,cost:invested,monthly,items,state:0 as 0},
    groups,qty,invested,monthly,annual,working:0,totalWithWorking:invested,
    bikesValue,fees,appropriation,leftover:0,workingGap:0,
    gross,op,insurance,accounting,expenses,net,locagora,
    roiAnnual:invested?annual/invested*100:0,
    rentMonthly:invested?monthly/invested*100:0,
    bikeRentMonthly:bikesValue?monthly/bikesValue*100:0,
    productCount:chunks.length,
    chunks
  };
}
