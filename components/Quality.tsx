"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import PageHero from "./PageHero";

type Data={
 ok:boolean;passed:number;total:number;
 checks:{name:string;ok:boolean;detail:string}[];
 infrastructure:{aiConfigured:boolean;supabaseConfigured:boolean;appUrlConfigured:boolean};
 generatedAt:string;
};

export default function Quality(){
 const [data,setData]=useState<Data|null>(null);
 const [loading,setLoading]=useState(false);
 async function load(){
  setLoading(true);
  try{const r=await fetch("/api/quality",{cache:"no-store"});setData(await r.json())}finally{setLoading(false)}
 }
 useEffect(()=>{void load()},[]);
 return <main className="workspace"><PageHero kicker="HOMOLOGAÇÃO • SAÚDE DA CENTRAL" title="Qualidade e prontidão de produção." description="Teste automático de sanidade dos motores comerciais e das configurações essenciais da Central." actions={<button className="heroActionButton" onClick={load}><RefreshCw size={15}/>{loading?"Testando...":"Executar testes"}</button>}/><section className="panel">
  {data&&<>
   <div className={`qualityHero ${data.ok?"ok":"fail"}`}><div>{data.ok?<CheckCircle2/>:<XCircle/>}</div><div><b>{data.passed}/{data.total} verificações aprovadas</b><p>{data.ok?"Motores financeiros responderam dentro dos critérios básicos.":"Há pelo menos uma verificação que precisa ser revisada."}</p></div></div>
   <div className="qualityInfra"><div><span>SUPABASE</span><b>{data.infrastructure.supabaseConfigured?"CONFIGURADO":"PENDENTE"}</b></div><div><span>OPENAI</span><b>{data.infrastructure.aiConfigured?"CONFIGURADA":"PENDENTE"}</b></div><div><span>APP URL</span><b>{data.infrastructure.appUrlConfigured?"CONFIGURADA":"PENDENTE"}</b></div></div>
   <div className="qualityList">{data.checks.map((x,i)=><div key={i} className={x.ok?"ok":"fail"}>{x.ok?<CheckCircle2 size={16}/>:<XCircle size={16}/>}<span>{x.name}</span><code>{x.detail}</code></div>)}</div>
   <p className="qualityNote">Esses testes são de sanidade técnica. Eles não substituem a homologação comercial das premissas, contratos, DREs e regras aprovadas pela Locagora.</p>
  </>}
 </section></main>
}
