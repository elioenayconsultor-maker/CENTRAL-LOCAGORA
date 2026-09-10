"use client";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  LOC_PLANS, LOC_OPERATION, calculateLocInvest, compareLocInvest, enumeratePackages,
  groupRecommendation, projectLocInvest, type LocPlanKey, type LocPlan
} from "@/lib/locinvest";
import type { Simulation } from "@/lib/types";

const money=(n:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(n)||0);
const pct=(n:number)=>`${(Number(n)||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}%`;

export default function LocInvestCalculator({
  initialCapital,
  onBack,
  onSave,
  saveLabel
}:{
  initialCapital:number;
  onBack:()=>void;
  onSave:(simulation:Simulation)=>void;
  saveLabel?:string;
}){
 const [capital,setCapital]=useState(initialCapital||137594);
 const [workingPerBike,setWorkingPerBike]=useState(600);
 const [ipca,setIpca]=useState(4.64);
 const [renewWorking,setRenewWorking]=useState(600);
 const [selic,setSelic]=useState(14);
 const [cdi,setCdi]=useState(13.9);
 const [ir,setIr]=useState(15);
 const [bikeModel,setBikeModel]=useState("Yamaha Factor 150");
 const [plans,setPlans]=useState<Record<LocPlanKey,LocPlan>>(()=>({
   start:{...LOC_PLANS.start},premium:{...LOC_PLANS.premium},exclusive:{...LOC_PLANS.exclusive}
 }));
 const [manualPlan,setManualPlan]=useState<LocPlanKey>("exclusive");
 const [manualQty,setManualQty]=useState(6);

 const result=useMemo(()=>calculateLocInvest(capital,workingPerBike,plans),[capital,workingPerBike,plans]);
 const projection=useMemo(()=>projectLocInvest(capital,ipca,renewWorking,plans),[capital,ipca,renewWorking,plans]);
 const compare=useMemo(()=>compareLocInvest(capital,selic,cdi,ir,plans,workingPerBike),[capital,selic,cdi,ir,plans,workingPerBike]);
 const eligible=useMemo(()=>enumeratePackages(capital,plans),[capital,plans]);

 const manualCfg=plans[manualPlan];
 const setPlan=(key:LocPlanKey)=>{
   setManualPlan(key);
   const p=plans[key];
   setManualQty(q=>Math.min(p.max,Math.max(p.min,q)));
 };
 const setQty=(qty:number)=>{
   const q=Math.max(1,Math.round(qty||1));
   if(q<=2){setManualPlan("start");setManualQty(Math.min(2,q));}
   else if(q<=4){setManualPlan("premium");setManualQty(Math.max(3,q));}
   else {setManualPlan("exclusive");setManualQty(Math.min(6,Math.max(5,q)));}
 };

 const save=()=>{
   const details={
     qty:result.qty,
     model:bikeModel,
     assets:result.bikesValue,
     unitValue:result.qty?result.bikesValue/result.qty:0,
     roiAnnual:result.roiAnnual,
     plan:result.groups.map(g=>`${g.count}× ${g.label}`).join(" + "),
     workingCapital:result.working,
     fees:result.fees,
     appropriation:result.appropriation,
     gross:result.gross,
     operatingExpenses:result.op,
     insurance:result.insurance,
     accounting:result.accounting,
     netOperational:result.net,
     locagoraShare:result.locagora,
     cycle:"36 meses",
     horizon:"12 anos",
     notes:[
       `Modelo de moto definido pelo consultor: ${bikeModel}.`,
       "Renda tratada nesta simulação como líquida conforme condição comercial informada.",
       "Reajuste anual conforme IPCA projetado.",
       "Recebimento de referência a partir de 45 dias.",
       "Start não é combinado com Exclusive na composição automática."
     ]
   };
   onSave({
     id:Date.now(),
     name:`LocInvest — ${result.qty} motos`,
     sourceRoute:"locinvest",
     capital:result.invested,
     monthly:result.monthly,
     annual:result.annual,
     details,
     updatedAt:new Date().toISOString()
   });
 };

 return <div className="locinvest">
   <div className="calculatorHero">
     <div><small>LOCAGORA • LOCINVEST</small><h2>Transforme capital em renda mensal.</h2><p>Composição inteligente por capital disponível, renda líquida, frota, giro e projeção em 12 anos.</p></div>
     <div className="miniMetrics"><div><span>Horizonte</span><b>12 anos</b></div><div><span>Renda</span><b>Líquida</b></div><div><span>Renovação</span><b>36 meses</b></div></div>
   </div>

   <div className="calcLayout">
    <section className="panel">
      <div className="sectionHead"><small>CONFIGURAÇÃO</small><h2>Quanto o cliente deseja investir?</h2></div>
      <div className="formGrid">
        <label>Capital disponível<input type="number" value={capital||""} onChange={e=>setCapital(Number(e.target.value))}/></label>
        <label>Capital de giro / moto<input type="number" value={workingPerBike} onChange={e=>setWorkingPerBike(Number(e.target.value))}/></label>
      </div>
      <div className="quickValues">{[70000,130000,300000,500000].map(v=><button key={v} className="secondary" onClick={()=>setCapital(v)}>{money(v).replace(",00","")}</button>)}</div>

      <div className="softBlock freeEditBlock">
        <div className="blockHead"><div><small>AJUSTE LIVRE DO CONSULTOR</small><h3>Valores comerciais do LocInvest</h3></div><span className="successBadge">EDITÁVEL</span></div>
        <div className="formGrid"><label>Tipo / modelo da moto<input value={bikeModel} onChange={e=>setBikeModel(e.target.value)}/></label><label>Capital de giro / moto<input type="number" value={workingPerBike} onChange={e=>setWorkingPerBike(Number(e.target.value)||0)}/></label></div>
        <div className="editablePlanGrid">{(Object.keys(plans) as LocPlanKey[]).map(key=>{const p=plans[key];return <div key={key} className="editablePlan"><b>{p.label}</b><label>Valor da moto<input type="number" value={p.bike} onChange={e=>setPlans(x=>({...x,[key]:{...x[key],bike:Number(e.target.value)||0}}))}/></label><label>Taxa ADM<select value={p.fee} onChange={e=>setPlans(x=>({...x,[key]:{...x[key],fee:Number(e.target.value)||0}}))}>{p.fees.map((fee,i)=><option key={fee+"-"+i} value={fee}>{money(fee)}</option>)}</select><small>Opções definidas pelo Administrador.</small></label><label>Rentabilidade / moto / mês<input type="number" value={p.income} onChange={e=>setPlans(x=>({...x,[key]:{...x[key],income:Number(e.target.value)||0}}))}/></label><label>Apropriação / moto<input type="number" value={p.appropriation} onChange={e=>setPlans(x=>({...x,[key]:{...x[key],appropriation:Number(e.target.value)||0}}))}/></label></div>})}</div>
        <div className="quickValues"><button type="button" className="secondary" onClick={()=>{setBikeModel("Yamaha Factor 150");setWorkingPerBike(600);setRenewWorking(600);setPlans({start:{...LOC_PLANS.start},premium:{...LOC_PLANS.premium},exclusive:{...LOC_PLANS.exclusive}})}}>Restaurar tabela padrão</button></div>
      </div>

      <div className="softBlock">
        <div className="blockHead"><div><small>COMPOSIÇÃO AUTOMÁTICA</small><h3>Melhor estrutura para o capital</h3></div><span className="successBadge">{result.qty?`${result.qty} MOTOS`:"SEM PLANO"}</span></div>
        {result.groups.length?result.groups.map(g=><div className="line" key={`${g.key}-${g.qty}`}><span>{g.count}× {g.label} ({g.count*g.qty} motos)</span><b>{money(g.count*g.cost)}</b></div>):<div className="empty">Nenhum LocInvest completo cabe no valor informado.</div>}
        <div className="line"><span>Valor usado nos planos</span><b>{money(result.invested)}</b></div>
        <div className="line"><span>Taxa ADM total</span><b>{money(result.fees)}</b></div>
        <div className="line"><span>Apropriação total</span><b>{money(result.appropriation)}</b></div>
        <div className="line"><span>Sobra do capital</span><b>{money(result.leftover)}</b></div>
        <div className="line"><span>Capital de giro necessário</span><b>{money(result.working)}</b></div>
        <div className="line"><span>Plano + giro</span><b>{money(result.totalWithWorking)}</b></div>
        <div className={result.workingGap>=0?"statusOk":"statusWarn"}>{result.workingGap>=0?`Capital de giro coberto. Restam ${money(result.workingGap)}.`:`Faltam ${money(Math.abs(result.workingGap))} para completar o giro.`}</div>
      </div>
    </section>

    <section className="panel resultPanel">
      <div className="sectionHead"><small>ESTRUTURA RECOMENDADA</small><h2>{result.groups.length?result.groups.map(g=>`${g.count}× ${g.label}`).join(" + "):"Capital insuficiente"}</h2></div>
      <div className="resultGrid">
        <div className="highlight"><span>Renda líquida mensal</span><b>{money(result.monthly)}</b><small>{result.qty} motos em operação</small></div>
        <div><span>Renda líquida anual</span><b>{money(result.annual)}</b><small>Ano 1</small></div>
        <div><span>ROI operacional</span><b>{pct(result.roiAnnual)}</b><small>Ano 1</small></div>
        <div><span>Total de motos</span><b>{result.qty}</b><small>na carteira</small></div>
        <div><span>Rentab. investimento total</span><b>{pct(result.rentMonthly)} a.m.</b><small>{pct(result.rentMonthly*12)} a.a.</small></div>
        <div><span>Rentab. valor em motos</span><b>{pct(result.bikeRentMonthly)} a.m.</b><small>{pct(result.bikeRentMonthly*12)} a.a.</small></div>
      </div>
      <div className="statusOk"><b>Imposto debitado na fonte.</b> A renda é apresentada como líquida conforme a condição comercial informada.</div>
    </section>
   </div>

   <section className="panel">
    <div className="sectionHead"><small>PLANOS</small><h2>Condições LocInvest</h2><p>Plano e quantidade continuam ligados entre si.</p></div>
    <div className="planCards">{(Object.keys(plans) as LocPlanKey[]).map(key=>{const p=plans[key];return <button key={key} className={manualPlan===key?"planCard selected":"planCard"} onClick={()=>setPlan(key)}>
       <small>{p.min}–{p.max} MOTOS</small><h3>{p.label}</h3><span>{money(p.bike)} / moto</span><b>{money(p.income)} / moto / mês</b><span>ADM selecionada {money(p.fee)}</span><small>{p.fees.map((f,i)=>`${money(f)}`).join(" • ")}</small><span>{p.appropriation?`Apropriação ${money(p.appropriation)} / moto`:"Apropriação isenta"}</span>
    </button>})}</div>
    <div className="manualRow"><label>Plano<select value={manualPlan} onChange={e=>setPlan(e.target.value as LocPlanKey)}>{(Object.keys(plans) as LocPlanKey[]).map(k=><option value={k} key={k}>{plans[k].label}</option>)}</select></label>
      <label>Quantidade<input type="number" min={1} max={6} value={manualQty} onChange={e=>setQty(Number(e.target.value))}/></label>
      <div><span>Configuração individual</span><b>{money(manualQty*manualCfg.bike+manualCfg.fee+manualQty*manualCfg.appropriation)}</b></div>
    </div>
   </section>

   <section className="panel">
    <div className="sectionHead"><small>OPÇÕES ELEGÍVEIS</small><h2>LocInvest individuais que cabem neste capital</h2></div>
    <div className="tableWrap"><table className="dataTable"><thead><tr><th>Plano</th><th>Motos</th><th>Investimento</th><th>Renda líquida/mês</th></tr></thead><tbody>
      {eligible.length?eligible.map(v=><tr key={`${v.key}-${v.qty}`}><td><b>{v.label}</b></td><td>{v.qty}</td><td>{money(v.cost)}</td><td>{money(v.monthly)}</td></tr>):<tr><td colSpan={4}>Nenhum plano completo disponível.</td></tr>}
    </tbody></table></div>
   </section>

   <div className="calcLayout">
    <section className="panel">
      <div className="sectionHead"><small>BASE ECONÔMICA</small><h2>Como a rentabilidade acontece</h2></div>
      <div className="line"><span>Faturamento bruto da locação</span><b>{money(result.gross)}</b></div>
      <div className="line"><span>Despesas operacionais</span><b>- {money(result.op)}</b></div>
      <div className="line"><span>Seguro</span><b>- {money(result.insurance)}</b></div>
      <div className="line"><span>Contabilidade</span><b>- {money(result.accounting)}</b></div>
      <div className="line"><span>Total de despesas</span><b>- {money(result.expenses)}</b></div>
      <div className="statusOk"><span>Lucro líquido operacional da frota</span><b>{money(result.net)}</b></div>
      <p className="footnote">Base unitária preservada do modelo atual: R$ 1.797,00 de faturamento, R$ 985,00 de despesas e R$ 812,00 de lucro líquido por moto.</p>
    </section>
    <section className="panel">
      <div className="sectionHead"><small>DISTRIBUIÇÃO</small><h2>Cenário simulado</h2></div>
      <div className="resultGrid two">
        <div className="highlight"><span>Investidor / mês</span><b>{money(result.monthly)}</b><small>{result.qty?money(result.monthly/result.qty):"—"} por moto</small></div>
        <div><span>Locagora / mês</span><b>{money(result.locagora)}</b><small>{result.qty?money(result.locagora/result.qty):"—"} por moto</small></div>
      </div>
      <div className="line"><span>% investidor do lucro líquido</span><b>{pct(result.net?result.monthly/result.net*100:0)}</b></div>
      <div className="line"><span>% Locagora do lucro líquido</span><b>{pct(result.net?result.locagora/result.net*100:0)}</b></div>
    </section>
   </div>

   <section className="panel">
    <div className="sectionHead"><small>VISÃO DE LONGO PRAZO</small><h2>Projeção financeira em 12 anos</h2></div>
    <div className="formGrid smallGrid"><label>IPCA projetado (% a.a.)<input type="number" step=".01" value={ipca} onChange={e=>setIpca(Number(e.target.value))}/></label><label>Giro na renovação / moto<input type="number" value={renewWorking} onChange={e=>setRenewWorking(Number(e.target.value))}/></label></div>
    <div className="summaryGrid"><div><span>Investimento inicial</span><b>{money(projection.initial)}</b></div><div><span>Renda acumulada</span><b className="green">{money(projection.accumulatedIncome)}</b></div><div><span>Devoluções brutas</span><b>{money(projection.accumulatedReturns)}</b></div><div><span>Total líquido após renovações</span><b>{money(projection.netAfterRenewals)}</b></div></div>
    <div className="tableWrap"><table className="dataTable"><thead><tr><th>Ano</th><th>Renda mensal</th><th>Renda anual</th><th>Devolução motos</th><th>Novas motos</th><th>Giro renovação</th><th>Fluxo</th><th>Acumulado</th></tr></thead><tbody>{projection.rows.map(r=><tr key={r.year}><td>{r.year}</td><td>{money(r.monthly)}</td><td>{money(r.annual)}</td><td>{money(r.returnBikes)}</td><td>{money(r.newFleet)}</td><td>{money(r.renewalWorking)}</td><td>{money(r.yearFlow)}</td><td>{money(r.accumulated)}</td></tr>)}</tbody></table></div>
    <p className="footnote">Anos 3, 6 e 9 representam renovação da frota. O ano 12 encerra o projeto sem nova aquisição.</p>
   </section>

   <section className="panel">
    <div className="sectionHead"><small>COMPARATIVO ILUSTRATIVO</small><h2>Compare o mesmo capital</h2></div>
    <div className="formGrid compareInputs"><label>Selic (% a.a.)<input type="number" step=".01" value={selic} onChange={e=>setSelic(Number(e.target.value))}/></label><label>CDI (% a.a.)<input type="number" step=".01" value={cdi} onChange={e=>setCdi(Number(e.target.value))}/></label><label>IR estimado renda fixa (%)<input type="number" step=".01" value={ir} onChange={e=>setIr(Number(e.target.value))}/></label></div>
    <div className="tableWrap"><table className="dataTable"><thead><tr><th>Cenário</th><th>Capital</th><th>Resultado anual estimado</th><th>Taxa líquida estimada</th></tr></thead><tbody>{compare.map(r=><tr key={r.label}><td>{r.label}</td><td>{money(r.capital)}</td><td>{money(r.annual)}</td><td>{pct(r.rate)}</td></tr>)}</tbody></table></div>
    <div className="statusWarn">Comparação meramente ilustrativa. Risco, liquidez, tributação e garantias são diferentes entre os produtos.</div>
   </section>

   <section className="nextBar">
      <button className="secondary" onClick={onBack}><ArrowLeft size={16}/> Voltar às soluções</button>
      <div><small>SIMULAÇÃO PRONTA</small><b>{result.qty} motos • {money(result.monthly)}/mês</b></div>
      <button className="primary" disabled={!result.qty} onClick={save}><CheckCircle2 size={17}/> {saveLabel||"Adicionar à projeção"} <ArrowRight size={16}/></button>
   </section>
 </div>
}
