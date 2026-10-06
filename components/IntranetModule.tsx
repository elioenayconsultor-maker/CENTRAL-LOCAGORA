"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEPARTMENT_LABELS, type CorporateDepartment, type CorporatePage } from "@/lib/corporate-access";
import { safeDocumentUrl } from "@/lib/intranet";
import "./intranet.css";

type Section="announcements"|"documents"|"directory";
type Content={id:string;title:string;body?:string;description?:string;url?:string;department:string|null;published:boolean;created_at:string};
type Person={id:string;name:string;email:string;department:string|null;job_title:string|null};
const labels={announcements:"Comunicados",documents:"Documentos",directory:"Equipe"};
const sector=(v:string|null)=>v?DEPARTMENT_LABELS[v as CorporateDepartment]||v:"Toda a empresa";
const date=(v:string)=>new Date(v).toLocaleDateString("pt-BR",{timeZone:"America/Sao_Paulo"});

export function IntranetHighlights({onOpen}:{onOpen:(page:CorporatePage)=>void}){
 const db=useMemo(()=>createClient(),[]);const[items,setItems]=useState<Content[]>([]);const[failed,setFailed]=useState(false);
 useEffect(()=>{let alive=true;db.from("intranet_announcements").select("id,title,department,created_at,published").eq("published",true).order("created_at",{ascending:false}).limit(3).then(({data,error})=>{if(alive){setItems(data||[]);setFailed(Boolean(error))}});return()=>{alive=false}},[db]);
 return <section className="panel intranet"><div className="intra-heading"><div><small>FIQUE POR DENTRO</small><h2>Últimos comunicados</h2></div><button className="secondary" onClick={()=>onOpen("announcements")}>Ver comunicados</button></div>{failed?<p>Não foi possível carregar os comunicados. Abra o módulo para tentar novamente.</p>:items.length?items.map(x=><button className="intra-highlight" key={x.id} onClick={()=>onOpen("announcements")}><b>{x.title}</b><span>{sector(x.department)} · {date(x.created_at)}</span></button>):<p>Nenhum comunicado publicado ainda.</p>}</section>;
}

export default function IntranetModule({section}:{section:Section}){
 const db=useMemo(()=>createClient(),[]);
 const requestId=useRef(0);
 const[items,setItems]=useState<Content[]>([]),[people,setPeople]=useState<Person[]>([]),[admin,setAdmin]=useState(false);
 const[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const[query,setQuery]=useState(""),[department,setDepartment]=useState("");
 const[title,setTitle]=useState(""),[body,setBody]=useState(""),[url,setUrl]=useState(""),[audience,setAudience]=useState("");
 const table=section==="announcements"?"intranet_announcements":"intranet_documents";
 const load=useCallback(async()=>{const current=++requestId.current;setLoading(true);setError("");try{
  const status=await db.rpc("intranet_admin");if(current!==requestId.current)return;if(status.error)throw status.error;setAdmin(Boolean(status.data));
  if(section==="directory"){const result=await db.rpc("intranet_directory");if(current!==requestId.current)return;if(result.error)throw result.error;setPeople(result.data||[])}
  else{const result=await db.from(table).select(section==="announcements"?"id,title,body,department,published,created_at":"id,title,description,url,department,published,created_at").order("created_at",{ascending:false}).limit(500);if(current!==requestId.current)return;if(result.error)throw result.error;setItems(result.data as unknown as Content[])}
 }catch{if(current===requestId.current)setError("Não foi possível carregar este módulo. Tente novamente; se o erro continuar, procure o administrador.")}finally{if(current===requestId.current)setLoading(false)}},[db,section,table]);
 useEffect(()=>{const requests=requestId;const timer=setTimeout(()=>void load(),0);return()=>{clearTimeout(timer);requests.current++}},[load]);
 const matches=(text:string,dept:string|null)=>text.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))&&(!department||dept===department);
 const visible=items.filter(x=>matches(`${x.title} ${x.body||x.description||""}`,x.department));
 const members=people.filter(x=>matches(`${x.name} ${x.email} ${x.job_title||""}`,x.department));
 async function publish(event:FormEvent){event.preventDefault();setBusy(true);setError("");setNotice("");try{
  const link=section==="documents"?safeDocumentUrl(url):null;if(section==="documents"&&!link)throw new Error("invalid_url");
  const payload:Record<string,string|boolean|null>={title:title.trim(),department:audience||null,published:true,...(section==="announcements"?{body:body.trim()}:{description:body.trim(),url:link})};
  const result=await db.from(table).insert(payload);if(result.error)throw result.error;
  setTitle("");setBody("");setUrl("");setNotice("Publicação realizada.");await load();
 }catch(e){setError(e instanceof Error&&e.message==="invalid_url"?"Informe um endereço HTTPS válido, sem usuário ou senha na URL.":"Não foi possível publicar. Verifique seu acesso e tente novamente.")}finally{setBusy(false)}}
 async function toggle(item:Content){setBusy(true);setError("");setNotice("");const result=await db.from(table).update({published:!item.published}).eq("id",item.id).select("id");if(result.error||!result.data?.length)setError("Não foi possível atualizar a publicação.");else{setNotice(item.published?"Publicação arquivada.":"Publicação disponibilizada.");await load()}setBusy(false)}
 return <main className="workspace intranet"><section className="panel"><div className="intra-heading"><div><small>INTRANET LOCAGORA</small><h1>{labels[section]}</h1><p>{section==="directory"?"Contatos profissionais dos colaboradores ativos.":section==="documents"?"Manuais, políticas e materiais da empresa e do seu setor.":"Avisos da empresa e informações do seu setor."}</p></div><button className="secondary" disabled={loading||busy} onClick={()=>void load()}>Atualizar</button></div>
 <div className="intra-filters"><label>Pesquisar<input value={query} onChange={e=>setQuery(e.target.value)} placeholder={section==="directory"?"Nome, cargo ou e-mail":"Título ou conteúdo"}/></label><label>Setor<select value={department} onChange={e=>setDepartment(e.target.value)}><option value="">Todos os setores disponíveis</option>{Object.entries(DEPARTMENT_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label></div>
 {error&&<div role="alert" className="statusWarn">{error}</div>}{notice&&<p role="status" className="statusOk">{notice}</p>}
 {loading?<p role="status">Carregando...</p>:error?null:<><p className="intra-count">{section==="directory"?members.length:visible.length} {section==="directory"?"colaboradores":"publicações"}{section!=="directory"&&items.length===500?" · Mostrando as 500 publicações mais recentes":""}</p><div className="intra-grid">{section==="directory"?members.map(p=><article className="intra-card" key={p.id}><span className="intra-avatar" aria-hidden="true">{(p.name||p.email).slice(0,1).toUpperCase()}</span><h2>{p.name||"Colaborador"}</h2><span className="intra-tag">{sector(p.department)}</span><p>{p.job_title||"Cargo não informado"}</p><a href={`mailto:${p.email}`}>{p.email}</a></article>):visible.map(item=><article className="intra-card" key={item.id}><div className="intra-card-meta"><span className="intra-tag">{sector(item.department)}</span><small>{date(item.created_at)}</small></div>{!item.published&&<small>Arquivado · visível apenas à administração</small>}<h2>{item.title}</h2><p className="intra-body">{item.body||item.description}</p>{item.url&&safeDocumentUrl(item.url)&&<a className="intra-link" href={safeDocumentUrl(item.url)!} target="_blank" rel="noopener noreferrer">Abrir documento ↗</a>}{admin&&<button className="secondary" disabled={busy} onClick={()=>void toggle(item)}>{item.published?"Arquivar":"Publicar novamente"}</button>}</article>)}</div>{!(section==="directory"?members.length:visible.length)&&<div className="intra-empty"><h2>{query||department?"Nenhum resultado encontrado":"Ainda não há itens disponíveis"}</h2><p>{query||department?"Altere a pesquisa ou o filtro de setor.":"Os itens aparecerão aqui quando forem disponibilizados."}</p></div>}</>}
 </section>{admin&&section!=="directory"&&<section className="panel"><h2>{section==="announcements"?"Publicar comunicado":"Adicionar documento"}</h2><form className="intra-form" onSubmit={publish}><label>Título<input required minLength={3} maxLength={160} value={title} onChange={e=>setTitle(e.target.value)}/></label><label>Público<select value={audience} onChange={e=>setAudience(e.target.value)}><option value="">Toda a empresa</option>{Object.entries(DEPARTMENT_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label>{section==="announcements"?"Mensagem":"Descrição"}<textarea required={section==="announcements"} minLength={section==="announcements"?3:undefined} maxLength={section==="announcements"?10000:2000} rows={5} value={body} onChange={e=>setBody(e.target.value)}/></label>{section==="documents"&&<><label>Link do documento<input type="url" required placeholder="https://" value={url} onChange={e=>setUrl(e.target.value)}/></label><p>Use um arquivo com acesso restrito no serviço onde está armazenado. O acesso ao link nesta intranet não altera as permissões do arquivo.</p></>}<button className="primary" disabled={busy||loading}>{busy?"Publicando...":"Publicar"}</button></form></section>}</main>;
}
