export interface MiniMasterInput {
  bikes:number;
  ownBikes:number;
  franchisees:number;
  fee:number;
  structure:number;
  ownBikeRevenue:number;
  thirdPartyRevenue:number;
  workshopSharePct:number;
  locagoraPaymentPct:number;
}

export interface MiniMasterDre {
  bikes:number;
  revenueOwn:number;
  revenueThirdParty:number;
  grossRevenue:number;
  adminRevenue:number;
  maintenanceRevenue:number;
  withdrawalRevenue:number;
  serviceRevenue:number;
  deductions:number;
  parts:number;
  personnel:number;
  infrastructure:number;
  other:number;
  ebitda:number;
  taxes:number;
  net:number;
  margin:number;
}

export const MINI_MASTER = {
  cityPopulationMax:400000,
  collaboratorsInitial:5,
  capacity:300,
  franchiseesMin:20,
  franchiseesMax:25,
  fee:300000,
  structure:80000,
  totalInvestment:380000,
  adminPerBike:250,
  maintenancePerBike:170,
  withdrawalPerBike:12,
  matureGross:129600,
  matureDeductions:8618,
  matureParts:30600,
  maturePersonnel:40582,
  matureInfrastructure:13500,
  matureOther:3800,
  matureTaxes:9291,
  matureNet:23208,
  paybackProjectedMonths:20,
  ownBikeRevenue:1300,
  thirdPartyRevenue:250,
  workshopProfitSharePct:15,
  locagoraPaymentPct:5
};

export function clampMiniBikes(value:number){
  return Math.max(0,Math.min(MINI_MASTER.capacity,Math.round(Number(value)||0)));
}

export function calculateMiniMaster(input:Partial<MiniMasterInput>={}):MiniMasterDre & {
  investment:number;
  paybackMonths:number;
  matureSimplePayback:number;
  workshopShare:number;
  locagoraPayment:number;
}{
  const bikes=clampMiniBikes(input.bikes ?? 300);
  const ownBikes=Math.max(0,Math.min(bikes,Math.round(Number(input.ownBikes ?? 0))));
  const thirdPartyBikes=Math.max(0,bikes-ownBikes);

  const ownBikeRevenue=Number(input.ownBikeRevenue ?? MINI_MASTER.ownBikeRevenue);
  const thirdPartyRevenue=Number(input.thirdPartyRevenue ?? MINI_MASTER.thirdPartyRevenue);
  const workshopSharePct=Number(input.workshopSharePct ?? MINI_MASTER.workshopProfitSharePct);
  const locagoraPaymentPct=Number(input.locagoraPaymentPct ?? MINI_MASTER.locagoraPaymentPct);

  const revenueOwn=ownBikes*ownBikeRevenue;
  const revenueThirdParty=thirdPartyBikes*thirdPartyRevenue;

  // Mature DRE scales linearly from the 300-bike reference supplied for the current model.
  const scale=bikes/MINI_MASTER.capacity;
  const adminRevenue=bikes*MINI_MASTER.adminPerBike;
  const maintenanceRevenue=bikes*MINI_MASTER.maintenancePerBike;
  const withdrawalRevenue=bikes*MINI_MASTER.withdrawalPerBike;

  // Reconcile the supplied mature gross reference with the per-bike service components.
  // The residual represents additional mature service revenue.
  const baseServiceAt300=
    MINI_MASTER.matureGross -
    MINI_MASTER.capacity*(MINI_MASTER.adminPerBike+MINI_MASTER.maintenancePerBike+MINI_MASTER.withdrawalPerBike);
  const serviceRevenue=Math.max(0,baseServiceAt300*scale);

  const grossRevenue=adminRevenue+maintenanceRevenue+withdrawalRevenue+serviceRevenue;
  const deductions=MINI_MASTER.matureDeductions*scale;
  const parts=MINI_MASTER.matureParts*scale;
  const personnel=MINI_MASTER.maturePersonnel*scale;
  const infrastructure=MINI_MASTER.matureInfrastructure*scale;
  const other=MINI_MASTER.matureOther*scale;
  const ebitda=grossRevenue-deductions-parts-personnel-infrastructure-other;
  const taxes=MINI_MASTER.matureTaxes*scale;
  const net=ebitda-taxes;

  const workshopProfit=Math.max(0,maintenanceRevenue-parts);
  const workshopShare=workshopProfit*(workshopSharePct/100);
  const locagoraPayment=Math.max(0,grossRevenue)*(locagoraPaymentPct/100);

  const investment=Number(input.fee ?? MINI_MASTER.fee)+Number(input.structure ?? MINI_MASTER.structure);
  const paybackMonths=net>0?investment/net:Infinity;
  const matureSimplePayback=MINI_MASTER.totalInvestment/MINI_MASTER.matureNet;

  return {
    bikes,revenueOwn,revenueThirdParty,grossRevenue,
    adminRevenue,maintenanceRevenue,withdrawalRevenue,serviceRevenue,
    deductions,parts,personnel,infrastructure,other,ebitda,taxes,net,
    margin:grossRevenue?net/grossRevenue*100:0,
    investment,paybackMonths,matureSimplePayback,workshopShare,locagoraPayment
  };
}

export function miniMasterRamp(){
  return [
    {label:"Implantação",month:1,bikes:50,franchisees:5},
    {label:"Tração",month:6,bikes:120,franchisees:10},
    {label:"Escala",month:12,bikes:210,franchisees:16},
    {label:"Maturidade",month:20,bikes:300,franchisees:22}
  ].map(x=>({...x,result:calculateMiniMaster({bikes:x.bikes})}));
}

export function miniMasterTerritoryCheck(city:string, population:number){
  const name=String(city||"").trim();
  const pop=Math.max(0,Number(population)||0);
  if(!name)return {status:"missing" as const,message:"Informe a cidade/região."};
  if(pop>MINI_MASTER.cityPopulationMax){
    return {status:"blocked" as const,message:"População acima de 400 mil habitantes. Avaliar Master Regional."};
  }
  if(pop<=0){
    return {status:"pending" as const,message:"Informe a população para validar o critério territorial."};
  }
  return {
    status:"preliminarily_eligible" as const,
    message:"Critério populacional atendido. A exclusividade territorial ainda exige validação online e aprovação da Locagora."
  };
}
