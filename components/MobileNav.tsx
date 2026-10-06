"use client";
import { BookOpenText, Building2, Ellipsis, Newspaper, X, Gauge, ShieldQuestion, Activity, Network, Settings, Scale, Headphones, UsersRound, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MODULE_LABELS, type CorporatePage } from "@/lib/corporate-access";
import { Home } from "lucide-react";
export default function MobileNav({page,onChange,allowedPages}:{page:CorporatePage;onChange:(p:CorporatePage)=>void;allowedPages?:CorporatePage[]}){
  const [more,setMore]=useState(false);
  const supabase=useMemo(()=>createClient(),[]);
  const [isAdmin,setIsAdmin]=useState(false);
  useEffect(()=>{let alive=true;(async()=>{const {data,error}=await supabase.rpc("is_commercial_admin");if(alive)setIsAdmin(!error&&Boolean(data));})();return()=>{alive=false}},[supabase]);
  const go=(p:CorporatePage)=>{setMore(false);onChange(p)};
  if(allowedPages)return <><nav className="mobileBottomNav"><button className={page==="home"?"active":""} onClick={()=>go("home")}><Home/><span>Início</span></button>{(["announcements","documents","directory"] as const).filter(p=>allowedPages.includes(p)).map(p=><button key={p} className={page===p?"active":""} onClick={()=>go(p)}>{p==="directory"?<UsersRound/>:p==="documents"?<BookOpenText/>:<Newspaper/>}<span>{MODULE_LABELS[p]}</span></button>)}<button aria-expanded={more} onClick={()=>setMore(!more)}><Ellipsis/><span>Mais</span></button></nav>{more&&<div className="mobileMoreBackdrop" onClick={()=>setMore(false)}><div className="mobileMoreSheet" onClick={e=>e.stopPropagation()}><header><b>Ferramentas</b><button aria-label="Fechar menu" onClick={()=>setMore(false)}><X/></button></header>{allowedPages.filter(p=>p!=="home").map(p=><button key={p} onClick={()=>go(p)}>{MODULE_LABELS[p as Exclude<CorporatePage,"home">]}</button>)}{isAdmin&&<a href="/admin">Administração</a>}</div></div>}</>;
  return <><nav className="mobileBottomNav">
    <button className={page==="solutions"?"active":""} onClick={()=>go("solutions")}><Building2/><span>Negócios</span></button>
    <button className={page==="history"?"active":""} onClick={()=>go("history")}><BookOpenText/><span>História</span></button>
    <button className={page==="network"?"active":""} onClick={()=>go("network")}><Network/><span>Rede</span></button>
    <button className={page==="capital"?"active":""} onClick={()=>go("capital")}><Scale/><span>Comparador</span></button>
    <button onClick={()=>setMore(true)}><Ellipsis/><span>Mais</span></button>
  </nav>{more&&<div className="mobileMoreBackdrop" onClick={()=>setMore(false)}><div className="mobileMoreSheet" onClick={e=>e.stopPropagation()}><header><b>Mais ferramentas</b><button onClick={()=>setMore(false)}><X/></button></header><button onClick={()=>go("news")}><Newspaper/> LOCNEWS</button><button onClick={()=>go("benchmark")}><Gauge/> Benchmark</button><button onClick={()=>go("support")}><ShieldQuestion/> Apoio Comercial</button><button onClick={()=>go("quality")}><Activity/> Homologação</button><a href="https://chamados-ti.locgrupo.com.br/#" target="_blank" rel="noreferrer" onClick={()=>setMore(false)}><Headphones/> Chamados LOC <ExternalLink size={14}/></a><a href="https://rh-colaborador.quark.tec.br/" target="_blank" rel="noreferrer" onClick={()=>setMore(false)}><UsersRound/> QuarkRH <ExternalLink size={14}/></a>{isAdmin&&<a className="mobileMoreAdmin" href="/admin"><Settings/> Administração</a>}</div></div>}</>;
}
