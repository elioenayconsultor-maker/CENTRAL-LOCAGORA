"use client";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  LOC_PLANS, LOC_OPERATION, calculateLocInvest, compareLocInvest, enumeratePackages,
  projectLocInvest, variantCost, type LocPlanKey, type LocPlan
} from "@/lib/locinvest";
import { composeLocInvestByQuantity } from "@/lib/locinvest-quantity";
import type { Simulation } from "@/lib/types";

const money=(n:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(n)||0);
const pct=(n:number)=>`${(Number(n)||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}%`;

export default function LocInvestCalculator({initialCapital,onBack,onSave,saveLabel}:{initialCapital:number;onBack:()=>void;onSave:(simulation:Simulation)=>void;saveLabel?:string}){
 const [capital,setCapital]=useState(initialCapital||137594);
 const [dimensionMode,setDimensionMode]=useState<"capital"|"quantity">("capital");
 const [desiredQty,setDesiredQty]=useState(6);
 const [ipca,setIpca]=useState(4.64);
 const [renewWorking,setRenewWorking]=useState(600);
 const [selic,setSelic]=useState(14);
 const [cdi,setCdi]=useState(13.9);
 const [ir,setIr]=useState(15);
 const [bikeModel,setBikeModel]=useState("Yamaha Factor 150");
 const [plans,setPlans]=useState<Record<LocPlanKey,LocPlan>>(()=>({start:{...LOC_PLANS.start},premium:{...LOC_PLANS.premium},exclusive:{...LOC_PLANS.exclusive}}));
 const [manualPlan,setManualPlan]=useState<LocPlanKey>("exclusive");
 const [manualQty,setManualQty]=useState(6);

 const capitalResult=useMemo(()=>calculateLocInvest(capital,0,plans),[capital,plans]);
 const quantityResult=useMemo(()=>composeLocInvestByQuantity(desiredQty,plans),[desiredQty,plans]);
 const applied=dimensionMode==="quantity"?quantityResult:capitalResult;
 const projection=useMemo(()=>projectLocInvest(applied.invested,ipca,renewWorking,plans),[applied.invested,ipca,renewWorking,plans]);
 const compare=useMemo(()=>compareLocInvest(applied.invested,selic,cdi,ir,plans,0),[applied.invested,selic,cdi,ir,plans]);
 const eligible=useMemo(()=>enumeratePackages(capital,plans),[capital,plans]);

 const manualCfg=plans[manualPlan];
 const manualCost=variantCost(manualCfg,manualQty);
 const setPlan=(key:LocPlanKey)=>{setManualPlan(key);const p=plans[key];setManualQty(q=>Math.min(p.max,Math.max(p.min,q)))};
 const setQty=(qty:number)=>{const q=Math.max(1,Math.round(qty||1));if(q<=2){setManualPlan("start");setManualQty(Math.min(2,q))}else if(q<=4){setManualPlan("premium");setManualQty(Math.max(3,q))}else{setManualPlan("exclusive");setManualQty(Math.min(6,Math.max(5,q)))}};

 const save=()=>{
   const details={qty:applied.qty,model:bikeModel,assets:applied.bikesValue,unitValue:applied.qty?applied.bikesValue/applied.qty:0,roiAnnual:applied.roiAnnual,plan:applied.groups.map(g=>`${g.count}× ${g.label}`).join(" + "),workingCapital:0,fees:applied.fees,appropriation:applied.appropriation,gross:applied.gross,operatingExpenses:applied.op,insurance:applied.insurance,accounting:applied.accounting,netOperational:applied.net,locagoraShare:applied.locagora,cycle:"36 meses",horizon:"12 anos",notes:[`Modelo de moto definido pelo consultor: ${bikeModel}.`,`Composição: ${applied.groups.map(g=>`${g.count}× ${g.label} (${g.count*g.qty} motos)`).join(" + ")}.`,"Cada LocInvest comporta no máximo 6 motos: 1–2 Start, 3–4 Premium e 5–6 Exclusive.","Acima de 6 motos o sistema abre automaticamente uma nova LocInvest na composição.","Capital de giro inicial já incluído no valor comercial do plano."]};
   onSave({id:Date.now(),name:`LocInvest — ${applied.qty} motos`,sourceRoute:"locinvest",capital:applied.invested,monthly:applied.monthly,annual:applied.annual,details,updatedAt:new Date().toISOString()});
 };

 return <div className="locinvest">
   <div className="calculatorHero"><div><small>LOCAGORA • LOCINVEST</small><h2>Transforme capital em renda mensal.</h2><p>Escolha pelo capital disponível ou pela quantidade de motos. Cada LocInvest aceita até 6 motos; acima disso uma nova LocInvest entra automaticamente na composição.</p></div><div className="miniMetrics"><div><span>Start</span><b>1–2 motos</b></div><div><span>Premium</span><b>3–4 motos</b></div><div><span>Exclusive</span><b>5–6 motos</b></div></div></div>

   <div className="calcLayout">
    <section className="panel">
      <div className="sectionHead"><small>CONFIGURAÇÃO</small><h2>Como deseja montar o investimento?</h2></div>
      <div className="dimensionMode" role="group" aria-label="Dimensionar LocInvest"><button type="button" className={dimensionMode==="capital"?"active":""} onClick={()=>setDimensionMode("capital")}>Por capital</button><button type="button" className={dimensionMode==="quantity"?"active":""} onClick={()=>setDimensionMode("quantity")}>Por quantidade de motos</button></div>
      <div className="formGrid">
        {dimensionMode==="capital"?<label>Capital disponível<input type="number" value={capital||""} onChange={e=>setCapital(Number(e.target.value))}/></label>:<label>Quantidade desejada de motos<input type="number" min={1} value={desiredQty} onChange={e=>setDesiredQty(Math.max(1,Math.round(Number(e.target.value)||1)))}/><small>Acima de 6 motos, a composição cria outra LocInvest.</small></label>}
        <label>Capital de giro<input value="Já incluído no plano" disabled/></label>
      </div>
      {dimensionMode==="capital"?<div className="quickValues">{[30598,74296,137594,300000].map(v=><button key={v} className="secondary" onClick={()=>setCapital(v)}>{money(v).replace(",00","")}</button>)}</div>:<div className="quantitySummary"><span>Composição calculada</span><b>{applied.qty} motos • {applied.groups.map(g=>`${g.count}× ${g.label}`).join(" + ")}</b><strong>Capital necessário: {money(applied.invested)}</strong><small>{(applied as any).productCount||applied.groups.reduce((s,g)=>s+g.count,0)} LocInvest(s) na composição</small></div>}

      <div className="softBlock freeEditBlock"><div className="blockHead"><div><small>AJUSTE LIVRE DO CONSULTOR</small><h3>Valores comerciais do LocInvest</h3></div><span className="successBadge">EDITÁVEL</span></div><div className="formGrid"><label>Tipo / modelo da moto<input value={bikeModel} onChange={e=>setBikeModel(e.target.value)}/></label><label>Capital de giro inicial<input value="Incluído no valor-base" disabled/></label></div><div className="editablePlanGrid">{(Object.keys(plans) as LocPlanKey[]).map(key=>{const p=plans[key];return <div key={key} className="editablePlan"><b>{p.label}</b><label>Quantidade-base<input type="number" value={p.baseQty} disabled/></label><label>Valor-base<input type="number" value={p.basePrice} onChange={e=>setPlans(x=>({...x,[key]:{...x[key],basePrice:Number(e.target.value)||0}}))}/></label><label>Valor da moto adicional/retirada<input type="number" value={p.bike} onChange={e=>setPlans(x=>({...x,[key]:{...x[key],bike:Number(e.target.value)||0}}))}/></label><label>Rentabilidade / moto / mês<input type="number" value={p.income} onChange={e=>setPlans(x=>({...x,[key]:{...x[key],income:Number(e.target.value)||0}}))}/></label><label>Apropriação adicional<input type="number" value={p.appropriation} onChange={e=>setPlans(x=>({...x,[key]:{...x[key],appropriation:Number(e.target.value)||0}}))}/></label></div>})}</div><div className="quickValues"><button type="button" className="secondary" onClick={()=>{setBikeModel("Yamaha Factor 150");setRenewWorking(600);setPlans({start:{...LOC_PLANS.start},premium:{...LOC_PLANS.premium},exclusive:{...LOC_PLANS.exclusive}})}}>Restaurar tabela padrão</button></div></div>

      <div className="softBlock"><div className="blockHead"><div><small>COMPOSIÇÃO</small><h3>Estrutura do produto</h3></div><span className="successBadge">{applied.qty} MOTOS</span></div>{applied.groups.map(g=><div className="line" key={`${g.key}-${g.qty}`}><span>{g.count}× {g.label} ({g.count*g.qty} motos)</span><b>{money(g.count*g.cost)}</b></div>)}<div className="line"><span>Investimento total</span><b>{money(applied.invested)}</b></div><div className="line"><span>Capital de giro inicial</span><b>INCLUÍDO</b></div>{dimensionMode==="capital"&&<div className="line"><span>Sobra do capital</span><b>{money(applied.leftover)}</b></div>}<div className="statusOk">Regra automática: 1–2 motos = Start • 3–4 = Premium • 5–6 = Exclusive • acima de 6 = nova LocInvest.</div></div>
    </section>

    <section className="panel resultPanel"><div className="sectionHead"><small>ESTRUTURA RECOMENDADA</small><h2>{applied.groups.map(g=>`${g.count}× ${g.label}`).join(" + ")}</h2></div><div className="resultGrid"><div className="highlight"><span>Renda líquida mensal</span><b>{money(applied.monthly)}</b><small>{applied.qty} motos em operação</small></div><div><span>Renda líquida anual</span><b>{money(applied.annual)}</b><small>Ano 1</small></div><div><span>ROI operacional</span><b>{pct(applied.roiAnnual)}</b><small>Ano 1</small></div><div><span>Total de motos</span><b>{applied.qty}</b><small>na carteira</small></div><div><span>Rentab. investimento total</span><b>{pct(applied.rentMonthly)} a.m.</b><small>{pct(applied.rentMonthly*12)} a.a.</small></div><div><span>Rentab. valor em motos</span><b>{pct(applied.bikeRentMonthly)} a.m.</b><small>{pct(applied.bikeRentMonthly*12)} a.a.</small></div></div><div className="statusOk"><b>Imposto debitado na fonte.</b> A renda é apresentada como líquida conforme a condição comercial informada.</div></section>
   </div>

   <section className="panel"><div className="sectionHead"><small>PLANOS</small><h2>Condições por LocInvest</h2><p>Uma LocInvest individual vai até 6 motos.</p></div><div className="planCards">{(Object.keys(plans) as LocPlanKey[]).map(key=>{const p=plans[key];return <button key={key} className={manualPlan===key?"planCard selected":"planCard"} onClick={()=>setPlan(key)}><small>{p.min}–{p.max} MOTOS</small><h3>{p.label}</h3><span>Base: {p.baseQty} {p.baseQty===1?"moto":"motos"}</span><b>{money(p.basePrice)}</b><span>{money(p.income)} / moto / mês</span><small>Capital de giro inicial incluído</small></button>})}</div><div className="manualRow"><label>Plano<select value={manualPlan} onChange={e=>setPlan(e.target.value as LocPlanKey)}>{(Object.keys(plans) as LocPlanKey[]).map(k=><option value={k} key={k}>{plans[k].label}</option>)}</select></label><label>Quantidade nesta LocInvest<input type="number" min={1} max={6} value={manualQty} onChange={e=>setQty(Number(e.target.value))}/></label><div><span>Configuração individual</span><b>{money(manualCost)}</b></div></div></section>

   {dimensionMode==="capital"&&<section className="panel"><div className="sectionHead"><small>OPÇÕES ELEGÍVEIS</small><h2>LocInvest individuais que cabem neste capital</h2></div><div className="tableWrap"><table className="dataTable"><thead><tr><th>Plano</th><th>Motos</th><th>Investimento</th><th>Renda líquida/mês</th></tr></thead><tbody>{eligible.length?eligible.map(v=><tr key={`${v.key}-${v.qty}`}><td><b>{v.label}</b></td><td>{v.qty}</td><td>{money(v.cost)}</td><td>{money(v.monthly)}</td></tr>):<tr><td colSpan={4}>Nenhum plano completo disponível.</td></tr>}</tbody></table></div></section>}

   <div className="calcLayout"><section className="panel"><div className="sectionHead"><small>BASE ECONÔMICA</small><h2>Como a rentabilidade acontece</h2></div><div className="line"><span>Faturamento bruto da locação</span><b>{money(applied.gross)}</b></div><div className="line"><span>Despesas operacionais</span><b>- {money(applied.op)}</b></div><div className="line"><span>Seguro</span><b>- {money(applied.insurance)}</b></div><div className="line"><span>Contabilidade</span><b>- {money(applied.accounting)}</b></div><div className="line"><span>Total de despesas</span><b>- {money(applied.expenses)}</b></div><div className="statusOk"><span>Lucro líquido operacional da frota</span><b>{money(applied.net)}</b></div></section><section className="panel"><div className="sectionHead"><small>DISTRIBUIÇÃO</small><h2>Cenário simulado</h2></div><div className="resultGrid two"><div className="highlight"><span>Investidor / mês</span><b>{money(applied.monthly)}</b><small>{applied.qty?money(applied.monthly/applied.qty):"—"} por moto</small></div><div><span>Locagora / mês</span><b>{money(applied.locagora)}</b><small>{applied.qty?money(applied.locagora/applied.qty):"—"} por moto</small></div></div></section></div>

   <section className="panel"><div className="sectionHead"><small>VISÃO DE LONGO PRAZO</small><h2>Projeção financeira em 12 anos</h2></div><div className="formGrid smallGrid"><label>IPCA projetado (% a.a.)<input type="number" step=".01" value={ipca} onChange={e=>setIpca(Number(e.target.value))}/></label><label>Giro na renovação / moto<input type="number" value={renewWorking} onChange={e=>setRenewWorking(Number(e.target.value))}/></label></div><div className="summaryGrid"><div><span>Investimento inicial</span><b>{money(projection.initial)}</b></div><div><span>Renda acumulada</span><b className="green">{money(projection.accumulatedIncome)}</b></div><div><span>Devoluções brutas</span><b>{money(projection.accumulatedReturns)}</b></div><div><span>Total líquido após renovações</span><b>{money(projection.netAfterRenewals)}</b></div></div></section>

   <section className="panel"><div className="sectionHead"><small>COMPARATIVO ILUSTRATIVO</small><h2>Compare o mesmo capital</h2></div><div className="formGrid compareInputs"><label>Selic (% a.a.)<input type="number" step=".01" value={selic} onChange={e=>setSelic(Number(e.target.value))}/></label><label>CDI (% a.a.)<input type="number" step=".01" value={cdi} onChange={e=>setCdi(Number(e.target.value))}/></label><label>IR estimado renda fixa (%)<input type="number" step=".01" value={ir} onChange={e=>setIr(Number(e.target.value))}/></label></div><div className="tableWrap"><table className="dataTable"><thead><tr><th>Cenário</th><th>Capital</th><th>Resultado anual estimado</th><th>Taxa líquida estimada</th></tr></thead><tbody>{compare.map(r=><tr key={r.label}><td>{r.label}</td><td>{money(r.capital)}</td><td>{money(r.annual)}</td><td>{pct(r.rate)}</td></tr>)}</tbody></table></div></section>

   <section className="nextBar"><button className="secondary" onClick={onBack}><ArrowLeft size={16}/> Voltar às soluções</button><div><small>SIMULAÇÃO PRONTA</small><b>{applied.qty} motos • {money(applied.monthly)}/mês</b></div><button className="primary" disabled={!applied.qty} onClick={save}><CheckCircle2 size={17}/> {saveLabel||"Adicionar à projeção"} <ArrowRight size={16}/></button></section>
 </div>
}
