"use client";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getPublishedPremises } from "@/lib/data/premises-repository";
import { applyCommercialConfig } from "@/lib/commercial-config";
import { defaultPremises, type PremiseVersion } from "@/lib/domain/premises";

const fallback:PremiseVersion={id:"boot",version:0,status:"published",config:defaultPremises(),createdAt:new Date(0).toISOString(),publishedAt:null,createdBy:null,notes:null};
type Ctx={premises:PremiseVersion;loading:boolean;error:string|null;reload:()=>Promise<void>};
const PremisesContext=createContext<Ctx|null>(null);

export function PremisesProvider({children}:{children:ReactNode}){
 const [premises,setPremises]=useState(fallback); const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null);
 const reload=async()=>{setLoading(true);setError(null);try{const next=await getPublishedPremises();setPremises(next);/* Compatibilidade V13: consumidores serão migrados para o contexto nas fases seguintes. */applyCommercialConfig(next.config);}catch(e){setError(e instanceof Error?e.message:"Falha ao carregar premissas.");}finally{setLoading(false);}};
 useEffect(()=>{void reload();},[]);
 const value=useMemo(()=>({premises,loading,error,reload}),[premises,loading,error]);
 return <PremisesContext.Provider value={value}>{children}</PremisesContext.Provider>;
}
export function usePremises(){const v=useContext(PremisesContext);if(!v)throw new Error("usePremises deve ser usado dentro de PremisesProvider");return v;}
