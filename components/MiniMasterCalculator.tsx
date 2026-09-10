"use client";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Users } from "lucide-react";
import { MINI_MASTER, calculateMiniMaster, miniMasterRamp, miniMasterTerritoryCheck } from "@/lib/mini-master";
import type { Simulation } from "@/lib/types";
import TerritoryValidation from "@/components/TerritoryValidation";
import type { TerritoryResult } from "@/lib/territory";

const money=(n:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(n)||0);
const pct=(n:number)=>`${(Number(n)||0).toLocaleString("pt-BR",{minimumFractionDigits:1,maximumFractionDigits:1})}%`;

export default function MiniMasterCalculator({
  initialCapital,onBack,onSave,saveLabel
}:{
  initialCapital:number;
  onBack:()=>void;
  onSave:(simulation:Simulation)=>void;
  saveLabel?:string;
}){
 const [city,setCity]=useState("");
 const [population,setPopulation]=useState(0);
 const [bikes,setBikes]=useState(300);
 const [ownBikes,setOwnBikes]=useState(0);
 const [franchisees,setFranchisees]=useState(22);
 const [workshopShare,setWorkshopShare]=useState(15);
 const [locagoraPayment,setLocagoraPayment]=useState(5);
 const [territoryOnline,setTerritoryOnline]=useState<TerritoryResult|null>(null);

 const result=useMemo(()=>calculateMiniMaster({
   bikes,ownBikes,franchisees,
   workshopSharePct:workshopShare,
   locagoraPaymentPct:locagoraPayment
 }),[bikes,ownBikes,franchisees,workshopShare,locagoraPayment]);

 const territory=useMemo(()=>miniMasterTerritoryCheck(city,population),[city,population]);
 const ramp=useMemo(()=>miniMasterRamp(),[]);
 const capitalFit=initialCapital<=0||result.investment<=initialCapital;
 const canSave=territory.status==="preliminarily_eligible"&&territoryOnline?.status==="available";

 const save=()=>{
   if(!canSave)return;
   onSave({
     id:Date.now(),
     name:`Mini-Master — ${city} • ${bikes} motos`,
     sourceRoute:"mini",
     capital:result.investment,
     monthly:result.net,
     annual:result.net*12,
     details:{
       qty:bikes,
       model:"Operação Mini-Master",
       assets:0,
       plan:"Mini-Master",
       franchiseFee:MINI_MASTER.fee,
       structure:MINI_MASTER.structure,
       capacity:MINI_MASTER.capacity,
       collaborators:MINI_MASTER.collaboratorsInitial,
       franchisees,
       city,population,
       workshopSharePct:workshopShare,
       locagoraPaymentPct:locagoraPayment,
       roiAnnual:result.investment?result.net*12/result.investment*100:0,
       paybackMonths:result.paybackMonths,
       notes:[
         "A frota da operação é da matriz; não há compra de frota pela Mini-Master.",
         "Praça de até 400 mil habitantes.",
         "Capacidade operacional de 300 motos.",
         "Referência de 20–25 franqueados em maturidade.",
         "Território pré-validado contra a base operacional; aprovação final da gestão continua obrigatória."
       ]
     },
     updatedAt:new Date().toISOString()
   });
 };

 return <div className="masterModule">
   <section className="calculatorHero miniHero">
     <div><small>LOCAGORA • MINI-MASTER</small><h2>Operação territorial enxuta, escalável e exclusiva.</h2><p>Estrutura de R$ 380 mil para cidades de até 400 mil habitantes, com capacidade de até 300 motos e frota pertencente à matriz.</p></div>
     <div className="miniMetrics"><div><span>Investimento</span><b>R$ 380 mil</b></div><div><span>Capacidade</span><b>300 motos</b></div><div><span>Equipe inicial</span><b>5 pessoas</b></div></div>
   </section>

   <div className="calcLayout">
    <section className="panel">
      <div className="sectionHead"><small>TERRITÓRIO</small><h2>Cidade e disponibilidade</h2><p>A nova arquitetura separa o critério territorial da futura checagem online.</p></div>
      <div className="formGrid">
        <label>Cidade / região<input value={city} placeholder="Ex.: Aracaju / SE" onChange={e=>setCity(e.target.value)}/></label>
        <label>População estimada<input type="number" value={population||""} onChange={e=>setPopulation(Number(e.target.value)||0)}/></label>
      </div>
      <div className={territory.status==="preliminarily_eligible"?"statusOk":"statusWarn"}>
        <MapPin size={16}/> <b>{territory.message}</b>
      </div>
      <TerritoryValidation product="mini" city={city} population={population} onValidated={setTerritoryOnline}/>
    </section>

    <section className="panel">
      <div className="sectionHead"><small>INVESTIMENTO</small><h2>Estrutura inicial</h2></div>
      <div className="line"><span>Taxa Mini-Master</span><b>{money(MINI_MASTER.fee)}</b></div>
      <div className="line"><span>Estrutura / implantação</span><b>{money(MINI_MASTER.structure)}</b></div>
      <div className="statusOk"><span>Investimento total</span><b>{money(MINI_MASTER.totalInvestment)}</b></div>
      <div className="line"><span>Compra de frota</span><b>R$ 0,00</b></div>
      <div className="line"><span>Propriedade da frota</span><b>Matriz</b></div>
      {!capitalFit?<div className="statusWarn">O capital informado no perfil do cliente está abaixo do investimento de referência.</div>:null}
    </section>
   </div>

   <section className="panel">
     <div className="sectionHead"><small>DRE MINI-MASTER</small><h2>Operação por quantidade de motos</h2></div>
     <div className="formGrid compareInputs">
       <label>Motos em operação<input type="number" min={0} max={300} value={bikes} onChange={e=>setBikes(Math.max(0,Math.min(300,Number(e.target.value)||0)))}/></label>
       <label>Motos próprias na operação<input type="number" min={0} max={bikes} value={ownBikes} onChange={e=>setOwnBikes(Math.max(0,Math.min(bikes,Number(e.target.value)||0)))}/></label>
       <label>Franqueados ativos<input type="number" min={0} max={40} value={franchisees} onChange={e=>setFranchisees(Math.max(0,Number(e.target.value)||0))}/></label>
       <label>Participação lucro oficina (%)<input type="number" step=".1" value={workshopShare} onChange={e=>setWorkshopShare(Number(e.target.value)||0)}/></label>
       <label>Pagamento Locagora (%)<input type="number" step=".1" value={locagoraPayment} onChange={e=>setLocagoraPayment(Number(e.target.value)||0)}/></label>
     </div>

     <div className="resultGrid">
       <div className="highlight"><span>Lucro líquido mensal</span><b>{money(result.net)}</b><small>{pct(result.margin)} margem</small></div>
       <div><span>Receita bruta</span><b>{money(result.grossRevenue)}</b><small>{bikes} motos</small></div>
       <div><span>EBITDA</span><b>{money(result.ebitda)}</b><small>antes de tributos</small></div>
       <div><span>Payback simples</span><b>{Number.isFinite(result.paybackMonths)?`${result.paybackMonths.toFixed(1).replace(".",",")} meses`:"—"}</b><small>pela configuração atual</small></div>
       <div><span>Referência madura</span><b>{money(MINI_MASTER.matureNet)}</b><small>300 motos</small></div>
       <div><span>Payback ref. madura</span><b>{result.matureSimplePayback.toFixed(1).replace(".",",")} meses</b><small>R$ 380 mil / R$ 23.208</small></div>
     </div>
   </section>

   <div className="calcLayout">
    <section className="panel">
      <div className="sectionHead"><small>RECEITA</small><h2>Composição mensal</h2></div>
      <div className="line"><span>Administração — R$ 250/moto</span><b>{money(result.adminRevenue)}</b></div>
      <div className="line"><span>Manutenção — R$ 170/moto</span><b>{money(result.maintenanceRevenue)}</b></div>
      <div className="line"><span>Retirada — R$ 12/moto</span><b>{money(result.withdrawalRevenue)}</b></div>
      <div className="line"><span>Outros serviços</span><b>{money(result.serviceRevenue)}</b></div>
      <div className="statusOk"><span>Receita bruta</span><b>{money(result.grossRevenue)}</b></div>
      <div className="line"><span>Referência moto própria</span><b>{money(MINI_MASTER.ownBikeRevenue)}/mês</b></div>
      <div className="line"><span>Referência terceiro</span><b>{money(MINI_MASTER.thirdPartyRevenue)}/mês</b></div>
    </section>

    <section className="panel">
      <div className="sectionHead"><small>DESPESAS</small><h2>Estrutura operacional</h2></div>
      <div className="line"><span>Deduções</span><b>- {money(result.deductions)}</b></div>
      <div className="line"><span>Peças</span><b>- {money(result.parts)}</b></div>
      <div className="line"><span>Pessoal</span><b>- {money(result.personnel)}</b></div>
      <div className="line"><span>Infraestrutura</span><b>- {money(result.infrastructure)}</b></div>
      <div className="line"><span>Outros</span><b>- {money(result.other)}</b></div>
      <div className="line"><span>Tributos</span><b>- {money(result.taxes)}</b></div>
      <div className="line"><span>Participação oficina calculada</span><b>{money(result.workshopShare)}</b></div>
      <div className="line"><span>Pagamento Locagora calculado</span><b>{money(result.locagoraPayment)}</b></div>
    </section>
   </div>

   <section className="panel">
     <div className="sectionHead"><small>RAMPA OPERACIONAL</small><h2>Do início à maturidade</h2></div>
     <div className="tableWrap"><table className="dataTable"><thead><tr><th>Fase</th><th>Mês</th><th>Motos</th><th>Franqueados</th><th>Receita</th><th>Lucro líquido</th></tr></thead><tbody>{ramp.map(r=><tr key={r.label}><td><b>{r.label}</b></td><td>{r.month}</td><td>{r.bikes}</td><td>{r.franchisees}</td><td>{money(r.result.grossRevenue)}</td><td>{money(r.result.net)}</td></tr>)}</tbody></table></div>
   </section>

   <section className="nextBar">
     <button className="secondary" onClick={onBack}><ArrowLeft size={16}/> Voltar às soluções</button>
     <div><small>MINI-MASTER</small><b>{city||"Território pendente"} • {money(result.net)}/mês</b></div>
     <button className="primary" disabled={!canSave} onClick={save}><CheckCircle2 size={17}/> {saveLabel||"Adicionar à projeção"} <ArrowRight size={16}/></button>
   </section>
 </div>
}
