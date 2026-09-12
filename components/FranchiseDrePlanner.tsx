"use client";
import type { FranchiseDreEvolution, FranchiseDreMode } from "@/lib/franchise-dre-evolution";
import { franchiseDreModeLabel } from "@/lib/franchise-dre-evolution";

const money=(n:number,currency="BRL")=>new Intl.NumberFormat("pt-BR",{style:"currency",currency,maximumFractionDigits:2}).format(Number(n)||0);
const sum=(rows:FranchiseDreEvolution["rows"],key:string)=>rows.reduce((s,r)=>s+Number(r.breakdown?.[key]||0),0);

export default function FranchiseDrePlanner({projection,mode,onModeChange,balancedPct,onBalancedPctChange,includeInProposal,onIncludeInProposal,currency="BRL",assetLabel="motos"}:{projection:FranchiseDreEvolution;mode:FranchiseDreMode;onModeChange:(mode:FranchiseDreMode)=>void;balancedPct:number;onBalancedPctChange:(pct:number)=>void;includeInProposal:boolean;onIncludeInProposal:(value:boolean)=>void;currency?:string;assetLabel?:string;}){
 const purchaseEvents=projection.rows.filter(r=>r.purchases>0);
 const cumulative=projection.rows.map((r,i)=>projection.rows.slice(0,i+1).reduce((s,x)=>s+x.availableToClient,0));
 const periods=[projection.rows.slice(0,12),projection.rows.slice(12,24),projection.rows.slice(24,36)].filter(x=>x.length);
 const hasBreakdown=projection.rows.some(r=>r.breakdown);
 return <section className="panel">
   <div className="sectionHead"><small>LOCAGORA • PROJEÇÃO FINANCEIRA</small><h2>Tabela DRE — 36 Meses</h2><p>Modelo mensal inspirado no padrão executivo Locagora: receitas, custos, lucro líquido, investimento em novos ativos e lucro acumulado.</p></div>
   <div className="dimensionMode" role="group" aria-label="Estratégia do DRE">
     <button type="button" className={mode==="static"?"active":""} onClick={()=>onModeChange("static")}>1 • Sem evolução</button>
     <button type="button" className={mode==="balanced"?"active":""} onClick={()=>onModeChange("balanced")}>2 • Reinvestimento parcial</button>
     <button type="button" className={mode==="full"?"active":""} onClick={()=>onModeChange("full")}>3 • Reinvestimento total</button>
   </div>

   <div className="softBlock">
     <div className="blockHead"><div><small>CENÁRIO SELECIONADO</small><h3>{franchiseDreModeLabel(mode)}</h3></div><span className="successBadge">36 MESES</span></div>
     {mode==="static"&&<p>A frota permanece fixa. 100% do lucro líquido operacional fica disponível ao cliente, sem compra automática de novas motos.</p>}
     {mode==="balanced"&&<><p>Parte do lucro líquido é acumulada para compra de novas motos e parte permanece disponível ao cliente.</p><label>Percentual de reinvestimento<input type="number" min={0} max={100} step={5} value={balancedPct} onChange={e=>onBalancedPctChange(Math.max(0,Math.min(100,Number(e.target.value)||0)))}/><small>Você escolhe o percentual do cenário. Referência inicial: 50%.</small></label></>}
     {mode==="full"&&<p>100% do lucro líquido operacional é acumulado. Assim que o caixa atingir o custo incremental de uma moto, a nova moto é adquirida e passa a produzir nos meses seguintes.</p>}
     <div className="line"><span>Custo incremental por nova moto</span><b>{money(projection.unitAssetCost,currency)}</b></div>
     <div className="line"><span>Frota inicial</span><b>{projection.initialAssets} {assetLabel}</b></div>
     <div className="line"><span>Frota final projetada</span><b>{projection.finalAssets} {assetLabel}</b></div>
     <div className="line"><span>Novas motos adquiridas</span><b>+ {projection.addedAssets}</b></div>
     <div className="line"><span>Lucro líquido operacional acumulado</span><b>{money(projection.totalOperatingResult,currency)}</b></div>
     <div className="line"><span>Investimento em novas motos</span><b>{money(projection.totalReinvested,currency)}</b></div>
     <div className="line"><span>Lucro disponível ao cliente</span><b>{money(projection.totalAvailableToClient,currency)}</b></div>
     <div className="line"><span>Saldo no caixa de reinvestimento</span><b>{money(projection.endingPool,currency)}</b></div>
     {projection.firstPurchaseMonth&&<div className="statusOk">Primeira nova moto projetada no mês <b>{projection.firstPurchaseMonth}</b>.</div>}
   </div>

   {periods.map((rows,pIndex)=>{
     const first=rows[0]?.month||1,last=rows[rows.length-1]?.month||first;
     return <div className="softBlock" key={first} style={{marginTop:16}}>
       <div className="blockHead"><div><small>DRE MENSAL • PÁGINA {pIndex+1} DE {periods.length}</small><h3>Meses {first} a {last}</h3></div><span>{mode==="static"?"FROTA FIXA":`${projection.reinvestPct}% REINVESTIMENTO`}</span></div>
       <div className="tableWrap"><table className="dataTable" style={{minWidth:1180}}><thead><tr><th>DRE</th>{rows.map(r=><th key={r.month}>Mês {r.month}</th>)}</tr></thead><tbody>
         {hasBreakdown&&<><tr><td><b>(+) Receita Total</b></td>{rows.map(r=><td key={r.month}>{money(Number(r.breakdown?.revenueTotal||0),currency)}</td>)}</tr><tr><td>Aluguel</td>{rows.map(r=><td key={r.month}>{money(Number(r.breakdown?.rentalRevenue||0),currency)}</td>)}</tr><tr><td>Outras receitas</td>{rows.map(r=><td key={r.month}>{money(Number(r.breakdown?.otherRevenue||0),currency)}</td>)}</tr><tr><td><b>(-) Custos Operacionais</b></td>{rows.map(r=><td key={r.month}>- {money(Number(r.breakdown?.operatingCosts||0),currency)}</td>)}</tr><tr><td>Proteção veicular</td>{rows.map(r=><td key={r.month}>- {money(Number(r.breakdown?.protection||0),currency)}</td>)}</tr><tr><td>Manutenção</td>{rows.map(r=><td key={r.month}>- {money(Number(r.breakdown?.maintenance||0),currency)}</td>)}</tr><tr><td>Taxa de operação</td>{rows.map(r=><td key={r.month}>- {money(Number(r.breakdown?.operation||0),currency)}</td>)}</tr><tr><td>Royalties</td>{rows.map(r=><td key={r.month}>- {money(Number(r.breakdown?.royalties||0),currency)}</td>)}</tr><tr><td>Despesas financeiras</td>{rows.map(r=><td key={r.month}>- {money(Number(r.breakdown?.financial||0),currency)}</td>)}</tr><tr><td>Marketing + sistema</td>{rows.map(r=><td key={r.month}>- {money(Number(r.breakdown?.marketing||0)+Number(r.breakdown?.system||0),currency)}</td>)}</tr><tr><td>Contabilidade</td>{rows.map(r=><td key={r.month}>- {money(Number(r.breakdown?.accounting||0),currency)}</td>)}</tr><tr><td>Impostos</td>{rows.map(r=><td key={r.month}>- {money(Number(r.breakdown?.taxes||0),currency)}</td>)}</tr></>}
         <tr><td><b>Total de motos</b></td>{rows.map(r=><td key={r.month}><b>{r.openingAssets}</b></td>)}</tr>
         <tr style={{background:"rgba(16,185,129,.08)"}}><td><b>(=) Lucro Líquido</b></td>{rows.map(r=><td key={r.month}><b>{money(r.operatingResult,currency)}</b></td>)}</tr>
         <tr><td>(-) Reserva para reinvestimento</td>{rows.map(r=><td key={r.month}>{r.reinvestmentContribution?`- ${money(r.reinvestmentContribution,currency)}`:"—"}</td>)}</tr>
         <tr><td>(-) Investimento Moto</td>{rows.map(r=><td key={r.month}>{r.purchaseAmount?`- ${money(r.purchaseAmount,currency)}`:"—"}</td>)}</tr>
         <tr><td>Novas motos</td>{rows.map(r=><td key={r.month}>{r.purchases?`+${r.purchases}`:"—"}</td>)}</tr>
         <tr><td>Frota ao fim do mês</td>{rows.map(r=><td key={r.month}><b>{r.closingAssets}</b></td>)}</tr>
         <tr><td>Disponível ao cliente</td>{rows.map(r=><td key={r.month}>{money(r.availableToClient,currency)}</td>)}</tr>
         <tr style={{background:"rgba(16,185,129,.08)"}}><td><b>(=) Lucro Acumulado disponível</b></td>{rows.map(r=><td key={r.month}><b>{money(cumulative[r.month-1]||0,currency)}</b></td>)}</tr>
       </tbody></table></div>
     </div>;
   })}

   <div className="tableWrap" style={{marginTop:16}}><table className="dataTable"><thead><tr><th>Ano</th><th>Frota inicial</th><th>Frota final</th><th>Novas motos</th><th>Lucro operacional</th><th>Reinvestido</th><th>Disponível ao cliente</th></tr></thead><tbody>{projection.annual.map(r=><tr key={r.year}><td><b>Ano {r.year}</b></td><td>{r.openingAssets}</td><td>{r.closingAssets}</td><td>+{r.addedAssets}</td><td>{money(r.operatingResult,currency)}</td><td>{money(r.reinvested,currency)}</td><td>{money(r.availableToClient,currency)}</td></tr>)}</tbody></table></div>

   {mode!=="static"&&<div className="softBlock"><div className="blockHead"><div><small>MOMENTOS DE COMPRA</small><h3>Entrada de novos ativos</h3></div><span>{purchaseEvents.length} eventos</span></div>{purchaseEvents.length?purchaseEvents.map(r=><div className="line" key={r.month}><span>Mês {r.month} • +{r.purchases} {r.purchases===1?"moto":"motos"}</span><b>{money(r.purchaseAmount,currency)} • frota {r.closingAssets}</b></div>):<div className="empty">O caixa de reinvestimento não atinge o custo de uma nova moto dentro dos 36 meses.</div>}</div>}

   {hasBreakdown&&<p className="footnote">Totais de referência do DRE detalhado: receitas {money(sum(projection.rows,"revenueTotal"),currency)} • custos operacionais {money(sum(projection.rows,"operatingCosts"),currency)}. Os valores acompanham a evolução real da quantidade de motos em cada mês.</p>}
   <label className="statusOk" style={{display:"flex",gap:10,alignItems:"center"}}><input type="checkbox" checked={includeInProposal} onChange={e=>onIncludeInProposal(e.target.checked)}/><span><b>Incluir este DRE na proposta final e no PDF</b><br/><small>Opcional. O snapshot salvo agora inclui o detalhamento dos 36 meses e a estratégia escolhida.</small></span></label>
   <p className="footnote">Projeção operacional ilustrativa. Valores reais podem variar por ocupação, inadimplência, manutenção, preço de aquisição das motos, tributos, disponibilidade e demais condições da operação.</p>
 </section>;
}
