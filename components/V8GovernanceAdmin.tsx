"use client";
import { useEffect, useMemo, useState } from "react";
import { Activity, CheckCircle2, RefreshCcw, ShieldCheck, Trash2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Member={userId:string;email:string;name:string;role:"admin"|"gestor"|"closer"|"visualizacao";active:boolean;teamName:string;createdAt:string;updatedAt:string};
type Audit={id:number;action:string;entity_type:string;entity_id?:string|null;actor_email?:string|null;metadata:Record<string,unknown>;created_at:string};
type Health={aiConfigured:boolean;proposalModelConfigured:boolean;supabaseConfigured:boolean;serviceRoleConfigured?:boolean;resendConfigured?:boolean;leadFromEmailConfigured?:boolean;appUrlConfigured:boolean;generatedAt:string};
const roleLabels={admin:"Administrador",gestor:"Gestor",closer:"Closer",visualizacao:"Visualização"};

export default function V8GovernanceAdmin(){
 const supabase=useMemo(()=>createClient(),[]);
 const [members,setMembers]=useState<Member[]>([]);const [audits,setAudits]=useState<Audit[]>([]);const [health,setHealth]=useState<Health|null>(null);const [status,setStatus]=useState("");const [busy,setBusy]=useState(false);
 const token=async()=>{const {data}=await supabase.auth.getSession();return data.session?.access_token||""};
 const load=async()=>{setBusy(true);setStatus("");try{const t=await token();const [accessRes,healthRes,auditRes]=await Promise.all([fetch("/api/admin/access",{headers:{Authorization:`Bearer ${t}`},cache:"no-store"}),fetch("/api/system/status",{cache:"no-store"}),supabase.from("commercial_audit_log").select("id,action,entity_type,entity_id,actor_email,metadata,created_at").order("created_at",{ascending:false}).limit(30)]);const access=await accessRes.json();if(!accessRes.ok)throw new Error(access.message||access.reason||"Falha ao carregar acessos.");setMembers(access.members||[]);setHealth(await healthRes.json());if(!auditRes.error)setAudits((auditRes.data||[]) as Audit[]);}catch(e){setStatus(e instanceof Error?e.message:"Falha ao carregar governança.");}finally{setBusy(false)}};
 useEffect(()=>{void load()},[]);
 const updateMember=async(member:Member)=>{setBusy(true);setStatus("Salvando usuário...");try{const t=await token();const res=await fetch("/api/admin/access",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({userId:member.userId,role:member.role,teamName:member.teamName})});const data=await res.json();if(!res.ok)throw new Error(data.message||data.reason||"Falha ao atualizar acesso.");setStatus("Usuário atualizado com sucesso.");await load();}catch(e){setStatus(e instanceof Error?e.message:"Falha ao atualizar acesso.");}finally{setBusy(false)}};
 const patch=(id:string,change:Partial<Member>)=>setMembers(xs=>xs.map(x=>x.userId===id?{...x,...change}:x));
 const revoke=async(member:Member)=>{if(!confirm(`Revogar o acesso de ${member.email}?`))return;setBusy(true);setStatus("Revogando acesso...");try{const t=await token();const res=await fetch("/api/admin/access",{method:"DELETE",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({userId:member.userId})});const data=await res.json();if(!res.ok)throw new Error(data.message||data.reason||"Falha ao revogar acesso.");setStatus("Acesso revogado.");await load();}catch(e){setStatus(e instanceof Error?e.message:"Falha ao revogar acesso.");}finally{setBusy(false)}};
 const checks=health?[{label:"Supabase público",ok:health.supabaseConfigured},{label:"Chave servidor",ok:Boolean(health.serviceRoleConfigured)},{label:"Resend",ok:Boolean(health.resendConfigured)},{label:"Remetente comercial",ok:Boolean(health.leadFromEmailConfigured)},{label:"URL da aplicação",ok:health.appUrlConfigured}]:[];
 return <>
  <section className="adminSection v8Governance"><div className="sectionHead"><small>V8 • GOVERNANÇA E ACESSOS</small><h2>Usuários, permissões e equipes</h2><p>Todo novo usuário autenticado entra automaticamente como Closer. O administrador pode alterar função, equipe e situação do acesso depois do cadastro.</p></div>
   <div className="v8AccessComposer"><div><b>{members.length} usuários cadastrados</b><small style={{display:"block"}}>Novos cadastros aparecem automaticamente nesta lista.</small></div><button className="secondary" onClick={()=>void load()} disabled={busy}><RefreshCcw size={17}/> Atualizar lista</button></div>
   {status&&<div className="adminStatus"><CheckCircle2/>{status}</div>}
   <div className="v8MemberList">{members.length?members.map(m=><article key={m.userId} className={!m.active?"inactive":""} style={{alignItems:"stretch",gap:12}}>
     <div style={{minWidth:220}}><Users size={17}/><span><b>{m.name||m.email}</b><small>{m.email}</small><small>{m.active?"Ativo":"Inativo"}</small></span></div>
     <label style={{display:"grid",gap:6,minWidth:170}}><small>Permissão</small><select value={m.role} onChange={e=>patch(m.userId,{role:e.target.value as Member["role"]})}>{Object.entries(roleLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
     <label style={{display:"grid",gap:6,minWidth:190,flex:1}}><small>Equipe</small><input value={m.teamName||""} onChange={e=>patch(m.userId,{teamName:e.target.value})} placeholder="Ex.: Equipe Minas, Closer BH"/></label>
     <div style={{display:"flex",gap:8,alignItems:"end"}}><button className="primary" disabled={busy} onClick={()=>void updateMember(m)}>Salvar</button>{m.active&&<button className="v8Danger" onClick={()=>void revoke(m)} title="Revogar acesso"><Trash2 size={16}/> Revogar</button>}</div>
   </article>):<p>Nenhum usuário carregado.</p>}</div>
  </section>
  <section className="adminSection"><div className="sectionHead"><small>V8 • SAÚDE DO SISTEMA</small><h2>Produção e integrações</h2><p>Diagnóstico sem revelar chaves ou segredos.</p></div><div className="v8HealthGrid">{checks.map(c=><article key={c.label} className={c.ok?"ok":"warn"}><ShieldCheck/><span>{c.label}</span><b>{c.ok?"Configurado":"Pendente"}</b></article>)}</div></section>
  <section className="adminSection"><div className="sectionHead"><small>V8 • AUDITORIA</small><h2>Alterações críticas recentes</h2><p>Registro de mudanças de função, equipe e revogação de acesso.</p></div><div className="v8AuditList">{audits.length?audits.map(a=><article key={a.id}><Activity size={16}/><div><b>{a.action.replaceAll("_"," ")}</b><span>{a.actor_email||"sistema"} • {new Date(a.created_at).toLocaleString("pt-BR")}</span><small>{a.entity_type}{a.entity_id?` • ${a.entity_id}`:""}</small></div></article>):<p>Nenhum evento de auditoria registrado ainda.</p>}</div></section>
 </>;
}
