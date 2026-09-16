"use client";
import { useState } from "react";
import type { Simulation } from "@/lib/types";
import { analyzeFinancial36 } from "@/lib/financial-analysis-36";

const money = (n:number) => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n);
const pct = (n:number) => `${n.toLocaleString("pt-BR",{maximumFractionDigits:2})}%`;

/** Read-only: never fabricate missing product cash flows or undocumented scenario adjustments. */
export default function FinancialAnalysisPanel({simulation,clientName="Cliente"}:{simulation:Simulation;clientName?:string}) {
 const analysis=analyzeFinancial36(simulation);
 const [exporting,setExporting]=useState(false);
 const [error,setError]=useState("");
 const exportPdf=async()=>{
  if(!analysis.available)return;
  setExporting(true);setError("");
  try {
   const {jsPDF}=await import("jspdf");
   const pdf=new jsPDF({orientation:"landscape",unit:"mm",format:"a4"});
   const clean=(s:string)=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^\x20-\x7E]/g," ");
   const line=(text:string,x:number,y:number,size=9)=>{pdf.setFontSize(size);pdf.text(clean(text),x,y)};
   pdf.setFillColor(8,30,66);pdf.rect(0,0,297,35,"F");pdf.setTextColor(255,255,255);line("LOCAGORA | ANALISE FINANCEIRA 36 MESES",12,14,17);line(`${clientName} | ${simulation.name} | ${new Date().toLocaleDateString("pt-BR")}`,12,25,10);
   pdf.setTextColor(20,35,55);line(`Capital inicial: ${money(simulation.capital)}    Distribuicoes 36m: ${money(analysis.totalClientCash)}    ROI de caixa: ${pct(analysis.roiPct)}    Payback: ${analysis.paybackMonth===null?"Nao recuperado em 36 meses":`${analysis.paybackMonth} meses`}`,12,44,10);
   line("Mes",12,55);line("Resultado operacional",40,55);line("Reinvestimento",100,55);line("Distribuido",154,55);line("Acumulado",207,55);line("Posicao liquida",253,55);
   analysis.months.forEach((m,i)=>{const y=61+i*3.5;if(i%2===0){pdf.setFillColor(239,244,249);pdf.rect(11,y-2.8,275,3.5,"F");}line(String(m.month),12,y,7);line(money(m.operatingCash),40,y,7);line(money(m.reinvestment),100,y,7);line(money(m.clientCash),154,y,7);line(money(m.accumulatedCash),207,y,7);line(money(m.netPosition),253,y,7)});
   let y=194;line("FONTE E PREMISSAS",12,y,9);y+=5;line(analysis.source,12,y,7);y+=4;analysis.assumptions.forEach(a=>{const lines=pdf.splitTextToSize(clean(a),270);lines.forEach((l:string)=>{if(y<207){line(l,12,y,7);y+=3.5;}})});
   pdf.save(`Analise_Financeira_36m_${clientName.replace(/[^a-zA-Z0-9_-]+/g,"_")}.pdf`);
  }catch(e){setError(e instanceof Error?e.message:"Falha ao gerar PDF.");}finally{setExporting(false)}
 };
 return <section className="panel" aria-label="Análise financeira de 36 meses" style={{marginTop:18}}>
  <div className="sectionHead"><small>FASE 2 • FINANCEIRO</small><h2>Fluxo de caixa e retorno • 36 meses</h2><p>Valores provenientes exclusivamente do demonstrativo mensal salvo no produto.</p></div>
  {!analysis.available?<div className="statusWarn"><b>Indicadores não disponíveis:</b> {analysis.reason} Os cenários conservador e otimista exigem premissas quantitativas específicas e documentadas.</div>:<>
   <div className="summaryGrid"><div><span>Capital inicial</span><b>{money(simulation.capital)}</b></div><div><span>Distribuições em 36 meses</span><b>{money(analysis.totalClientCash)}</b></div><div><span>ROI de caixa em 36 meses</span><b>{pct(analysis.roiPct)}</b></div><div><span>Payback das distribuições</span><b>{analysis.paybackMonth===null?"Não recuperado em 36 meses":`${analysis.paybackMonth} meses`}</b></div></div>
   <p className="footnote">Cenário base: demonstrativo efetivamente salvo. Conservador e otimista: indisponíveis sem premissas quantitativas aprovadas por produto. ROI de caixa não inclui valor patrimonial residual.</p>
   <div className="tableWrap" style={{maxHeight:340,overflow:"auto"}}><table className="dataTable"><thead><tr><th>Mês</th><th>Resultado operacional</th><th>Reinvestimento</th><th>Disponível ao cliente</th><th>Acumulado</th><th>Posição após capital</th></tr></thead><tbody>{analysis.months.map(m=><tr key={m.month}><td>{m.month}</td><td>{money(m.operatingCash)}</td><td>{money(m.reinvestment)}</td><td>{money(m.clientCash)}</td><td>{money(m.accumulatedCash)}</td><td>{money(m.netPosition)}</td></tr>)}</tbody></table></div>
   <details><summary>Fonte e premissas auditáveis</summary><p>{analysis.source}</p><ul>{analysis.assumptions.map(a=><li key={a}>{a}</li>)}</ul></details>
   <div className="actions" style={{marginTop:12}}><button type="button" className="secondary" disabled={exporting} onClick={()=>void exportPdf()}>{exporting?"Gerando PDF...":"Exportar análise financeira em PDF"}</button></div>{error&&<div className="statusWarn">{error}</div>}
  </>}
 </section>;
}
