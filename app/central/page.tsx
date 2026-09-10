"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import AuthGate from "@/components/AuthGate";
import CommercialConfigGate from "@/components/CommercialConfigGate";
import MobileNav from "@/components/MobileNav";
import MobileCorporateHeader from "@/components/MobileCorporateHeader";
import AppHeader from "@/components/AppHeader";
import ModuleSkeleton from "@/components/ModuleSkeleton";

const load = () => <ModuleSkeleton/>;
const Journey = dynamic(()=>import("@/components/Journey"),{loading:load});
const News = dynamic(()=>import("@/components/News"),{loading:load});
const NetworkPage = dynamic(()=>import("@/components/NetworkPage"),{loading:load});
const Solutions = dynamic(()=>import("@/components/Solutions"),{loading:load});
const Support = dynamic(()=>import("@/components/Support"),{loading:load});
const History = dynamic(()=>import("@/components/History"),{loading:load});
const Benchmark = dynamic(()=>import("@/components/Benchmark"),{loading:load});
const CapitalOpportunityComparator = dynamic(()=>import("@/components/CapitalOpportunityComparator"),{loading:load});
const Quality = dynamic(()=>import("@/components/Quality"),{loading:load});

type Page = "news"|"journey"|"solutions"|"network"|"history"|"benchmark"|"capital"|"support"|"quality";

export default function Home(){
 const [page,setPage]=useState<Page>("journey");
 const [pendingPage,setPendingPage]=useState<Page|null>(null);
 const requestPage=(next:Page)=>{
   if(page==="journey"&&next!=="journey"){
     try{const raw=localStorage.getItem("locagora_commercial_state_v2");const current=raw?JSON.parse(raw):null;if(current?.step==="proposal"){setPendingPage(next);return;}}catch{}
   }
   setPage(next);
 };
 const newProposalAndLeave=()=>{
   try{
     const raw=localStorage.getItem("locagora_commercial_state_v2");const current=raw?JSON.parse(raw):{};const old=current?.proposal||{};
     const fresh={version:2,step:"client",client:{name:"",phone:"",capital:0,goal:"Renda mensal",income:"Renda variável",priority:"Rentabilidade",notes:""},selectedProductRoute:"",activeSimulationId:null,simulations:[],proposal:{title:"Proposta Locagora",date:new Date().toISOString().slice(0,10),validityDays:7,orientation:"landscape",extraInfo:"",consultant:old.consultant||"",consultantPhone:old.consultantPhone||"",consultantPhoto:old.consultantPhoto||""}};
     localStorage.setItem("locagora_commercial_state_v2",JSON.stringify(fresh));localStorage.removeItem("locagora_commercial_session_id");
   }catch{}
   const target=pendingPage||"journey";setPendingPage(null);setPage(target);
 };
 return <AuthGate><CommercialConfigGate><div className="appShell"><MobileCorporateHeader/><Sidebar page={page} onChange={requestPage}/><div className="content"><AppHeader page={page}/>
   {page==="news"&&<News/>}
   {page==="journey"&&<Journey/>}
   {page==="solutions"&&<Solutions onJourney={()=>setPage("journey")}/>}
   {page==="network"&&<NetworkPage/>}
   {page==="history"&&<History/>}
   {page==="benchmark"&&<Benchmark/>}
   {page==="capital"&&<CapitalOpportunityComparator/>}
   {page==="support"&&<Support/>}
   {page==="quality"&&<Quality/>}
 </div>{pendingPage&&<div className="journeyDecisionBackdrop"><div className="journeyDecision"><small>PROPOSTA EM ANDAMENTO</small><h3>Deseja sair desta proposta?</h3><p>Escolha continuar na proposta atual ou iniciar um novo atendimento. Nova proposta limpa o cliente e volta a Jornada para o passo 01 quando você retornar.</p><div className="actions"><button className="secondary" onClick={()=>setPendingPage(null)}>Continuar nesta proposta</button><button className="primary" onClick={newProposalAndLeave}>Nova proposta e sair</button></div></div></div>}<MobileNav page={page} onChange={requestPage}/></div></CommercialConfigGate></AuthGate>
}
