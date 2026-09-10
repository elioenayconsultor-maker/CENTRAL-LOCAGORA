"use client";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Plus, Trash2, Users } from "lucide-react";
import { LOCMILLION, calculateLocMillion, locMillionFundingStatus, projectLocMillion, splitLocMillion } from "@/lib/locmillion";
import type { Simulation } from "@/lib/types";

const money=(n:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(n)||0);
const pct=(n:number)=>`${(Number(n)||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}%`;

type InvestorInput={id:number;name:string;contribution:number};

export default function LocMillionCalculator({
  onBack,onSave,saveLabel
}:{
  initialCapital:number;
  onBack:()=>void;
  onSave:(simulation:Simulation)=>void;
  saveLabel?:string;
}){
 const [groupMode,setGroupMode]=useState(false);
 const [peopleCount,setPeopleCount]=useState(2);
 const [investors,setInvestors]=useState<InvestorInput[]>([{id:1,name:"Investidor 1",contribution:1000000}]);
 const [ipca,setIpca]=useState(4.64);

 const funding=useMemo(()=>locMillionFundingStatus(investors),[investors]);
 const split=useMemo(()=>splitLocMillion(investors),[investors]);
 const projection=useMemo(()=>projectLocMillion(ipca),[ipca]);
 const totalScenario=calculateLocMillion(1000000);

 const update=(id:number,patch:Partial<InvestorInput>)=>setInvestors(xs=>xs.map(x=>x.id===id?{...x,...patch}:x));
 const add=()=>setInvestors(xs=>[...xs,{id:Date.now(),name:`Investidor ${xs.length+1}`,contribution:0}]);
 const setPeople=(count:number)=>{const n=Math.max(2,Math.min(20,Math.round(Number(count)||2)));setPeopleCount(n);const each=LOCMILLION.total/n;setInvestors(Array.from({length:n},(_,i)=>({id:Date.now()+i,name:`Investidor ${i+1}`,contribution:each})));};
 const setShare=(id:number,pctValue:number)=>update(id,{contribution:LOCMILLION.total*Math.max(0,Math.min(100,Number(pctValue)||0))/100});
 const remove=(id:number)=>setInvestors(xs=>xs.length>1?xs.filter(x=>x.id!==id):xs);
 const setMode=(group:boolean)=>{
   setGroupMode(group);
   if(!group)setInvestors([{id:Date.now(),name:"Investidor principal",contribution:1000000}]);
   else {setPeopleCount(2);setInvestors([{id:Date.now(),name:"Investidor 1",contribution:500000},{id:Date.now()+1,name:"Investidor 2",contribution:500000}]);}
 };

 const save=()=>{
   if(!funding.complete)return;
   onSave({
     id:Date.now(),
     name:`LocMillion — ${groupMode?`${investors.length} investidores`:"Projeto integral"}`,
     sourceRoute:"locmillion",
     capital:LOCMILLION.total,
     monthly:LOCMILLION.monthly,
     annual:LOCMILLION.monthly*12,
     details:{
       qty:LOCMILLION.bikes,
       model:LOCMILLION.bikeModel,
       unitValue:LOCMILLION.unitValue,
       assets:LOCMILLION.assetBase,
       admFee:LOCMILLION.adm,
       activation:LOCMILLION.activation,
       roiAnnual:30,
       plan:"LocMillion",
       cycle:"36 meses",
       contract:"12 anos",
       groupMode,
       peopleCount:investors.length,
       investors:split,
       notes:[
         "Investimento total de R$ 1.000.000.",
         "R$ 900 mil correspondem a 45 Yamaha Factor 150, a R$ 20 mil por unidade.",
         "R$ 50 mil de taxa administrativa e R$ 50 mil de estrutura/implantação.",
         "Renda mensal de referência de R$ 25 mil.",
         "Ciclo contratual de liquidez/renovação a cada 36 meses; condições e valores efetivos seguem o instrumento contratual vigente."
       ]
     },
     updatedAt:new Date().toISOString()
   });
 };

 return <div className="locmillionModule">
  <section className="calculatorHero millionHero">
    <div><small>LOCAGORA • LOCMILLION</small><h2>Um projeto de R$ 1 milhão estruturado em ativos e renda recorrente.</h2><p>45 motos, participação individual ou em grupo, renda proporcional e eventos de liquidez a cada 36 meses.</p></div>
    <div className="miniMetrics"><div><span>Projeto</span><b>R$ 1 milhão</b></div><div><span>Frota</span><b>45 motos</b></div><div><span>Renda</span><b>R$ 25 mil/mês</b></div></div>
  </section>

  <section className="panel">
    <div className="sectionHead"><small>ESTRUTURA DO PROJETO</small><h2>Composição do R$ 1 milhão</h2></div>
    <div className="summaryGrid"><div><span>Ativos / motos</span><b>{money(LOCMILLION.assetBase)}</b></div><div><span>Taxa ADM</span><b>{money(LOCMILLION.adm)}</b></div><div><span>Estrutura / implantação</span><b>{money(LOCMILLION.activation)}</b></div><div><span>Total</span><b>{money(LOCMILLION.total)}</b></div></div>
    <div className="resultGrid">
      <div className="highlight"><span>Renda mensal</span><b>{money(totalScenario.monthly)}</b><small>projeto integral</small></div>
      <div><span>Renda anual</span><b>{money(totalScenario.annual)}</b><small>simples</small></div>
      <div><span>ROI mensal</span><b>{pct(totalScenario.roiMonthly)}</b><small>sobre R$ 1 milhão</small></div>
      <div><span>ROI anual</span><b>{pct(totalScenario.roiAnnual)}</b><small>simples</small></div>
      <div><span>Renda em 36 meses</span><b>{money(totalScenario.income36)}</b><small>sem reajuste</small></div>
      <div><span>Base de ativos</span><b>{money(totalScenario.assetRepurchase36)}</b><small>45 Yamaha Factor 150</small></div>
    </div>
  </section>

  <section className="panel">
    <div className="sectionHead"><small>FORMA DE PARTICIPAÇÃO</small><h2>Integral ou em grupo</h2></div>
    <div className="modeSwitch">
      <button className={!groupMode?"selected":""} onClick={()=>setMode(false)}><Users size={18}/><span><b>Investidor único</b><small>100% do projeto</small></span></button>
      <button className={groupMode?"selected":""} onClick={()=>setMode(true)}><Users size={18}/><span><b>Grupo de investidores</b><small>Participação proporcional</small></span></button>
    </div>

    <div className="formGrid smallGrid" style={{marginTop:14}}>{groupMode&&<label>Quantidade de pessoas<input type="number" min={2} max={20} value={peopleCount} onChange={e=>setPeople(Number(e.target.value))}/><small>Ao alterar, as cotas são redistribuídas igualmente.</small></label>}</div>

    <div className="investorList">{investors.map((inv,i)=>{
      const result=split[i];
      return <div className="investorRow" key={inv.id}>
        <input value={inv.name} onChange={e=>update(inv.id,{name:e.target.value})}/>
        <input type="number" step={50000} value={inv.contribution||""} onChange={e=>update(inv.id,{contribution:Number(e.target.value)})}/>
        <label className="quotaField"><span>Cota (%)</span><input type="number" min={0} max={100} step="0.1" value={(result?.sharePct||0).toFixed(2)} onChange={e=>setShare(inv.id,Number(e.target.value))}/></label>
        <div className="millionKpi"><span>Participação</span><b>{pct(result?.sharePct||0)}</b></div>
        <div className="millionKpi"><span>Renda/mês</span><b>{money(result?.monthly||0)}</b></div>
        <div className="millionKpi"><span>Base de ativos</span><b>{money(result?.assetRepurchase36||0)}</b><small>proporcional à cota</small></div>
        {groupMode?<button className="iconButton" onClick={()=>remove(inv.id)}><Trash2 size={16}/></button>:null}
      </div>
    })}</div>
    {groupMode?<button className="secondary addInvestor" onClick={add}><Plus size={16}/> Adicionar investidor</button>:null}

    <div className={funding.complete?"statusOk":"statusWarn"}>
      <b>{funding.complete?"Projeto integralizado.":"Capital ainda incompleto."}</b> Total informado: {money(funding.raised)}.
      {funding.missing>0?` Faltam ${money(funding.missing)}.`:""}
      {funding.over>0?` Há ${money(funding.over)} acima do valor-alvo.`:""}
    </div>
  </section>

  <section className="panel">
    <div className="sectionHead"><small>PARTICIPAÇÃO INDIVIDUAL</small><h2>Indicadores por investidor</h2></div>
    <div className="tableWrap"><table className="dataTable"><thead><tr><th>Investidor</th><th>Aporte</th><th>%</th><th>Renda/mês</th><th>ROI a.a.</th><th>Payback</th><th>Renda 36m</th><th>Base de ativos</th></tr></thead><tbody>{split.map(x=><tr key={x.name}><td><b>{x.name}</b></td><td>{money(x.contribution)}</td><td>{pct(x.sharePct)}</td><td>{money(x.monthly)}</td><td>{pct(x.roiAnnual)}</td><td>{x.paybackMonths.toFixed(1).replace(".",",")} meses</td><td>{money(x.income36)}</td><td>{money(x.assetRepurchase36)}</td></tr>)}</tbody></table></div>
  </section>

  <section className="panel">
    <div className="sectionHead"><small>PROJEÇÃO • 12 ANOS</small><h2>Renda + ciclos de liquidez / renovação</h2></div>
    <div className="formGrid smallGrid"><label>IPCA projetado (% a.a.)<input type="number" step=".01" value={ipca} onChange={e=>setIpca(Number(e.target.value))}/></label></div>
    <div className="tableWrap"><table className="dataTable"><thead><tr><th>Ano</th><th>Renda/mês</th><th>Renda anual</th><th>Renda acumulada</th><th>Ciclo de liquidez / renovação</th><th>Renda acumulada + referência de ativos</th></tr></thead><tbody>{projection.map(r=><tr key={r.year}><td>{r.year}</td><td>{money(r.monthlyIncome)}</td><td>{money(r.annualIncome)}</td><td>{money(r.incomeAccumulated)}</td><td>{money(r.liquidityEvent)}</td><td>{money(r.accumulatedWithLiquidity)}</td></tr>)}</tbody></table></div>
    <div className="statusWarn"><b>Liquidez / renovação da frota — a cada 36 meses.</b> A referência exibida nos anos 3, 6, 9 e 12 corresponde à base inicial de 45 motocicletas (R$ 900 mil). Ela não deve ser interpretada automaticamente como lucro adicional ou recompra garantida. Valores, renovação, continuidade operacional e condições de liquidez seguem o instrumento contratual vigente.</div>
  </section>

  <section className="panel millionCommercial">
    <div className="sectionHead"><small>COMO O LOCMILLION FUNCIONA</small><h2>R$ 1 milhão colocado em operação</h2></div>
    <div className="millionInfoGrid">
      <div><span>01</span><b>45 Yamaha Factor 150</b><p>R$ 900 mil destinados à base de ativos: 45 motocicletas de R$ 20 mil cada.</p></div>
      <div><span>02</span><b>Estrutura Locagora</b><p>Locação, gestão de locatários, contratos, cobrança, manutenção, proteção, rastreamento, tecnologia e suporte operacional.</p></div>
      <div><span>03</span><b>Implantação</b><p>Assinatura, taxa administrativa, abertura do CNPJ, aquisição das motos, montagem e emplacamento.</p></div>
      <div><span>04</span><b>Receita</b><p>Referência comercial de R$ 25 mil por mês no projeto integral, com recebimento previsto a partir de aproximadamente 45 dias e reajuste anual pelo IPCA.</p></div>
    </div>
    <div className="millionComposition">
      <div><small>45 MOTOS</small><b>{money(LOCMILLION.assetBase)}</b><span>{LOCMILLION.bikeModel} • {money(LOCMILLION.unitValue)} cada</span></div>
      <div><small>TAXA ADMINISTRATIVA</small><b>{money(LOCMILLION.adm)}</b><span>implantação e acesso à estrutura operacional</span></div>
      <div><small>ESTRUTURA / IMPLANTAÇÃO</small><b>{money(LOCMILLION.activation)}</b><span>componente separado da taxa administrativa</span></div>
    </div>
  </section>

  <section className="nextBar">
    <button className="secondary" onClick={onBack}><ArrowLeft size={16}/> Voltar às soluções</button>
    <div><small>LOCMILLION</small><b>{funding.complete?"Projeto integralizado":`Faltam ${money(funding.missing)}`}</b></div>
    <button className="primary" disabled={!funding.complete} onClick={save}><CheckCircle2 size={17}/> {saveLabel||"Adicionar à projeção"} <ArrowRight size={16}/></button>
  </section>
 </div>
}
