"use client";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Globe2 } from "lucide-react";
import {
  INTERNATIONAL_FRANCHISE, calculateInternationalDre, calculateInternationalInvestment,
  type InternationalFee
} from "@/lib/franquia-internacional";
import type { Simulation } from "@/lib/types";

const money=(n:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(n)||0);
const eur=(n:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"EUR"}).format(Number(n)||0);
const pct=(n:number)=>`${(Number(n)||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}%`;

export default function FranquiaInternacionalCalculator({
  initialCapital,onBack,onSave,saveLabel
}:{
  initialCapital:number;
  onBack:()=>void;
  onSave:(simulation:Simulation)=>void;
  saveLabel?:string;
}){
 const [fee,setFee]=useState<number>(INTERNATIONAL_FRANCHISE.feeOptions[0]);
 const [qty,setQty]=useState(10);
 const [fx,setFx]=useState(6.20);
 const [brazilQty,setBrazilQty]=useState(10);
 const [europeQty,setEuropeQty]=useState(10);
 const [brazilBikeValue,setBrazilBikeValue]=useState(16990);
 const [europeBikeValue,setEuropeBikeValue]=useState(24999);
 const [working,setWorking]=useState(600);
 const [intermediation,setIntermediation]=useState(0);
 const [brazilModel,setBrazilModel]=useState(INTERNATIONAL_FRANCHISE.brazilModels[0]);
 const [europeModel,setEuropeModel]=useState(INTERNATIONAL_FRANCHISE.europeModels[0]);

 const dre=useMemo(()=>calculateInternationalDre(qty,fx),[qty,fx]);
 const investment=useMemo(()=>calculateInternationalInvestment(fee,brazilQty,europeQty,brazilBikeValue,europeBikeValue,working,intermediation),[fee,brazilQty,europeQty,brazilBikeValue,europeBikeValue,working,intermediation]);
 const capitalFit=initialCapital<=0||investment.total<=initialCapital;

 const save=()=>{
   onSave({
     id:Date.now(),
     name:`Franquia Internacional 2 em 1 — ${qty} motos Europa`,
     sourceRoute:"franq-i",
     capital:investment.total,
     monthly:dre.netBrl,
     annual:dre.netBrl*12,
     details:{
       qty:brazilQty+europeQty,
       model:`Brasil: ${brazilModel} • Europa: ${europeModel}`,
       assets:investment.brazilAssets+investment.europeAssets,
       franchiseFee:fee,
       workingCapital:investment.working,
       intermediation:investment.intermediation,
       intermediationPerBike:intermediation,
       internationalQty:qty,
       revenueEur:dre.revenueEur,
       expenseEur:dre.expenseEur,
       netEur:dre.netEur,
       margin:dre.margin,
       fx,
       plan:"Franquia Internacional 2 em 1",
       notes:[
         "Sem comissão comercial no cálculo.",
         "DRE internacional escalado linearmente a partir da base de 10 motos.",
         "Conversão cambial editável.",
         "Estrutura combina operação Brasil + Europa."
       ]
     },
     updatedAt:new Date().toISOString()
   });
 };

 const exp=dre.expenses as Record<string,number>;
 const rev=dre.revenue as Record<string,number>;

 return <div className="franchiseModule">
   <section className="calculatorHero intlFranchiseHero">
     <div><small>LOCAGORA • FRANQUIA INTERNACIONAL 2 EM 1</small><h2>Brasil + Europa em uma única estrutura comercial.</h2><p>Taxa de franquia, ativos nos dois mercados e DRE internacional escalável por quantidade de motos.</p></div>
     <div className="miniMetrics"><div><span>DRE base</span><b>10 motos</b></div><div><span>Moeda operacional</span><b>EUR</b></div><div><span>Estrutura</span><b>2 em 1</b></div></div>
   </section>

   <div className="calcLayout">
    <section className="panel">
      <div className="sectionHead"><small>INVESTIMENTO</small><h2>Estrutura Brasil + Europa</h2></div>
      <div className="formGrid">
        <label>Taxa de franquia<select value={fee} onChange={e=>setFee(Number(e.target.value)||0)}>{INTERNATIONAL_FRANCHISE.feeOptions.map((f,i)=><option key={f+"-"+i} value={f}>{money(f)}</option>)}</select><small>Opções publicadas pelo Administrador.</small></label>
        <label>Capital de giro / moto<input type="number" value={working} onChange={e=>setWorking(Number(e.target.value)||0)}/></label>
        <label>Taxa de intermediação / moto<input type="number" value={intermediation} onChange={e=>setIntermediation(Number(e.target.value)||0)}/></label>
        <label>Motos Brasil<input type="number" min={0} value={brazilQty} onChange={e=>setBrazilQty(Math.max(0,Math.round(Number(e.target.value)||0)))}/></label>
        <label>Valor unitário Brasil<input type="number" value={brazilBikeValue} onChange={e=>setBrazilBikeValue(Number(e.target.value)||0)}/></label>
        <label>Modelo Brasil<select value={brazilModel} onChange={e=>setBrazilModel(e.target.value)}>{INTERNATIONAL_FRANCHISE.brazilModels.map(m=><option key={m}>{m}</option>)}</select></label>
        <label>Motos Europa<input type="number" min={0} value={europeQty} onChange={e=>setEuropeQty(Math.max(0,Math.round(Number(e.target.value)||0)))}/></label>
        <label>Valor unitário Europa<input type="number" value={europeBikeValue} onChange={e=>setEuropeBikeValue(Number(e.target.value)||0)}/></label>
        <label>Modelo Europa<select value={europeModel} onChange={e=>setEuropeModel(e.target.value)}>{INTERNATIONAL_FRANCHISE.europeModels.map(m=><option key={m}>{m}</option>)}</select></label>
      </div>
      <div className="quickValues"><button className="secondary" type="button" onClick={()=>{setFee(INTERNATIONAL_FRANCHISE.feeOptions[0]);setBrazilBikeValue(16990);setEuropeBikeValue(24999);setIntermediation(0);setWorking(600)}}>Restaurar padrão</button></div>
      <div className="line"><span>Taxa de franquia</span><b>{money(investment.fee)}</b></div>
      <div className="line"><span>Ativos Brasil</span><b>{money(investment.brazilAssets)}</b></div>
      <div className="line"><span>Ativos Europa</span><b>{money(investment.europeAssets)}</b></div>
      <div className="line"><span>Capital de giro</span><b>{money(investment.working)}</b></div>
      <div className="line"><span>Intermediação</span><b>{money(investment.intermediation)}</b></div>
      <div className="statusOk"><span>Investimento total</span><b>{money(investment.total)}</b></div>
      {!capitalFit?<div className="statusWarn">O capital disponível do cliente está abaixo desta configuração.</div>:null}
    </section>

    <section className="panel resultPanel">
      <div className="sectionHead"><small>DRE INTERNACIONAL</small><h2>Resultado operacional</h2></div>
      <div className="formGrid">
        <label>Motos na operação internacional<input type="number" min={1} value={qty} onChange={e=>setQty(Math.max(1,Math.round(Number(e.target.value)||1)))}/></label>
        <label>Câmbio EUR/BRL<input type="number" step=".01" value={fx} onChange={e=>setFx(Number(e.target.value)||6.20)}/></label>
      </div>
      <div className="resultGrid">
        <div className="highlight"><span>Lucro líquido</span><b>{eur(dre.netEur)}</b><small>{money(dre.netBrl)}</small></div>
        <div><span>Receita</span><b>{eur(dre.revenueEur)}</b><small>{money(dre.revenueBrl)}</small></div>
        <div><span>Despesas</span><b>{eur(dre.expenseEur)}</b><small>{money(dre.expenseBrl)}</small></div>
        <div><span>Margem líquida</span><b>{pct(dre.margin)}</b><small>margem operacional</small></div>
        <div><span>Qtd. internacional</span><b>{qty}</b><small>motos</small></div>
        <div><span>Câmbio</span><b>R$ {fx.toFixed(2).replace(".",",")}</b><small>por € 1</small></div>
      </div>
    </section>
   </div>

   <section className="panel">
     <div className="sectionHead"><small>DRE DETALHADO</small><h2>Receitas e despesas internacionais</h2></div>
     <div className="calcLayout">
       <div>
         <h3>Receitas</h3>
         <div className="line"><span>Locação</span><b>{eur(rev.rental)}</b></div>
         <div className="line"><span>Multa</span><b>{eur(rev.fine)}</b></div>
         <div className="line"><span>Juros</span><b>{eur(rev.interest)}</b></div>
         <div className="line"><span>Caução</span><b>{eur(rev.deposit)}</b></div>
         <div className="statusOk"><span>Total receitas</span><b>{eur(dre.revenueEur)}</b></div>
       </div>
       <div>
         <h3>Despesas</h3>
         <div className="line"><span>Espaço</span><b>{eur(exp.space)}</b></div>
         <div className="line"><span>Royalties</span><b>{eur(exp.royalties)}</b></div>
         <div className="line"><span>Marketing</span><b>{eur(exp.marketing)}</b></div>
         <div className="line"><span>Sistema</span><b>{eur(exp.system)}</b></div>
         <div className="line"><span>Contabilidade</span><b>{eur(exp.accounting)}</b></div>
         <div className="line"><span>Tarifas</span><b>{eur(exp.tariffs)}</b></div>
         <div className="line"><span>Desconto</span><b>{eur(exp.discount)}</b></div>
         <div className="line"><span>Depreciação</span><b>{eur(exp.depreciation)}</b></div>
         <div className="line"><span>Manutenção</span><b>{eur(exp.maintenance)}</b></div>
         <div className="statusWarn"><span>Total despesas</span><b>{eur(dre.expenseEur)}</b></div>
       </div>
     </div>
   </section>

   <section className="panel">
     <div className="sectionHead"><small>MODELOS</small><h2>Frotas compatíveis</h2></div>
     <div className="referenceGrid">
       <article><div className="assetIcon"><Globe2/></div><small>BRASIL</small><h3>{brazilModel}</h3><p>{INTERNATIONAL_FRANCHISE.brazilModels.join(" • ")}</p></article>
       <article><div className="assetIcon"><Globe2/></div><small>EUROPA</small><h3>{europeModel}</h3><p>{INTERNATIONAL_FRANCHISE.europeModels.join(" • ")}</p></article>
     </div>
   </section>

   <section className="nextBar">
     <button className="secondary" onClick={onBack}><ArrowLeft size={16}/> Voltar às soluções</button>
     <div><small>FRANQUIA INTERNACIONAL</small><b>{eur(dre.netEur)}/mês • {pct(dre.margin)} margem</b></div>
     <button className="primary" onClick={save}><CheckCircle2 size={17}/> {saveLabel||"Adicionar à projeção"} <ArrowRight size={16}/></button>
   </section>
 </div>
}
