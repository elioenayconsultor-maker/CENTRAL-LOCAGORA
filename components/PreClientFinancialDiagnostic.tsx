"use client";

import { ArrowLeft, ArrowRight, BarChart3, Clock3, Gauge, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import type { ComparisonSnapshot, Simulation } from "@/lib/types";
import CapitalOpportunityComparator from "./CapitalOpportunityComparator";
import styles from "./PreClientFinancialDiagnostic.module.css";

const money=(v:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(v)||0);
const pct=(v:number)=>`${(Number(v)||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}%`;

export default function PreClientFinancialDiagnostic({simulation,onBack,onContinue}:{simulation:Simulation;onBack:()=>void;onContinue:(snapshot:ComparisonSnapshot|null)=>void}){
  const [selected,setSelected]=useState<ComparisonSnapshot|null>(null);
  const metrics=useMemo(()=>{
    const capital=Math.max(0,Number(simulation.capital)||0);
    const monthly=Math.max(0,Number(simulation.monthly)||0);
    const annual=Number(simulation.annual)||monthly*12;
    const monthlyReturn=capital>0?monthly/capital*100:0;
    const annualReturn=capital>0?annual/capital*100:0;
    const paybackMonths=monthly>0?capital/monthly:null;
    const details=(simulation.details||{}) as Record<string,unknown>;
    const gross=Number(details.gross||0);
    const explicitExpenses=Number(details.expenses||0);
    const composedExpenses=Number(details.operatingExpenses||0)+Number(details.insurance||0)+Number(details.accounting||0);
    const expenses=explicitExpenses||composedExpenses;
    const breakEvenValue=gross>0&&expenses>0?expenses:null;
    const marginOfSafety=gross>0&&expenses>0?Math.max(0,(gross-expenses)/gross*100):null;
    return {capital,monthly,annual,monthlyReturn,annualReturn,paybackMonths,breakEvenValue,marginOfSafety};
  },[simulation]);
  const continueFlow=()=>{localStorage.setItem("locagora_preclient_diagnostic",JSON.stringify({simulation,comparison:selected,createdAt:new Date().toISOString()}));onContinue(selected)};

  return <main className={`workspace ${styles.workspace}`}>
    <section className={styles.hero}><div><small>V9.3.3 • DIAGNÓSTICO FINANCEIRO PRÉ-CLIENTE</small><h1>Visão completa antes do cadastro do cliente</h1><p>Analise o modelo, rentabilidade, payback, ponto de equilíbrio operacional e alternativas de capital antes de iniciar o atendimento nominal.</p></div><button className="secondary" onClick={onBack}><ArrowLeft size={16}/> Voltar à simulação</button></section>
    <section className={styles.metrics}><article><TrendingUp/><span>Rentabilidade mensal</span><b>{pct(metrics.monthlyReturn)}</b><small>{money(metrics.monthly)} de renda/mês</small></article><article><BarChart3/><span>Rentabilidade anual simples</span><b>{pct(metrics.annualReturn)}</b><small>{money(metrics.annual)} no ano 1</small></article><article><Clock3/><span>Payback estimado</span><b>{metrics.paybackMonths?`${metrics.paybackMonths.toLocaleString("pt-BR",{maximumFractionDigits:1})} meses`:"N/D"}</b><small>Capital alocado ÷ renda mensal, sem reinvestimento.</small></article><article><Gauge/><span>Break-even operacional</span><b>{metrics.breakEvenValue?money(metrics.breakEvenValue):"N/D"}</b><small>{metrics.marginOfSafety!=null?`Margem de segurança estimada: ${pct(metrics.marginOfSafety)}`:"Exige receita e custos operacionais detalhados no produto."}</small></article></section>
    <section className={`panel ${styles.readout}`}><div><span>Capital efetivamente alocado</span><b>{money(metrics.capital)}</b></div><div><span>Renda mensal simulada</span><b>{money(metrics.monthly)}</b></div><div><span>Produto/modelo</span><b>{simulation.name}</b></div></section>
    <section className={`panel ${styles.comparator}`}><div className="sectionHead"><small>COMPARAÇÃO DE OPORTUNIDADES</small><h2>Mesmo capital, mesmo horizonte</h2><p>As referências abaixo usam as premissas publicadas no sistema. Selecione um cenário para levá-lo ao atendimento.</p></div><CapitalOpportunityComparator embedded simulation={simulation} selected={selected} onSelect={setSelected}/></section>
    <section className={styles.next}><div><b>Diagnóstico pronto</b><span>O cadastro do cliente só será solicitado a partir do próximo passo.</span></div><button className="primary" onClick={continueFlow}>Cliente interessado • continuar <ArrowRight size={16}/></button></section>
  </main>;
}
