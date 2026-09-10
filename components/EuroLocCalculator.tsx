"use client";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Globe2 } from "lucide-react";
import {
  EUROLOC_COUNTRIES, EUROLOC_PLANS, EUROLOC_SUPPORT, EURO_PCX_VALUE,
  calculateEuroLoc, convertBrlToEur, enumerateEuroLocOptions,
  planFromQty, recommendEuroLocByCapital, type EuroLocPlanKey
} from "@/lib/euroloc";
import type { Simulation } from "@/lib/types";

const money=(n:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(n)||0);
const eur=(n:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"EUR"}).format(Number(n)||0);
const pct=(n:number)=>`${(Number(n)||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}%`;

export default function EuroLocCalculator({
  initialCapital,onBack,onSave,saveLabel
}:{
  initialCapital:number;
  onBack:()=>void;
  onSave:(simulation:Simulation)=>void;
  saveLabel?:string;
}){
 const [capital,setCapital]=useState(initialCapital||31998);
 const [dimensionMode,setDimensionMode]=useState<"capital"|"quantity">("capital");
 const [desiredQty,setDesiredQty]=useState(1);
 const [bikeModel,setBikeModel]=useState("Honda PCX");
 const [bikeValue,setBikeValue]=useState(EURO_PCX_VALUE);
 const [feeByPlan,setFeeByPlan]=useState<Record<EuroLocPlanKey,number>>(()=>({start:EUROLOC_PLANS.start.fees[0],exclusive:EUROLOC_PLANS.exclusive.fees[0],premium:EUROLOC_PLANS.premium.fees[0],black:EUROLOC_PLANS.black.fees[0]}));
 const [customIncome,setCustomIncome]=useState<number|null>(null);
 const [workingPerBike,setWorkingPerBike]=useState(600);

 const recommendation=useMemo(()=>{
   const budget=Math.max(0,Number(capital)||0);
   const unit=Math.max(0,Number(bikeValue)||0);
   for(let q=15;q>=1;q--){
     const key=planFromQty(q);
     const plan=EUROLOC_PLANS[key];
     const fee=Math.max(0,Number(feeByPlan[key] ?? plan.fees[0])||0);
     const income=customIncome===null?plan.income:Math.max(0,Number(customIncome)||0);
     const assets=q*unit;
     const working=q*Math.max(0,Number(workingPerBike)||0);
     const total=assets+fee+working;
     if(total<=budget){
       const monthly=q*income;
       const annual=monthly*12;
       return {key,label:plan.label,qty:q,fee,assets,working,total,income,monthly,annual,refund:budget-total,roiMonthly:total?monthly/total*100:0,roiAnnual:total?annual/total*100:0};
     }
   }
   return null;
 },[capital,bikeValue,feeByPlan,customIncome,workingPerBike]);

 const quantityRecommendation=useMemo(()=>{
   const qty=Math.max(1,Math.min(15,Math.round(Number(desiredQty)||1)));
   const key=planFromQty(qty);
   const plan=EUROLOC_PLANS[key];
   const fee=Math.max(0,Number(feeByPlan[key] ?? plan.fees[0])||0);
   const income=customIncome===null?plan.income:Math.max(0,Number(customIncome)||0);
   const assets=qty*Math.max(0,Number(bikeValue)||0);
   const working=qty*Math.max(0,Number(workingPerBike)||0);
   const total=assets+fee+working;
   const monthly=qty*income;
   const annual=monthly*12;
   return {key,label:plan.label,qty,fee,assets,working,total,income,monthly,annual,refund:0,roiMonthly:total?monthly/total*100:0,roiAnnual:total?annual/total*100:0};
 },[desiredQty,bikeValue,feeByPlan,customIncome,workingPerBike]);

 const [manualPlan,setManualPlan]=useState<EuroLocPlanKey>("start");
 const [manualQty,setManualQty]=useState(1);
 const [eurRate,setEurRate]=useState(6.20);

 const manual=useMemo(()=>{const plan=EUROLOC_PLANS[manualPlan];const q=Math.max(plan.min,Math.min(plan.max,manualQty));const fee=feeByPlan[manualPlan]??plan.fees[0];const assets=q*bikeValue;const working=q*workingPerBike;const total=assets+fee+working;const income=customIncome??plan.income;const monthly=q*income;return {key:manualPlan,label:plan.label,qty:q,fee,assets,working,total,income,monthly,annual:monthly*12,roiMonthly:total?monthly/total*100:0,roiAnnual:total?monthly*12/total*100:0};},[manualPlan,manualQty,feeByPlan,bikeValue,workingPerBike,customIncome]);
 const options=useMemo(()=>enumerateEuroLocOptions(capital),[capital]);

 const setPlan=(key:EuroLocPlanKey)=>{
   setManualPlan(key);
   const p=EUROLOC_PLANS[key];
   setManualQty(q=>Math.max(p.min,Math.min(p.max,q)));
 };
 const setQty=(qty:number)=>{
   const key=planFromQty(qty);
   setManualPlan(key);
   const p=EUROLOC_PLANS[key];
   setManualQty(Math.max(p.min,Math.min(p.max,Math.round(qty||p.min))));
 };

 const applied=dimensionMode==="quantity"?quantityRecommendation:(recommendation||manual);
 const refund=dimensionMode==="quantity"?0:(recommendation?recommendation.refund:Math.max(0,capital-manual.total));

 const save=()=>{
   const base=applied;
   if(!base.qty)return;
   onSave({
     id:Date.now(),
     name:`EUROLOC — ${base.label} • ${base.qty} ${bikeModel||"motos"}`,
     sourceRoute:"euroloc",
     capital:base.total,
     monthly:base.monthly,
     annual:base.annual,
     details:{
       qty:base.qty,
       model:bikeModel||"Moto",
       unitValue:bikeValue,
       assets:base.assets,
       plan:base.label,
       admFee:base.fee,
       workingCapital:(base as any).working||base.qty*workingPerBike,
       incomePerBike:base.income,
       roiAnnual:base.roiAnnual,
       country:"Europa",
       hub:"Barcelona, Espanha",
       cycle:"36 meses",
       notes:[
         `Modelo de frota: ${bikeModel||"Moto"}.`,
         "Rentabilidade calculada pela faixa comercial do plano.",
         "Taxa ADM selecionável dentro das opções do plano.",
         "Valores em euro exibidos apenas como equivalência cambial ilustrativa."
       ]
     },
     updatedAt:new Date().toISOString()
   });
 };

 return <div className="eurolocModule">
  <section className="calculatorHero euroHero">
    <div>
      <small>LOCAGORA • EUROLOC</small>
      <h2>Renda recorrente conectada à expansão europeia.</h2>
      <p>Capital, plano, quantidade de Honda PCX, taxa ADM e rentabilidade dentro de um único motor TypeScript.</p>
    </div>
    <div className="countryChips">{EUROLOC_COUNTRIES.map(c=><span key={c.name}>{c.flag} {c.name}</span>)}</div>
  </section>

  <div className="calcLayout">
    <section className="panel">
      <div className="sectionHead"><small>APORTE</small><h2>Recomendação automática</h2><p>O sistema procura a maior quantidade de motos possível e prioriza a maior renda quando há empate.</p></div>
      <div className="dimensionMode" role="group" aria-label="Dimensionar investimento">
        <button type="button" className={dimensionMode==="capital"?"active":""} onClick={()=>setDimensionMode("capital")}>Por capital</button>
        <button type="button" className={dimensionMode==="quantity"?"active":""} onClick={()=>setDimensionMode("quantity")}>Por quantidade de motos</button>
      </div>
      <div className="formGrid">
        {dimensionMode==="capital"?<label>Capital disponível<input type="number" value={capital||""} onChange={e=>setCapital(Number(e.target.value))}/></label>:<label>Quantidade desejada de motos<input type="number" min="1" max="15" value={desiredQty} onChange={e=>setDesiredQty(Math.max(1,Math.min(15,Number(e.target.value)||1)))}/><small>O perfil comercial muda automaticamente conforme a quantidade.</small></label>}
        <label>Cotação EUR/BRL<input type="number" step=".01" value={eurRate} onChange={e=>setEurRate(Number(e.target.value))}/></label>
      </div>
      {dimensionMode==="capital"?<div className="quickValues">{[50000,100000,200000,400000].map(v=><button className="secondary" key={v} onClick={()=>setCapital(v)}>{money(v).replace(",00","")}</button>)}</div>:<div className="quantitySummary"><span>Perfil calculado</span><b>{quantityRecommendation.label} • {quantityRecommendation.qty} motos</b><strong>Capital necessário: {money(quantityRecommendation.total)}</strong><small>{eur(convertBrlToEur(quantityRecommendation.total,eurRate))} na cotação informada</small></div>}

      <div className="softBlock" style={{marginTop:16}}>
        <div className="blockHead"><div><small>AJUSTE LIVRE DO CONSULTOR</small><h3>Premissas comerciais editáveis</h3></div><span className="successBadge">EDITÁVEL</span></div>
        <div className="formGrid">
          <label>Modelo da moto<input value={bikeModel} onChange={e=>setBikeModel(e.target.value)} placeholder="Ex.: Honda PCX"/></label>
          <label>Valor da moto<input type="number" min="0" step="1" value={bikeValue||""} onChange={e=>setBikeValue(Number(e.target.value))}/></label>
          <label>Taxa ADM da faixa atual<select value={feeByPlan[recommendation?.key||manualPlan]} onChange={e=>{const key=recommendation?.key||manualPlan;setFeeByPlan(x=>({...x,[key]:Number(e.target.value)||0}))}}>{EUROLOC_PLANS[recommendation?.key||manualPlan].fees.map((f,i)=><option key={f+"-"+i} value={f}>{money(f)}</option>)}</select><small>Opções publicadas pelo Administrador.</small></label>
          <label>Capital de giro / moto<input type="number" min="0" step="1" value={workingPerBike} onChange={e=>setWorkingPerBike(Number(e.target.value)||0)}/></label>
          <label>Rentabilidade / moto / mês<input type="number" min="0" step="1" value={customIncome ?? recommendation?.income ?? ""} onChange={e=>setCustomIncome(e.target.value===""?null:Number(e.target.value))}/><small>Base do HTML: Start 450 • Exclusive 490 • Premium 530 • Black 580.</small></label>
        </div>
        <div className="quickValues"><button className="secondary" type="button" onClick={()=>{setBikeModel("Honda PCX");setBikeValue(EURO_PCX_VALUE);setFeeByPlan({start:EUROLOC_PLANS.start.fees[0],exclusive:EUROLOC_PLANS.exclusive.fees[0],premium:EUROLOC_PLANS.premium.fees[0],black:EUROLOC_PLANS.black.fees[0]});setCustomIncome(null);setWorkingPerBike(600)}}>Restaurar tabela padrão</button></div>
      </div>

      {dimensionMode==="quantity" ? <div className="softBlock">
        <div className="blockHead"><div><small>ESTRUTURA POR QUANTIDADE</small><h3>{quantityRecommendation.label} • {quantityRecommendation.qty} {bikeModel||"motos"}</h3></div><span className="successBadge">CALCULADO</span></div>
        <div className="line"><span>Investimento em ativos</span><b>{money(quantityRecommendation.assets)}</b></div>
        <div className="line"><span>Taxa ADM</span><b>{money(quantityRecommendation.fee)}</b></div>
        <div className="line"><span>Capital de giro</span><b>{money(quantityRecommendation.working)}</b></div>
        <div className="line"><span>Capital necessário</span><b>{money(quantityRecommendation.total)}</b></div>
        <div className="line"><span>Equivalente aproximado em euro</span><b>{eur(convertBrlToEur(quantityRecommendation.total,eurRate))}</b></div>
      </div> : recommendation ? <div className="softBlock">
        <div className="blockHead"><div><small>ESTRUTURA INDICADA</small><h3>{recommendation.label} • {recommendation.qty} {bikeModel||"motos"}</h3></div><span className="successBadge">HABILITADO</span></div>
        <div className="line"><span>Investimento em ativos</span><b>{money(recommendation.assets)}</b></div>
        <div className="line"><span>Taxa ADM</span><b>{money(recommendation.fee)}</b></div>
        <div className="line"><span>Capital de giro</span><b>{money((recommendation as any).working||0)}</b></div>
        <div className="line"><span>Total utilizado</span><b>{money(recommendation.total)}</b></div>
        <div className="line"><span>Valor devolvido ao cliente</span><b>{money(recommendation.refund)}</b></div>
        <div className="line"><span>Equivalente aproximado em euro</span><b>{eur(convertBrlToEur(recommendation.total,eurRate))}</b></div>
      </div> : <div className="statusWarn"><b>Capital insuficiente.</b> O aporte ainda não comporta 1 Honda PCX + Taxa ADM Start.</div>}
    </section>

    <section className="panel resultPanel">
      <div className="sectionHead"><small>RESULTADO EUROLOC</small><h2>{applied.label}</h2></div>
      <div className="resultGrid">
        <div className="highlight"><span>Renda mensal</span><b>{money(applied.monthly)}</b><small>{money(applied.income)} / moto</small></div>
        <div><span>Renda anual simples</span><b>{money(applied.annual)}</b><small>Ano 1</small></div>
        <div><span>Investimento total</span><b>{money(applied.total)}</b><small>ativos + ADM + giro</small></div>
        <div><span>Quantidade</span><b>{applied.qty}</b><small>{bikeModel||"Moto"}</small></div>
        <div><span>Rentabilidade mensal</span><b>{pct(applied.roiMonthly)}</b><small>sobre investimento total</small></div>
        <div><span>Rentabilidade anual</span><b>{pct(applied.roiAnnual)}</b><small>simples</small></div>
      </div>
    </section>
  </div>

  <section className="panel">
    <div className="sectionHead"><small>PLANOS EUROLOC</small><h2>Faixas comerciais</h2><p>Plano e quantidade permanecem vinculados automaticamente.</p></div>
    <div className="planCards four">{(Object.keys(EUROLOC_PLANS) as EuroLocPlanKey[]).map(key=>{const p=EUROLOC_PLANS[key];return <button className={manualPlan===key?"planCard selected":"planCard"} onClick={()=>setPlan(key)} key={key}>
      <small>{p.min}–{p.max} MOTOS</small><h3>{p.label}</h3><b>{money(p.income)} / moto / mês</b><span>Honda PCX {money(EURO_PCX_VALUE)}</span><span>ADM a partir de {money(Math.min(...p.fees))}</span>
    </button>})}</div>

    <div className="manualRow euroManual">
      <label>Plano<select value={manualPlan} onChange={e=>setPlan(e.target.value as EuroLocPlanKey)}>{(Object.keys(EUROLOC_PLANS) as EuroLocPlanKey[]).map(k=><option value={k} key={k}>{EUROLOC_PLANS[k].label}</option>)}</select></label>
      <label>Quantidade<input type="number" min={1} max={15} value={manualQty} onChange={e=>setQty(Number(e.target.value))}/></label>
      <label>Taxa ADM<select value={feeByPlan[manualPlan]} onChange={e=>setFeeByPlan(x=>({...x,[manualPlan]:Number(e.target.value)||0}))}>{EUROLOC_PLANS[manualPlan].fees.map((f,i)=><option key={f+"-"+i} value={f}>{money(f)}</option>)}</select></label>
      <div><span>Configuração personalizada</span><b>{money(manual.total)}</b><small>{money(manual.monthly)}/mês</small></div>
    </div>
  </section>

  <section className="panel">
    <div className="sectionHead"><small>OPÇÕES ELEGÍVEIS</small><h2>Configurações que cabem no capital</h2></div>
    <div className="tableWrap"><table className="dataTable"><thead><tr><th>Plano</th><th>Qtd.</th><th>ADM</th><th>Ativos</th><th>Total</th><th>Renda/mês</th><th>Sobra</th></tr></thead><tbody>
      {options.length?options.map((o,i)=><tr key={`${o.key}-${o.qty}-${o.fee}-${i}`}><td><b>{o.label}</b></td><td>{o.qty}</td><td>{money(o.fee)}</td><td>{money(o.assets)}</td><td>{money(o.total)}</td><td>{money(o.monthly)}</td><td>{money(o.refund)}</td></tr>):<tr><td colSpan={7}>Nenhuma configuração completa disponível.</td></tr>}
    </tbody></table></div>
  </section>

  <div className="calcLayout">
    <section className="panel">
      <div className="sectionHead"><small>MODELO</small><h2>Composição da frota</h2></div>
      <div className="assetFeature"><div className="assetIcon"><Globe2/></div><div><small>100% DA FROTA</small><h3>{bikeModel||"Moto"}</h3><p>Valor do ativo aplicado: <b>{money(recommendation?bikeValue:EURO_PCX_VALUE)}</b>.</p></div></div>
      <div className="line"><span>Quantidade aplicada</span><b>{applied.qty} motos</b></div>
      <div className="line"><span>Investimento em motos</span><b>{money(applied.assets)}</b></div>
      <div className="line"><span>Renda base por moto</span><b>{money(applied.income)}/mês</b></div>
    </section>
    <section className="panel">
      <div className="sectionHead"><small>MOVIMENTO EUROLOC</small><h2>Estrutura internacional</h2></div>
      <div className="line"><span>Hub de referência</span><b>Barcelona, Espanha</b></div>
      <div className="line"><span>Porta de entrada</span><b>Portugal</b></div>
      <div className="line"><span>Expansão</span><b>Espanha • Itália • França • Inglaterra</b></div>
      <div className="line"><span>Operação</span><b>Brasil + Europa</b></div>
    </section>
  </div>

  <section className="panel">
    <div className="sectionHead"><small>SUPORTE</small><h2>Você não atravessa o oceano sozinho</h2></div>
    <div className="supportGrid">{EUROLOC_SUPPORT.map(item=><article key={item.cadence}><small>{item.cadence}</small><h3>{item.title}</h3><p>{item.description}</p></article>)}</div>
  </section>

  <section className="nextBar">
    <button className="secondary" onClick={onBack}><ArrowLeft size={16}/> Voltar às soluções</button>
    <div><small>EUROLOC PRONTO</small><b>{applied.qty} {bikeModel||"motos"} • {money(applied.monthly)}/mês</b></div>
    <button className="primary" disabled={!applied.qty||(dimensionMode==="capital"&&applied.total>capital)} onClick={save}><CheckCircle2 size={17}/> {saveLabel||"Adicionar à projeção"} <ArrowRight size={16}/></button>
  </section>
 </div>
}
