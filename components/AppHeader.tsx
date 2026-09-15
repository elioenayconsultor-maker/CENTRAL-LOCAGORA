"use client";
import { CircleHelp, Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CorporatePage } from "@/lib/corporate-access";

const labels:Record<CorporatePage,{eyebrow:string;title:string}>={
  home:{eyebrow:"Central corporativa",title:"Início"},news:{eyebrow:"Inteligência comercial",title:"LOCNEWS"},solutions:{eyebrow:"Portfólio",title:"Investimentos & Franquias"},network:{eyebrow:"Expansão",title:"Rede Locagora"},history:{eyebrow:"Institucional",title:"História"},benchmark:{eyebrow:"Inteligência",title:"Benchmark"},capital:{eyebrow:"Inteligência financeira",title:"Comparador de Oportunidades de Capital"},support:{eyebrow:"Vendas",title:"Apoio Comercial"},quality:{eyebrow:"Governança",title:"Homologação"}
};
export default function AppHeader({page}:{page:CorporatePage}){
 const current=labels[page],supabase=useMemo(()=>createClient(),[]);const[isAdmin,setIsAdmin]=useState(false);
 useEffect(()=>{let alive=true;(async()=>{const {data,error}=await supabase.rpc("is_commercial_admin");if(alive)setIsAdmin(!error&&Boolean(data));})();return()=>{alive=false}},[supabase]);
 const actionStyle={color:"#fff",border:"1px solid rgba(255,255,255,.24)",background:"rgba(255,255,255,.08)",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:7,padding:"8px 12px",borderRadius:10,fontWeight:800,fontSize:12} as const;
 return <header className="appHeader" style={{background:"#082b63",color:"#fff"}}><div className="appHeaderTitle"><small style={{color:"#76ec3f",fontWeight:900}}>{current.eyebrow}</small><strong style={{color:"#fff",display:"block"}}>{current.title}</strong></div><div className="appHeaderActions"><a style={actionStyle} href="/historia" aria-label="Ajuda e contexto institucional"><CircleHelp size={18}/><span>Contexto</span></a>{isAdmin&&<a style={actionStyle} href="/admin" aria-label="Abrir configurações administrativas"><Settings size={18}/><span>Configurações</span></a>}</div></header>;
}
