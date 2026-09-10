"use client";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, ExternalLink, FileText, Minimize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PublicProduct } from "@/lib/public-products";

type DbPresentation={id:string;status:"draft"|"published"|"paused"|"archived"};
type DbPage={id:string;position:number;role:string;public_url:string|null};

export default function PublicProductGallery({product}:{product:PublicProduct}){
  const [index,setIndex]=useState(0); const [pdf,setPdf]=useState<string|undefined>(); const [presentation,setPresentation]=useState<DbPresentation|null|undefined>(undefined); const [pages,setPages]=useState<DbPage[]>([]); const [fullscreen,setFullscreen]=useState(false); const stageRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{(async()=>{try{const supabase=createClient();const [{data:doc},{data:p}]=await Promise.all([supabase.from("commercial_documents").select("public_url").eq("slug",product.slug).eq("active",true).maybeSingle(),supabase.from("commercial_public_presentations").select("id,status").eq("product_slug",product.slug).maybeSingle()]);if(doc?.public_url)setPdf(doc.public_url);if(p){setPresentation(p as DbPresentation);if(p.status==="published"){const {data:pg}=await supabase.from("commercial_public_presentation_pages").select("id,position,role,public_url").eq("presentation_id",p.id).order("position");setPages((pg||[]) as DbPage[]);}else setPages([]);}else setPresentation(null);}catch{setPresentation(null);}})();},[product.slug]);
  const legacy=Array.from({length:10},(_,i)=>({id:`legacy-${i}`,position:i+1,role:i===0?"cover":i===9?"back_cover":"page",public_url:product.slides[i]||null}));
  const slides=presentation===null?legacy:pages; const count=slides.length; const prev=()=>count&&setIndex(i=>(i-1+count)%count); const next=()=>count&&setIndex(i=>(i+1)%count);
  useEffect(()=>{if(index>=count)setIndex(0)},[count,index]);
  useEffect(()=>{const on=()=>setFullscreen(Boolean(document.fullscreenElement));document.addEventListener("fullscreenchange",on);return()=>document.removeEventListener("fullscreenchange",on)},[]);
  const toggleFullscreen=async()=>{if(!stageRef.current)return;if(!document.fullscreenElement)await stageRef.current.requestFullscreen();else await document.exitFullscreen();};
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(!fullscreen)return;if(e.key==="ArrowLeft")prev();if(e.key==="ArrowRight")next();};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)});
  if(presentation&&presentation.status!=="published")return <section className="publicProductViewer publicPresentationUnavailable"><FileText/><h3>Apresentação temporariamente indisponível</h3><p>Este material está {presentation.status==="paused"?"pausado":"fora de publicação"} no momento.</p></section>;
  if(!count)return <section className="publicProductViewer publicPresentationUnavailable"><FileText/><h3>Apresentação em atualização</h3><p>O conteúdo público deste produto está sendo preparado.</p></section>;
  const slide=slides[index];
  return <section className="publicProductViewer">
    <div className="publicSlideStage" ref={stageRef}>
      <button onClick={prev} className="slideArrow left" aria-label="Anterior"><ChevronLeft/></button>
      {slide?.public_url?<Image src={slide.public_url} alt={`${product.name} - página ${index+1}`} width={1920} height={1080} className="publicSlide" priority={index===0} unoptimized={slide.public_url.startsWith("http")}/>:<div className="publicSlidePlaceholder"><small>{index===0?"CAPA":index===count-1?"CONTRACAPA":`PÁGINA ${String(index).padStart(2,"0")}`}</small><h3>{product.name}</h3><p>Conteúdo desta página em atualização.</p></div>}
      <button onClick={next} className="slideArrow right" aria-label="Próxima"><ChevronRight/></button>
      <div className="presentationOverlay"><span>Página {index+1} de {count}</span><button onClick={()=>void toggleFullscreen()}>{fullscreen?<Minimize2 size={17}/>:<Expand size={17}/>} {fullscreen?"Sair da tela cheia":"Tela cheia"}</button></div>
    </div>
    <div className="slideDots slidePageNav">{slides.map((_,i)=><button key={_.id} onClick={()=>setIndex(i)} className={i===index?"active":""} aria-label={`Ir para página ${i+1}`}>{String(i+1).padStart(2,"0")}</button>)}</div>
    <div className="publicMaterialActions"><span><FileText size={17}/> Apresentação • {index+1} de {count}</span>{pdf&&<a href={pdf} target="_blank" rel="noreferrer"><ExternalLink size={16}/> Ver PDF publicado</a>}</div>
  </section>
}
