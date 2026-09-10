"use client";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Instagram, Facebook, Youtube, Linkedin, Music2, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import PageHero from "./PageHero";

type Item={title:string;link:string;publishedAt:string;source:string;sourceDomain?:string;kind?:string;category?:string;country?:string;city?:string;imageUrl?:string;};
const FILTERS=[["todas","Todas"],["locagora","Locagora"],["motos","Motos"],["carros","Locação de carros"],["investimentos","Investimentos / Finanças"],["portugal","Portugal"],["espanha","Espanha"]] as const;
const SOCIALS=[{name:"Instagram",handle:"@locagoraoficial",url:"https://www.instagram.com/locagoraoficial/",Icon:Instagram},{name:"Facebook",handle:"LocAgora",url:"https://www.facebook.com/locagoraoficial",Icon:Facebook},{name:"YouTube",handle:"@LocAgora",url:"https://www.youtube.com/@LocAgora",Icon:Youtube},{name:"LinkedIn",handle:"Locagora Moto",url:"https://www.linkedin.com/company/locagora-moto/posts/",Icon:Linkedin},{name:"TikTok",handle:"@locagoraveiculos",url:"https://www.tiktok.com/@locagoraveiculos",Icon:Music2}];
function d(v:string){const dt=new Date(v||0);return Number.isNaN(dt.getTime())?"":dt.toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"});}

function fallbackImage(x:Item){
 const c=(x.category||"").toLowerCase();
 const country=(x.country||"").toLowerCase();
 if(c.includes("locagora"))return "/locagora-story/franquias.jpg";
 if(c.includes("moto")||c.includes("mobilidade"))return "/locagora-story/motos.jpg";
 if(c.includes("turismo")||country.includes("portugal")||country.includes("espanha"))return "/locagora-story/europa.jpg";
 if(c.includes("imigra"))return "/locagora-story/europa.jpg";
 if(c.includes("invest")||c.includes("finan"))return "/locagora-story/mercado.jpg";
 if(c.includes("franqu"))return "/locagora-story/franquias.jpg";
 return "/locagora-story/delivery.jpg";
}

function sourceInitials(source:string){
 return (source||"Fonte").replace(/[^\p{L}\p{N} ]/gu," ").split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()).join("")||"N";
}
function sourceLogo(x:Item){
 return x.sourceDomain?`https://www.google.com/s2/favicons?domain=${encodeURIComponent(x.sourceDomain)}&sz=128`:"";
}

export default function News(){
 const [cat,setCat]=useState("todas"),[items,setItems]=useState<Item[]>([]),[loading,setLoading]=useState(false),[updated,setUpdated]=useState(""),[error,setError]=useState(""),[q,setQ]=useState(""),[slide,setSlide]=useState(0),[paused,setPaused]=useState(false);
 async function load(){setLoading(true);setError("");try{const r=await fetch(`/api/news?category=${cat}&days=30`,{cache:"no-store"});const data=await r.json();setItems(data.items||[]);setUpdated(data.updatedAt||"");setSlide(0);if(data.error)setError("Algumas fontes não responderam agora.");}catch{setItems([]);setError("Não foi possível atualizar a LOCNEWS.");}finally{setLoading(false)}}
 useEffect(()=>{void load()},[cat]);
 const filtered=useMemo(()=>{const query=q.trim().toLowerCase();if(!query)return items;return items.filter(x=>[x.title,x.source,x.category,x.country,x.city].join(" ").toLowerCase().includes(query));},[items,q]);
 const newest=filtered.slice(0,5),older=filtered.slice(5),locagora=items.filter(x=>(x.category||"").toLowerCase()==="locagora").slice(0,8),active=newest[slide]||newest[0];
 useEffect(()=>{if(paused||newest.length<2)return;const id=setInterval(()=>setSlide(s=>(s+1)%newest.length),7000);return()=>clearInterval(id)},[paused,newest.length]);
 useEffect(()=>{if(slide>=newest.length)setSlide(0)},[newest.length,slide]);

 return <main className="workspace locnewsWorkspace">
  <PageHero kicker="LOCNEWS • INTELIGÊNCIA DE MERCADO" title="O que está acontecendo no mercado agora." description="Locação de motos e carros, investimentos, finanças, mobilidade, turismo, imigração e mercados estratégicos no Brasil, Portugal e Espanha." actions={<div className="locnewsRefresh"><span>{updated?`Atualizado ${d(updated)}`:""}</span><button onClick={load}><RefreshCw size={15}/>{loading?"Atualizando":"Atualizar"}</button></div>}/>
  <section className="panel locnewsTools"><div className="locnewsSearch"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar por empresa, cidade, país, fonte ou assunto"/></div><div className="locnewsFilters">{FILTERS.map(([id,label])=><button className={cat===id?"active":""} key={id} onClick={()=>setCat(id)}>{label}</button>)}</div>{error&&<div className="newsWarning">{error}</div>}</section>

  <section className="locnewsLayout">
   <div className="locnewsMain">
    <div className="locnewsSectionTitle"><small>MAIS RECENTES</small><h2>Destaques do momento</h2></div>
    {active&&<div className="newsCarousel" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}>
      <a className="newsCarouselHero" href={active.link} target="_blank" rel="noreferrer"><img className="newsCarouselImage" src={active.imageUrl||fallbackImage(active)} alt="" onError={e=>{e.currentTarget.src=fallbackImage(active)}}/><div className="newsCarouselShade"/>
       <div className="newsCarouselContent"><div className="locnewsMeta"><span>{active.category||"Notícia"}</span><b>{active.country}{active.city?` • ${active.city}`:""}</b></div><h3>{active.title}</h3><p>{active.source} • {d(active.publishedAt)}</p><strong>ABRIR NOTÍCIA <ExternalLink size={15}/></strong></div>
      </a>
      {newest.length>1&&<><button className="carouselPrev" type="button" onClick={()=>setSlide(s=>(s-1+newest.length)%newest.length)}><ChevronLeft/></button><button className="carouselNext" type="button" onClick={()=>setSlide(s=>(s+1)%newest.length)}><ChevronRight/></button><div className="carouselDots">{newest.map((_,i)=><button key={i} className={i===slide?"active":""} onClick={()=>setSlide(i)} aria-label={`Notícia ${i+1}`}/>)}</div></>}
    </div>}
    <div className="newsSecondaryStrip">{newest.filter((_,i)=>i!==slide).slice(0,3).map((x,i)=><button type="button" key={x.link+i} onClick={()=>setSlide(newest.indexOf(x))}><span>{x.category||"Notícia"}</span><b>{x.title}</b><small>{x.source}</small></button>)}</div>

    <div className="locnewsSectionTitle olderTitle"><small>ARQUIVO RECENTE</small><h2>Notícias anteriores</h2></div>
    <div className="locnewsOlderGrid editorialArchiveGrid">{older.length?older.map((x,i)=><a key={x.link+i} href={x.link} target="_blank" rel="noreferrer" className="newsArchiveCard editorialArchiveCard">
      <div className="archiveSourceMark">{sourceLogo(x)?<img src={sourceLogo(x)} alt="" onError={e=>{e.currentTarget.style.display="none"}}/>:<span>{sourceInitials(x.source)}</span>}</div>
      <div className="newsArchiveBody editorialArchiveBody">
       <div className="archiveSourceLine"><div><b>{x.source||"Fonte"}</b><small>{d(x.publishedAt)}</small></div><span className="archiveCategory">{x.category||"Notícia"}</span></div>
       <h3>{x.title}</h3>
       <div className="archiveFooter"><span>{x.country}{x.city?` • ${x.city}`:""}</span><ExternalLink size={15}/></div>
      </div>
    </a>):!loading&&<div className="empty">Nenhuma notícia encontrada com estes filtros.</div>}</div>
   </div>

   <aside className="locnewsAside"><div className="locagoraColumn premiumBrandColumn">
    <div className="locagoraBrandHero"><img src="/go/go-green.png" alt="GO Locagora"/><div><small>LOCAGORA OFICIAL</small><h2>Locagora em destaque</h2><p>Canal institucional, redes oficiais e menções recentes da marca em um só lugar.</p></div></div>
    <div className="locagoraQuickLinks">{SOCIALS.map(({name,handle,url,Icon})=><a key={name} href={url} target="_blank" rel="noreferrer"><span className="socialIconBubble"><Icon size={17}/></span><span><small>{name}</small><b>{handle}</b></span><ExternalLink size={12}/></a>)}</div>
    <div className="locagoraFeedHead"><span>MENÇÕES RECENTES</span><b>{locagora.length}</b></div>
    <div className="locagoraNewsList premium">{locagora.length?locagora.map((x,i)=><a key={x.link+i} href={x.link} target="_blank" rel="noreferrer">{x.imageUrl?<span className="locagoraThumb" style={{backgroundImage:`url(${x.imageUrl})`}}/>:<span className="locagoraThumb fallback"><img src="/go/go-green.png" alt=""/></span>}<span className="locagoraStoryText"><b>{x.title}</b><small>{x.source} • {d(x.publishedAt)}</small></span><ExternalLink size={13}/></a>):<div className="locagoraEmptyState"><img src="/go/go-gray.png" alt=""/><b>Nenhuma menção recente nesta atualização.</b><span>Use Atualizar para consultar novamente as fontes monitoradas.</span></div>}</div>
    <div className="locnewsEditorialNote premium"><b>Separação editorial</b><p>Conteúdo institucional da Locagora e cobertura jornalística externa permanecem identificados separadamente.</p></div>
   </div></aside>
  </section>
  <style jsx>{`
   .editorialArchiveGrid{gap:14px}
   .editorialArchiveCard{display:grid;grid-template-columns:76px minmax(0,1fr);min-height:158px;background:#fff;border:1px solid #dbe4ef;border-radius:18px;overflow:hidden;text-decoration:none;color:inherit;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}
   .editorialArchiveCard:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(13,42,82,.10);border-color:#b8c9dd}
   .archiveSourceMark{display:flex;align-items:center;justify-content:center;background:#f5f8fc;border-right:1px solid #e4ebf3;padding:16px}
   .archiveSourceMark img{width:42px;height:42px;object-fit:contain;border-radius:9px}
   .archiveSourceMark span{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:#e7edf5;color:#12345b;font-size:13px;font-weight:800}
   .editorialArchiveBody{position:relative;display:flex;flex-direction:column;gap:10px;padding:17px 18px 15px}
   .archiveSourceLine{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
   .archiveSourceLine>div{display:flex;flex-direction:column;gap:2px;min-width:0}
   .archiveSourceLine b{font-size:12px;line-height:1.2;color:#17375e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
   .archiveSourceLine small{font-size:10px;color:#7b8ca2}
   .archiveCategory{flex:none;padding:5px 8px;border-radius:999px;background:#eef5ff;color:#1557a5;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.04em}
   .editorialArchiveBody h3{margin:0;font-size:15px;line-height:1.28;color:#071a36}
   .archiveFooter{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:10px;color:#6f8096;font-size:11px}
   @media(max-width:720px){.editorialArchiveCard{grid-template-columns:58px minmax(0,1fr)}.archiveSourceMark{padding:10px}.archiveSourceMark img,.archiveSourceMark span{width:34px;height:34px}.archiveCategory{display:none}}
  `}</style>
 </main>
}
