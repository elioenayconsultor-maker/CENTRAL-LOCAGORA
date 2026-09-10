export type FranchiseNationalFee = number;

export interface NationalDreRow {
  period:string;
  months:number;
  maintenancePerBike:number;
  financialPerBike:number;
  netMonthly:number;
  netPeriod:number;
}

export const NATIONAL_FRANCHISE = {
  feeOptions:[79990,74990,69999] as FranchiseNationalFee[],
  bikeValue:16990,
  intermediationPerBike:4000,
  workingPerBike:600,
  rentalPerBike:1890,
  otherRevenuePerBike:180.69,
  protectionPerBike:170,
  operationPerBike:300,
  royaltyPct:6,
  marketingFixed:250,
  systemFixed:250,
  accountingOneBike:450,
  accountingSixBikes:600,
  taxPctOnRevenue:4,
  saleValuePerBike36:17000
};

export function maintenanceByMonth(month:number){
  if(month<=6)return 70;
  if(month<=12)return 150;
  if(month<=24)return 200;
  return 250;
}

export function financialByMonth(month:number){
  return month<=6?200:150;
}

export function accountingForQty(qty:number){
  if(qty<=1)return NATIONAL_FRANCHISE.accountingOneBike;
  if(qty>=6)return NATIONAL_FRANCHISE.accountingSixBikes;
  const t=(qty-1)/5;
  return NATIONAL_FRANCHISE.accountingOneBike +
    (NATIONAL_FRANCHISE.accountingSixBikes-NATIONAL_FRANCHISE.accountingOneBike)*t;
}

export function calculateNationalMonthly(qty:number,month:number){
  const q=Math.max(1,Math.round(Number(qty)||1));
  const revenueRental=NATIONAL_FRANCHISE.rentalPerBike*q;
  const revenueOther=NATIONAL_FRANCHISE.otherRevenuePerBike*q;
  const revenue=revenueRental+revenueOther;
  const protection=NATIONAL_FRANCHISE.protectionPerBike*q;
  const maintenance=maintenanceByMonth(month)*q;
  const operation=NATIONAL_FRANCHISE.operationPerBike*q;
  const royalties=revenueRental*(NATIONAL_FRANCHISE.royaltyPct/100);
  const financial=financialByMonth(month)*q;
  const marketing=NATIONAL_FRANCHISE.marketingFixed;
  const system=NATIONAL_FRANCHISE.systemFixed;
  const accounting=accountingForQty(q);
  const taxes=revenue*(NATIONAL_FRANCHISE.taxPctOnRevenue/100);
  const expenses=protection+maintenance+operation+royalties+financial+marketing+system+accounting+taxes;
  const net=revenue-expenses;
  return {q,revenueRental,revenueOther,revenue,protection,maintenance,operation,royalties,financial,marketing,system,accounting,taxes,expenses,net};
}

export function calculateNationalInvestment(
  qty:number,
  fee:FranchiseNationalFee=79990,
  workingPerBike=NATIONAL_FRANCHISE.workingPerBike,
  bikeValue=NATIONAL_FRANCHISE.bikeValue,
  intermediationPerBike=NATIONAL_FRANCHISE.intermediationPerBike
){
  const q=Math.max(1,Math.round(Number(qty)||1));
  const bikes=q*Number(bikeValue||0);
  const intermediation=q*Number(intermediationPerBike||0);
  const working=q*workingPerBike;
  const total=fee+bikes+intermediation+working;
  return {qty:q,fee,bikes,intermediation,working,total};
}

export function nationalDre36(qty:number):NationalDreRow[]{
  const periods=[
    {period:"Meses 1–6",months:6,maintenance:70,financial:200},
    {period:"Meses 7–12",months:6,maintenance:150,financial:150},
    {period:"Meses 13–24",months:12,maintenance:200,financial:150},
    {period:"Meses 25–36",months:12,maintenance:250,financial:150},
  ];
  return periods.map((p,i)=>{
    const sampleMonth=i===0?1:i===1?7:i===2?13:25;
    const monthly=calculateNationalMonthly(qty,sampleMonth);
    return {
      period:p.period,months:p.months,
      maintenancePerBike:p.maintenance,
      financialPerBike:p.financial,
      netMonthly:monthly.net,
      netPeriod:monthly.net*p.months
    };
  });
}

export function calculateNationalFranchise(
  qty:number,
  fee:FranchiseNationalFee=79990,
  workingPerBike=NATIONAL_FRANCHISE.workingPerBike,
  bikeValue=NATIONAL_FRANCHISE.bikeValue,
  intermediationPerBike=NATIONAL_FRANCHISE.intermediationPerBike
){
  const investment=calculateNationalInvestment(qty,fee,workingPerBike,bikeValue,intermediationPerBike);
  const dre=nationalDre36(qty);
  const operating36=dre.reduce((s,r)=>s+r.netPeriod,0);
  const sale36=investment.qty*NATIONAL_FRANCHISE.saleValuePerBike36;
  const total36=operating36+sale36;
  const avgMonthly=operating36/36;
  const roi36=investment.total?total36/investment.total*100:0;
  const payback=avgMonthly>0?investment.total/avgMonthly:Infinity;
  return {investment,dre,operating36,sale36,total36,avgMonthly,roi36,payback};
}
