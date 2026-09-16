import type { Simulation } from "./types";

type Month = { month: number; operatingCash: number; reinvestment: number; clientCash: number; accumulatedCash: number; netPosition: number };
export type FinancialAnalysis36 = { available: true; source: string; assumptions: string[]; months: Month[]; totalClientCash: number; roiPct: number; paybackMonth: number | null; monthlyReturnPct: number | null } | { available: false; reason: string };

/** A DRE projection is not an audited cash statement: this is a modeled distribution analysis, never a promise of actual receipts. */
export function analyzeFinancial36(simulation: Simulation): FinancialAnalysis36 {
 const details=simulation.details||{};
 const snapshot=details.dreEvolution as {monthly?:unknown;rows?:unknown;horizonMonths?:unknown;totalAvailableToClient?:unknown} | undefined;
 const sourceRows=snapshot?.monthly??snapshot?.rows;
 if(!Array.isArray(sourceRows)||sourceRows.length!==36)return {available:false,reason:"Demonstrativo mensal completo de 36 meses não disponível para este produto. Não é possível calcular retorno de distribuições e payback com segurança."};
 if(snapshot?.horizonMonths!==36)return {available:false,reason:"O demonstrativo de origem não possui horizonte confirmado de 36 meses."};
 const capital=simulation.capital;
 if(typeof capital!=="number"||!Number.isFinite(capital)||capital<=0)return {available:false,reason:"Capital inicial inválido."};
 const requiredNumber=(value:unknown):value is number=>typeof value==="number"&&Number.isFinite(value);
 let accumulatedCash=0;let paybackMonth:number|null=null;const months:Month[]=[];
 for(let index=0;index<36;index++){
  const source=sourceRows[index] as Record<string,unknown>;
  if(!source||typeof source!=="object")return {available:false,reason:`Demonstrativo inválido no mês ${index+1}.`};
  if(source.month!==index+1||!requiredNumber(source.operatingResult)||!requiredNumber(source.reinvestmentContribution)||!requiredNumber(source.availableToClient))return {available:false,reason:`Dados mensais ausentes ou inválidos no mês ${index+1}.`};
  const month=source.month,operatingCash=source.operatingResult,reinvestment=source.reinvestmentContribution,clientCash=source.availableToClient;
  if(operatingCash<0||reinvestment<0||clientCash<0||Math.abs(operatingCash-reinvestment-clientCash)>0.02)return {available:false,reason:`Distribuições e reinvestimentos inconsistentes no mês ${index+1}.`};
  accumulatedCash+=clientCash;if(paybackMonth===null&&accumulatedCash>=capital)paybackMonth=month;
  months.push({month,operatingCash,reinvestment,clientCash,accumulatedCash,netPosition:accumulatedCash-capital});
 }
 if(snapshot.totalAvailableToClient!==undefined&&(!requiredNumber(snapshot.totalAvailableToClient)||Math.abs(snapshot.totalAvailableToClient-accumulatedCash)>0.05))return {available:false,reason:"Soma das distribuições mensais não confere com o total do demonstrativo."};
 return {available:true,source:"Projeção mensal DRE de 36 meses salva na simulação; valores projetados, não recebimentos realizados.",assumptions:["Cenário base: valores projetados como disponíveis ao cliente no demonstrativo mensal; reinvestimentos não são distribuições.","Capital inicial considerado integralmente no mês zero.","Venda de ativos, valor residual, tributos adicionais e reinvestimentos recuperáveis não incluídos sem fluxo de recebimento documentado.","ROI de distribuições = (distribuições projetadas − capital inicial) ÷ capital inicial; não representa retorno patrimonial total.","Payback = primeiro mês em que as distribuições projetadas acumuladas alcançam o capital inicial; não é break-even operacional.","Cenários conservador e otimista indisponíveis até existirem premissas quantitativas específicas, fixas e documentadas por produto."],months,totalClientCash:accumulatedCash,roiPct:(accumulatedCash/capital-1)*100,paybackMonth,monthlyReturnPct:null};
}
