export type FranchiseDreMode = "static" | "balanced" | "full";

export type FranchiseDreBreakdown = {
  revenueTotal?:number;
  rentalRevenue?:number;
  otherRevenue?:number;
  operatingCosts?:number;
  protection?:number;
  maintenance?:number;
  operation?:number;
  royalties?:number;
  financial?:number;
  marketing?:number;
  system?:number;
  accounting?:number;
  taxes?:number;
  [key:string]:number|undefined;
};

export interface FranchiseDreEvolutionRow {
  month:number;
  openingAssets:number;
  operatingResult:number;
  reinvestmentContribution:number;
  availableToClient:number;
  purchases:number;
  purchaseAmount:number;
  closingAssets:number;
  reinvestmentPool:number;
  breakdown?:FranchiseDreBreakdown;
}

export interface FranchiseDreAnnualRow {
  year:number;
  openingAssets:number;
  closingAssets:number;
  addedAssets:number;
  operatingResult:number;
  reinvested:number;
  availableToClient:number;
}

export interface FranchiseDreEvolution {
  mode:FranchiseDreMode;
  reinvestPct:number;
  horizonMonths:number;
  initialAssets:number;
  finalAssets:number;
  addedAssets:number;
  unitAssetCost:number;
  totalOperatingResult:number;
  totalReinvested:number;
  totalAvailableToClient:number;
  endingPool:number;
  firstPurchaseMonth:number|null;
  rows:FranchiseDreEvolutionRow[];
  annual:FranchiseDreAnnualRow[];
}

export const franchiseDreModeLabel=(mode:FranchiseDreMode)=>
  mode==="static"?"1 • Sem evolução":mode==="full"?"3 • Reinvestimento total":"2 • Reinvestimento parcial";

export function projectFranchiseDreEvolution({
  initialAssets,
  unitAssetCost,
  horizonMonths=36,
  mode="static",
  balancedReinvestPct=50,
  netForAssets,
  breakdownForAssets
}:{
  initialAssets:number;
  unitAssetCost:number;
  horizonMonths?:number;
  mode?:FranchiseDreMode;
  balancedReinvestPct?:number;
  netForAssets:(assets:number,month:number)=>number;
  breakdownForAssets?:(assets:number,month:number)=>FranchiseDreBreakdown;
}):FranchiseDreEvolution{
  const start=Math.max(1,Math.round(Number(initialAssets)||1));
  const unit=Math.max(.01,Number(unitAssetCost)||.01);
  const horizon=Math.max(1,Math.round(Number(horizonMonths)||36));
  const pct=mode==="static"?0:mode==="full"?100:Math.max(0,Math.min(100,Number(balancedReinvestPct)||0));
  let assets=start,pool=0,totalOperatingResult=0,totalReinvested=0,totalAvailableToClient=0;
  let firstPurchaseMonth:number|null=null;
  const rows:FranchiseDreEvolutionRow[]=[];

  for(let month=1;month<=horizon;month++){
    const openingAssets=assets;
    const operatingResult=Math.max(0,Number(netForAssets(openingAssets,month))||0);
    const breakdown=breakdownForAssets?.(openingAssets,month);
    const reinvestmentContribution=operatingResult*(pct/100);
    const availableToClient=operatingResult-reinvestmentContribution;
    pool+=reinvestmentContribution;
    const purchases=mode==="static"?0:Math.floor((pool+1e-8)/unit);
    const purchaseAmount=purchases*unit;
    if(purchases>0){pool=Math.max(0,pool-purchaseAmount);assets+=purchases;if(firstPurchaseMonth===null)firstPurchaseMonth=month;}
    totalOperatingResult+=operatingResult;
    totalReinvested+=purchaseAmount;
    totalAvailableToClient+=availableToClient;
    rows.push({month,openingAssets,operatingResult,reinvestmentContribution,availableToClient,purchases,purchaseAmount,closingAssets:assets,reinvestmentPool:pool,breakdown});
  }

  const annual:Array<FranchiseDreAnnualRow>=[];
  for(let startMonth=1;startMonth<=horizon;startMonth+=12){
    const slice=rows.slice(startMonth-1,Math.min(horizon,startMonth+11));if(!slice.length)continue;
    const openingAssets=slice[0].openingAssets,closingAssets=slice[slice.length-1].closingAssets;
    annual.push({year:Math.ceil(startMonth/12),openingAssets,closingAssets,addedAssets:closingAssets-openingAssets,operatingResult:slice.reduce((s,r)=>s+r.operatingResult,0),reinvested:slice.reduce((s,r)=>s+r.purchaseAmount,0),availableToClient:slice.reduce((s,r)=>s+r.availableToClient,0)});
  }
  return {mode,reinvestPct:pct,horizonMonths:horizon,initialAssets:start,finalAssets:assets,addedAssets:assets-start,unitAssetCost:unit,totalOperatingResult,totalReinvested,totalAvailableToClient,endingPool:pool,firstPurchaseMonth,rows,annual};
}

export function franchiseDreSnapshot(projection:FranchiseDreEvolution){
  return {
    mode:projection.mode,modeLabel:franchiseDreModeLabel(projection.mode),reinvestPct:projection.reinvestPct,horizonMonths:projection.horizonMonths,
    initialAssets:projection.initialAssets,finalAssets:projection.finalAssets,addedAssets:projection.addedAssets,unitAssetCost:projection.unitAssetCost,
    totalOperatingResult:projection.totalOperatingResult,totalReinvested:projection.totalReinvested,totalAvailableToClient:projection.totalAvailableToClient,
    endingPool:projection.endingPool,firstPurchaseMonth:projection.firstPurchaseMonth,annual:projection.annual,
    monthly:projection.rows.map(r=>({month:r.month,openingAssets:r.openingAssets,closingAssets:r.closingAssets,operatingResult:r.operatingResult,reinvestmentContribution:r.reinvestmentContribution,availableToClient:r.availableToClient,purchases:r.purchases,purchaseAmount:r.purchaseAmount,reinvestmentPool:r.reinvestmentPool,breakdown:r.breakdown||null})),
    purchases:projection.rows.filter(r=>r.purchases>0).map(r=>({month:r.month,purchases:r.purchases,closingAssets:r.closingAssets,purchaseAmount:r.purchaseAmount}))
  };
}
