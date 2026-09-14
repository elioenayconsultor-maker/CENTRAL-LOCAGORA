"use client";
import { BookOpenText, Building2, Ellipsis, Newspaper, X, Gauge, ShieldQuestion, Activity, Network, Settings, Scale, Headphones, UsersRound, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
type Page="news"|"solutions"|"network"|"history"|"benchmark"|"capital"|"support"|"quality";
export default function MobileNav({page,onChange}:{page:Page;onChange:(p:Page)=>void}){
  const [more,setMore]=useState(false);
  const supabase=useMemo(()=>createClient(),[]);
  const [isAdmin,setIsAdmin]=useState(false);
  useEffect(()=>{let alive=true;(async()=>{const {data,error}=await supabase.rpc("is_commercial_admin");if(alive)setIsAdmin(!error&&Boolean(data));})();return()=>{alive=false}},[supabase]);
  const go=(p:Page)=>{setMore(false);onChange(p)};
  return <><nav className="mobileBottomNav">
    <button className={page==="solutions"?"active":""} onClick={()=>go("solutions")}><Building2/><span>Negócios</span></button>
    <button className={page==="history"?"active":""} onClick={()=>go("history")}><BookOpenText/><span>História</span></button>
    <button className={page==="network"?"active":""} onClick={()=>go("network")}><Network/><span>Rede</span></button>
    <button className={page==="capital"?"active":""} onClick={()=>go("capital")}><Scale/><span>Comparador</span></button>
    <button onClick={()=>setMore(true)}><Ellipsis/><span>Mais</span></button>
  </nav>{more&&<div className="mobileMoreBackdrop" onClick={()=>setMore(false)}><div className="mobileMoreSheet" onClick={e=>e.stopPropagation()}><header><b>Mais ferramentas</b><button onClick={()=>setMore(false)}><X/></button></header><button onClick={()=>go("news")}><Newspaper/> LOCNEWS</button><button onClick={()=>go("benchmark")}><Gauge/> Benchmark</button><button onClick={()=>go("support")}><ShieldQuestion/> Apoio Comercial</button><button onClick={()=>go("quality")}><Activity/> Homologação</button><a href="https://chamados-ti.locgrupo.com.br/#" target="_blank" rel="noreferrer" onClick={()=>setMore(false)}><Headphones/> Chamados LOC <ExternalLink size={14}/></a><a href="https://rh-colaborador.quark.tec.br/" target="_blank" rel="noreferrer" onClick={()=>setMore(false)}><UsersRound/> QuarkRH <ExternalLink size={14}/></a>{isAdmin&&<a className="mobileMoreAdmin" href="/admin"><Settings/> Administração</a>}</div></div>}</>;
}
