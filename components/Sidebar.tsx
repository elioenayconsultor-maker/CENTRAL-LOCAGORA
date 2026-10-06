"use client";
import Image from "next/image";
import CloudSyncStatus from "./CloudSyncStatus";
import { Activity, BarChart3, BookOpenText, ExternalLink, Gauge, Headphones, Home, Newspaper, Network, ShieldQuestion, Scale, UsersRound } from "lucide-react";
import type { CorporatePage } from "@/lib/corporate-access";

export default function Sidebar({page,onChange,allowedPages}:{page:CorporatePage;onChange:(p:CorporatePage)=>void;allowedPages:CorporatePage[]}) {
 const items = [
  ["home","Início",Home,"Sua intranet"],
  ["announcements","Comunicados",Newspaper,"Empresa e setores"],
  ["documents","Documentos",BookOpenText,"Biblioteca interna"],
  ["directory","Equipe",UsersRound,"Colaboradores"],
  ["news","LOCNEWS",Newspaper,"Mercado"],
  ["solutions","Investimentos & Franquias",BarChart3,"Portfólio"],
  ["network","Rede Locagora",Network,"Rede"],
  ["history","História",BookOpenText,"Apresentação"],
  ["benchmark","Benchmark",Gauge,"Inteligência"],
  ["capital","Comparador de Capital",Scale,"Oportunidades"],
  ["support","Apoio Comercial",ShieldQuestion,"Argumentação"],
  ["quality","Homologação",Activity,"Qualidade"]
 ] as const;
 const visible=items.filter(([id])=>allowedPages.includes(id));
 const systems=[
  {label:"Chamados LOC",hint:"Suporte e TI",href:"https://chamados-ti.locgrupo.com.br/#",Icon:Headphones},
  {label:"QuarkRH",hint:"Portal do colaborador",href:"https://rh-colaborador.quark.tec.br/",Icon:UsersRound}
 ] as const;
 return <aside className="sidebar">
   <div className="brand brandOfficial"><div className="brandLogoRow"><Image src="/locagora-logo.png" alt="Locagora - Assinatura de Motos" width={190} height={72} priority className="sidebarLogo"/><span className="versionBadge">V9.0</span></div><small>INTRANET LOCAGORA</small></div>
   <div className="sidebarNavLabel">CENTRAL</div>
   <nav>{visible.map(([id,label,Icon,hint])=>
     <button key={id} className={`${page===id?"active":""} ${id==="news"?"newsNav":""} ${id==="history"?"historyNav":""}`} onClick={()=>onChange(id)} type="button" title={label}>
       <span className="sidebarIcon"><Icon size={19}/></span><span className="sidebarItemText"><b>{label}</b><small>{hint}</small></span>
     </button>)}
   </nav>
   <div className="sidebarNavLabel" style={{marginTop:18}}>SISTEMAS LOCAGORA</div>
   <nav>{systems.map(({label,hint,href,Icon})=><a key={label} href={href} target="_blank" rel="noreferrer" title={label} style={{display:"flex",gap:11,alignItems:"center",padding:"13px 14px",borderRadius:12,color:"#b9c8e5",textDecoration:"none",fontWeight:750,background:"rgba(255,255,255,.035)",border:"1px solid rgba(255,255,255,.06)",marginBottom:7}}><span className="sidebarIcon"><Icon size={19}/></span><span className="sidebarItemText" style={{display:"flex",flexDirection:"column",gap:2,flex:1}}><b>{label}</b><small style={{fontSize:9,color:"#8fa4cb"}}>{hint}</small></span><ExternalLink size={13}/></a>)}</nav>
 <CloudSyncStatus/></aside>
}
