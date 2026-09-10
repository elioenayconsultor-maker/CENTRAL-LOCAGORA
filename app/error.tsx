"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Locagora Central error", error);
  }, [error]);

  return (
    <main className="systemStateScreen">
      <section className="systemStateCard">
        <img src="/locagora-logo.png" alt="Locagora" className="systemStateLogo" />
        <span className="systemStateEyebrow">CENTRAL COMERCIAL</span>
        <h1>Não foi possível carregar esta área.</h1>
        <p>O restante da Central permanece protegido. Tente recarregar o módulo; se o erro persistir, registre a tela para o administrador.</p>
        <button type="button" onClick={reset}>Tentar novamente</button>
      </section>
    </main>
  );
}
