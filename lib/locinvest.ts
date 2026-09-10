export type LocPlanKey = "start" | "premium" | "exclusive";

export interface LocPlan {
  key: LocPlanKey;
  label: string;
  min: number;
  max: number;
  bike: number;
  fee: number;
  fees: number[];
  appropriation: number;
  income: number;
}

export interface LocVariant extends LocPlan {
  qty: number;
  cost: number;
  monthly: number;
}

export interface LocRecommendation {
  motos: number;
  cost: number;
  monthly: number;
  items: LocVariant[];
  state: 0 | 1 | 2;
}

export interface LocProjectionRow {
  year: number;
  monthly: number;
  annual: number;
  returnBikes: number;
  newFleet: number;
  renewalWorking: number;
  yearFlow: number;
  accumulated: number;
}

export const LOC_PLANS: Record<LocPlanKey, LocPlan> = {
  start: {
    key:"start", label:"Start", min:1, max:2,
    bike:21999, fee:8999, fees:[8999,7999,6999], appropriation:1000, income:410
  },
  premium: {
    key:"premium", label:"Premium", min:3, max:4,
    bike:20999, fee:9999, fees:[9999,9499,8999], appropriation:0, income:430
  },
  exclusive: {
    key:"exclusive", label:"Exclusive", min:5, max:6,
    bike:19999, fee:14000, fees:[14000,13500,13000], appropriation:0, income:470
  }
};

export const LOC_OPERATION = {
  grossPerBike: 1797,
  opPerBike: 671.34,
  insurancePerBike: 169.90,
  accountingPerBike: 143.76,
  netPerBike: 812
};

export function variantCost(plan: LocPlan, qty: number) {
  return qty * plan.bike + plan.fee + qty * plan.appropriation;
}

export function allVariants(plans:Record<LocPlanKey,LocPlan>=LOC_PLANS): LocVariant[] {
  const result: LocVariant[] = [];
  (Object.keys(LOC_PLANS) as LocPlanKey[]).forEach(key => {
    const plan = plans[key];
    for (let qty=plan.min; qty<=plan.max; qty++) {
      const cost = variantCost(plan, qty);
      result.push({...plan, qty, cost, monthly:qty*plan.income});
    }
  });
  return result;
}

export function enumeratePackages(capital:number,plans:Record<LocPlanKey,LocPlan>=LOC_PLANS) {
  return allVariants(plans).filter(v=>v.cost<=capital).sort((a,b)=>a.cost-b.cost);
}

/**
 * Port fiel do motor da versão HTML.
 * Prioridade:
 * 1. maior número de motos;
 * 2. maior renda mensal;
 * 3. maior capital efetivamente alocado.
 *
 * Regra comercial preservada: Start e Exclusive não podem compor
 * simultaneamente a mesma recomendação automática.
 */
export function recommendLocInvest(rawCapital:number,plans:Record<LocPlanKey,LocPlan>=LOC_PLANS):LocRecommendation {
  const capital=Math.max(0,Number(rawCapital)||0);
  const variants=allVariants(plans);
  const maxK=Math.floor(capital/1000);

  type Bucket = LocRecommendation | null;
  const dp:Bucket[][]=Array.from({length:maxK+1},()=>[null,null,null]);
  dp[0][0]={motos:0,cost:0,monthly:0,items:[],state:0};

  const better=(a:LocRecommendation,b:LocRecommendation|null)=>
    !b ||
    a.motos>b.motos ||
    (a.motos===b.motos && a.monthly>b.monthly) ||
    (a.motos===b.motos && a.monthly===b.monthly && a.cost>b.cost);

  for(let k=0;k<=maxK;k++){
    for(let state=0;state<3;state++){
      const cur=dp[k][state];
      if(!cur) continue;

      for(const v of variants){
        const isStart=v.key==="start";
        const isExclusive=v.key==="exclusive";
        if((state===1&&isExclusive)||(state===2&&isStart)) continue;

        let nextState:0|1|2=state as 0|1|2;
        if(isStart) nextState=1;
        if(isExclusive) nextState=2;

        const nk=k+Math.round(v.cost/1000);
        if(nk>maxK) continue;

        const candidate:LocRecommendation={
          motos:cur.motos+v.qty,
          cost:cur.cost+v.cost,
          monthly:cur.monthly+v.monthly,
          items:[...cur.items,v],
          state:nextState
        };

        if(candidate.cost<=capital && better(candidate,dp[nk][nextState])){
          dp[nk][nextState]=candidate;
        }
      }
    }
  }

  let best:LocRecommendation={motos:0,cost:0,monthly:0,items:[],state:0};
  for(const bucket of dp){
    for(const item of bucket){
      if(item && better(item,best)) best=item;
    }
  }
  return best;
}

export function groupRecommendation(items:LocVariant[]) {
  const grouped=new Map<string,LocVariant & {count:number}>();
  items.forEach(v=>{
    const id=`${v.key}-${v.qty}`;
    const existing=grouped.get(id);
    if(existing) existing.count+=1;
    else grouped.set(id,{...v,count:1});
  });
  return [...grouped.values()];
}

export function calculateLocInvest(
  capital:number,
  workingPerBike=600,
  plans:Record<LocPlanKey,LocPlan>=LOC_PLANS,
  operation=LOC_OPERATION
){
  const recommendation=recommendLocInvest(capital,plans);
  const groups=groupRecommendation(recommendation.items);
  const qty=recommendation.motos;
  const invested=recommendation.cost;
  const monthly=recommendation.monthly;
  const annual=monthly*12;
  const working=qty*workingPerBike;
  const totalWithWorking=invested+working;
  const bikesValue=recommendation.items.reduce((sum,v)=>sum+v.qty*v.bike,0);
  const fees=recommendation.items.reduce((sum,v)=>sum+v.fee,0);
  const appropriation=recommendation.items.reduce((sum,v)=>sum+v.qty*v.appropriation,0);

  const gross=qty*operation.grossPerBike;
  const op=qty*operation.opPerBike;
  const insurance=qty*operation.insurancePerBike;
  const accounting=qty*operation.accountingPerBike;
  const expenses=op+insurance+accounting;
  const net=qty*operation.netPerBike;
  const locagora=Math.max(0,net-monthly);

  const roiAnnual=invested?annual/invested*100:0;
  const rentMonthly=invested?monthly/invested*100:0;
  const bikeRentMonthly=bikesValue?monthly/bikesValue*100:0;

  return {
    capital,recommendation,groups,qty,invested,monthly,annual,working,totalWithWorking,
    bikesValue,fees,appropriation,
    leftover:Math.max(0,capital-invested),
    workingGap:capital-totalWithWorking,
    gross,op,insurance,accounting,expenses,net,locagora,
    roiAnnual,rentMonthly,bikeRentMonthly
  };
}

export function projectLocInvest(
  capital:number,
  ipcaPct=4.64,
  renewalWorkingPerBike=600,
  plans:Record<LocPlanKey,LocPlan>=LOC_PLANS,
  operation=LOC_OPERATION
){
  const base=calculateLocInvest(capital,renewalWorkingPerBike,plans,operation);
  const q=base.qty;
  const monthly0=base.monthly;
  const ipca=ipcaPct/100;
  const renewalWorking=q*renewalWorkingPerBike;
  const bikesValue=base.bikesValue;

  let accumulated=0;
  let accumulatedIncome=0;
  let accumulatedReturns=0;
  const rows:LocProjectionRow[]=[];

  for(let year=1;year<=12;year++){
    const monthly=monthly0*Math.pow(1+ipca,year-1);
    const annual=monthly*12;
    accumulatedIncome+=annual;

    const cycle=[3,6,9,12].includes(year);
    const returnBikes=cycle?bikesValue:0;
    const newFleet=[3,6,9].includes(year)?bikesValue:0;
    const renewal=[3,6,9].includes(year)?renewalWorking:0;

    accumulatedReturns+=returnBikes;
    const yearFlow=annual+returnBikes-newFleet-renewal;
    accumulated+=yearFlow;

    rows.push({
      year,monthly,annual,returnBikes,newFleet,
      renewalWorking:renewal,yearFlow,accumulated
    });
  }

  return {
    initial:base.invested,
    accumulatedIncome,
    accumulatedReturns,
    netAfterRenewals:accumulated,
    rows
  };
}

export function compareLocInvest(
  capital:number,
  selicPct=14,
  cdiPct=13.9,
  irPct=15,
  plans:Record<LocPlanKey,LocPlan>=LOC_PLANS,
  workingPerBike=600
){
  const base=calculateLocInvest(capital,workingPerBike,plans);
  const ir=irPct/100;
  const selic=selicPct/100;
  const cdi=cdiPct/100;
  const benchmarkCapital=capital||base.invested;
  return [
    {
      label:"LocInvest — composição recomendada",
      capital:base.invested,
      annual:base.annual,
      rate:base.invested?base.annual/base.invested*100:0
    },
    {
      label:"Selic de referência",
      capital:benchmarkCapital,
      annual:benchmarkCapital*selic*(1-ir),
      rate:selic*(1-ir)*100
    },
    {
      label:"CDI / renda fixa",
      capital:benchmarkCapital,
      annual:benchmarkCapital*cdi*(1-ir),
      rate:cdi*(1-ir)*100
    }
  ];
}
