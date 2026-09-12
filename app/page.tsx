import Link from "next/link";
import { ArrowRight, Bike, BookOpenText, Building2, Calculator, LogIn, MapPin, TrendingUp } from "lucide-react";
import PublicShell from "@/components/PublicShell";
import rentalStyles from "@/components/RentalPublic.module.css";

export default function PublicHome(){
  return <PublicShell>
    <main className="publicMain publicHomeMain">
      <section className="publicHero publicHomeHero">
        <div>
          <small>LOCAGORA • CENTRAL PÚBLICA</small>
          <h1>Conheça, compare e simule seu próximo investimento.</h1>
          <p>Acesse a história da Locagora, conheça os modelos de franquias e investimentos, consulte onde a nossa rede está presente e avance para as simulações.</p>
          <div className="publicHeroActions">
            <Link href="/negocios" className="ctaPrimary">Ver negócios e investimentos <ArrowRight size={17}/></Link>
            <Link href="/rede" className="ctaGhost"><MapPin size={17}/> Onde tem Locagora?</Link>
            <Link href="/simulador" className="ctaGhost"><Calculator size={17}/> Começar pelo simulador</Link>
          </div>
        </div>
        <div className="publicHeroStats">
          <div><BookOpenText/><b>Conheça</b><span>história e posicionamento</span></div>
          <div><MapPin/><b>Encontre</b><span>bases e Masters da rede</span></div>
          <div><TrendingUp/><b>Simule</b><span>cenários de investimento</span></div>
        </div>
      </section>

      <section className={rentalStyles.homeCall} aria-label="Aluguel de motos Locagora">
        <Link href="/aluguel" className={rentalStyles.homeCard}>
          <div><small>MOBILIDADE • ALUGUEL DE MOTOS</small><h2>Precisa de uma moto para trabalhar?</h2><p>Veja as cidades atendidas pela rede e deixe seu contato para receber orientação sobre disponibilidade e condições.</p></div>
          <strong><Bike size={21}/> Quero alugar uma moto <ArrowRight size={18}/></strong>
        </Link>
      </section>

      <section className="publicHomeGrid" aria-label="Caminhos da Central Pública">
        <Link href="/historia" className="publicHomeCard"><BookOpenText/><div><small>01 • HISTÓRIA</small><h2>Conheça a Locagora</h2><p>Veja a trajetória, a expansão da rede e os depoimentos selecionados.</p><span>Ver história <ArrowRight size={16}/></span></div></Link>
        <Link href="/negocios" className="publicHomeCard"><Building2/><div><small>02 • PORTFÓLIO</small><h2>Negócios & Investimentos</h2><p>Compare franquias, modelos de expansão e oportunidades de investimento.</p><span>Explorar modelos <ArrowRight size={16}/></span></div></Link>
        <Link href="/rede" className="publicHomeCard"><MapPin/><div><small>03 • REDE LOCAGORA</small><h2>Onde estamos</h2><p>Consulte bases, unidades e Masters Locagora e veja a localização no mapa.</p><span>Consultar a rede <ArrowRight size={16}/></span></div></Link>
        <Link href="/simulador" className="publicHomeCard"><Calculator/><div><small>04 • SIMULADOR</small><h2>Apresentação → Simulação</h2><p>Escolha o modelo, veja sua apresentação e avance para o simulador correspondente.</p><span>Iniciar jornada <ArrowRight size={16}/></span></div></Link>
      </section>

      <section className="publicCta publicCorporateCta">
        <div><small>ÁREA CORPORATIVA</small><h2>Colaborador Locagora?</h2><p>O acesso interno continua protegido e separado da experiência pública do cliente.</p></div>
        <Link href="/acesso" className="ctaPrimary"><LogIn size={17}/> Entrar na área corporativa</Link>
      </section>
    </main>
  </PublicShell>;
}
