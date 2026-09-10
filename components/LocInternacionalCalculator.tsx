"use client";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Globe2 } from "lucide-react";
import { calculateLocInternacional, locInternacionalBaseRate, locInternacionalEligible } from "@/lib/locinternacional";
import type { Simulation } from "@/lib/types";

const money=(n:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(n)||0);
const pct=(n:number)=>`${(Number(n)||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}%`;

export default function LocInternacionalCalculator({
  initialCapital,onBack,onSave,saveLabel
}:{
  initialCapital:number;
  onBack:()=>void;
  onSave:(simulation:Simulation)=>void;
  saveLabel?:string;
}){
 const [capital,setCapital]=useState(Math.max(100000,initialCapital||100000));
 const [rate,setRate]=useState(locInternacionalBaseRate(Math.max(100000,initialCapital||100000)));
 const result=useMemo(()=>calculateLocInternacional(capital,rate),[capital,rate]);
 const eligible=locInternacionalEligible(capital);

 const onCapital=(value:number)=>{
   const c=Number(value)||0;
   setCapital(c);
   const base=locInternacionalBaseRate(c);
   if(base && rate<base)setRate(base);
 };

 const save=()=>{
   if(!eligible)return;
   onSave({
     id:Date.now(),
     name:`Cotas LocInternacional — ${money(result.capital)} • ${pct(result.appliedRate)} a.m.`,
     sourceRoute:"locinternacional",
     capital:result.capital,
     monthly:result.monthly,
     annual:result.annual,
     details:{
       qty:1,
       model:"Participação LocInternacional",
       assets:result.capital,
       unitValue:result.capital,
       plan:`Rentabilidade ${pct(result.appliedRate)} a.m.`,
       roiAnnual:result.appliedRate*12,
       cycle:"13 meses",
       country:"Internacional",
       notes:[
         "Aporte mínimo de R$ 100.000.",
         "Rentabilidade-base de 1,5% a.m. em R$ 100 mil.",
         "Rentabilidade-base de 2,0% a.m. a partir de R$ 200 mil.",
         "O consultor pode elevar a taxa acima da base comercial."
       ]
     },
     updatedAt:new Date().toISOString()
   });
 };

 return <div className="locinternationalModule">
   <section className="calculatorHero intlHero">
     <div><small>LOCAGORA • LOCINTERNACIONAL</small><h2>Capital internacional com rentabilidade configurável.</h2><p>Aporte direto, sem limite máximo de R$ 200 mil, com taxa-base progressiva e possibilidade de condição comercial superior.</p></div>
     <div className="miniMetrics"><div><span>Mínimo</span><b>R$ 100 mil</b></div><div><span>Base</span><b>1,5%–2,0% a.m.</b></div><div><span>Ciclo</span><b>13 meses</b></div></div>
   </section>

   <div className="calcLayout">
    <section className="panel">
      <div className="sectionHead"><small>APORTE</small><h2>Defina o capital</h2></div>
      <div className="formGrid">
        <label>Capital disponível<input type="number" min={100000} step={10000} value={capital||""} onChange={e=>onCapital(Number(e.target.value))}/></label>
        <label>Rentabilidade aplicada (% a.m.)<input type="number" min={result.baseRate} step=".1" value={rate} onChange={e=>setRate(Math.max(result.baseRate,Number(e.target.value)||0))}/></label>
      </div>
      <div className="quickValues">{[100000,150000,200000,300000,500000].map(v=><button className="secondary" key={v} onClick={()=>onCapital(v)}>{money(v).replace(",00","")}</button>)}</div>
      {!eligible?<div className="statusWarn"><b>Aporte mínimo não atingido.</b> Informe pelo menos R$ 100.000.</div>:<div className="statusOk"><b>Base comercial atual:</b> {pct(result.baseRate)} ao mês. A taxa aplicada nunca fica abaixo da base prevista para o capital.</div>}
    </section>

    <section className="panel resultPanel">
      <div className="sectionHead"><small>RESULTADO</small><h2>Cenário LocInternacional</h2></div>
      <div className="resultGrid">
        <div className="highlight"><span>Renda mensal</span><b>{money(result.monthly)}</b><small>{pct(result.appliedRate)} a.m.</small></div>
        <div><span>Renda anual simples</span><b>{money(result.annual)}</b><small>12 meses</small></div>
        <div><span>Capital</span><b>{money(result.capital)}</b><small>Aporte considerado</small></div>
        <div><span>13 meses</span><b>{money(result.months13)}</b><small>Renda acumulada</small></div>
        <div><span>ROI em 13 meses</span><b>{pct(result.roi13)}</b><small>sobre o aporte</small></div>
        <div><span>Taxa-base</span><b>{pct(result.baseRate)}</b><small>mínimo comercial</small></div>
      </div>
    </section>
   </div>

   <section className="panel">
     <div className="sectionHead"><small>REGRA COMERCIAL</small><h2>Faixas de rentabilidade</h2></div>
     <div className="tierGrid">
       <article><small>R$ 100 MIL</small><h3>1,5% a.m.</h3><p>Faixa-base de entrada.</p></article>
       <article><small>ENTRE R$ 100 MIL E R$ 199.999</small><h3>1,5% a.m.</h3><p>A taxa permanece na faixa inicial.</p></article>
       <article><small>A PARTIR DE R$ 200 MIL</small><h3>2,0% a.m.</h3><p>Nova base mínima comercial.</p></article>
       <article className="accent"><small>CONDIÇÃO NEGOCIADA</small><h3>Acima da base</h3><p>O consultor pode elevar a rentabilidade conforme condição aprovada.</p></article>
     </div>
   </section>

   <section className="panel">
     <div className="sectionHead"><small>POSICIONAMENTO</small><h2>Estrutura internacional</h2></div>
     <div className="summaryGrid"><div><span>Modelo</span><b>Participação internacional</b></div><div><span>Aporte mínimo</span><b>R$ 100.000</b></div><div><span>Teto</span><b>Sem limite de R$ 200 mil</b></div><div><span>Rentabilidade</span><b>Progressiva</b></div></div>
     <div className="assetFeature"><div className="assetIcon"><Globe2/></div><div><small>LOCAGORA INTERNACIONAL</small><h3>Capital conectado à expansão internacional</h3><p>A proposta final recebe automaticamente capital, taxa e renda mensal desta simulação.</p></div></div>
   </section>

   <section className="nextBar">
     <button className="secondary" onClick={onBack}><ArrowLeft size={16}/> Voltar às soluções</button>
     <div><small>SIMULAÇÃO PRONTA</small><b>{money(result.capital)} • {money(result.monthly)}/mês</b></div>
     <button className="primary" disabled={!eligible} onClick={save}><CheckCircle2 size={17}/> {saveLabel||"Adicionar à projeção"} <ArrowRight size={16}/></button>
   </section>
 </div>
}
