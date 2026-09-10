"use client";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, MessageCircle, ShieldCheck } from "lucide-react";
import type { Simulation } from "@/lib/types";
import { canonicalProductMetadata } from "@/lib/product-registry";

const CONSULTANT_WHATSAPP="5531983964474";
const emailOk=(v:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const money=(n:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(n||0);

function whatsappUrl(params:{name:string;email:string;phone:string;productName:string;productRoute:string;simulation?:Simulation|null}){
 const identity=canonicalProductMetadata(params.productRoute);
 const lines=[
  "Olá! Acabei de concluir uma simulação na Central LOC e gostaria de falar com um consultor.",
  "",
  `Nome: ${params.name}`,
  `E-mail: ${params.email}`,
  `Telefone: ${params.phone}`,
  `Produto: ${params.productName}`,
  `Código do produto: ${identity?.crmCode||params.productRoute}`,
  ...(identity?[`ID do produto: ${identity.id}`]:[]),
 ];
 if(params.simulation){
  lines.push(
   `Cenário: ${params.simulation.name}`,
   `Capital: ${money(params.simulation.capital)}`,
   `Estimativa mensal: ${money(params.simulation.monthly)}/mês`
  );
 }
 lines.push("", "Meu cadastro já foi registrado no CRM da Central LOC.");
 return `https://wa.me/${CONSULTANT_WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export default function PublicConversionForm({productRoute,productName,simulation,mode="simulation"}:{productRoute:string;productName:string;simulation?:Simulation|null;mode?:"simulation"|"personalized"}){
 const [lead,setLead]=useState({name:"",email:"",phone:"",consent:false,website:""});
 const [sending,setSending]=useState(false);
 const [sent,setSent]=useState(false);
 const [error,setError]=useState("");

 const productIdentity=canonicalProductMetadata(productRoute);

 async function submit(e:React.FormEvent){
  e.preventDefault();
  setError("");
  if(lead.name.trim().length<2)return setError("Informe seu nome para continuar.");
  if(!emailOk(lead.email))return setError("Informe um e-mail válido.");
  if(lead.phone.replace(/\D/g,"").length<10)return setError("Informe telefone/WhatsApp com DDD.");
  if(!lead.consent)return setError("Autorize o contato para concluir.");
  setSending(true);
  try{
   const r=await fetch("/api/public-interest",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
     lead,
     product:{route:productRoute,name:productName,canonicalId:productIdentity?.id||null,crmCode:productIdentity?.crmCode||null,internalRoute:productIdentity?.internalRoute||null},
     simulation:simulation?{
      name:simulation.name,
      capital:simulation.capital,
      monthly:simulation.monthly,
      annual:simulation.annual||0,
      details:simulation.details||{},
      sourceRoute:simulation.sourceRoute
     }:null,
     mode
    })
   });
   const d=await r.json().catch(()=>({}));
   if(!r.ok)throw new Error(d.reason||"capture_failed");
   setSent(true);
   const url=whatsappUrl({
    name:lead.name.trim(),
    email:lead.email.trim(),
    phone:lead.phone.trim(),
    productName,
    productRoute,
    simulation
   });
   window.location.href=url;
  }catch{
   setError("Não foi possível registrar seu interesse agora. Tente novamente.");
  }finally{
   setSending(false);
  }
 }

 if(sent)return <section className="publicConversionSuccess"><CheckCircle2/><div><small>LEAD REGISTRADO</small><h3>Recebemos seu interesse em {productName}.</h3><p>Seu cadastro foi salvo no CRM da Central LOC. O atendimento continua pelo WhatsApp do consultor.</p><a className="ctaPrimary" href={whatsappUrl({name:lead.name,email:lead.email,phone:lead.phone,productName,productRoute,simulation})}><MessageCircle/> Abrir WhatsApp do consultor</a></div></section>;

 return <section className="publicConversion"><div className="publicConversionCopy"><small>{mode==="personalized"?"SIMULAÇÃO PERSONALIZADA":"CONCLUIR • CONVERSÃO PÚBLICA"}</small><h2>{mode==="personalized"?"Solicite uma simulação com o time Locagora.":"Conclua sua simulação sem sair da área pública."}</h2><p>{mode==="personalized"?"Este produto exige parametrização comercial específica. Deixe seus dados para que a equipe prepare o cenário adequado.":"Seu cenário já está pronto. Preencha os dados abaixo para registrá-lo no CRM e continuar o atendimento pelo WhatsApp."}</p>{simulation&&<div className="publicConversionScenario"><span>{simulation.name}</span><b>{money(simulation.capital)}</b><small>{money(simulation.monthly)}/mês</small></div>}<div className="publicPrivacy"><ShieldCheck/><span>Seus dados são usados para este atendimento comercial. A área corporativa continua separada e não é necessária para clientes.</span></div></div><form onSubmit={submit} className="publicConversionForm"><label>Nome<input value={lead.name} onChange={e=>setLead({...lead,name:e.target.value})} required minLength={2}/></label><label>E-mail<input type="email" value={lead.email} onChange={e=>setLead({...lead,email:e.target.value})} required/></label><label>Telefone / WhatsApp<input value={lead.phone} onChange={e=>setLead({...lead,phone:e.target.value})} required minLength={10} placeholder="(00) 00000-0000"/></label><input tabIndex={-1} autoComplete="off" aria-hidden="true" style={{position:"absolute",left:"-9999px"}} value={lead.website} onChange={e=>setLead({...lead,website:e.target.value})}/><label className="simConsent"><input type="checkbox" checked={lead.consent} onChange={e=>setLead({...lead,consent:e.target.checked})} required/><span>Autorizo o contato da equipe Locagora sobre este produto e oportunidades relacionadas.</span></label><button className="ctaPrimary" disabled={sending}>{sending?<><Loader2 className="spin"/> Registrando…</>:<><MessageCircle/> {mode==="personalized"?"Registrar e falar no WhatsApp":"Concluir e falar com consultor"} <ArrowRight/></>}</button>{error&&<p className="simInlineError">{error}</p>}</form></section>;
}
