"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { NATIONAL_FRANCHISE, calculateNationalFranchise, calculateNationalMonthly } from "@/lib/franquia-nacional";
import { projectFranchiseDreEvolution, franchiseDreSnapshot, type FranchiseDreMode } from "@/lib/franchise-dre-evolution";
import { loadMotorcycles, motorcycleIntermediationBRL, motorcyclePriceBRL, type Motorcycle } from "@/lib/motorcycle-catalog";
import FranchiseDrePlanner from "./FranchiseDrePlanner";
import type { Simulation } from "@/lib/types";

const money=(n:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(n)||0);
const pct=(n:number)=>`${(Number(n)||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}%`;

export default function FranquiaNacionalCalculator({initialCapital,onBack,onSave,saveLabel}:{initialCapital:number;onBack:()=>void;onSave:(simulation:Simulation)=>void;saveLabel?:string;}){
 const [qty,setQty]=useState(6);
 const [fee,setFee]=useState<number>(NATIONAL_FRANCHISE.feeOptions[0]);
 const [bikes,setBikes]=useState<Motorcycle[]>([]);
 const [bikeId,setBikeId]=useState("");
 const [bikeModel,setBikeModel]=useState("Frota Nacional");
 const [bikeValue,setBikeValue]=useState(NATIONAL_FRANCHISE.bikeValue);
 const [intermediation,setIntermediation]=useState(NATIONAL_FRANCHISE.intermediationPerBike);
 const [working,setWorking]=useState(600);
 const [dreMode,setDreMode]=useState<FranchiseDreMode>("static");
 const [balancedPct,setBalancedPct]=useState(50);
 const [includeDreInProposal,setIncludeDreInProposal]=useState(false);
 useEffect(()=>{void loadMotorcycles("brazil").then(rows=>{setBikes(rows);if(rows.length){const m=rows[0];setBikeId(m.id);setBikeModel(m.display_name);setBikeValue(motorcyclePriceBRL(m,1));setIntermediation(motorcycleIntermediationBRL(m,1));}})},[]);
 const chooseBike=(id:string)=>{setBikeId(id);const m=bikes.find(x=>x.id===id);if(m){setBikeModel(m.display_name);setBikeValue(motorcyclePriceBRL(m,1));setIntermediation(motorcycleIntermediationBRL(m,1));}};
 const result=useMemo(()=>calculateNationalFranchise(qty,fee,working,bikeValue,intermediation),[qty,fee,working,bikeValue,intermediation]);
 const month1=useMemo(()=>calculateNationalMonthly(qty,1),[qty]);
 const month7=useMemo(()=>calculateNationalMonthly(qty,7),[qty]);
 const month13=useMemo(()=>calculateNationalMonthly(qty,13),[qty]);
 const month25=useMemo(()=>calculateNationalMonthly(qty,25),[qty]);
 const incrementalBikeCost=Math.max(1,bikeValue+intermediation+working);
 const dreEvolution=useMemo(()=>projectFranchiseDreEvolution({initialAssets:qty,unitAssetCost:incrementalBikeCost,horizonMonths:36,mode:dreMode,balancedReinvestPct:balancedPct,netForAssets:(assets,month)=>calculateNationalMonthly(assets,month).net}),[qty,incrementalBikeCost,dreMode,balancedPct]);
 const capitalFit=initialCapital<=0||result.investment.total<=initialCapital;
 const save=()=>onSave({id:Date.now(),name:`Franquia Nacional Exclusive — ${qty} motos`,sourceRoute:"franq-n",capital:result.investment.total,monthly:result.avgMonthly,annual:result.avgMonthly*12,details:{qty,model:bikeModel,motorcycleId:bikeId||undefined,unitValue:bikeValue,assets:result.investment.bikes,plan:"Franquia Nacional Exclusive",franchiseFee:fee,intermediation:result.investment.intermediation,intermediationPerBike:intermediation,workingCapital:result.investment.working,sale36:result.sale36,operating36:result.operating36,roi36:result.roi36,paybackMonths:result.payback,cycle:"36 meses",dreIncludeInProposal:includeDreInProposal,dreMode,dreReinvestPct:dreEvolution.reinvestPct,dreAssetUnitCost:incrementalBikeCost,dreEvolution:franchiseDreSnapshot(dreEvolution),notes:["Moto e taxa de intermediação importadas do catálogo central administrado.","Sem comissão comercial no cálculo.","Royalty de 6% calculado sobre a receita de locação.","Manutenção cresce por faixa ao longo dos 36 meses.","Venda de referência ao mês 36: R$ 17 mil por moto.","DRE de evolução é um cenário operacional opcional; não constitui garantia ou recomendação financeira individual."]},updatedAt:new Date().toISOString()});
 return <div className="franchiseModule">
   <section className="calculatorHero franchiseHero"><div><small>LOCAGORA • FRANQUIA NACIONAL EXCLUSIVE</small><h2>Operação de franquia com DRE mês a mês.</h2><p>Taxa de franquia, frota, intermediação, capital de giro, custos operacionais e evolução opcional dos ativos.</p></div><div className="miniMetrics"><div><span>Frota</span><b>{qty} motos</b></div><div><span>Ciclo</span><b>36 meses</b></div><div><span>DRE</span><b>3 cenários</b></div></div></section>
   <div className="calcLayout">
    <section className="panel"><div className="sectionHead"><small>INVESTIMENTO</small><h2>Configuração da unidade</h2></div><div className="formGrid">
      <label>Quantidade de motos<input type="number" min={1} max={30} value={qty} onChange={e=>setQty(Math.max(1,Math.round(Number(e.target.value)||1)))}/></label>
      <label>Taxa de franquia<select value={fee} onChange={e=>setFee(Number(e.target.value)||0)}>{NATIONAL_FRANCHISE.feeOptions.map((f,i)=><option key={f+"-"+i} value={f}>{money(f)}</option>)}</select><small>Opções publicadas pelo Administrador.</small></label>
      <label>Moto da operação{bikes.length?<select value={bikeId} onChange={e=>chooseBike(e.target.value)}>{bikes.map(m=><option key={m.id} value={m.id}>{m.display_name} • {m.currency} {Number(m.base_price).toLocaleString("pt-BR")}</option>)}</select>:<input value={bikeModel} onChange={e=>setBikeModel(e.target.value)}/>}<small>{bikes.length?"Somente motos ATIVAS para Brasil aparecem aqui.":"Nenhuma moto Brasil publicada; usando configuração de contingência."}</small></label>
      <label>Preço base da moto<input type="number" value={bikeValue} readOnly={bikes.length>0} onChange={e=>setBikeValue(Number(e.target.value)||0)}/></label>
      <label>Taxa de intermediação / moto<input type="number" value={intermediation} readOnly={bikes.length>0} onChange={e=>setIntermediation(Number(e.target.value)||0)}/></label>
      <label>Capital de giro por moto<input type="number" value={working} onChange={e=>setWorking(Number(e.target.value)||0)}/></label>
    </div><div className="line"><span>Taxa de franquia</span><b>{money(result.investment.fee)}</b></div><div className="line"><span>Motos</span><b>{money(result.investment.bikes)}</b></div><div className="line"><span>Intermediação</span><b>{money(result.investment.intermediation)}</b></div><div className="line"><span>Capital de giro</span><b>{money(result.investment.working)}</b></div><div className="statusOk"><span>Investimento total</span><b>{money(result.investment.total)}</b></div>{!capitalFit?<div className="statusWarn">O capital informado no perfil do cliente está abaixo desta configuração.</div>:null}</section>
    <section className="panel resultPanel"><div className="sectionHead"><small>RESULTADO</small><h2>Visão de 36 meses sem reaplicação</h2></div><div className="resultGrid"><div className="highlight"><span>Lucro operacional 36m</span><b>{money(result.operating36)}</b><small>antes da venda</small></div><div><span>Venda das motos</span><b>{money(result.sale36)}</b><small>mês 36</small></div><div><span>Total 36 meses</span><b>{money(result.total36)}</b><small>operacional + venda</small></div><div><span>Média mensal operacional</span><b>{money(result.avgMonthly)}</b><small>36 meses</small></div><div><span>ROI 36 meses</span><b>{pct(result.roi36)}</b></div><div><span>Payback simples</span><b>{Number.isFinite(result.payback)?`${result.payback.toFixed(1).replace(".",",")} meses`:"—"}</b></div></div></section>
   </div>
   <FranchiseDrePlanner projection={dreEvolution} mode={dreMode} onModeChange={setDreMode} balancedPct={balancedPct} onBalancedPctChange={setBalancedPct} includeInProposal={includeDreInProposal} onIncludeInProposal={setIncludeDreInProposal}/>
   <section className="panel"><div className="sectionHead"><small>DRE POR FASE</small><h2>Operação sem evolução de ativos</h2><p>Esta tabela preserva a leitura do DRE original, com a frota inicial fixa.</p></div><div className="tableWrap"><table className="dataTable"><thead><tr><th>Período</th><th>Manutenção/moto</th><th>Financeiro/moto</th><th>Lucro mensal</th><th>Lucro no período</th></tr></thead><tbody>{result.dre.map(r=><tr key={r.period}><td><b>{r.period}</b></td><td>{money(r.maintenancePerBike)}</td><td>{money(r.financialPerBike)}</td><td>{money(r.netMonthly)}</td><td>{money(r.netPeriod)}</td></tr>)}</tbody></table></div></section>
   <section className="panel"><div className="sectionHead"><small>DRE DETALHADO</small><h2>Meses de referência</h2></div><div className="referenceGrid">{[["Mês 1",month1],["Mês 7",month7],["Mês 13",month13],["Mês 25",month25]].map(([label,row]:any)=><article key={label}><small>{label}</small><h3>{money(row.net)}</h3><div className="line"><span>Receita</span><b>{money(row.revenue)}</b></div><div className="line"><span>Proteção</span><b>- {money(row.protection)}</b></div><div className="line"><span>Manutenção</span><b>- {money(row.maintenance)}</b></div><div className="line"><span>Operação</span><b>- {money(row.operation)}</b></div><div className="line"><span>Royalties</span><b>- {money(row.royalties)}</b></div><div className="line"><span>Financeiro</span><b>- {money(row.financial)}</b></div><div className="line"><span>Marketing + sistema</span><b>- {money(row.marketing+row.system)}</b></div><div className="line"><span>Contabilidade</span><b>- {money(row.accounting)}</b></div><div className="line"><span>Tributos</span><b>- {money(row.taxes)}</b></div></article>)}</div></section>
   <section className="nextBar"><button className="secondary" onClick={onBack}><ArrowLeft size={16}/> Voltar às soluções</button><div><small>FRANQUIA NACIONAL</small><b>{qty} motos • {money(result.avgMonthly)}/mês médio</b></div><button className="primary" onClick={save}><CheckCircle2 size={17}/> {saveLabel||"Adicionar à projeção"} <ArrowRight size={16}/></button></section>
 </div>;
}
