"use client";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Network } from "lucide-react";
import { MASTER_REGIONAL, calculateMasterRegional, masterProjection, masterTerritoryCheck } from "@/lib/master-regional";
import type { Simulation } from "@/lib/types";
import TerritoryValidation from "@/components/TerritoryValidation";
import type { TerritoryResult } from "@/lib/territory";

const money=(n:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(n)||0);
const pct=(n:number)=>`${(Number(n)||0).toLocaleString("pt-BR",{minimumFractionDigits:1,maximumFractionDigits:1})}%`;

export default function MasterRegionalCalculator({
  initialCapital,onBack,onSave,saveLabel
}:{
  initialCapital:number;
  onBack:()=>void;
  onSave:(simulation:Simulation)=>void;
  saveLabel?:string;
}){
 const [region,setRegion]=useState("");
 const [population,setPopulation]=useState(0);
 const [investment,setInvestment]=useState(MASTER_REGIONAL.referenceInvestment);
 const [month,setMonth]=useState(24);
 const [customMonthly,setCustomMonthly]=useState(0);
 const [territoryOnline,setTerritoryOnline]=useState<TerritoryResult|null>(null);

 const territory=useMemo(()=>masterTerritoryCheck(region,population),[region,population]);
 const result=useMemo(()=>calculateMasterRegional(investment,month,customMonthly||undefined),[investment,month,customMonthly]);
 const projection=useMemo(()=>masterProjection(investment),[investment]);
 const capitalFit=initialCapital<=0||investment<=initialCapital;
 const canSave=territory.status==="preliminarily_eligible"&&territoryOnline?.status==="available";

 const save=()=>{
   if(!canSave)return;
   onSave({
     id:Date.now(),
     name:`Master Regional — ${region}`,
     sourceRoute:"master",
     capital:investment,
     monthly:result.monthlyRevenue,
     annual:result.annualRevenue,
     details:{
       qty:result.milestone.bikes,
       model:"Master Regional",
       assets:0,
       plan:"Master Regional",
       region,population,
       franchisees:result.milestone.franchisees,
       bikes:result.milestone.bikes,
       contractYears:MASTER_REGIONAL.contractYears,
       royaltiesPct:0,
       marketingPct:0,
       systemPct:0,
       roiAnnual:result.roiAnnual,
       paybackMonths:result.paybackMonths,
       notes:[
         "Investimento de referência: R$ 928 mil.",
         "Contrato de referência: 10 anos.",
         "Royalties, marketing e sistema: 0% no modelo atual.",
         "Metas operacionais: 30/50/80 franqueados em 6/12/24 meses.",
         "Território pré-validado contra a base operacional; aprovação final da gestão continua obrigatória."
       ]
     },
     updatedAt:new Date().toISOString()
   });
 };

 return <div className="masterModule">
   <section className="calculatorHero masterHero">
     <div><small>LOCAGORA • MASTER REGIONAL</small><h2>Estrutura regional para escalar uma rede inteira.</h2><p>Praças acima de 400 mil habitantes, metas de franqueados e motos, receitas regionais e horizonte contratual de 10 anos.</p></div>
     <div className="miniMetrics"><div><span>Investimento ref.</span><b>R$ 928 mil</b></div><div><span>Contrato</span><b>10 anos</b></div><div><span>Royalties</span><b>0%</b></div></div>
   </section>

   <div className="calcLayout">
     <section className="panel">
       <div className="sectionHead"><small>TERRITÓRIO</small><h2>Região pretendida</h2></div>
       <div className="formGrid">
         <label>Cidade / região<input value={region} placeholder="Ex.: Região Metropolitana de..." onChange={e=>setRegion(e.target.value)}/></label>
         <label>População estimada<input type="number" value={population||""} onChange={e=>setPopulation(Number(e.target.value)||0)}/></label>
       </div>
       <div className={territory.status==="preliminarily_eligible"?"statusOk":"statusWarn"}><MapPin size={16}/> <b>{territory.message}</b></div>
       <TerritoryValidation product="master" city={region} population={population} onValidated={setTerritoryOnline}/>
     </section>

     <section className="panel">
       <div className="sectionHead"><small>ESTRUTURA</small><h2>Investimento e cenário</h2></div>
       <div className="formGrid">
         <label>Investimento de referência<input type="number" value={investment} onChange={e=>setInvestment(Number(e.target.value)||MASTER_REGIONAL.referenceInvestment)}/></label>
         <label>Mês de referência<input type="number" min={6} max={24} value={month} onChange={e=>setMonth(Math.max(6,Math.min(24,Number(e.target.value)||24)))}/></label>
         <label className="wide">Receita mensal customizada (opcional)<input type="number" placeholder={money(result.milestone.monthlyRevenue)} value={customMonthly||""} onChange={e=>setCustomMonthly(Number(e.target.value)||0)}/></label>
       </div>
       {!capitalFit?<div className="statusWarn">O capital do perfil do cliente está abaixo do investimento informado.</div>:null}
     </section>
   </div>

   <section className="panel resultPanel">
     <div className="sectionHead"><small>CENÁRIO REGIONAL</small><h2>Mês {month}</h2></div>
     <div className="resultGrid">
       <div className="highlight"><span>Receita mensal estimada</span><b>{money(result.monthlyRevenue)}</b><small>cenário atual</small></div>
       <div><span>Receita anualizada</span><b>{money(result.annualRevenue)}</b><small>12 meses</small></div>
       <div><span>Franqueados</span><b>{result.milestone.franchisees}</b><small>estimativa interpolada</small></div>
       <div><span>Motos na rede</span><b>{result.milestone.bikes}</b><small>estimativa interpolada</small></div>
       <div><span>ROI anual simples</span><b>{pct(result.roiAnnual)}</b><small>sobre investimento</small></div>
       <div><span>Payback simples</span><b>{Number.isFinite(result.paybackMonths)?`${result.paybackMonths.toFixed(1).replace(".",",")} meses`:"—"}</b><small>pela receita mensal</small></div>
     </div>
   </section>

   <section className="panel">
     <div className="sectionHead"><small>MARCOS</small><h2>Metas de expansão regional</h2></div>
     <div className="tableWrap"><table className="dataTable"><thead><tr><th>Mês</th><th>Franqueados</th><th>Motos</th><th>Receita mensal</th><th>Anualizada</th><th>ROI a.a.</th><th>Payback</th></tr></thead><tbody>
       {projection.map(r=><tr key={r.month}><td><b>{r.month}</b></td><td>{r.franchisees}</td><td>{r.bikes}</td><td>{money(r.monthlyRevenue)}</td><td>{money(r.annualized)}</td><td>{pct(r.roiAnnual)}</td><td>{Number.isFinite(r.paybackMonths)?`${r.paybackMonths.toFixed(1).replace(".",",")} meses`:"—"}</td></tr>)}
     </tbody></table></div>
   </section>

   <section className="panel">
     <div className="sectionHead"><small>FONTES DE RECEITA</small><h2>Repasses e percentuais do modelo</h2></div>
     <div className="revenueRules">{MASTER_REGIONAL.revenueRules.map(r=><article key={r.label}><span>{r.label}</span><b>{r.value}</b></article>)}</div>
     <div className="statusOk"><Network size={16}/> <b>Master Regional:</b> royalties 0%, marketing 0% e sistema 0% conforme a premissa comercial atual.</div>
   </section>

   <section className="panel">
     <div className="sectionHead"><small>POSICIONAMENTO</small><h2>Elegibilidade regional</h2></div>
     <div className="summaryGrid"><div><span>População mínima</span><b>400 mil habitantes</b></div><div><span>Contrato</span><b>10 anos</b></div><div><span>Meta 24 meses</span><b>80 franqueados</b></div><div><span>Rede 24 meses</span><b>1.000 motos</b></div></div>
   </section>

   <section className="nextBar">
     <button className="secondary" onClick={onBack}><ArrowLeft size={16}/> Voltar às soluções</button>
     <div><small>MASTER REGIONAL</small><b>{region||"Território pendente"} • {money(result.monthlyRevenue)}/mês</b></div>
     <button className="primary" disabled={!canSave} onClick={save}><CheckCircle2 size={17}/> {saveLabel||"Adicionar à projeção"} <ArrowRight size={16}/></button>
   </section>
 </div>
}
