import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, Layers3, Target } from "lucide-react";
import PublicShell from "@/components/PublicShell";
import PublicProductGallery from "@/components/PublicProductGallery";
import PublicTestimonials from "@/components/PublicTestimonials";
import PublicModelSimulator from "@/components/PublicModelSimulator";
import { PUBLIC_PRODUCTS } from "@/lib/public-products";
import { getPublicProductWithCatalog } from "@/lib/public-product-catalog";

export function generateStaticParams(){return PUBLIC_PRODUCTS.map(p=>({slug:p.slug}));}

export default async function ProductPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const product=await getPublicProductWithCatalog(slug);
  if(!product)notFound();
  const related=PUBLIC_PRODUCTS.filter(item=>item.slug!==product.slug&&item.profiles.some(profile=>product.profiles.includes(profile))).slice(0,2);
  return <PublicShell><main className="publicMain productDetailPage">
    <Link href="/negocios" className="publicBack"><ArrowLeft size={16}/> Voltar ao portfólio</Link>
    <section className="publicProductHero phase3ProductHero"><div><small>{product.eyebrow}</small><h1>{product.name}</h1><p>{product.description}</p><span>{product.audience}</span></div><div className="productHeroMeta"><div><Target/><span>Perfil</span><b>{product.category}</b></div><div><Compass/><span>Escopo</span><b>{product.scope}</b></div><div><Layers3/><span>Estrutura</span><b>{product.structure}</b></div></div></section>
    <div className="publicFacts">{product.facts.map(f=><div key={f.label}><span>{f.label}</span><b>{f.value}</b>{f.note&&<small>{f.note}</small>}</div>)}</div>
    <section className="productDetailIntro"><div><small>VISÃO GERAL</small><h2>Entenda o modelo antes de avançar.</h2><p>Esta página reúne o material público disponível para consulta e organiza os principais pontos de leitura. Não substitui simulação, proposta ou validação de condições vigentes.</p></div><ul>{product.tags.map(tag=><li key={tag}><CheckCircle2 size={17}/>{tag}</li>)}</ul></section>
    <PublicProductGallery product={product}/>
    <PublicTestimonials placement={product.slug} title={`Depoimentos relacionados a ${product.name}`}/>
    {related.length>0&&<section className="relatedProducts"><div className="relatedHead"><small>TAMBÉM PODE FAZER SENTIDO</small><h2>Continue comparando o portfólio.</h2></div><div>{related.map(item=><Link key={item.slug} href={`/negocios/${item.slug}`}><small>{item.category}</small><b>{item.name}</b><span>{item.audience}</span><strong>Ver modelo <ArrowRight size={15}/></strong></Link>)}</div></section>}
    <section className="publicCta"><div><small>PRÓXIMO PASSO</small><h2>Pronto para simular este modelo?</h2><p>A apresentação vem primeiro. Continue abaixo para montar o cenário no motor público quando disponível ou seguir para o atendimento personalizado — sempre sem exigir login corporativo.</p></div><a href="#simulacao" className="ctaPrimary">Simular este modelo <ArrowRight size={17}/></a></section>
    <section id="simulacao" className="publicEmbeddedSimulation"><PublicModelSimulator slug={product.slug} embedded/></section>
  </main></PublicShell>;
}
