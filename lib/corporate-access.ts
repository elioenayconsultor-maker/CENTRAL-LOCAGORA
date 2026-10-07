export type CorporateDepartment="COMERCIAL"|"DIRETORIA"|"FINANCEIRO"|"RH"|"MARKETING"|"OPERACOES"|"CS"|"TI_SUPORTE"|"JURIDICO";
export type CorporateAccessProfile="COLABORADOR"|"GESTOR_AREA"|"EXECUTIVO"|"ADMINISTRADOR";
export type CorporatePage="home"|"announcements"|"documents"|"directory"|"news"|"solutions"|"network"|"history"|"benchmark"|"capital"|"support"|"quality";

export const DEPARTMENT_LABELS:Record<CorporateDepartment,string>={
 COMERCIAL:"Comercial",DIRETORIA:"Diretoria",FINANCEIRO:"Financeiro",RH:"RH",MARKETING:"Marketing",OPERACOES:"Operações",CS:"CS / Relacionamento",TI_SUPORTE:"TI / Suporte",JURIDICO:"Jurídico / Compliance"
};
export const ACCESS_PROFILE_LABELS:Record<CorporateAccessProfile,string>={
 COLABORADOR:"Colaborador",GESTOR_AREA:"Gestor de área",EXECUTIVO:"Executivo / Diretoria",ADMINISTRADOR:"Administrador"
};
export const MODULE_LABELS:Record<Exclude<CorporatePage,"home">,string>={
 announcements:"Comunicados",documents:"Documentos",directory:"Equipe",news:"LOCNEWS",solutions:"Investimentos & Franquias",network:"Rede Locagora",history:"História",benchmark:"Benchmark",capital:"Comparador de Capital",support:"Apoio Comercial",quality:"Homologação"
};
const ALL:CorporatePage[]=["home","announcements","documents","directory","news","solutions","network","history","benchmark","capital","support","quality"];
const DEFAULTS:Record<CorporateDepartment,CorporatePage[]>={
 COMERCIAL:["home","announcements","documents","directory","news","solutions","network","history","benchmark","capital","support","quality"],
 DIRETORIA:ALL,
 FINANCEIRO:["home","announcements","documents","directory","news","network","history","benchmark","capital","support"],
 RH:["home","announcements","documents","directory","news","network","history","support"],
 MARKETING:["home","announcements","documents","directory","news","network","history","benchmark","support"],
 OPERACOES:["home","announcements","documents","directory","news","solutions","network","history","support"],
 CS:["home","announcements","documents","directory","news","solutions","network","history","benchmark","support"],
 TI_SUPORTE:["home","announcements","documents","directory","news","network","history","support","quality"],
 JURIDICO:["home","announcements","documents","directory","news","network","history","support"]
};
export function normalizeDepartment(v:unknown):CorporateDepartment{return String(v||"COMERCIAL").toUpperCase() as CorporateDepartment}
export function normalizeAccessProfile(v:unknown):CorporateAccessProfile{return String(v||"COLABORADOR").toUpperCase() as CorporateAccessProfile}
export function allowedCorporatePages(user:{department?:unknown;access_profile?:unknown;module_permissions?:unknown;role?:unknown}|null|undefined):CorporatePage[]{
 if(!user)return ["home"];
 const profile=normalizeAccessProfile(user.access_profile);
 const role=String(user.role||"").toUpperCase();
 if(profile==="ADMINISTRADOR"||profile==="EXECUTIVO"||role==="ADMIN")return ALL;
 const department=normalizeDepartment(user.department);
 const base=DEFAULTS[department]||DEFAULTS.COMERCIAL;
 const extra=Array.isArray(user.module_permissions)?user.module_permissions.map(String).filter(x=>x in MODULE_LABELS) as CorporatePage[]:[];
 return Array.from(new Set<CorporatePage>([...base,...extra]));
}
