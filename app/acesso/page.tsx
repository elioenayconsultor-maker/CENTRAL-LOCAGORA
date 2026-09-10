import Link from "next/link";
import AuthGate from "@/components/AuthGate";

export default function CorporateAccessPage(){
  return <AuthGate>
    <main className="authScreen">
      <section className="authCard corporateAccessConfirmed">
        <small>CENTRAL COMERCIAL</small>
        <h1>Acesso confirmado</h1>
        <p>Sua sessão corporativa já está ativa. Continue para a Central Comercial ou volte à área pública.</p>
        <Link className="primary authLinkButton" href="/central">Entrar na Central Comercial</Link>
        <Link className="secondary authLinkButton" href="/historia">Voltar à área pública</Link>
      </section>
    </main>
  </AuthGate>;
}
