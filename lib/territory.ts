import { NETWORK_POINTS, type NetworkPoint } from "./network";

export type TerritoryProduct = "mini" | "master";
export type TerritoryStatus = "missing" | "pending" | "available" | "review" | "blocked";

export type TerritoryResult = {
  status: TerritoryStatus;
  label: string;
  message: string;
  matched: NetworkPoint[];
  populationRuleOk: boolean;
  registryRuleOk: boolean;
};

function normalize(v:string){
  return String(v||"")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase().trim();
}

function matchesPlace(point:NetworkPoint, city:string, state?:string){
  const c=normalize(city), s=normalize(state||"");
  if(!c) return false;
  const pc=normalize(point.city), pn=normalize(point.name), pa=normalize(point.address);
  const cityHit=pc===c || pn.includes(c) || pa.includes(c);
  const stateHit=!s || normalize(point.state)===s || pa.includes(` ${s}`);
  return cityHit && stateHit;
}

function relevantTerritorialPoint(point:NetworkPoint){
  const t=normalize(point.type);
  const n=normalize(point.name);
  return t==="master" || n.includes("master") || n.includes("mini-master") || n.includes("mini master");
}

export function checkTerritory(input:{
  product:TerritoryProduct;
  city:string;
  state?:string;
  population:number;
}):TerritoryResult{
  const city=String(input.city||"").trim();
  const population=Math.max(0,Number(input.population)||0);
  const product=input.product;

  if(!city){
    return {status:"missing",label:"Cidade pendente",message:"Informe a cidade ou região.",matched:[],populationRuleOk:false,registryRuleOk:false};
  }
  if(population<=0){
    return {status:"pending",label:"População pendente",message:"Informe a população estimada para validar o enquadramento.",matched:[],populationRuleOk:false,registryRuleOk:false};
  }

  const populationRuleOk = product==="mini" ? population<=400000 : population>=400000;
  if(!populationRuleOk){
    return {
      status:"blocked",
      label:"Fora do enquadramento",
      message:product==="mini"
        ?"População acima de 400 mil habitantes. Avaliar Master Regional."
        :"População abaixo de 400 mil habitantes. Avaliar Mini-Master.",
      matched:[],populationRuleOk:false,registryRuleOk:false
    };
  }

  const samePlace = NETWORK_POINTS.filter(p=>matchesPlace(p,city,input.state));
  const territorial = samePlace.filter(relevantTerritorialPoint);
  const activeTerritorial = territorial.filter(p=>!p.future && normalize(p.status).includes("oper"));
  const futureTerritorial = territorial.filter(p=>p.future || normalize(p.status).includes("futur") || normalize(p.status).includes("implant"));

  if(activeTerritorial.length){
    return {
      status:"blocked",
      label:"Território ocupado",
      message:`Encontramos ${activeTerritorial.length} operação territorial ativa na base da Rede Locagora para esta praça. Exige validação da gestão antes de avançar.`,
      matched:activeTerritorial,
      populationRuleOk:true,
      registryRuleOk:false
    };
  }

  if(futureTerritorial.length){
    return {
      status:"review",
      label:"Território em análise",
      message:`Existe ${futureTerritorial.length} implantação/futura operação registrada para a praça. Solicite validação da gestão comercial.`,
      matched:futureTerritorial,
      populationRuleOk:true,
      registryRuleOk:false
    };
  }

  const localUnits=samePlace.filter(p=>normalize(p.status).includes("oper"));
  return {
    status:"available",
    label:"Pré-disponível",
    message:localUnits.length
      ?`Critério populacional atendido. A cidade possui ${localUnits.length} ponto(s) Locagora na base, mas nenhuma Master/Mini-Master ativa identificada. A aprovação final continua obrigatória.`
      :"Critério populacional atendido e nenhuma Master/Mini-Master ativa foi encontrada na base operacional atual. A aprovação final da Locagora continua obrigatória.",
    matched:localUnits.slice(0,8),
    populationRuleOk:true,
    registryRuleOk:true
  };
}
