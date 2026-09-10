export type InternationalFee = number;

export const INTERNATIONAL_FRANCHISE = {
  feeOptions:[119990,104990,97000] as InternationalFee[],
  baseQty:10,
  fx:6.20,
  revenueEur:{
    rental:3000,
    fine:160,
    interest:100,
    deposit:60
  },
  expenseEur:{
    space:504,
    royalties:189,
    marketing:52.5,
    system:42,
    accounting:157.5,
    tariffs:16.8,
    taxes:0,
    discount:21,
    depreciation:42,
    maintenance:84
  },
  brazilModels:[
    "Yamaha Factor 150",
    "Shineray SHI 175 EFI",
    "Shineray DK 160",
    "Honda CG 160 Start",
    "Bajaj Boxer 150"
  ],
  europeModels:["Honda PCX","LocEletric"]
};

export function calculateInternationalDre(qty:number,fx=INTERNATIONAL_FRANCHISE.fx){
  const q=Math.max(1,Math.round(Number(qty)||1));
  const scale=q/INTERNATIONAL_FRANCHISE.baseQty;
  const rev=Object.fromEntries(Object.entries(INTERNATIONAL_FRANCHISE.revenueEur).map(([k,v])=>[k,v*scale]));
  const exp=Object.fromEntries(Object.entries(INTERNATIONAL_FRANCHISE.expenseEur).map(([k,v])=>[k,v*scale]));
  const revenueEur=Object.values(rev).reduce((s,v)=>s+(v as number),0);
  const expenseEur=Object.values(exp).reduce((s,v)=>s+(v as number),0);
  const netEur=revenueEur-expenseEur;
  const margin=revenueEur?netEur/revenueEur*100:0;
  return {
    qty:q,scale,fx:Number(fx)||6.20,
    revenue:rev,expenses:exp,
    revenueEur,expenseEur,netEur,margin,
    revenueBrl:revenueEur*(Number(fx)||6.20),
    expenseBrl:expenseEur*(Number(fx)||6.20),
    netBrl:netEur*(Number(fx)||6.20)
  };
}

export function calculateInternationalInvestment(
  fee:InternationalFee=119990,
  brazilQty=10,
  europeQty=10,
  brazilBikeValue=16990,
  europeBikeValue=24999,
  workingPerBike=600,
  intermediationPerBike=0
){
  const bq=Math.max(0,Math.round(Number(brazilQty)||0));
  const eq=Math.max(0,Math.round(Number(europeQty)||0));
  const brazilAssets=bq*Number(brazilBikeValue||0);
  const europeAssets=eq*Number(europeBikeValue||0);
  const working=(bq+eq)*Number(workingPerBike||0);
  const intermediation=(bq+eq)*Number(intermediationPerBike||0);
  const total=Number(fee||0)+brazilAssets+europeAssets+working+intermediation;
  return {fee:Number(fee||0),brazilQty:bq,europeQty:eq,brazilAssets,europeAssets,working,intermediation,total};
}
