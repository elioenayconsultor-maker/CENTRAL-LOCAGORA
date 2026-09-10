export interface MasterMilestone {
  month:number;
  franchisees:number;
  bikes:number;
  monthlyRevenue:number;
  annualized:number;
}

export const MASTER_REGIONAL = {
  referenceInvestment:928000,
  minPopulation:400000,
  contractYears:10,
  royaltiesPct:0,
  marketingPct:0,
  systemPct:0,
  milestones:[
    {month:6,franchisees:30,bikes:300,monthlyRevenue:19900},
    {month:12,franchisees:50,bikes:600,monthlyRevenue:39600},
    {month:24,franchisees:80,bikes:1000,monthlyRevenue:81000}
  ] as MasterMilestone[],
  revenueRules:[
    {label:"Taxa de franquia",value:"50% para Master Regional"},
    {label:"Franqueadora",value:"10%"},
    {label:"Espaço",value:"100%"},
    {label:"Oficina",value:"100%"},
    {label:"Montagem de fábrica",value:"2%"},
    {label:"GPS",value:"100%"},
    {label:"Retirada",value:"100%"},
    {label:"Intermediação Locagora",value:"4%"},
    {label:"Concessionária",value:"28%"},
    {label:"Cooperloc",value:"0%"},
    {label:"Royalties",value:"0%"},
    {label:"Marketing",value:"0%"},
    {label:"Sistema",value:"0%"}
  ]
};

export function masterMilestone(month:number){
  const m=Math.max(0,Number(month)||0);
  const rows=MASTER_REGIONAL.milestones;
  if(m<=rows[0].month)return rows[0];
  if(m>=rows[rows.length-1].month)return rows[rows.length-1];

  for(let i=0;i<rows.length-1;i++){
    const a=rows[i], b=rows[i+1];
    if(m>=a.month&&m<=b.month){
      const t=(m-a.month)/(b.month-a.month);
      return {
        month:m,
        franchisees:Math.round(a.franchisees+(b.franchisees-a.franchisees)*t),
        bikes:Math.round(a.bikes+(b.bikes-a.bikes)*t),
        monthlyRevenue:a.monthlyRevenue+(b.monthlyRevenue-a.monthlyRevenue)*t,
        annualized:(a.monthlyRevenue+(b.monthlyRevenue-a.monthlyRevenue)*t)*12
      };
    }
  }
  return rows[0];
}

export function calculateMasterRegional(
  investment=MASTER_REGIONAL.referenceInvestment,
  month=24,
  customMonthlyRevenue?:number
){
  const milestone=masterMilestone(month);
  const monthlyRevenue=Number(customMonthlyRevenue||0)>0?Number(customMonthlyRevenue):milestone.monthlyRevenue;
  const annualRevenue=monthlyRevenue*12;
  const roiAnnual=investment?annualRevenue/investment*100:0;
  const paybackMonths=monthlyRevenue?investment/monthlyRevenue:Infinity;
  return {
    investment:Number(investment)||MASTER_REGIONAL.referenceInvestment,
    milestone:{...milestone,monthlyRevenue,annualized:annualRevenue},
    monthlyRevenue,annualRevenue,roiAnnual,paybackMonths,
    contractYears:MASTER_REGIONAL.contractYears
  };
}

export function masterProjection(investment=MASTER_REGIONAL.referenceInvestment){
  return MASTER_REGIONAL.milestones.map(m=>{
    const result=calculateMasterRegional(investment,m.month,m.monthlyRevenue);
    return {...m,roiAnnual:result.roiAnnual,paybackMonths:result.paybackMonths};
  });
}

export function masterTerritoryCheck(region:string,population:number){
  const name=String(region||"").trim();
  const pop=Math.max(0,Number(population)||0);
  if(!name)return {status:"missing" as const,message:"Informe a cidade/região."};
  if(pop<=0)return {status:"pending" as const,message:"Informe a população para avaliar o critério territorial."};
  if(pop<MASTER_REGIONAL.minPopulation){
    return {status:"blocked" as const,message:"A praça está abaixo de 400 mil habitantes. Avaliar Mini-Master."};
  }
  return {
    status:"preliminarily_eligible" as const,
    message:"Critério populacional atendido. A região ainda precisa de checagem online de disponibilidade e aprovação da Locagora."
  };
}
