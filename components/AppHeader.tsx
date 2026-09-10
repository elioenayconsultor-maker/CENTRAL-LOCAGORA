"use client";
import { CircleHelp, Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Page = "news"|"solutions"|"network"|"history"|"benchmark"|"capital"|"support"|"quality";
const labels:Record<Page,{eyebrow:string;title:string}>={
  news:{eyebrow:"Inteligência comercial",title:"LOCNEWS"},
  solutions:{eyebrow:"Portfólio",title:"Investimentos & Franquias"},
  network:{eyebrow:"Expansão",title:"Rede Locagora"},
  history:{eyebrow:"Institucional",title:"História"},
  benchmark:{eyebrow:"Inteligência",title:"Benchmark"},
  capital:{eyebrow:"Inteligência financeira",title:"Comparador de Oportunidades de Capital"},
  support:{eyebrow:"Vendas",title:"Apoio Comercial"},
  quality:{eyebrow:"Governança",title:"Homologação"}
};
export default function AppHeader({page}:{page:Page}){
 const current=labels[page];
 const supabase=useMemo(()=>createClient(),[]);
 const [isAdmin,setIsAdmin]=useState(false);
 useEffect(()=>{let alive=true;(async()=>{const {data,error}=await supabase.rpc("is_commercial_admin");if(alive)setIsAdmin(!error&&Boolean(data));})();return()=>{alive=false}},[supabase]);
 return <header className="appHeader">
   <div className="appHeaderTitle"><small>{current.eyebrow}</small><strong>{current.title}</strong></div>
   <div className="appHeaderActions"><a href="/historia" aria-label="Ajuda e contexto institucional"><CircleHelp size={18}/><span>Contexto</span></a>{isAdmin&&<a href="/admin" aria-label="Abrir configurações administrativas"><Settings size={18}/><span>Configurações</span></a>}</div>
 </header>;
}
