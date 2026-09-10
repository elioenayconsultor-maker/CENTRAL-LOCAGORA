"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MessageCircle } from "lucide-react";
import LocInvestCalculator from "./LocInvestCalculator";
import EuroLocCalculator from "./EuroLocCalculator";
import LocMillionCalculator from "./LocMillionCalculator";
import FranquiaNacionalCalculator from "./FranquiaNacionalCalculator";
import FranquiaInternacionalCalculator from "./FranquiaInternacionalCalculator";
import MiniMasterCalculator from "./MiniMasterCalculator";
import MasterRegionalCalculator from "./MasterRegionalCalculator";
import LocInternacionalCalculator from "./LocInternacionalCalculator";
import PublicConversionForm from "./PublicConversionForm";
import type { Simulation } from "@/lib/types";
import { getPublicProduct } from "@/lib/public-products";
import { getCalculatorKeyForPublicSlug } from "@/lib/product-registry";

const money=(n:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(n||0);
export default function PublicModelSimulator({slug,embedded=false}:{slug:string;embedded?:boolean}){
 const [last,setLast]=useState<Simulation|null>(null);const [conversionOpen,setConversionOpen]=useState(false);const product=getPublicProduct(slug);
 const common={initialCapital:0,onBack:()=>{location.href=`/negocios/${slug}`},onSave:(s:Simulation)=>{setLast(s);setConversionOpen(true)},saveLabel:"Concluir simulação"};
 const calculatorKey=getCalculatorKeyForPublicSlug(slug);
 const calculator=calculatorKey==="locinvest"?<LocInvestCalculator {...common}/>:calculatorKey==="euroloc"?<EuroLocCalculator {...common}/>:calculatorKey==="locmillion"?<LocMillionCalculator {...common}/>:calculatorKey==="franquia-nacional"?<FranquiaNacionalCalculator {...common}/>:calculatorKey==="franquia-internacional"?<FranquiaInternacionalCalculator {...common}/>:calculatorKey==="mini-master"?<MiniMasterCalculator {...common}/>:calculatorKey==="master-regional"?<MasterRegionalCalculator {...common}/>:calculatorKey==="locinternacional"?<LocInternacionalCalculator {...common}/>:null;
 if(!product)return <main className="publicModelSimulator"><Link className="publicBack" href="/simulador"><ArrowLeft/> Voltar</Link><section className="publicPresentationUnavailable"><h2>Modelo não encontrado</h2><p>Retorne ao portfólio público para escolher um produto disponível.</p><Link className="ctaPrimary" href="/negocios">Ver portfólio</Link></section></main>;
 if(!calculator)return <main className="publicModelSimulator"><div className="publicSimulationTop">{embedded?<div><small>PRÓXIMO PASSO</small><b>{product.name}</b></div>:<><Link href={`/negocios/${slug}`}><ArrowLeft/> Voltar à apresentação</Link><div><small>PRÓXIMO PASSO</small><b>{product.name}</b></div></>}</div><section className="publicPersonalizedState"><div><small>SIMULAÇÃO ASSISTIDA</small><h1>Este modelo exige uma simulação personalizada.</h1><p>Em vez de uma mensagem sem saída, a jornada continua diretamente para o atendimento público. O time comercial recebe seu interesse e prepara o cenário conforme as condições aplicáveis.</p></div><PublicConversionForm productRoute={slug} productName={product.name} mode="personalized"/></section></main>;
 return <main className="publicModelSimulator"><div className="publicSimulationTop">{embedded?<div><small>SIMULAÇÃO DO MODELO</small><b>{product.name}</b></div>:<><Link href={`/negocios/${slug}`}><ArrowLeft/> Voltar à apresentação</Link><div><small>SIMULAÇÃO DO MODELO</small><b>{product.name}</b></div></>}</div>{calculator}{last&&<section className="publicSimulationDone"><CheckCircle2/><div><small>CENÁRIO CONCLUÍDO</small><b>{last.name}</b><span>{money(last.capital)} • {money(last.monthly)}/mês</span></div><button type="button" onClick={()=>setConversionOpen(v=>!v)}><MessageCircle/> {conversionOpen?"Ocultar formulário":"Falar com consultor"}</button></section>}{last&&conversionOpen&&<PublicConversionForm productRoute={slug} productName={product.name} simulation={last} mode="simulation"/>}</main>
}
