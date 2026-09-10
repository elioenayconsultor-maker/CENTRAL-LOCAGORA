import PublicShell from "@/components/PublicShell";
import PublicProductExplorer from "@/components/PublicProductExplorer";

export default function PublicBusiness(){
  return <PublicShell><main className="publicMain">
    <section className="publicHero compact phase3PortfolioHero"><div><small>NEGÓCIOS & INVESTIMENTOS • ACESSO PÚBLICO</small><h1>Um portfólio. Diferentes formas de participar.</h1><p>Conheça os modelos Locagora por objetivo, compare estruturas e encontre o caminho mais aderente ao que você procura. Valores finais e condições vigentes devem ser confirmados com um consultor.</p></div></section>
    <PublicProductExplorer/>
  </main></PublicShell>;
}
