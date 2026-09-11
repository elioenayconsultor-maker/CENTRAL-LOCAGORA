"use client";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Globe2 } from "lucide-react";
import { EUROLOC_COUNTRIES, EUROLOC_PLANS, EUROLOC_SUPPORT, EURO_PCX_VALUE, convertBrlToEur, type EuroLocPlanKey } from "@/lib/euroloc";
import { composeEuroLocByQuantity } from "@/lib/euroloc-quantity";
import type { Simulation } from "@/lib/types";

const money=(n:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(n)||0);
const eur=(n:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"EUR"}).format(Number(n)||0);
const pct=(n:number)=>`${(Number(n)||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}%`;

export default function EuroLocCalculator({initialCapital,onBack,onSave,saveLabel}:{initialCapital:number;onBack:()=>void;onSave:(simulation:Simulation)=>void;saveLabel?:string}){
 const [capital,setCapital]=useState(initialCapital||31998);
 const [dimensionMode,setDimensionMode]=useState<"capital"|"quantity">("capital");
 const [desiredQty,setDesiredQty]=useState(1);
 const [bikeModel,setBikeModel]=useState("Honda PCX");
 const [bikeValue,setBikeValue]=useState(EURO_PCX_VALUE);
 const [feeByPlan,setFeeByPlan]=useState<Record<EuroLocPlanKey,number>>(()=>({start:EUROLOC_PLANS.start.fees[0],exclusive:EUROLOC_PLANS.exclusive.fees[0],premium:EUROLOC_PLANS.premium.fees[0],black:EUROLOC_PLANS.black.fees[0]}));
 const [customIncome,setCustomIncome]=useState<number|null>(null);
 const [workingPerBike,setWorkingPerBike]=useState(600);
 const [eurRate,setEurRate]=useState(6.20);

 const quantityRecommendation=useMemo(()=>composeEuroLocByQuantity({qty:desiredQty,bikeValue,workingPerBike,feeByPlan,customIncome}),[desiredQty,bikeValue,workingPerBike,feeByPlan,customIncome]);
 const recommendation=useMemo(()=>{
   const budget=Math.max(0,Number(capital)||0);
   for(let q=60;q>=1;q--){
     const candidate=composeEuroLocByQuantity({qty:q,bikeValue,workingPerBike,feeByPlan,customIncome});
     if(candidate.total<=budget)return {...candidate,refund:budget-candidate.total};
   }
   return null;
 },[capital,bikeValue,workingPerBike,feeByPlan,customIncome]);
 const applied=dimensionMode==="quantity"?quantityRecommendation:recommendation;

 const save=()=>{
   if(!applied?.qty)return;
   onSave({id:Date.now(),name:`LOCINVEST EUROPA — ${applied.qty} ${bikeModel||"motos"}`,sourceRoute:"euroloc",capital:applied.total,monthly:applied.monthly,annual:applied.annual,details:{qty:applied.qty,model:bikeModel||"Moto",unitValue:bikeValue,assets:applied.assets,plan:applied.label,admFee:applied.fee,workingCapital:applied.working,incomePerBike:applied.income,roiAnnual:applied.roiAnnual,country:"Europa",hub:"Barcelona, Espanha",cycle:"36 meses",notes:[`Composição: ${applied.items.map(i=>`${i.label} (${i.qty} motos)`).join(" + ")}.`,"Cada LocInvest Europa comporta no máximo 6 motos.","1–2 motos = Start • 3–4 = Premium • 5–6 = Exclusive.","Acima de 6 motos o sistema cria automaticamente outra LocInvest Europa na composição.","Valores em euro são equivalência cambial ilustrativa."]},updatedAt:new Date().toISOString()});
 };

 const activeKey=(applied?.items?.[applied.items.length-1]?.key||"start") as EuroLocPlanKey;

 return <div className="eurolocModule">
  <section className="calculatorHero euroHero"><div><small>LOCAGORA • LOCINVEST EUROPA</small><h2>Monte a operação pela quantidade de motos.</h2><p>Você pode dimensionar pelo capital ou informar diretamente a quantidade desejada. Cada LocInvest Europa vai até 6 motos; acima disso uma nova LocInvest é adicionada à composição.</p></div><div className="countryChips">{EUROLOC_COUNTRIES.map(c=><span key={c.name}>{c.flag} {c.name}</span>)}</div></section>

  <div className="calcLayout">
    <section className="panel">
      <div className="sectionHead"><small>APORTE</small><h2>Como deseja montar o investimento?</h2></div>
      <div className="dimensionMode" role="group" aria-label="Dimensionar investimento"><button type="button" className={dimensionMode==="capital"?"active":""} onClick={()=>setDimensionMode("capital")}>Por capital</button><button type="button" className={dimensionMode==="quantity"?"active":""} onClick={()=>setDimensionMode("quantity")}>Por quantidade de motos</button></div>
      <div className="formGrid">{dimensionMode==="capital"?<label>Capital disponível<input type="number" value={capital||""} onChange={e=>setCapital(Number(e.target.value))}/></label>:<label>Quantidade desejada de motos<input type="number" min="1" value={desiredQty} onChange={e=>setDesiredQty(Math.max(1,Math.round(Number(e.target.value)||1)))}/><small>Acima de 6 motos, outra LocInvest Europa entra na composição.</small></label>}<label>Cotação EUR/BRL<input type="number" step=".01" value={eurRate} onChange={e=>setEurRate(Number(e.target.value))}/></label></div>
      {dimensionMode==="capital"?<div className="quickValues">{[50000,100000,200000,400000].map(v=><button className="secondary" key={v} onClick={()=>setCapital(v)}>{money(v).replace(",00","")}</button>)}</div>:<div className="quantitySummary"><span>Composição calculada</span><b>{quantityRecommendation.qty} motos • {quantityRecommendation.label}</b><strong>Capital necessário: {money(quantityRecommendation.total)}</strong><small>{quantityRecommendation.productCount} LocInvest(s) Europa • {eur(convertBrlToEur(quantityRecommendation.total,eurRate))}</small></div>}

      <div className="softBlock" style={{marginTop:16}}><div className="blockHead"><div><small>AJUSTE LIVRE DO CONSULTOR</small><h3>Premissas comerciais</h3></div><span className="successBadge">EDITÁVEL</span></div><div className="formGrid"><label>Modelo da moto<input value={bikeModel} onChange={e=>setBikeModel(e.target.value)}/></label><label>Valor da moto<input type="number" min="0" value={bikeValue||""} onChange={e=>setBikeValue(Number(e.target.value))}/></label><label>Taxa ADM da faixa atual<select value={feeByPlan[activeKey]} onChange={e=>setFeeByPlan(x=>({...x,[activeKey]:Number(e.target.value)||0}))}>{EUROLOC_PLANS[activeKey].fees.map((f,i)=><option key={f+"-"+i} value={f}>{money(f)}</option>)}</select></label><label>Capital de giro / moto<input type="number" min="0" value={workingPerBike} onChange={e=>setWorkingPerBike(Number(e.target.value)||0)}/></label><label>Rentabilidade customizada / moto / mês<input type="number" min="0" value={customIncome??""} placeholder="Usar faixa do plano" onChange={e=>setCustomIncome(e.target.value===""?null:Number(e.target.value))}/></label></div></div>

      {applied?<div className="softBlock"><div className="blockHead"><div><small>COMPOSIÇÃO</small><h3>{applied.qty} motos • {applied.productCount} produto(s)</h3></div><span className="successBadge">CALCULADO</span></div>{applied.items.map((i,idx)=><div className="line" key={`${i.key}-${idx}`}><span>LocInvest {idx+1} • {i.label} ({i.qty} motos)</span><b>{money(i.total)}</b></div>)}<div className="line"><span>Investimento em ativos</span><b>{money(applied.assets)}</b></div><div className="line"><span>Taxas ADM</span><b>{money(applied.fee)}</b></div><div className="line"><span>Capital de giro</span><b>{money(applied.working)}</b></div><div className="line"><span>Capital necessário</span><b>{money(applied.total)}</b></div>{dimensionMode==="capital"&&<div className="line"><span>Valor devolvido ao cliente</span><b>{money((applied as any).refund||0)}</b></div>}<div className="statusOk">Regra automática: 1–2 motos = Start • 3–4 = Premium • 5–6 = Exclusive • acima de 6 = nova LocInvest Europa.</div></div>:<div className="statusWarn"><b>Capital insuficiente.</b> O aporte ainda não comporta a primeira LocInvest Europa.</div>}
    </section>

    <section className="panel resultPanel"><div className="sectionHead"><small>RESULTADO LOCINVEST EUROPA</small><h2>{applied?.label||"Aguardando composição"}</h2></div>{applied&&<div className="resultGrid"><div className="highlight"><span>Renda mensal</span><b>{money(applied.monthly)}</b><small>{applied.qty} motos</small></div><div><span>Renda anual simples</span><b>{money(applied.annual)}</b><small>Ano 1</small></div><div><span>Investimento total</span><b>{money(applied.total)}</b><small>ativos + ADM + giro</small></div><div><span>Quantidade</span><b>{applied.qty}</b><small>{bikeModel||"Moto"}</small></div><div><span>Rentabilidade mensal</span><b>{pct(applied.roiMonthly)}</b><small>sobre investimento total</small></div><div><span>Rentabilidade anual</span><b>{pct(applied.roiAnnual)}</b><small>simples</small></div></div>}</section>
  </div>

  <section className="panel"><div className="sectionHead"><small>FAIXAS COMERCIAIS</small><h2>Uma LocInvest Europa por bloco de até 6 motos</h2></div><div className="planCards"><article className="planCard selected"><small>1–2 MOTOS</small><h3>Start</h3><p>Entrada da composição.</p></article><article className="planCard"><small>3–4 MOTOS</small><h3>Premium</h3><p>Faixa intermediária.</p></article><article className="planCard"><small>5–6 MOTOS</small><h3>Exclusive</h3><p>Capacidade máxima de uma LocInvest Europa.</p></article></div><div className="statusWarn"><b>Mais de 6 motos?</b> Não ampliamos o mesmo produto. O sistema adiciona outra LocInvest Europa e aplica novamente a faixa correspondente ao saldo de motos.</div></section>

  <div className="calcLayout"><section className="panel"><div className="sectionHead"><small>MODELO</small><h2>Composição da frota</h2></div><div className="assetFeature"><div className="assetIcon"><Globe2/></div><div><small>100% DA FROTA</small><h3>{bikeModel||"Moto"}</h3><p>Valor do ativo aplicado: <b>{money(bikeValue)}</b>.</p></div></div>{applied&&<><div className="line"><span>Quantidade aplicada</span><b>{applied.qty} motos</b></div><div className="line"><span>Investimento em motos</span><b>{money(applied.assets)}</b></div></>}</section><section className="panel"><div className="sectionHead"><small>MOVIMENTO EUROPA</small><h2>Estrutura internacional</h2></div><div className="line"><span>Hub de referência</span><b>Barcelona, Espanha</b></div><div className="line"><span>Porta de entrada</span><b>Portugal</b></div><div className="line"><span>Expansão</span><b>Espanha • Itália • França • Inglaterra</b></div></section></div>

  <section className="panel"><div className="sectionHead"><small>SUPORTE</small><h2>Você não atravessa o oceano sozinho</h2></div><div className="supportGrid">{EUROLOC_SUPPORT.map(item=><article key={item.cadence}><small>{item.cadence}</small><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></section>

  <section className="nextBar"><button className="secondary" onClick={onBack}><ArrowLeft size={16}/> Voltar às soluções</button><div><small>LOCINVEST EUROPA PRONTO</small><b>{applied?`${applied.qty} ${bikeModel||"motos"} • ${money(applied.monthly)}/mês`:"Defina a composição"}</b></div><button className="primary" disabled={!applied?.qty} onClick={save}><CheckCircle2 size={17}/> {saveLabel||"Adicionar à projeção"} <ArrowRight size={16}/></button></section>
 </div>
}
