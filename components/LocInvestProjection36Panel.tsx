"use client";

import { useMemo, useState } from "react";
import { projectLocInvest36 } from "@/lib/locinvest-projection-36";

const brl = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

/** Componente isolado de homologação. Não salva dados nem altera o simulador legado. */
export default function LocInvestProjection36Panel() {
  const [signedAt, setSignedAt] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [bikeCapital, setBikeCapital] = useState(0);
  const [fees, setFees] = useState(0);
  const [monthlyPerBike, setMonthlyPerBike] = useState(0);
  const [ipca, setIpca] = useState(0);
  const [firstPaymentMonth, setFirstPaymentMonth] = useState(2);
  const calculation = useMemo(() => {
    try {
      if (!signedAt || bikeCapital <= 0 || monthlyPerBike <= 0) throw new Error("Informe a data e as premissas comerciais aprovadas para iniciar a homologação.");
      const cents = (amount: number) => {
        if (!Number.isFinite(amount) || amount < 0 || !Number.isSafeInteger(Math.round(amount * 100))) throw new Error("Informe valores monetários válidos.");
        return Math.round(amount * 100);
      };
      return { result: projectLocInvest36({ signedAt, quantity, bikeCapitalCents: cents(bikeCapital), initialFeesCents: cents(fees), monthlyIncomePerBikeCents: cents(monthlyPerBike), estimatedAnnualIpcaPct: ipca, firstPaymentMonth }), error: "" };
    } catch (error) {
      return { result: null, error: error instanceof Error ? error.message : "Não foi possível calcular." };
    }
  }, [signedAt, quantity, bikeCapital, fees, monthlyPerBike, ipca, firstPaymentMonth]);
  return <section className="panel" aria-label="Homologação da projeção LocInvest de 36 meses">
    <div className="sectionHead"><small>HOMOLOGAÇÃO • NÃO APROVADO PARA PROPOSTAS</small><h2>Projeção ilustrativa de 36 meses</h2><p>Preencha somente premissas verificadas. Os valores comerciais não são carregados automaticamente.</p></div>
    <div className="formGrid">
      <label>Data da assinatura (referência; não calcula os 45 dias)<input type="date" value={signedAt} onChange={event => setSignedAt(event.target.value)} /></label>
      <label>Quantidade de motos<input type="number" min="1" step="1" value={quantity} onChange={event => setQuantity(Number(event.target.value))} /></label>
      <label>Capital destinado às motos (R$)<input type="number" min="0" step="0.01" value={bikeCapital} onChange={event => setBikeCapital(Number(event.target.value))} /></label>
      <label>Taxas iniciais (R$)<input type="number" min="0" step="0.01" value={fees} onChange={event => setFees(Number(event.target.value))} /></label>
      <label>Repasse mensal por moto (R$)<input type="number" min="0" step="0.01" value={monthlyPerBike} onChange={event => setMonthlyPerBike(Number(event.target.value))} /></label>
      <label>IPCA anual estimado (%)<input type="number" min="-99.99" max="100" step="0.01" value={ipca} onChange={event => setIpca(Number(event.target.value))} /></label>
      <label>Primeiro mês com repasse (a confirmar)<input type="number" min="1" max="36" step="1" value={firstPaymentMonth} onChange={event => setFirstPaymentMonth(Number(event.target.value))} /></label>
    </div>
    {calculation.error && <p role="alert" className="statusWarn">{calculation.error}</p>}
    {calculation.result && <>
      <div className="summaryGrid">
        <div><span>Desembolso inicial</span><b>{brl(calculation.result.initialOutflowCents)}</b></div>
        <div><span>Repasses estimados em 36 meses</span><b>{brl(calculation.result.totalIncomeCents)}</b></div>
        <div><span>Capital das motos devolvido no mês 36 (premissa)</span><b>{brl(calculation.result.returnedBikeCapitalCents)}</b></div>
        <div><span>Saldo de caixa ilustrativo após desembolso</span><b>{brl(calculation.result.finalCashBalanceCents)}</b></div>
      </div>
      <div className="tableWrap"><table className="dataTable"><thead><tr><th>Mês</th><th>Repasse estimado</th><th>Devolução de capital</th><th>Fluxo acumulado</th></tr></thead><tbody>{calculation.result.months.map(row => <tr key={row.month}><td>{row.month}</td><td>{brl(row.monthlyIncomeCents)}</td><td>{brl(row.capitalReturnCents)}</td><td>{brl(row.accumulatedCashFlowCents)}</td></tr>)}</tbody></table></div>
      <p className="footnote">{calculation.result.disclaimer} Sem renovação automática. Primeiro pagamento, tabela comercial, tributação e devolução dependem de aprovação formal. O saldo não representa lucro líquido contábil.</p>
    </>}
  </section>;
}
