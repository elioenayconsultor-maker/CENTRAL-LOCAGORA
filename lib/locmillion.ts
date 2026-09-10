export interface LocMillionInvestor {
  name:string;
  contribution:number;
  sharePct:number;
  monthly:number;
  annual:number;
  income36:number;
  assetRepurchase36:number;
  total36:number;
  roiMonthly:number;
  roiAnnual:number;
  paybackMonths:number;
}

export interface LocMillionProjection {
  year:number;
  monthlyIncome:number;
  annualIncome:number;
  incomeAccumulated:number;
  liquidityEvent:number;
  accumulatedWithLiquidity:number;
}

export const LOCMILLION={
  total:1000000,
  adm:50000,
  activation:50000,
  assetBase:900000,
  bikes:45,
  monthly:25000,
  termYears:12,
  bikeModel:"Yamaha Factor 150",
  unitValue:20000,
  cycleMonths:36
};

export function calculateLocMillion(contribution=LOCMILLION.total){
  const c=Math.max(0,Number(contribution)||0);
  const share=Math.min(1,c/LOCMILLION.total);
  const monthly=LOCMILLION.monthly*share;
  const annual=monthly*12;
  const income36=monthly*36;
  const assetRepurchase36=LOCMILLION.assetBase*share;
  return {
    contribution:c,
    sharePct:share*100,
    monthly,annual,income36,assetRepurchase36,
    total36:income36+assetRepurchase36,
    roiMonthly:c?monthly/c*100:0,
    roiAnnual:c?annual/c*100:0,
    paybackMonths:monthly?c/monthly:0
  };
}

export function splitLocMillion(
  contributions: { name: string; contribution: number }[]
): LocMillionInvestor[] {
  return contributions
    .map((x) => {
      const base = calculateLocMillion(x.contribution);
      return { ...x, ...base };
    })
    .map((x) => ({ ...x, contribution: Number(x.contribution) }));
}
export function projectLocMillion(ipcaPct=4.64):LocMillionProjection[]{
  const ipca=Number(ipcaPct||0)/100;
  let incomeAccumulated=0;
  let accumulatedWithLiquidity=0;
  const rows:LocMillionProjection[]=[];
  for(let year=1;year<=12;year++){
    const monthlyIncome=LOCMILLION.monthly*Math.pow(1+ipca,year-1);
    const annualIncome=monthlyIncome*12;
    incomeAccumulated+=annualIncome;
    const liquidityEvent=[3,6,9,12].includes(year)?LOCMILLION.assetBase:0;
    accumulatedWithLiquidity+=annualIncome+liquidityEvent;
    rows.push({year,monthlyIncome,annualIncome,incomeAccumulated,liquidityEvent,accumulatedWithLiquidity});
  }
  return rows;
}

export function locMillionFundingStatus(contributions:{contribution:number}[]){
  const raised=contributions.reduce((s,x)=>s+Math.max(0,Number(x.contribution)||0),0);
  return {raised,missing:Math.max(0,LOCMILLION.total-raised),over:Math.max(0,raised-LOCMILLION.total),complete:raised>=LOCMILLION.total};
}
