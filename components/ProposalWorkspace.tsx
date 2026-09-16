"use client";
import { useEffect, useMemo, useState } from "react";
import { Bot, CloudUpload, FileDown, Maximize2, PencilLine, RefreshCw, RotateCcw, ShieldCheck } from "lucide-react";
import ProposalDeck, { defaultProposalLayout, defaultProposalPageLayout, type ProposalLayout } from "./ProposalDeck";
import FinancialAnalysisPanel from "./FinancialAnalysisPanel";
import { deterministicNarrative } from "@/lib/proposal-ai";
import { finalizeRemoteProposalWithPdf, saveRemoteProposal } from "@/lib/commercial-repository";
import { generateProposalPdfBlob } from "@/lib/client-pdf";
import type { ClientProfile, CommercialState, ProposalState, Simulation } from "@/lib/types";
import { getMyConsultantProfile } from "@/lib/consultant-profile";

const pageNames=["Capa","Página 01","Página 02","Página 03","Página 04","Página 05","Página 06","Página 07","Página 08","Contracapa"];

export default function ProposalWorkspace({client,simulation,proposal,onChange,onBack,onFinalized,state}:{client:ClientProfile;simulation:Simulation;proposal:ProposalState;onChange:(patch:Partial<ProposalState>)=>void;onBack:()=>void;onFinalized?:()=>void;state:CommercialState;}){
 const missing=!client.name||!simulation||!proposal.title||!proposal.date||!proposal.validityDays||!proposal.consultant||!proposal.consultantPhone;
 const [aiLoading,setAiLoading]=useState(false);
 const [saving,setSaving]=useState(false);
 const [status,setStatus]=useState("");
 const [selectedPage,setSelectedPage]=useState(0);
 const [layout,setLayout]=useState<ProposalLayout>(()=>defaultProposalLayout());
 const [consultantProfileStatus,setConsultantProfileStatus]=useState("Carregando consultor vinculado ao acesso...");
 useEffect(()=>{let alive=true;const sync=async()=>{try{const profile=await getMyConsultantProfile();if(!alive||!profile)return;onChange({consultant:profile.name,consultantPhone:profile.phone,consultantEmail:profile.email,consultantPhoto:profile.avatarUrl||undefined});setConsultantProfileStatus("Consultor vinculado ao seu acesso corporativo.");}catch{if(alive)setConsultantProfileStatus("Não foi possível carregar o perfil do consultor.");}};void sync();const refresh=()=>void sync();window.addEventListener("locagora:consultant-profile-updated",refresh);return()=>{alive=false;window.removeEventListener("locagora:consultant-profile-updated",refresh)}},[]);
 const activeLayout=useMemo(()=>layout.pages[selectedPage]||defaultProposalPageLayout(),[layout,selectedPage]);
 const patchActive=(patch:Partial<typeof activeLayout>)=>setLayout(current=>({...current,pages:{...current.pages,[selectedPage]:{...(current.pages[selectedPage]||defaultProposalPageLayout()),...patch}}}));
 const resetPage=()=>patchActive(defaultProposalPageLayout());
 const resetAll=()=>setLayout(defaultProposalLayout());
 const presentSelected=async()=>{const page=document.querySelector<HTMLElement>(`#proposalDeck [data-proposal-page="${selectedPage}"]`);if(page?.requestFullscreen)await page.requestFullscreen();};
 const generateAI=async()=>{setAiLoading(true);setStatus("");try{const res=await fetch("/api/proposal/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({client,simulation,proposal})});const data=await res.json();if(!res.ok){onChange({aiNarrative:deterministicNarrative(client,simulation),aiGeneratedAt:new Date().toISOString()});if(data.error==="openai_quota_exhausted")setStatus("Créditos da API OpenAI esgotados. A proposta continua funcionando com a narrativa segura local. Para reativar a IA, adicione créditos ao faturamento da API OpenAI.");else if(data.error==="openai_invalid_key")setStatus("A chave da API OpenAI não foi aceita. A proposta continua com a narrativa segura local. Revise OPENAI_API_KEY na Vercel.");else setStatus(data.message||"IA temporariamente indisponível. A proposta continua com a narrativa segura local.");}else{onChange({aiNarrative:data.narrative,aiGeneratedAt:data.generatedAt});setStatus(`Narrativa gerada e validada por IA (${data.model}).`);}}catch(e){onChange({aiNarrative:deterministicNarrative(client,simulation),aiGeneratedAt:new Date().toISOString()});setStatus(`IA indisponível: ${e instanceof Error?e.message:"erro de rede"}. Aplicado fallback determinístico seguro.`);}finally{setAiLoading(false)}};
 const saveDraft=async()=>{setSaving(true);setStatus("");const next={...state,proposal};const result=await saveRemoteProposal(next,simulation);if(result.ok){onChange({remoteId:result.proposalId});setStatus("Rascunho salvo no Supabase.");}else setStatus(`Não foi possível salvar no Supabase: ${result.reason}`);setSaving(false);};
 const finalize=async()=>{setSaving(true);setStatus("Gerando PDF Full HD 16:9...");try{const pdf=await generateProposalPdfBlob();const url=URL.createObjectURL(pdf);const a=document.createElement("a");a.href=url;a.download=`Proposta_Locagora_${client.name.replace(/\s+/g,"_")}.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);const next={...state,proposal};const remote=await finalizeRemoteProposalWithPdf(next,simulation,pdf);if(remote.ok){onChange({remoteId:remote.proposalId});setStatus("PDF Full HD gerado, baixado e salvo no histórico privado do Supabase.");}else setStatus(`PDF Full HD gerado e baixado. Histórico remoto pendente: ${remote.reason}`);onFinalized?.();}catch(e){setStatus(`Falha ao gerar PDF: ${e instanceof Error?e.message:"erro desconhecido"}. Tente novamente após recarregar a página.`);}finally{setSaving(false)}};
 return <section className="proposalWorkspace proposalWorkspaceV86">
  <div className="proposalToolbar panel noPrint">
   <div className="sectionHead"><small>05 • PROPOSTA PREMIUM + IA</small><h2>Proposta comercial de 10 páginas</h2><p>Capa + páginas 01–08 + contracapa. Todas as páginas usam a mesma proporção 16:9 do PDF Full HD.</p></div>
   <div className="aiGuardrail"><ShieldCheck size={18}/><div><b>Guardrail financeiro ativo</b><span>A IA não pode introduzir algarismos, recalcular valores nem prometer rentabilidade.</span></div></div>
   <div className="formGrid proposalFields">
    <label>Título<input value={proposal.title} onChange={e=>onChange({title:e.target.value})}/></label>
    <label>Data<input type="date" value={proposal.date} onChange={e=>onChange({date:e.target.value})}/></label>
    <label>Validade (dias)<input type="number" min={1} value={proposal.validityDays} onChange={e=>onChange({validityDays:Number(e.target.value)||1})}/></label>
    <label>Consultor vinculado<input value={proposal.consultant} readOnly placeholder="Perfil do acesso"/></label>
    <label>WhatsApp do consultor<input value={proposal.consultantPhone} readOnly placeholder="Perfil do acesso"/></label>
    <label>E-mail do consultor<input value={proposal.consultantEmail||""} readOnly placeholder="Perfil do acesso"/></label>
    <label className="wide">Informação adicional<textarea rows={3} value={proposal.extraInfo} onChange={e=>onChange({extraInfo:e.target.value})}/></label>
   </div>
   <div className="statusOk"><b>Identidade do consultor:</b> {consultantProfileStatus}</div>
   {missing&&<div className="statusWarn"><b>Campos obrigatórios:</b> cliente, título, data, validade e perfil do consultor completo.</div>}
   {status&&<div className={status.includes("salv")||status.includes("validada")||status.includes("Full HD")?"statusOk":"statusWarn"}>{status}</div>}
   <div className="actions proposalActions">
    <button className="secondary" onClick={onBack}><PencilLine size={16}/> Editar cenário</button>
    <button className="secondary" disabled={aiLoading} onClick={generateAI}>{aiLoading?<RefreshCw className="spin" size={16}/>:<Bot size={16}/>} {proposal.aiNarrative?"Regenerar narrativa":"Gerar narrativa com IA"}</button>
    <button className="secondary" disabled={missing||saving} onClick={saveDraft}><CloudUpload size={16}/> Salvar rascunho</button>
    <button className="primary" disabled={missing||saving} onClick={finalize}><FileDown size={16}/>{saving?"Finalizando...":"Finalizar + salvar PDF"}</button>
   </div>
   {proposal.aiGeneratedAt&&<small className="aiTimestamp">Narrativa atualizada em {new Date(proposal.aiGeneratedAt).toLocaleString("pt-BR")}.</small>}
  </div>
  <FinancialAnalysisPanel simulation={simulation} clientName={client.name}/>
  <ProposalDeck client={client} simulation={simulation} proposal={proposal} layout={layout} selectedPage={selectedPage} onSelectPage={setSelectedPage}/>
  <div className="proposalEditorDock noPrint" role="region" aria-label="Editor visual da proposta">
   <div className="proposalEditorPageSelect"><small>EDITANDO</small><select value={selectedPage} onChange={e=>setSelectedPage(Number(e.target.value))}>{pageNames.map((name,i)=><option key={name} value={i}>{name}</option>)}</select></div>
   <label>Horizontal <input type="range" min="-22" max="22" step="0.5" value={activeLayout.x} onChange={e=>patchActive({x:Number(e.target.value)})}/><span>{activeLayout.x.toFixed(1)}%</span></label>
   <label>Vertical <input type="range" min="-22" max="22" step="0.5" value={activeLayout.y} onChange={e=>patchActive({y:Number(e.target.value)})}/><span>{activeLayout.y.toFixed(1)}%</span></label>
   <label>Texto <input type="range" min="0.75" max="1.35" step="0.02" value={activeLayout.fontScale} onChange={e=>patchActive({fontScale:Number(e.target.value)})}/><span>{Math.round(activeLayout.fontScale*100)}%</span></label>
   <div className="proposalEditorDockActions"><button type="button" onClick={resetPage} title="Restaurar página"><RotateCcw size={16}/> Página</button><button type="button" onClick={resetAll}><RotateCcw size={16}/> Tudo</button><button type="button" className="present" onClick={presentSelected}><Maximize2 size={16}/> Tela cheia</button></div>
  </div>
 </section>;
}
