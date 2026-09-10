import PublicShell from "@/components/PublicShell";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, Globe2, TrendingUp } from "lucide-react";
import PublicTestimonials from "@/components/PublicTestimonials";

const story=[
  {img:"/public-materials/exclusive/page-2.webp",tag:"MOBILIDADE",title:"Um mercado que virou infraestrutura.",text:"A história da Locagora é apresentada a partir de uma mudança estrutural: a motocicleta passou de meio de transporte a ferramenta de renda e ativo operacional."},
  {img:"/public-materials/exclusive/page-8.webp",tag:"ORIGEM",title:"A oportunidade nasce de um problema real.",text:"O material institucional apresenta Fillipe Félix observando a dificuldade de quem precisava de uma moto para trabalhar e transformando essa demanda em um modelo estruturado."},
  {img:"/public-materials/franquias/page-6.webp",tag:"CRESCIMENTO",title:"De uma moto a uma rede nacional.",text:"A evolução da rede é apresentada em uma linha do tempo com crescimento de frota, franqueados e faturamento, sempre identificada como dado institucional."},
  {img:"/public-materials/internacional/page-8.webp",tag:"EXPANSÃO",title:"Do Brasil para a Europa.",text:"A expansão internacional conecta a experiência brasileira a Portugal, Espanha e outros mercados europeus em desenvolvimento."}
];
export default function PublicHistory(){return <PublicShell><main className="publicMain"><section className="publicHero"><div><small>HISTÓRIA • APRESENTAÇÃO PÚBLICA</small><h1>Conheça a Locagora antes de falar de produto.</h1><p>Uma apresentação visual, aberta e responsiva para clientes conhecerem a origem, a tese de mobilidade, o crescimento da rede e a expansão internacional.</p><div className="publicHeroActions"><Link href="/negocios" className="ctaPrimary">Conhecer negócios <ArrowRight size={17}/></Link><Link href="/acesso" className="ctaGhost">Sou colaborador</Link></div></div><div className="publicHeroStats"><div><TrendingUp/><b>Crescimento</b><span>trajetória institucional</span></div><div><Building2/><b>Rede</b><span>franquias e operação</span></div><div><Globe2/><b>Europa</b><span>expansão internacional</span></div></div></section>
<section className="storyTimeline">{story.map((s,i)=><article className="storyPublicCard" key={s.title}><div className="storyImageWrap"><Image src={s.img} alt={s.title} width={1200} height={675}/></div><div><small>{String(i+1).padStart(2,"0")} • {s.tag}</small><h2>{s.title}</h2><p>{s.text}</p></div></article>)}</section>
<PublicTestimonials placement="history"/><section className="publicCta"><div><small>PRÓXIMO PASSO</small><h2>Veja os modelos de negócios e investimentos.</h2><p>Apresentações comerciais organizadas por produto, sem necessidade de senha.</p></div><Link href="/negocios" className="ctaPrimary">Abrir portfólio <ArrowRight size={17}/></Link></section></main></PublicShell>}
