import type { CommercialState, Simulation } from "./types";
import { createClient } from "./supabase/client";
import { getPublishedPremises } from "./data/premises-repository";

export type RepoResult=
 | {ok:true;id?:string;sessionId?:string;simulationId?:string;proposalId?:string;pdfPath?:string;pdf?:Blob}
 | {ok:false;reason:string};

export async function getCurrentAppUser(){
  const supabase=createClient();
  const {data:{user},error}=await supabase.auth.getUser();
  if(error||!user)return null;
  const {data}=await supabase.from("users")
    .select("id,name,email,role,auth_user_id")
    .eq("auth_user_id",user.id).maybeSingle();
  return data?{...data,authId:user.id}:null;
}

async function resolveCustomerId(phone:string){
  const p=String(phone||"").trim();
  if(!p)return null;
  const {data}=await createClient().from("customers").select("id").eq("phone",p).limit(1).maybeSingle();
  return data?.id??null;
}

export async function saveCommercialSession(state:CommercialState):Promise<RepoResult>{
  const supabase=createClient();
  const user=await getCurrentAppUser();
  if(!user)return {ok:false,reason:"not_authenticated"};

  const customerId=await resolveCustomerId(state.client.phone);
  const payload={
    user_id:user.id,
    customer_id:customerId,
    client:state.client,
    step:state.step,
    selected_product_route:state.selectedProductRoute||"",
    updated_at:new Date().toISOString()
  };

  const remoteId=localStorage.getItem("locagora_commercial_session_id");
  if(remoteId){
    const {data,error}=await supabase.from("commercial_sessions")
      .update(payload).eq("id",remoteId).select("id").maybeSingle();
    if(!error&&data)return {ok:true,id:data.id,sessionId:data.id};
  }

  const {data,error}=await supabase.from("commercial_sessions")
    .insert(payload).select("id").single();
  if(error)return {ok:false,reason:error.message};
  localStorage.setItem("locagora_commercial_session_id",data.id);
  return {ok:true,id:data.id,sessionId:data.id};
}

export async function saveRemoteSimulation(simulation:Simulation,state:CommercialState):Promise<RepoResult>{
  const session=await saveCommercialSession(state);
  if(!session.ok)return session;
  const user=await getCurrentAppUser();
  if(!user)return {ok:false,reason:"not_authenticated"};

  const premises=await getPublishedPremises();
  const payload={
    session_id:session.sessionId!,
    user_id:user.id,
    premise_version_id:premises.id==="legacy-default"?null:premises.id,
    premise_version:premises.version,
    premise_snapshot:premises.config,
    product_route:simulation.sourceRoute,
    product_name:simulation.name,
    local_id:simulation.id,
    capital:simulation.capital,
    monthly:simulation.monthly,
    annual:simulation.annual||simulation.monthly*12,
    details:simulation.details||{},
    updated_at:new Date().toISOString()
  };

  if(simulation.remoteId){
    const {data,error}=await createClient().from("commercial_simulations")
      .update(payload).eq("id",simulation.remoteId).select("id").single();
    return error?{ok:false,reason:error.message}:{ok:true,id:data.id,simulationId:data.id,sessionId:session.sessionId};
  }

  const {data,error}=await createClient().from("commercial_simulations")
    .insert(payload).select("id").single();
  return error?{ok:false,reason:error.message}:{ok:true,id:data.id,simulationId:data.id,sessionId:session.sessionId};
}

export async function saveRemoteProposal(state:CommercialState,simulation:Simulation):Promise<RepoResult>{
  const session=await saveCommercialSession(state);
  if(!session.ok)return session;
  const user=await getCurrentAppUser();
  if(!user)return {ok:false,reason:"not_authenticated"};

  let simulationId=simulation.remoteId;
  if(!simulationId){
    const sr=await saveRemoteSimulation(simulation,state);
    if(!sr.ok)return sr;
    simulationId=sr.simulationId;
  }

  const validDays=Number(state.proposal.validityDays||7);
  const baseDate=state.proposal.date?new Date(`${state.proposal.date}T12:00:00`):new Date();
  baseDate.setDate(baseDate.getDate()+validDays);
  const validUntil=baseDate.toISOString().slice(0,10);

  const premises=await getPublishedPremises();
  const payload={
    session_id:session.sessionId!,
    simulation_id:simulationId!,
    premise_version_id:premises.id==="legacy-default"?null:premises.id,
    premise_version:premises.version,
    premise_snapshot:premises.config,
    user_id:user.id,
    client:state.client,
    proposal:state.proposal,
    status:"draft",
    valid_until:validUntil,
    updated_at:new Date().toISOString()
  };

  if(state.proposal.remoteId){
    const {data,error}=await createClient().from("commercial_proposals")
      .update(payload).eq("id",state.proposal.remoteId).select("id").single();
    return error?{ok:false,reason:error.message}:{ok:true,id:data.id,proposalId:data.id,simulationId,sessionId:session.sessionId};
  }

  const {data,error}=await createClient().from("commercial_proposals")
    .insert(payload).select("id").single();
  return error?{ok:false,reason:error.message}:{ok:true,id:data.id,proposalId:data.id,simulationId,sessionId:session.sessionId};
}

export async function finalizeRemoteProposal(state:CommercialState,simulation:Simulation):Promise<RepoResult>{
  const saved=await saveRemoteProposal(state,simulation);
  if(!saved.ok)return saved;

  const pdfResponse=await fetch("/api/proposal/pdf",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({client:state.client,simulation,proposal:state.proposal})
  });
  if(!pdfResponse.ok)return {ok:false,reason:"pdf_generation_failed"};
  const pdf=await pdfResponse.blob();

  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return {ok:false,reason:"not_authenticated"};
  const path=`${user.id}/${saved.proposalId}.pdf`;

  const {error:uploadError}=await supabase.storage.from("commercial-proposals")
    .upload(path,pdf,{contentType:"application/pdf",upsert:true});
  if(uploadError)return {ok:false,reason:`pdf_upload_failed: ${uploadError.message}`};

  const {error:updateError}=await supabase.from("commercial_proposals").update({
    status:"generated",
    pdf_path:path,
    generated_at:new Date().toISOString(),
    updated_at:new Date().toISOString()
  }).eq("id",saved.proposalId!);
  if(updateError)return {ok:false,reason:updateError.message};

  return {...saved,ok:true,pdfPath:path,pdf};
}


export async function finalizeRemoteProposalWithPdf(state:CommercialState,simulation:Simulation,pdf:Blob):Promise<RepoResult>{
  const saved=await saveRemoteProposal(state,simulation);
  if(!saved.ok)return saved;
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return {ok:false,reason:"not_authenticated"};
  const path=`${user.id}/${saved.proposalId}.pdf`;
  const {error:uploadError}=await supabase.storage.from("commercial-proposals")
    .upload(path,pdf,{contentType:"application/pdf",upsert:true});
  if(uploadError)return {ok:false,reason:`pdf_upload_failed: ${uploadError.message}`};
  const {error:updateError}=await supabase.from("commercial_proposals").update({
    status:"generated",pdf_path:path,generated_at:new Date().toISOString(),updated_at:new Date().toISOString()
  }).eq("id",saved.proposalId!);
  if(updateError)return {ok:false,reason:updateError.message};
  return {...saved,ok:true,pdfPath:path,pdf};
}

export async function loadCommercialHistory(client:{phone?:string;name?:string}){
  const supabase=createClient();
  let query=supabase.from("commercial_sessions")
    .select("id,client,step,selected_product_route,status,created_at,updated_at,commercial_simulations(id,product_name,capital,monthly,annual,created_at),commercial_proposals(id,status,pdf_path,valid_until,created_at)")
    .order("updated_at",{ascending:false})
    .limit(10);

  const phone=String(client.phone||"").trim();
  const name=String(client.name||"").trim();
  if(phone)query=query.contains("client",{phone});
  else if(name)query=query.contains("client",{name});
  else return {data:[],error:null};

  return query;
}

export async function getSignedProposalUrl(path:string){
  const {data,error}=await createClient().storage.from("commercial-proposals").createSignedUrl(path,600);
  return error?null:data.signedUrl;
}
