"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import AuthGate from "@/components/AuthGate";
import CommercialConfigGate from "@/components/CommercialConfigGate";
import MobileNav from "@/components/MobileNav";
import MobileCorporateHeader from "@/components/MobileCorporateHeader";
import AppHeader from "@/components/AppHeader";
import ModuleSkeleton from "@/components/ModuleSkeleton";
import CorporateHome from "@/components/CorporateHome";
import { createClient } from "@/lib/supabase/client";
import { allowedCorporatePages, type CorporatePage } from "@/lib/corporate-access";

const IntranetModule = dynamic(()=>import("@/components/IntranetModule"),{loading:()=> <ModuleSkeleton/>});
const load = () => <ModuleSkeleton/>;
const News = dynamic(()=>import("@/components/News"),{loading:load});
const NetworkPage = dynamic(()=>import("@/components/NetworkPage"),{loading:load});
const Solutions = dynamic(()=>import("@/components/Solutions"),{loading:load});
const Support = dynamic(()=>import("@/components/Support"),{loading:load});
const History = dynamic(()=>import("@/components/History"),{loading:load});
const Benchmark = dynamic(()=>import("@/components/Benchmark"),{loading:load});
const CapitalOpportunityComparator = dynamic(()=>import("@/components/CapitalOpportunityComparator"),{loading:load});
const Quality = dynamic(()=>import("@/components/Quality"),{loading:load});

type AppUser={id:string;name:string|null;email:string|null;role:string|null;department:string|null;job_title:string|null;access_profile:string|null;module_permissions:string[]|null};

export default function Home(){return <AuthGate><CorporateWorkspace/></AuthGate>}
function CorporateWorkspace(){
 const supabase=useMemo(()=>createClient(),[]);
 const [requestedPage,setPage]=useState<CorporatePage>("home");
 const [appUser,setAppUser]=useState<AppUser|null>(null);
 useEffect(()=>{let alive=true;(async()=>{const {data:{user}}=await supabase.auth.getUser();if(!user)return;const {data}=await supabase.from("users").select("id,name,email,role,department,job_title,access_profile,module_permissions").eq("auth_user_id",user.id).maybeSingle();if(alive&&data)setAppUser(data as AppUser);})();return()=>{alive=false}},[supabase]);
 const allowed=useMemo(()=>allowedCorporatePages(appUser),[appUser]);
 const page=allowed.includes(requestedPage)?requestedPage:"home";
 const go=(next:CorporatePage)=>setPage(allowed.includes(next)?next:"home");
 return <div className="appShell"><MobileCorporateHeader/><Sidebar page={page} onChange={go} allowedPages={allowed}/><div className="content"><AppHeader page={page}/>
   {page==="home"&&<CorporateHome user={appUser} onOpen={go}/>} 
   {(page==="announcements"||page==="documents"||page==="directory")&&<IntranetModule key={page} section={page}/>}
   {page==="news"&&<CommercialConfigGate><News/></CommercialConfigGate>}
   {page==="solutions"&&<CommercialConfigGate><Solutions/></CommercialConfigGate>}
   {page==="network"&&<CommercialConfigGate><NetworkPage/></CommercialConfigGate>}
   {page==="history"&&<CommercialConfigGate><History/></CommercialConfigGate>}
   {page==="benchmark"&&<CommercialConfigGate><Benchmark/></CommercialConfigGate>}
   {page==="capital"&&<CommercialConfigGate><CapitalOpportunityComparator/></CommercialConfigGate>}
   {page==="support"&&<CommercialConfigGate><Support/></CommercialConfigGate>}
   {page==="quality"&&<CommercialConfigGate><Quality/></CommercialConfigGate>}
 </div><MobileNav page={page} onChange={go} allowedPages={allowed}/></div>
}
