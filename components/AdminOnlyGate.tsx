"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ShieldX } from "lucide-react";

export default function AdminOnlyGate({children}:{children:React.ReactNode}){
  const supabase=useMemo(()=>createClient(),[]);
  const [state,setState]=useState<"checking"|"allowed"|"denied">("checking");
  useEffect(()=>{let alive=true;(async()=>{
    const {data,error}=await supabase.rpc("is_commercial_admin");
    if(alive)setState(!error&&Boolean(data)?"allowed":"denied");
  })();return()=>{alive=false}},[supabase]);
  if(state==="checking")return <div className="adminLoading">Validando permissão administrativa...</div>;
  if(state==="denied")return <main className="adminScreen"><section className="adminCard"><ShieldX/><h1>Acesso restrito</h1><p>CRM, Analytics e Configurações são exclusivos para administradores autorizados.</p><Link href="/central">Voltar à Central Comercial</Link></section></main>;
  return <>{children}</>;
}
