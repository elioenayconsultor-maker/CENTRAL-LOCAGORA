"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPinned, TrendingUp, Users, Bike, Globe2, ArrowRight, ExternalLink, Expand, Minimize2 } from "lucide-react";
import PageHero from "./PageHero";
import PublicTestimonials from "./PublicTestimonials";

const slides=[
 {tag:"QUEM É A LOCAGORA",title:"Mobilidade que virou negócio, renda e escala.",text:"A Locagora apresenta sua franquia como porta de entrada para um ecossistema de aluguel de motos, conectando mobilidade, trabalho e ativos operacionais.",accent:"ECOSSISTEMA",image:"/public-materials/franquias/page-1.webp"},
 {tag:"VISÃO",title:"Quando a moto gera renda, ela deixa de ser apenas transporte.",text:"A narrativa comercial posiciona a motocicleta como ferramenta de trabalho e ativo produtivo para quem depende de mobilidade para gerar renda.",accent:"ATIVO",image:"/public-materials/locinvest/page-3.webp"},
 {tag:"MERCADO",title:"Uma mudança estrutural no mercado de duas rodas.",text:"A expansão de delivery, locação e trabalho por aplicativo ampliou a demanda por motos. Indicadores de mercado devem sempre ser apresentados com fonte e período.",accent:"MERCADO",image:"/public-materials/locinvest/page-4.webp"},
 {tag:"ORIGEM",title:"A história começa observando um problema real.",text:"O material institucional apresenta Fillipe Félix identificando pessoas que queriam trabalhar de moto e não conseguiam comprar uma, evoluindo para a expansão do modelo de franquias.",accent:"HISTÓRIA",image:"/public-materials/exclusive/page-8.webp"},
 {tag:"PROPÓSITO",title:"Acelerar vidas, alimentar sonhos e abrir caminhos.",text:"A mensagem institucional conecta locatário, franqueado, parceiro, empresa e investidor em um mesmo ecossistema de mobilidade e geração de renda.",accent:"PROPÓSITO",image:"/public-materials/exclusive/page-10.webp"},
 {tag:"MODELO",title:"Você investe → compra motos → Locagora opera → você recebe.",text:"O modelo apresentado reúne ativos, proteção, plataforma digital, suporte operacional e treinamento, com papéis claros entre investimento e operação.",accent:"OPERAÇÃO",image:"/public-materials/locinvest/page-1.webp"},
 {tag:"REDE",title:"Escala nacional construída com franquias e operação distribuída.",text:"A rede combina presença geográfica, unidades operacionais e uma frota crescente. O módulo Benchmark mostra os números com origem identificada e sem preencher lacunas com estimativas.",accent:"ESCALA",image:"/public-materials/franquias/page-6.webp"},
 {tag:"EXPANSÃO",title:"Brasil, Portugal e Espanha no radar da expansão.",text:"A estratégia internacional apresentada conecta mobilidade, imigração, trabalho por aplicativo e geração de receita em mercados com moedas e perfis diferentes.",accent:"INTERNACIONAL",image:"/public-materials/internacional/page-8.webp"}
];

export default function History(){
 const [story,setStory]=useState(0);const [fullscreen,setFullscreen]=useState(false);const stageRef=useRef<HTMLDivElement>(null);const current=slides[story];
 const prev=()=>setStory(v=>(v-1+slides.length)%slides.length);const next=()=>setStory(v=>(v+1)%slides.length);
 useEffect(()=>{const on=()=>setFullscreen(Boolean(document.fullscreenElement));document.addEventListener("fullscreenchange",on);return()=>document.removeEventListener("fullscreenchange",on)},[]);
 useEffect(()=>{const on=(e:KeyboardEvent)=>{if(!fullscreen)return;if(e.key==="ArrowLeft")prev();if(e.key==="ArrowRight")next()};window.addEventListener("keydown",on);return()=>window.removeEventListener("keydown",on)},[fullscreen]);
 const toggle=async()=>{if(!stageRef.current)return;if(document.fullscreenElement)await document.exitFullscreen();else await stageRef.current.requestFullscreen()};
 return <main className="workspace historyWorkspace">
  <PageHero kicker="HISTÓRIA • APRESENTAÇÃO COMERCIAL" title="Apresente a Locagora direto na Central." description="Roteiro digital para conduzir a conversa com o cliente sem abrir PDF: história, mercado, modelo, rede e expansão em uma sequência única."/>
  <section className="panel historyPanel"><div className="historyPublicLink"><div><small>VERSÃO PARA CLIENTES</small><b>Esta apresentação também está disponível sem senha.</b></div><a href="/historia" target="_blank" rel="noreferrer">Abrir apresentação pública <ExternalLink size={15}/></a></div>
   <div className="historyQuick"><div><Users/><span>Franquias<b>crescimento da rede</b></span></div><div><Bike/><span>Mobilidade<b>ativos em operação</b></span></div><div><TrendingUp/><span>Mercado<b>demanda estrutural</b></span></div><div><Globe2/><span>Expansão<b>Brasil + Europa</b></span></div></div>
   <div className="storyStage historyStage" ref={stageRef}>
    <div className="storyVisual phase7StoryVisual"><div className="storyCopy"><small>{current.tag}</small><span>{String(story+1).padStart(2,"0")} / {String(slides.length).padStart(2,"0")}</span><h3>{current.title}</h3><p>{current.text}</p><b>{current.accent}</b></div><div className="storyMedia"><img src={current.image} alt={current.title} onError={e=>{e.currentTarget.src="/locagora-story/historia.jpg"}}/></div><button className="historyFullscreen" onClick={()=>void toggle()}>{fullscreen?<Minimize2/>:<Expand/>}{fullscreen?"Sair":"Tela cheia"}</button></div>
    <div className="storyNav"><button onClick={prev} aria-label="Anterior"><ChevronLeft/></button><div>{slides.map((_,i)=><button key={i} className={i===story?"active":""} onClick={()=>setStory(i)} aria-label={`Slide ${i+1}`}/>)}</div><button onClick={next} aria-label="Próximo"><ChevronRight/></button></div>
   </div>
   <div className="historyRoute"><span><MapPinned/> História</span><ArrowRight/><span>Mercado</span><ArrowRight/><span>Modelo</span><ArrowRight/><span>Rede</span><ArrowRight/><span>Benchmark</span><ArrowRight/><span>Proposta</span></div>
  </section>
  <PublicTestimonials placement="history"/>
 </main>
}
