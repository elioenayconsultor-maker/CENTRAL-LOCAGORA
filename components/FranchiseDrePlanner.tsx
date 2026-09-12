"use client";
import type { FranchiseDreEvolution, FranchiseDreMode } from "@/lib/franchise-dre-evolution";
import { franchiseDreModeLabel } from "@/lib/franchise-dre-evolution";

const money=(n:number,currency="BRL")=>new Intl.NumberFormat("pt-BR",{style:"currency",currency}).format(Number(n)||0);

export default function FranchiseDrePlanner({
  projection,mode,onModeChange,balancedPct,onBalancedPctChange,includeInProposal,onIncludeInProposal,currency="BRL",assetLabel="motos"
}:{
  projection:FranchiseDreEvolution;
  mode:FranchiseDreMode;
  onModeChange:(mode:FranchiseDreMode)=>void;
  balancedPct:number;
  onBalancedPctChange:(pct:number)=>void;
  includeInProposal:boolean;
  onIncludeInProposal:(value:boolean)=>void;
  currency?:string;
  assetLabel?:string;
}){
 const purchaseEvents=projection.rows.filter(r=>r.purchases>0);
 return <section className="panel">
   <div className="sectionHead"><small>DRE • EVOLUÇÃO DE ATIVOS</small><h2>Escolha como tratar o resultado da operação</h2><p>O DRE pode permanecer sem reinvestimento ou simular a compra progressiva de novos ativos. A simulação é opcional e não representa garantia de rentabilidade.</p></div>
   <div className="dimensionMode" role="group" aria-label="Estratégia do DRE">
     <button type="button" className={mode==="static"?"active":""} onClick={()=>onModeChange("static")}>Sem evolução</button>
     <button type="button" className={mode==="balanced"?"active":""} onClick={()=>onModeChange("balanced")}>Balanceado</button>
     <button type="button" className={mode==="full"?"active":""} onClick={()=>onModeChange("full")}>Full</button>
   </div>
   <div className="softBlock">
     <div className="blockHead"><div><small>CENÁRIO SELECIONADO</small><h3>{franchiseDreModeLabel(mode)}</h3></div><span className="successBadge">36 MESES</span></div>
     {mode==="static"&&<p>100% do resultado operacional permanece disponível ao cliente. A quantidade de ativos não cresce pela reaplicação.</p>}
     {mode==="balanced"&&<><p>Uma parcela do resultado é reservada para evolução da frota e o restante permanece disponível ao cliente.</p><label>Percentual para reaplicação<input type="number" min={0} max={100} step={5} value={balancedPct} onChange={e=>onBalancedPctChange(Math.max(0,Math.min(100,Number(e.target.value)||0)))}/><small>Referência inicial: 50%. O percentual é uma premissa de cenário, não uma recomendação financeira individual.</small></label></>}
     {mode==="full"&&<p>100% do resultado operacional positivo vai para o caixa de reinvestimento. Quando o saldo cobre o custo incremental de um novo ativo, o ativo é incluído a partir do ciclo seguinte.</p>}
     <div className="line"><span>Custo incremental por novo ativo</span><b>{money(projection.unitAssetCost,currency)}</b></div>
     <div className="line"><span>Frota inicial</span><b>{projection.initialAssets} {assetLabel}</b></div>
     <div className="line"><span>Frota ao fim do cenário</span><b>{projection.finalAssets} {assetLabel}</b></div>
     <div className="line"><span>Novos ativos adquiridos</span><b>+ {projection.addedAssets}</b></div>
     <div className="line"><span>Resultado operacional acumulado</span><b>{money(projection.totalOperatingResult,currency)}</b></div>
     <div className="line"><span>Aplicado na compra de novos ativos</span><b>{money(projection.totalReinvested,currency)}</b></div>
     <div className="line"><span>Resultado disponível ao cliente</span><b>{money(projection.totalAvailableToClient,currency)}</b></div>
     <div className="line"><span>Saldo no caixa de reinvestimento</span><b>{money(projection.endingPool,currency)}</b></div>
     {projection.firstPurchaseMonth&&<div className="statusOk">Primeira nova moto projetada no mês <b>{projection.firstPurchaseMonth}</b>.</div>}
   </div>
   <div className="tableWrap"><table className="dataTable"><thead><tr><th>Ano</th><th>Frota inicial</th><th>Frota final</th><th>Novas motos</th><th>Resultado operacional</th><th>Reaplicado</th><th>Disponível</th></tr></thead><tbody>{projection.annual.map(r=><tr key={r.year}><td><b>Ano {r.year}</b></td><td>{r.openingAssets}</td><td>{r.closingAssets}</td><td>+{r.addedAssets}</td><td>{money(r.operatingResult,currency)}</td><td>{money(r.reinvested,currency)}</td><td>{money(r.availableToClient,currency)}</td></tr>)}</tbody></table></div>
   {mode!=="static"&&<div className="softBlock"><div className="blockHead"><div><small>MOMENTOS DE COMPRA</small><h3>Entrada de novos ativos</h3></div><span>{purchaseEvents.length} eventos</span></div>{purchaseEvents.length?purchaseEvents.map(r=><div className="line" key={r.month}><span>Mês {r.month} • +{r.purchases} {r.purchases===1?"moto":"motos"}</span><b>Frota: {r.closingAssets}</b></div>):<div className="empty">O caixa de reinvestimento não atinge o custo de uma nova moto dentro do horizonte selecionado.</div>}</div>}
   <label className="statusOk" style={{display:"flex",gap:10,alignItems:"center"}}><input type="checkbox" checked={includeInProposal} onChange={e=>onIncludeInProposal(e.target.checked)}/><span><b>Incluir este DRE na proposta final e no PDF</b><br/><small>Opcional. Quando desmarcado, a proposta mantém a página padrão de escala e potencial.</small></span></label>
   <p className="footnote">Cenário comercial e operacional ilustrativo. O modo Balanceado usa apenas o percentual definido nesta tela; não constitui recomendação de investimento. Resultados reais dependem de ocupação, inadimplência, manutenção, tributos, disponibilidade e demais condições da operação.</p>
 </section>;
}
