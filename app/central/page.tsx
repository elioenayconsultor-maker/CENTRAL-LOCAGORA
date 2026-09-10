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
const News = dynamic(()=>import("@/components/News"),{loading:load});
const NetworkPage = dynamic(()=>import("@/components/NetworkPage"),{loading:load});
const Solutions = dynamic(()=>import("@/components/Solutions"),{loading:load});
const Support = dynamic(()=>import("@/components/Support"),{loading:load});
const History = dynamic(()=>import("@/components/History"),{loading:load});
const Benchmark = dynamic(()=>import("@/components/Benchmark"),{loading:load});
const CapitalOpportunityComparator = dynamic(()=>import("@/components/CapitalOpportunityComparator"),{loading:load});
const Quality = dynamic(()=>import("@/components/Quality"),{loading:load});

type Page = "news"|"solutions"|"network"|"history"|"benchmark"|"capital"|"support"|"quality";

export default function Home(){
 const [page,setPage]=useState<Page>("solutions");
 return <AuthGate><CommercialConfigGate><div className="appShell"><MobileCorporateHeader/><Sidebar page={page} onChange={setPage}/><div className="content"><AppHeader page={page}/>
   {page==="news"&&<News/>}
   {page==="solutions"&&<Solutions/>}
   {page==="network"&&<NetworkPage/>}
   {page==="history"&&<History/>}
   {page==="benchmark"&&<Benchmark/>}
   {page==="capital"&&<CapitalOpportunityComparator/>}
   {page==="support"&&<Support/>}
   {page==="quality"&&<Quality/>}
 </div><MobileNav page={page} onChange={setPage}/></div></CommercialConfigGate></AuthGate>
}
