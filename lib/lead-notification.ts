type NotificationLead={name:string;email:string;phone:string};
type NotificationSimulation={capital:number;invested:number;monthly:number;annual:number;qty:number;leftover:number;premiseVersion:number};

const money=(value:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(value||0);
const escapeHtml=(value:string)=>value.replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]||char));
const emailPattern=/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const fallbackFrom="Locagora <onboarding@resend.dev>";

function normalizeResendFrom(raw:string|undefined){
  const value=String(raw||"").trim().replace(/^["']+|["']+$/g,"").trim();
  if(!value)return fallbackFrom;
  if(emailPattern.test(value))return value.toLowerCase();
  const named=value.match(/^(.+?)\s*<([^<>]+)>$/);
  if(named&&emailPattern.test(named[2].trim())){
    const label=named[1].replace(/[<>\"]/g,"").trim()||"Locagora";
    return `${label} <${named[2].trim().toLowerCase()}>`;
  }
  return fallbackFrom;
}

export function getEmailProviderConfiguration(){
  const apiKey=String(process.env.RESEND_API_KEY||"").trim();
  const rawFrom=String(process.env.COMMERCIAL_LEAD_FROM_EMAIL||"").trim();
  const normalizedFrom=normalizeResendFrom(rawFrom);
  return {
    resendConfigured:Boolean(apiKey),
    resendKeyLooksValid:/^re_[A-Za-z0-9_-]{10,}$/.test(apiKey),
    leadFromEmailConfigured:Boolean(rawFrom),
    leadFromEmailLooksValid:!rawFrom||normalizedFrom!==fallbackFrom||rawFrom===fallbackFrom,
  };
}

async function sendResend(input:{to:string;subject:string;html:string;replyTo?:string}){
  const apiKey=String(process.env.RESEND_API_KEY||"").trim();
  const from=normalizeResendFrom(process.env.COMMERCIAL_LEAD_FROM_EMAIL);
  if(!apiKey)return {ok:false as const,error:"RESEND_API_KEY_not_configured"};
  if(!/^re_[A-Za-z0-9_-]{10,}$/.test(apiKey))return {ok:false as const,error:"RESEND_API_KEY_invalid_format"};
  try{
    const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({from,to:[input.to],subject:input.subject,html:input.html,...(input.replyTo?{reply_to:input.replyTo}:{})})});
    const data=await response.json().catch(()=>({})) as {id?:string;message?:string};
    if(!response.ok)return {ok:false as const,error:data.message||`resend_http_${response.status}`};
    return {ok:true as const,id:data.id||"sent"};
  }catch(error){return {ok:false as const,error:error instanceof Error?error.message:"email_provider_failed"};}
}

export async function sendCommercialLeadEmail(input:{to:string;lead:NotificationLead;simulation:NotificationSimulation;leadId:string;simulationId:string}){
  const {to,lead,simulation,leadId,simulationId}=input;
  const subject=`Novo lead LocInvest — ${lead.name} — ${money(simulation.capital)}`;
  const html=`<div style="font-family:Arial,sans-serif;color:#0b2851;line-height:1.5"><h2>Novo interesse no simulador Locagora</h2><p>Um visitante solicitou contato após visualizar um cenário LocInvest.</p><table style="border-collapse:collapse"><tr><td><b>Nome</b></td><td style="padding-left:16px">${escapeHtml(lead.name)}</td></tr><tr><td><b>E-mail</b></td><td style="padding-left:16px">${escapeHtml(lead.email)}</td></tr><tr><td><b>Telefone</b></td><td style="padding-left:16px">${escapeHtml(lead.phone)}</td></tr><tr><td><b>Capital</b></td><td style="padding-left:16px">${money(simulation.capital)}</td></tr><tr><td><b>Capital alocado</b></td><td style="padding-left:16px">${money(simulation.invested)}</td></tr><tr><td><b>Renda mensal estimada</b></td><td style="padding-left:16px">${money(simulation.monthly)}</td></tr><tr><td><b>Ativos</b></td><td style="padding-left:16px">${simulation.qty}</td></tr><tr><td><b>Premissas</b></td><td style="padding-left:16px">v${simulation.premiseVersion}</td></tr></table><p><small>Lead ${escapeHtml(leadId)} • Simulação ${escapeHtml(simulationId)}</small></p><p>Acesse o CRM da Central LOC para dar continuidade e registrar atividades/tarefas.</p></div>`;
  return sendResend({to,subject,html,replyTo:lead.email});
}

export async function sendCustomerConfirmationEmail(input:{to:string;lead:NotificationLead;simulation:NotificationSimulation;productName?:string}){
  const {to,lead,simulation}=input;const productName=input.productName||"LocInvest";
  const subject=`Recebemos sua simulação ${productName} — Locagora`;
  const html=`<div style="font-family:Arial,sans-serif;color:#0b2851;line-height:1.6;max-width:680px;margin:auto"><div style="background:#061f4b;color:white;padding:24px;border-radius:16px 16px 0 0"><b style="color:#7deb42;letter-spacing:.08em">LOCAGORA</b><h2 style="margin:8px 0 0">Recebemos seu interesse.</h2></div><div style="padding:24px;border:1px solid #dce6f3;border-top:0;border-radius:0 0 16px 16px"><p>Olá, <b>${escapeHtml(lead.name)}</b>.</p><p>Sua simulação de <b>${escapeHtml(productName)}</b> foi registrada e o time comercial poderá dar continuidade ao atendimento.</p><table style="border-collapse:collapse;width:100%;margin:18px 0"><tr><td><b>Capital de referência</b></td><td style="text-align:right">${money(simulation.capital)}</td></tr><tr><td><b>Capital alocado</b></td><td style="text-align:right">${money(simulation.invested)}</td></tr><tr><td><b>Renda mensal projetada</b></td><td style="text-align:right">${money(simulation.monthly)}</td></tr><tr><td><b>Ativos</b></td><td style="text-align:right">${simulation.qty}</td></tr><tr><td><b>Premissas</b></td><td style="text-align:right">v${simulation.premiseVersion}</td></tr></table><p style="font-size:12px;color:#64748b">Este cenário é informativo e depende das condições e premissas comerciais vigentes. Não representa garantia de rentabilidade.</p><p>Central LOC • Locagora</p></div></div>`;
  return sendResend({to,subject,html});
}

export async function sendEmailTest(to:string){
  const subject="Teste de e-mail — Central LOC";
  const html=`<div style="font-family:Arial,sans-serif;color:#0b2851"><h2>Central LOC</h2><p>O envio de e-mail está funcionando corretamente.</p><p style="color:#64748b">Teste gerado pelo painel administrativo da Locagora.</p></div>`;
  return sendResend({to,subject,html});
}

export function maskEmail(email:string){
  const [name,domain]=email.split("@");
  if(!domain)return "e-mail comercial configurado";
  const visible=name.length<=2?name[0]||"*":name.slice(0,2);
  return `${visible}${"*".repeat(Math.max(2,name.length-visible.length))}@${domain}`;
}

export async function sendCommercialInterestEmail(input:{to:string;lead:NotificationLead;productName:string;simulation?:Record<string,unknown>|null;leadId:string;simulationId?:string}){
 const capital=Number(input.simulation?.capital||0),monthly=Number(input.simulation?.monthly||0);
 const subject=`Novo lead ${input.productName} — ${input.lead.name}`;
 const scenario=input.simulation?`<tr><td><b>Capital</b></td><td style="padding-left:16px">${money(capital)}</td></tr><tr><td><b>Mensal projetado</b></td><td style="padding-left:16px">${money(monthly)}</td></tr>`:`<tr><td><b>Solicitação</b></td><td style="padding-left:16px">Simulação personalizada / contato</td></tr>`;
 const html=`<div style="font-family:Arial,sans-serif;color:#0b2851;line-height:1.5"><h2>Novo interesse público — ${escapeHtml(input.productName)}</h2><table><tr><td><b>Nome</b></td><td style="padding-left:16px">${escapeHtml(input.lead.name)}</td></tr><tr><td><b>E-mail</b></td><td style="padding-left:16px">${escapeHtml(input.lead.email)}</td></tr><tr><td><b>Telefone</b></td><td style="padding-left:16px">${escapeHtml(input.lead.phone)}</td></tr>${scenario}</table><p><small>Lead ${escapeHtml(input.leadId)}${input.simulationId?` • Simulação ${escapeHtml(input.simulationId)}`:""}</small></p></div>`;
 return sendResend({to:input.to,subject,html,replyTo:input.lead.email});
}
export async function sendCustomerInterestEmail(input:{to:string;lead:NotificationLead;productName:string;simulation?:Record<string,unknown>|null}){
 const subject=`Recebemos seu interesse em ${input.productName} — Locagora`;
 const detail=input.simulation?`O cenário concluído foi vinculado ao seu contato.`:`A equipe comercial recebeu sua solicitação de uma simulação personalizada.`;
 const html=`<div style="font-family:Arial,sans-serif;color:#0b2851;line-height:1.6;max-width:680px;margin:auto"><h2>Recebemos seu interesse.</h2><p>Olá, <b>${escapeHtml(input.lead.name)}</b>.</p><p>${detail}</p><p>Produto: <b>${escapeHtml(input.productName)}</b>.</p><p style="font-size:12px;color:#64748b">Condições e projeções dependem das premissas comerciais vigentes e não representam garantia de rentabilidade.</p><p>Central LOC • Locagora</p></div>`;
 return sendResend({to:input.to,subject,html});
}
