"use client";
import { useEffect, useMemo, useState } from "react";
import { Bot, Edit3, ExternalLink, Headphones, Plus, Save, Search, Sparkles, UsersRound, X } from "lucide-react";
import { OBJECTIONS } from "@/lib/objections";
import { createClient } from "@/lib/supabase/client";
import { getCurrentAppUser } from "@/lib/commercial-repository";
import PageHero from "./PageHero";
import NetworkContactsDirectory from "./NetworkContactsDirectory";

type Obj={
 id?:string; cat:string; q:string; why:string; answer:string; next:string;
 product_route?:string|null; active?:boolean; sort_order?:number;
};
const EMPTY:Obj={cat:"financeiro",q:"",why:"",answer:"",next:"",product_route:null,active:true};

export default function Support(){
 const [q,setQ]=useState("");
 const [cat,setCat]=useState("all");
 const [product,setProduct]=useState("all");
 const [rows,setRows]=useState<Obj[]>([...OBJECTIONS]);
 const [canManage,setCanManage]=useState(false);
 const [editing,setEditing]=useState<Obj|null>(null);
 const [selected,setSelected]=useState<Obj|null>(null);
 const [context,setContext]=useState("");
 const [ai,setAi]=useState<any>(null);
 const [aiLoading,setAiLoading]=useState(false);
 const [status,setStatus]=useState("");

 useEffect(()=>{void load()},[]);
 async function load(){
   const supabase=createClient();
   const user=await getCurrentAppUser();
   setCanManage(Boolean(user&&["ADMIN","GESTOR"].includes(String(user.role))));
   const {data,error}=await supabase.from("support_objections")
     .select("id,category,question,why,answer,next_question,product_route,active,sort_order")
     .order("sort_order",{ascending:true});
   if(!error&&data?.length){
     setRows(data.map((x:any)=>({id:x.id,cat:x.category,q:x.question,why:x.why,answer:x.answer,next:x.next_question,product_route:x.product_route,active:x.active,sort_order:x.sort_order})));
   }
 }

 const cats=Array.from(new Set(rows.map(o=>o.cat)));
 const products=Array.from(new Set(rows.map(o=>o.product_route).filter(Boolean))) as string[];
 const data=useMemo(()=>rows.filter(o=>
   (cat==="all"||o.cat===cat)&&
   (product==="all"||o.product_route===product||!o.product_route)&&
   [o.q,o.why,o.answer,o.next,o.product_route||""].join(" ").toLowerCase().includes(q.toLowerCase())
 ),[q,cat,product,rows]);

 async function save(){
   if(!editing?.q.trim()||!editing.answer.trim()) return setStatus("Informe objeção e resposta.");
   const payload={
     category:editing.cat,question:editing.q,why:editing.why,answer:editing.answer,
     next_question:editing.next,product_route:editing.product_route||null,active:editing.active!==false,
     sort_order:editing.sort_order||rows.length+1
   };
   const supabase=createClient();
   const res=editing.id
     ?await supabase.from("support_objections").update(payload).eq("id",editing.id)
     :await supabase.from("support_objections").insert(payload);
   if(res.error){setStatus(res.error.message);return;}
   setStatus("Biblioteca atualizada.");setEditing(null);await load();
 }

 async function assist(o:Obj){
   setSelected(o);setAi(null);setAiLoading(true);
   try{
     const r=await fetch("/api/support/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
       objection:o.q,baseAnswer:o.answer,product:o.product_route||"",context
     })});
     const d=await r.json();
     if(!r.ok) throw new Error(d.error||"Falha da IA");
     setAi(d);
   }catch(e){setAi({error:e instanceof Error?e.message:"IA indisponível"});}
   finally{setAiLoading(false)}
 }

 return <main className="workspace supportWorkspace"><PageHero kicker="APOIO COMERCIAL • ARGUMENTAÇÃO E CONTATOS" title="Objeções, argumentos, contatos internos e IA assistente." description="Biblioteca consultiva, diretório interno e acesso rápido aos principais sistemas corporativos da Locagora." actions={canManage?<button className="heroActionButton" onClick={()=>setEditing({...EMPTY})}><Plus size={16}/> Nova objeção</button>:undefined}/>
 <section className="panel" style={{background:"linear-gradient(135deg,#071a3f,#0d3475)",color:"white"}}>
  <div className="sectionIntro"><small style={{color:"#76ec3f"}}>SISTEMAS LOCAGORA</small><h2 style={{color:"white"}}>Acesso rápido às ferramentas do colaborador.</h2><p style={{color:"#c5d4ef"}}>Os sistemas continuam independentes e abrem em nova aba, mantendo a Central LOC disponível durante o atendimento.</p></div>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14,marginTop:18}}>
   <a href="https://chamados-ti.locgrupo.com.br/#" target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:14,padding:18,borderRadius:16,border:"1px solid rgba(255,255,255,.14)",background:"rgba(255,255,255,.07)",color:"white",textDecoration:"none"}}><span style={{display:"grid",placeItems:"center",width:48,height:48,borderRadius:14,background:"rgba(118,236,63,.14)",color:"#76ec3f",flex:"0 0 auto"}}><Headphones size={24}/></span><span style={{display:"flex",flexDirection:"column",gap:4,flex:1}}><b style={{fontSize:17}}>Chamados LOC</b><small style={{color:"#afc1df",lineHeight:1.45}}>Suporte, TI e abertura de chamados internos.</small></span><ExternalLink size={18}/></a>
   <a href="https://rh-colaborador.quark.tec.br/" target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:14,padding:18,borderRadius:16,border:"1px solid rgba(255,255,255,.14)",background:"rgba(255,255,255,.07)",color:"white",textDecoration:"none"}}><span style={{display:"grid",placeItems:"center",width:48,height:48,borderRadius:14,background:"rgba(118,236,63,.14)",color:"#76ec3f",flex:"0 0 auto"}}><UsersRound size={24}/></span><span style={{display:"flex",flexDirection:"column",gap:4,flex:1}}><b style={{fontSize:17}}>QuarkRH | Colaborador</b><small style={{color:"#afc1df",lineHeight:1.45}}>Portal do colaborador e rotinas de RH.</small></span><ExternalLink size={18}/></a>
  </div>
 </section>
 <NetworkContactsDirectory context="support"/>
 <section className="panel">
  <div className="sectionIntro"><small>ARGUMENTAÇÃO CONSULTIVA</small><h2>Objeções e respostas para avançar a conversa.</h2></div>
  <div className="objectionTools professional"><label><Search size={16}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Pesquisar objeção, argumento ou palavra-chave"/></label><select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">Todas as categorias</option>{cats.map(c=><option key={c}>{c}</option>)}</select><select value={product} onChange={e=>setProduct(e.target.value)}><option value="all">Todos os produtos</option>{products.map(p=><option key={p}>{p}</option>)}</select></div>
  {status&&<div className="supportStatus">{status}</div>}

  <div className="objectionsGrid">{data.map((o,i)=><article key={o.id||o.q} className="objectionCard professionalCard"><div className="objectionTop"><span>{String(i+1).padStart(2,"0")}</span><b>{o.cat}</b>{o.product_route&&<em>{o.product_route}</em>}</div><h3>“{o.q}”</h3><p className="objectionWhy">{o.why}</p><div className="objectionAnswer"><strong>Resposta sugerida</strong><p>{o.answer}</p></div><div className="objectionNext"><strong>Próxima pergunta</strong><p>{o.next}</p></div><div className="supportCardActions"><button onClick={()=>assist(o)}><Sparkles size={14}/> IA assistente</button>{canManage&&<button onClick={()=>setEditing({...o})}><Edit3 size={14}/> Editar</button>}</div></article>)}</div>
 </section>

 {selected&&<div className="supportDrawer"><div className="supportDrawerHead"><div><small>IA ASSISTENTE</small><h3>{selected.q}</h3></div><button onClick={()=>{setSelected(null);setAi(null)}}><X/></button></div><label>Contexto adicional da conversa<textarea value={context} onChange={e=>setContext(e.target.value)} placeholder="Ex.: cliente preocupado com prazo, está comparando com outro modelo..."/></label><button className="primary" onClick={()=>assist(selected)} disabled={aiLoading}><Bot size={16}/>{aiLoading?"Analisando...":"Gerar abordagem"}</button>{ai&&<div className="aiSupportResult">{ai.error?<p>{ai.error}</p>:<><div><small>RESPOSTA SUGERIDA</small><p>{ai.resposta_sugerida}</p></div><div><small>PERGUNTA DE AVANÇO</small><p>{ai.pergunta_de_avanco}</p></div><div className="caution"><small>CUIDADO</small><p>{ai.cuidado}</p></div></>}</div>}</div>}

 {editing&&<div className="supportModalBackdrop"><div className="supportModal"><div className="supportDrawerHead"><h3>{editing.id?"Editar objeção":"Nova objeção"}</h3><button onClick={()=>setEditing(null)}><X/></button></div><div className="supportEditGrid"><label>Categoria<input value={editing.cat} onChange={e=>setEditing({...editing,cat:e.target.value})}/></label><label>Produto (opcional)<input value={editing.product_route||""} onChange={e=>setEditing({...editing,product_route:e.target.value||null})}/></label><label className="full">Objeção<input value={editing.q} onChange={e=>setEditing({...editing,q:e.target.value})}/></label><label className="full">Por que aparece<textarea value={editing.why} onChange={e=>setEditing({...editing,why:e.target.value})}/></label><label className="full">Resposta sugerida<textarea value={editing.answer} onChange={e=>setEditing({...editing,answer:e.target.value})}/></label><label className="full">Próxima pergunta<textarea value={editing.next} onChange={e=>setEditing({...editing,next:e.target.value})}/></label></div><button className="primary" onClick={save}><Save size={16}/> Salvar na biblioteca</button></div></div>}
 </main>
}
