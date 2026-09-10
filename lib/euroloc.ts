export type EuroLocPlanKey = "start" | "exclusive" | "premium" | "black";

export interface EuroLocPlan {
  key: EuroLocPlanKey;
  label: string;
  min: number;
  max: number;
  income: number;
  fees: number[];
}

export interface EuroLocRecommendation {
  key: EuroLocPlanKey;
  label: string;
  qty: number;
  fee: number;
  assets: number;
  total: number;
  income: number;
  monthly: number;
  annual: number;
  refund: number;
  roiMonthly: number;
  roiAnnual: number;
}

export const EURO_PCX_VALUE=24999;
export const EURO_ELECTRIC_VALUE=18999;

export const EUROLOC_PLANS:Record<EuroLocPlanKey,EuroLocPlan>={
  start:{key:"start",label:"Start",min:1,max:2,income:450,fees:[8999,7999,6999]},
  exclusive:{key:"exclusive",label:"Exclusive",min:3,max:4,income:490,fees:[14000,13500,13000]},
  premium:{key:"premium",label:"Premium",min:5,max:9,income:530,fees:[9999,9499,8999]},
  black:{key:"black",label:"Black",min:10,max:15,income:580,fees:[16000,15500,15000]}
};

export const EUROLOC_COUNTRIES=[
  {name:"Brasil",flag:"🇧🇷"},
  {name:"Portugal",flag:"🇵🇹"},
  {name:"Espanha",flag:"🇪🇸"},
  {name:"Itália",flag:"🇮🇹"},
  {name:"França",flag:"🇫🇷"},
  {name:"Inglaterra",flag:"🇬🇧"}
];

export const EUROLOC_SUPPORT=[
  {cadence:"6 MESES",title:"Encontro na Europa",description:"Reunião presencial da rede europeia para alinhamento estratégico, visitas e integração."},
  {cadence:"12 MESES",title:"Encontro no Brasil",description:"Convenção anual reunindo as operações europeia e brasileira."},
  {cadence:"90 DIAS",title:"Mentoria",description:"Sessão trimestral de leitura de mercado, correção de rota e desenvolvimento empresarial."},
  {cadence:"CONTÍNUO",title:"Consultoria in loco",description:"Apoio à implantação, rotina operacional e resolução de problemas no destino europeu."}
];

export function planFromQty(qty:number):EuroLocPlanKey{
  const q=Math.max(1,Math.min(15,Math.round(Number(qty)||1)));
  if(q<=2)return "start";
  if(q<=4)return "exclusive";
  if(q<=9)return "premium";
  return "black";
}

export function clampQty(planKey:EuroLocPlanKey,qty:number){
  const p=EUROLOC_PLANS[planKey];
  return Math.max(p.min,Math.min(p.max,Math.round(Number(qty)||p.min)));
}

export function calculateEuroLoc(planKey:EuroLocPlanKey,qty:number,fee?:number){
  const plan=EUROLOC_PLANS[planKey];
  const q=clampQty(planKey,qty);
  const adm=plan.fees.includes(Number(fee))?Number(fee):plan.fees[0];
  const assets=q*EURO_PCX_VALUE;
  const total=assets+adm;
  const monthly=q*plan.income;
  const annual=monthly*12;
  return {
    key:planKey,label:plan.label,qty:q,fee:adm,assets,total,
    income:plan.income,monthly,annual,
    roiMonthly:total?monthly/total*100:0,
    roiAnnual:total?annual/total*100:0
  };
}

export function recommendEuroLocByCapital(rawCapital:number):EuroLocRecommendation|null{
  const capital=Math.max(0,Number(rawCapital)||0);
  const order:EuroLocPlanKey[]=["black","premium","exclusive","start"];
  let best:EuroLocRecommendation|null=null;

  for(const key of order){
    const plan=EUROLOC_PLANS[key];
    const fee=plan.fees[0];

    for(let q=plan.max;q>=plan.min;q--){
      const base=calculateEuroLoc(key,q,fee);
      if(base.total<=capital){
        const candidate:EuroLocRecommendation={
          ...base,
          refund:capital-base.total
        };
        if(
          !best ||
          candidate.qty>best.qty ||
          (candidate.qty===best.qty&&candidate.monthly>best.monthly) ||
          (candidate.qty===best.qty&&candidate.monthly===best.monthly&&candidate.total>best.total)
        ) best=candidate;
      }
    }
  }
  return best;
}

export function enumerateEuroLocOptions(capital:number){
  const out:EuroLocRecommendation[]=[];
  (Object.keys(EUROLOC_PLANS) as EuroLocPlanKey[]).forEach(key=>{
    const p=EUROLOC_PLANS[key];
    for(let q=p.min;q<=p.max;q++){
      for(const fee of p.fees){
        const base=calculateEuroLoc(key,q,fee);
        if(base.total<=capital){
          out.push({...base,refund:capital-base.total});
        }
      }
    }
  });
  return out.sort((a,b)=>a.qty-b.qty||a.total-b.total);
}

export function convertBrlToEur(brl:number,eurBrlRate:number){
  const rate=Math.max(.0001,Number(eurBrlRate)||6.20);
  return Number(brl||0)/rate;
}
