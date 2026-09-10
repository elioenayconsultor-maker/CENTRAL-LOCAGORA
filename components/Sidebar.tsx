"use client";
import Image from "next/image";
import CloudSyncStatus from "./CloudSyncStatus";
import { Activity, BarChart3, BookOpenText, Gauge, Newspaper, Network, ShieldQuestion, Scale } from "lucide-react";

type Page = "news"|"solutions"|"network"|"history"|"benchmark"|"capital"|"support"|"quality";
export default function Sidebar({page,onChange}:{page:Page,onChange:(p:Page)=>void}) {
 const items = [
  ["news","LOCNEWS",Newspaper,"Mercado"],
  ["solutions","Investimentos & Franquias",BarChart3,"Portfólio"],
  ["network","Rede Locagora",Network,"Rede"],
  ["history","História",BookOpenText,"Apresentação"],
  ["benchmark","Benchmark",Gauge,"Inteligência"],
  ["capital","Comparador de Capital",Scale,"Oportunidades"],
  ["support","Apoio Comercial",ShieldQuestion,"Argumentação"],
  ["quality","Homologação",Activity,"Qualidade"]
 ] as const;
 return <aside className="sidebar">
   <div className="brand brandOfficial"><div className="brandLogoRow"><Image src="/locagora-logo.png" alt="Locagora - Assinatura de Motos" width={190} height={72} priority className="sidebarLogo"/><span className="versionBadge">V9.0</span></div><small>CENTRAL COMERCIAL</small></div>
   <div className="sidebarNavLabel">CENTRAL</div>
   <nav>{items.map(([id,label,Icon,hint])=>
     <button key={id} className={`${page===id?"active":""} ${id==="news"?"newsNav":""} ${id==="history"?"historyNav":""}`} onClick={()=>onChange(id)} type="button" title={label}>
       <span className="sidebarIcon"><Icon size={19}/></span><span className="sidebarItemText"><b>{label}</b><small>{hint}</small></span>
     </button>)}
   </nav>
 <CloudSyncStatus/></aside>
}
