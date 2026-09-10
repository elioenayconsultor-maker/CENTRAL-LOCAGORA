"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Calculator, CheckCircle2, Info, RefreshCw, Scale, Sparkles } from "lucide-react";
import { DEFAULT_BENCHMARKS, projectAnnualRate, projectLocagora, type CapitalBenchmark } from "@/lib/capital-comparator";
import { createClient } from "@/lib/supabase/client";
import styles from "./CapitalOpportunityComparator.module.css";

const money=(v:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(Number(v)||0);
const numberBR=(v:number)=>new Intl.NumberFormat("pt-BR",{maximumFractionDigits:0}).format(Number(v)||0);
const parseBR=(v:string)=>Number(String(v||"").replace(/\D/g,""))||0;
const pct=(v:number)=>`${(Number(v)||0).toFixed(2).replace(".",",")}%`;
const STORAGE="locagora_capital_comparator_v2";
type JourneySeed={capital:number;monthly:number;product:string};
type RateRow={reference_key:string;annual_rate:number;tax_on_gain:number;label:string;source_label?:string|null;source_url?:string|null};

function readJourneySeed():JourneySeed|null{try{const raw=localStorage.getItem("locagora_commercial_state_v2");if(!raw)return null;const state=JSON.parse(raw);const sims=Array.isArray(state?.simulations)?state.simulations:[];const sim=sims.find((x:any)=>x?.id&&x.id===state?.activeSimulationId)||sims.at(-1);if(!sim)return null;const capital=Number(sim.capital||sim.inputs?.capital||0),monthly=Number(sim.monthly||sim.outputs?.monthly||0);if(!(capital>0&&monthly>=0))return null;return{capital,monthly,product:String(sim.productName||sim.product_name||sim.name||state?.selectedProductRoute||"Locagora")}}catch{return null}}

export default function CapitalOpportunityComparator(){
 const supabase=useMemo(()=>createClient(),[]);
 const [capital,setCapital]=useState(100000);const [monthly,setMonthly]=useState(0);const [product,setProduct]=useState("Cenário Locagora");const [months,setMonths]=useState(36);const [reinvest,setReinvest]=useState(false);const [benchmarks,setBenchmarks]=useState<CapitalBenchmark[]>(DEFAULT_BENCHMARKS);const [seeded,setSeeded]=useState(false);const [rateStatus,setRateStatus]=useState("Carregando referências...");
 function patch(id:string,next:Partial<CapitalBenchmark>){setBenchmarks(v=>v.map(x=>x.id===id?{...x,...next}:x))}
 async function refreshRates(){setRateStatus("Atualizando referências...");try{
   const {data:manual}=await supabase.from("commercial_capital_reference_rates").select("reference_key,annual_rate,tax_on_gain,label,source_label,source_url").eq("active",true);
   const res=await fetch("/api/market-reference-rates",{cache:"no-store"});const live=await res.json();
   setBenchmarks(prev=>prev.map(b=>{const db=(manual as RateRow[]||[]).find(x=>x.reference_key===b.id);let annual=db?.annual_rate??b.annualRate;let tax=db?.tax_on_gain??b.taxOnGain;if(b.id==="cdi-cdb"&&Number(live?.cdi?.annualRate)>0)annual=Number(live.cdi.annualRate);if(b.id==="tesouro-selic"&&Number(live?.selic?.annualRate)>0)annual=Number(live.selic.annualRate);return{...b,annualRate:Number(annual)||0,taxOnGain:Number(tax)||0}}));
   setRateStatus(`Atualizado ${new Date().toLocaleString("pt-BR")}`);
 }catch{setRateStatus("Não foi possível atualizar agora; mantendo as últimas premissas salvas.")}}
 useEffect(()=>{try{const saved=localStorage.getItem(STORAGE);if(saved){const x=JSON.parse(saved);if(x?.benchmarks)setBenchmarks(x.benchmarks);if(x?.months)setMonths(x.months);if(typeof x?.reinvest==="boolean")setReinvest(x.reinvest)}}catch{}const seed=readJourneySeed();if(seed){setCapital(seed.capital);setMonthly(seed.monthly);setProduct(seed.product);setSeeded(true)}void refreshRates()},[]);
 useEffect(()=>{try{localStorage.setItem(STORAGE,JSON.stringify({benchmarks,months,reinvest}))}catch{}},[benchmarks,months,reinvest]);
 const loc=useMemo(()=>projectLocagora(capital,monthly,months,reinvest),[capital,monthly,months,reinvest]);const rows=useMemo(()=>benchmarks.filter(x=>x.enabled).map(x=>({...x,projection:projectAnnualRate(capital,x.annualRate,x.taxOnGain,months)})),[benchmarks,capital,months]);const best=Math.max(loc.netGain,...rows.map(x=>x.projection.netGain),0);const simpleAnnual=capital>0?(monthly*12/capital)*100:0;
 function importJourney(){const seed=readJourneySeed();if(!seed)return;setCapital(seed.capital);setMonthly(seed.monthly);setProduct(seed.product);setSeeded(true)}
 return <main className={styles.workspace}>
  <section className={styles.hero}><div><small>V9.3 • INTELIGÊNCIA FINANCEIRA</small><h1>Comparador de Oportunidades de Capital</h1><p>Compare o cenário Locagora com referências financeiras e patrimoniais usando o mesmo capital e horizonte.</p></div><div className={styles.heroBadge}><Scale/><span><b>Comparação assistida</b><small>Premissas visíveis e editáveis</small></span></div></section>
  <section className={styles.notice}><Info/><div><b>Ferramenta comercial de comparação, não recomendação de investimento.</b><span>CDI e Selic são carregados de fonte pública do Banco Central. IPCA+, FII e imóvel usam premissas publicadas pelo ADM e permanecem editáveis.</span></div></section>
  <section className={styles.inputGrid}>
   <label><span>Capital comparado</span><input type="text" inputMode="numeric" value={numberBR(capital)} onChange={e=>setCapital(parseBR(e.target.value))}/></label>
   <label><span>Renda mensal Locagora</span><input type="text" inputMode="numeric" value={numberBR(monthly)} onChange={e=>setMonthly(parseBR(e.target.value))}/></label>
   <label><span>Horizonte</span><select value={months} onChange={e=>setMonths(Number(e.target.value))}><option value={12}>12 meses</option><option value={24}>24 meses</option><option value={36}>36 meses</option><option value={60}>60 meses</option><option value={120}>120 meses</option></select></label>
   <label className={styles.toggle}><span>Reinvestir renda Locagora</span><input type="checkbox" checked={reinvest} onChange={e=>setReinvest(e.target.checked)}/><i/></label>
   <button className={styles.importBtn} type="button" onClick={importJourney}><RefreshCw/> Usar simulação da Jornada</button>
  </section>
  <section className={styles.locCard}><div className={styles.locHead}><div><small>CENÁRIO LOCAGORA {seeded?"• IMPORTADO DA JORNADA":""}</small><h2>{product}</h2></div><Sparkles/></div><div className={styles.metrics}><div><span>Capital</span><b>{money(capital)}</b></div><div><span>Renda mensal</span><b>{money(monthly)}</b></div><div><span>Retorno anual simples</span><b>{pct(simpleAnnual)}</b></div><div><span>Resultado em {months} meses</span><b>{money(loc.netGain)}</b></div></div><p>{reinvest?"Cenário hipotético com reinvestimento mensal.":"Cenário de renda distribuída, sem reinvestimento. O capital-base é preservado apenas para efeito comparativo."}</p></section>
  <section className={styles.benchSection}><div className={styles.sectionHead}><div><small>PREMISSAS EXTERNAS</small><h2>Referências para comparação</h2><p className={styles.rateStatus}>{rateStatus}</p></div><button className={styles.refreshRates} type="button" onClick={()=>void refreshRates()}><RefreshCw/> Atualizar referências</button></div><div className={styles.benchmarkGrid}>{benchmarks.map(b=><article key={b.id} className={!b.enabled?styles.disabled:""}><div className={styles.cardTitle}><label className={styles.check}><input type="checkbox" checked={b.enabled} onChange={e=>patch(b.id,{enabled:e.target.checked})}/><CheckCircle2/></label><b>{b.label}</b></div><label><span>Retorno estimado (% a.a.)</span><input type="number" step="0.01" value={b.annualRate} onChange={e=>patch(b.id,{annualRate:Number(e.target.value)})}/></label><label><span>IR sobre ganho (%)</span><input type="number" min="0" max="100" step="0.5" value={b.taxOnGain} onChange={e=>patch(b.id,{taxOnGain:Number(e.target.value)})}/></label></article>)}</div></section>
  <section className={styles.results}><div className={styles.sectionHead}><div><small>RESULTADO COMPARATIVO</small><h2>Mesmo capital • mesmo horizonte</h2></div><ArrowUpRight/></div><div className={styles.tableWrap}><table><thead><tr><th>Oportunidade</th><th>Premissa</th><th>Ganho líquido/projetado</th><th>Valor econômico ao fim</th><th>Média/mês</th></tr></thead><tbody><tr className={loc.netGain===best?styles.best:""}><td><b>{product}</b><small>Locagora</small></td><td>{money(monthly)}/mês</td><td>{money(loc.netGain)}</td><td>{money(loc.finalValue)}</td><td>{money(loc.monthlyEquivalent)}</td></tr>{rows.map(r=><tr key={r.id} className={r.projection.netGain===best?styles.best:""}><td><b>{r.label}</b><small>Referência automática/editável</small></td><td>{pct(r.annualRate)} a.a. • IR {pct(r.taxOnGain)}</td><td>{money(r.projection.netGain)}</td><td>{money(r.projection.finalValue)}</td><td>{money(r.projection.monthlyEquivalent)}</td></tr>)}</tbody></table></div><div className={styles.footnote}>Maior resultado matemático não significa automaticamente melhor investimento. Liquidez, risco, garantias, volatilidade, tributação e natureza do ativo precisam ser avaliados separadamente.</div></section>
 </main>
}
