export type PublicProductSlug = string;
export type PublicProductProfile = "operator"|"investor"|"international"|"network";

export interface PublicProduct {
  slug:PublicProductSlug;
  name:string;
  eyebrow:string;
  category:string;
  description:string;
  audience:string;
  scope:string;
  structure:string;
  profiles:PublicProductProfile[];
  tags:string[];
  slides:string[];
  facts:{label:string;value:string;note?:string}[];
}

// V9.2.1 — catálogo comercial oficial.
// Materiais institucionais genéricos (ex.: "franquias" / "internacional")
// deixam de ser tratados como produtos e permanecem apenas como conteúdo editorial.
export const PUBLIC_PRODUCTS:PublicProduct[]=[
  {
    slug:"locinvest",name:"LOCINVEST",eyebrow:"INVESTIMENTOS • BRASIL",category:"Investimentos Brasil e Internacional",
    description:"Estrutura de investimento em ativos de mobilidade para geração de renda recorrente dentro do ecossistema Locagora.",audience:"Para clientes que buscam participação em ativos de mobilidade no Brasil.",
    scope:"Brasil",structure:"Planos escaláveis com ativos de mobilidade",profiles:["investor"],tags:["Brasil","Ativos","Renda recorrente"],
    slides:["/public-materials/locinvest/page-1.webp","/public-materials/locinvest/page-2.webp","/public-materials/locinvest/page-3.webp","/public-materials/locinvest/page-4.webp","/public-materials/locinvest/page-5.webp","/public-materials/locinvest/page-6.webp"],
    facts:[{label:"Entrada",value:"A partir de 1 ativo"},{label:"Estrutura",value:"Planos escaláveis"},{label:"Gestão",value:"Operação Locagora"}]
  },
  {
    slug:"euroloc",name:"LOCINVEST EUROPA",eyebrow:"INVESTIMENTOS • EUROPA",category:"Investimentos Brasil e Internacional",
    description:"Versão internacional da tese LocInvest para operação europeia, com dimensionamento por capital ou quantidade de motos.",audience:"Para investidores interessados em ativos de mobilidade com exposição internacional.",
    scope:"Europa",structure:"Ativos de mobilidade + operação internacional",profiles:["investor","international"],tags:["LocInvest Europa","Europa","Ativos"],
    slides:["/public-materials/internacional/page-1.webp","/public-materials/internacional/page-7.webp","/public-materials/internacional/page-8.webp"],
    facts:[{label:"Modelo",value:"LocInvest Europa"},{label:"Mercado",value:"Europa"},{label:"Dimensionamento",value:"Capital ou motos"}]
  },
  {
    slug:"locmillion",name:"LOCMILLION",eyebrow:"INVESTIMENTOS • PROJETO ESTRUTURADO",category:"Investimentos Brasil e Internacional",
    description:"Projeto estruturado de maior escala dentro do ecossistema Locagora, com participação em ativos e renda projetada conforme premissas vigentes.",audience:"Para investidores que avaliam projetos de maior porte.",
    scope:"Projeto estruturado",structure:"Ativos + participação financeira",profiles:["investor"],tags:["LocMillion","Escala","Ativos"],
    slides:["/public-materials/locinvest/page-1.webp","/public-materials/locinvest/page-4.webp","/public-materials/locinvest/page-6.webp"],
    facts:[{label:"Modelo",value:"LocMillion"},{label:"Perfil",value:"Projeto de maior escala"},{label:"Atendimento",value:"Simulação comercial"}]
  },
  {
    slug:"cotas",name:"COTAS INTERNACIONAIS",eyebrow:"INVESTIMENTOS • INTERNACIONAL",category:"Investimentos Brasil e Internacional",
    description:"Estrutura de participação por cotas em projetos internacionais da Locagora.",audience:"Para clientes que buscam participação em estruturas internacionais de investimento da rede.",
    scope:"Projetos internacionais",structure:"Participação por cotas",profiles:["investor","international"],tags:["Cotas","Internacional","Participação"],
    slides:["/public-materials/cotas/page-1.webp","/public-materials/cotas/page-2.webp","/public-materials/cotas/page-3.webp","/public-materials/cotas/page-4.webp","/public-materials/cotas/page-5.webp"],
    facts:[{label:"Formato",value:"Cotas"},{label:"Escopo",value:"Internacional"},{label:"Objetivo",value:"Participação"}]
  },
  {
    slug:"exclusive",name:"EXCLUSIVE BRASIL",eyebrow:"FRANQUIAS • BRASIL",category:"Franquias Brasil e Internacional",
    description:"Modelo Exclusive para operação nacional com ativos de mobilidade e estrutura comercial Locagora.",audience:"Para quem deseja operar uma franquia Exclusive no Brasil.",
    scope:"Brasil",structure:"Franquia com ativos de mobilidade",profiles:["operator","network"],tags:["Exclusive Brasil","Operação","Franquia"],
    slides:["/public-materials/exclusive/page-1.webp","/public-materials/exclusive/page-2.webp","/public-materials/exclusive/page-3.webp","/public-materials/exclusive/page-4.webp","/public-materials/exclusive/page-6.webp","/public-materials/exclusive/page-8.webp","/public-materials/exclusive/page-10.webp"],
    facts:[{label:"Modelo",value:"Exclusive Brasil"},{label:"Escopo",value:"Operação nacional"},{label:"Tese",value:"Moto como ativo"}]
  },
  {
    slug:"franquia-internacional",name:"EXCLUSIVE INTERNACIONAL",eyebrow:"FRANQUIAS • INTERNACIONAL",category:"Franquias Brasil e Internacional",
    description:"Modelo Exclusive para implantação e operação em mercado internacional dentro da estratégia de expansão Locagora.",audience:"Para quem pretende operar uma unidade Exclusive em mercado internacional.",
    scope:"Operação internacional",structure:"Franquia com implantação e operação em mercado externo",profiles:["operator","international"],tags:["Exclusive Internacional","Internacional","Operação"],
    slides:["/public-materials/internacional/page-1.webp","/public-materials/internacional/page-2.webp","/public-materials/internacional/page-7.webp"],
    facts:[{label:"Modelo",value:"Exclusive Internacional"},{label:"Escopo",value:"Operação externa"},{label:"Atendimento",value:"Simulação personalizada"}]
  },
  {
    slug:"franquia-2x1",name:"EXCLUSIVE 2X1",eyebrow:"FRANQUIAS • BRASIL + EUROPA",category:"Franquias Brasil e Internacional",
    description:"Estrutura comercial Exclusive que combina operação no Brasil e na Europa em uma mesma jornada.",audience:"Para quem busca uma estrutura combinada Brasil + Europa.",
    scope:"Brasil + Europa",structure:"Duas frentes operacionais integradas",profiles:["operator","international"],tags:["Exclusive 2X1","Brasil","Europa"],
    slides:["/public-materials/internacional/page-1.webp","/public-materials/internacional/page-8.webp","/public-materials/internacional/page-9.webp"],
    facts:[{label:"Formato",value:"2X1"},{label:"Mercados",value:"Brasil + Europa"},{label:"Atendimento",value:"Simulação comercial"}]
  },
  {
    slug:"mini-master",name:"MINI-MASTER",eyebrow:"FRANQUIAS • EXPANSÃO TERRITORIAL",category:"Franquias Brasil e Internacional",
    description:"Modelo de expansão territorial em escala intermediária, com estrutura própria de implantação e capacidade.",audience:"Para operadores que querem desenvolver uma praça com escopo territorial definido.",
    scope:"Expansão local/regional",structure:"Operação territorial intermediária",profiles:["operator","network"],tags:["Mini-Master","Território","Rede"],
    slides:["/public-materials/franquias/page-1.webp","/public-materials/franquias/page-4.webp","/public-materials/franquias/page-5.webp"],
    facts:[{label:"Modelo",value:"Mini-Master"},{label:"Foco",value:"Desenvolvimento territorial"},{label:"Atendimento",value:"Simulação comercial"}]
  },
  {
    slug:"master",name:"MASTER",eyebrow:"FRANQUIAS • EXPANSÃO REGIONAL",category:"Franquias Brasil e Internacional",
    description:"Estrutura Master para expansão, desenvolvimento territorial e suporte à rede Locagora.",audience:"Para operadores com foco em desenvolvimento territorial e escala regional.",
    scope:"Expansão regional",structure:"Operação territorial e suporte à rede",profiles:["operator","network"],tags:["Master","Território","Expansão"],
    slides:["/public-materials/franquias/page-1.webp","/public-materials/franquias/page-5.webp","/public-materials/franquias/page-6.webp"],
    facts:[{label:"Modelo",value:"Master"},{label:"Foco",value:"Expansão regional"},{label:"Atendimento",value:"Simulação comercial"}]
  }
];

export const getPublicProduct=(slug:string)=>PUBLIC_PRODUCTS.find(p=>p.slug===slug);
