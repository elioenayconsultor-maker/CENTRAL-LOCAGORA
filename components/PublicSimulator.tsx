"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Calculator, CheckCircle2, CircleDollarSign, Coins, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { getPublishedPremises } from "@/lib/data/premises-repository";
import { snapshotPremises, type PremiseSnapshot } from "@/lib/domain/premises";
import { simulatePublicLocInvest, type PublicSimulationOutput } from "@/lib/domain/public-simulator";
import { trackAnalytics } from "@/lib/analytics";

const money=(value:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(value||0);
const emailOk=(value:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function PublicSimulator(){
  const [premises,setPremises]=useState<PremiseSnapshot|null>(null);
  const [premiseError,setPremiseError]=useState(false);
  const [capital,setCapital]=useState(60000);
  const [result,setResult]=useState<PublicSimulationOutput|null>(null);
  const [calcError,setCalcError]=useState("");
  const [lead,setLead]=useState({name:"",email:"",phone:"",consent:false});
  const [sending,setSending]=useState(false);
  const [sent,setSent]=useState(false);
  const [notification,setNotification]=useState<{status:"sent"|"failed"|"not_configured";destination?:string}|null>(null);
  const [sendError,setSendError]=useState("");
  const [guideOpen,setGuideOpen]=useState(true);
  const [guidePath,setGuidePath]=useState<""|"franchise"|"investment">("");

  useEffect(()=>{
    trackAnalytics({event:"public_simulator_viewed",route:"/simulador",productRoute:"locinvest"});
    void getPublishedPremises().then(version=>{
      if(version.id==="legacy-default"||version.version<=0){setPremiseError(true);trackAnalytics({event:"public_premises_unavailable",route:"/simulador",productRoute:"locinvest"});return;}
      setPremises(snapshotPremises(version));
      trackAnalytics({event:"public_premises_loaded",route:"/simulador",productRoute:"locinvest",premiseVersion:version.version});
    }).catch(()=>{setPremiseError(true);trackAnalytics({event:"public_premises_unavailable",route:"/simulador",productRoute:"locinvest"});});
  },[]);

  const minimum=useMemo(()=>{
    if(!premises)return 0;
    const p=premises.config.locinvest.start;
    return p.bike+(p.feeOptions[0]??0)+p.appropriation;
  },[premises]);

  const simulate=()=>{
    if(!premises)return;
    try{const next=simulatePublicLocInvest({capital},premises);setResult(next);setCalcError("");setSent(false);setNotification(null);setSendError("");trackAnalytics({event:"public_simulation_calculated",route:"/simulador",productRoute:"locinvest",premiseVersion:premises.version,metadata:{capitalBand:capital<75000?"50_75k":capital<150000?"75_150k":"150k_plus",qty:next.qty}});}
    catch(error){setResult(null);setCalcError(error instanceof Error&&error.message==="capital_below_minimum"?`Para o cenário publicado atual, informe ao menos ${money(minimum)}.`:"Não foi possível calcular este cenário.");trackAnalytics({event:"public_simulation_failed",route:"/simulador",productRoute:"locinvest",premiseVersion:premises.version,metadata:{reason:error instanceof Error?error.message:"unknown"}});}
  };

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();if(!result)return;setSendError("");
    if(lead.name.trim().length<2){setSendError("Informe seu nome para continuar.");trackAnalytics({event:"public_lead_validation_failed",route:"/simulador",productRoute:"locinvest",premiseVersion:result.premiseVersion,metadata:{field:"name"}});return;}
    if(!emailOk(lead.email)){setSendError("Informe um e-mail completo, por exemplo nome@empresa.com.br.");trackAnalytics({event:"public_lead_validation_failed",route:"/simulador",productRoute:"locinvest",premiseVersion:result.premiseVersion,metadata:{field:"email"}});return;}
    if(lead.phone.replace(/\D/g,"").length<10){setSendError("Informe um telefone/WhatsApp com DDD.");trackAnalytics({event:"public_lead_validation_failed",route:"/simulador",productRoute:"locinvest",premiseVersion:result.premiseVersion,metadata:{field:"phone"}});return;}
    if(!lead.consent){setSendError("Autorize o contato para enviar seu interesse.");trackAnalytics({event:"public_lead_validation_failed",route:"/simulador",productRoute:"locinvest",premiseVersion:result.premiseVersion,metadata:{field:"consent"}});return;}
    setSending(true);trackAnalytics({event:"public_lead_submit_started",route:"/simulador",productRoute:"locinvest",premiseVersion:result.premiseVersion});
    try{
      const response=await fetch("/api/public-simulation",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lead,simulation:result})});
      const payload=await response.json().catch(()=>({})) as {reason?:string;notification?:{status:"sent"|"failed"|"not_configured";destination?:string}};
      if(!response.ok){if(payload.reason==="invalid_lead")throw new Error("invalid_lead");throw new Error(payload.reason||"send_failed");}
      setNotification(payload.notification||null);setSent(true);trackAnalytics({event:"public_lead_captured",route:"/simulador",productRoute:"locinvest",premiseVersion:result.premiseVersion});
      const notificationEvent=payload.notification?.status==="sent"?"commercial_notification_sent":payload.notification?.status==="failed"?"commercial_notification_failed":"commercial_notification_not_configured";
      trackAnalytics({event:notificationEvent,route:"/simulador",productRoute:"locinvest",premiseVersion:result.premiseVersion});
    }catch(error){const reason=error instanceof Error?error.message:"send_failed";setSendError(reason==="invalid_lead"?"Confira nome, e-mail e telefone. O e-mail precisa estar no formato nome@empresa.com.br.":reason==="persistence_failed"?"O CRM não conseguiu registrar o interesse. Verifique a migration da Fase 5 e tente novamente.":"Não foi possível registrar seu interesse agora. Tente novamente.");trackAnalytics({event:"public_lead_capture_failed",route:"/simulador",productRoute:"locinvest",premiseVersion:result.premiseVersion,metadata:{reason}});}
    finally{setSending(false);}
  };

  return <main className="publicSimulatorPage">
    {guideOpen&&<div className="simGuideBackdrop" role="presentation"><section className="simGuide" role="dialog" aria-modal="true" aria-labelledby="sim-guide-title"><div className="simGuideHead"><div><small>ANTES DE SIMULAR</small><h2 id="sim-guide-title">Qual modelo você quer avaliar?</h2><p>Primeiro escolha entre operar uma franquia ou investir. Depois selecione o modelo específico para conhecer a estrutura correta antes da simulação.</p></div></div>
      {!guidePath?<div className="simGuideChoices"><button type="button" onClick={()=>setGuidePath("franchise")}><BriefcaseBusiness/><span><b>Quero operar uma franquia</b><small>Para quem pretende operar um negócio, desenvolver território ou participar diretamente da expansão da rede.</small></span><ArrowRight/></button><button type="button" onClick={()=>setGuidePath("investment")}><Coins/><span><b>Quero investir em ativos</b><small>Para quem pretende alocar capital em ativos ou estruturas de participação, sem necessariamente operar uma franquia.</small></span><ArrowRight/></button></div>:guidePath==="franchise"?<div className="simGuideDetail"><div className="simGuideConcept"><b>Franquia = operação e desenvolvimento de negócio</b><p>O resultado depende da operação, custos, gestão, ocupação, mercado e demais premissas do modelo escolhido.</p></div><div className="simGuideModelIntro"><small>ESCOLHA O MODELO DE FRANQUIA</small><p>Selecione uma estrutura para conhecer seus detalhes e seguir para a simulação comercial correspondente.</p></div><div className="simGuideOptions simGuideModelGrid"><Link href="/negocios/exclusive"><b>Franquia Brasil</b><span>Operação nacional com ativos de mobilidade.</span><ArrowRight/></Link><Link href="/negocios/franquia-internacional"><b>Franquia Internacional</b><span>Estrutura de operação em mercado internacional.</span><ArrowRight/></Link><Link href="/negocios/franquia-2x1"><b>Franquia 2x1 — Brasil x Europa</b><span>Duas frentes operacionais integradas.</span><ArrowRight/></Link><Link href="/negocios/master"><b>Master</b><span>Expansão e desenvolvimento regional da rede.</span><ArrowRight/></Link><Link href="/negocios/mini-master"><b>Mini-Master</b><span>Modelo territorial intermediário de expansão.</span><ArrowRight/></Link></div><button className="simGuideBack" type="button" onClick={()=>setGuidePath("")}>← Voltar para Franquia ou Investimento</button></div>:<div className="simGuideDetail"><div className="simGuideIncome"><article><small>RENDA RECORRENTE PROJETADA</small><b>Maior previsibilidade de fluxo</b><p>O fluxo é calculado com premissas comerciais publicadas e condições contratuais. Não significa rentabilidade garantida.</p></article><article><small>PARTICIPAÇÃO / RESULTADO VARIÁVEL</small><b>Exposição a diferentes estruturas</b><p>O resultado pode variar conforme ativos, utilização, operação, projeto, mercado e condições específicas do investimento.</p></article></div><div className="simGuideModelIntro"><small>ESCOLHA O MODELO DE INVESTIMENTO</small><p>Todos os modelos abrem primeiro sua apresentação. Depois, o botão “Simular este modelo” leva ao motor correspondente.</p></div><div className="simGuideOptions simGuideModelGrid"><Link href="/negocios/locinvest"><b>LocInvest</b><span>Conheça a apresentação e, depois, avance para a simulação com premissas vigentes.</span><ArrowRight/></Link><Link href="/negocios/locmillion"><b>LocMillion</b><span>Projeto estruturado de maior escala.</span><ArrowRight/></Link><Link href="/negocios/euroloc"><b>EUROLOC — LocInvest Espanha</b><span>Ativos de mobilidade na Espanha, por capital ou quantidade de motos.</span><ArrowRight/></Link><Link href="/negocios/cotas"><b>Cotas — Locagora Europa + México</b><span>Participação em estruturas e projetos internacionais.</span><ArrowRight/></Link></div><button className="simGuideBack" type="button" onClick={()=>setGuidePath("")}>← Voltar para Franquia ou Investimento</button></div>}
      <div className="simGuideFooter"><span>Quer comparar antes de decidir?</span><Link href="/negocios">Ver todo o portfólio</Link></div></section></div>}
    <section className="simHero">
      <div className="simHeroCopy"><span className="publicEyebrow"><Sparkles size={15}/> SIMULADOR PÚBLICO • V9.0</span><h1>Veja um cenário LocInvest com as <em>premissas oficiais vigentes.</em></h1><p>Informe um capital de referência e veja uma composição automática baseada exclusivamente na versão publicada pela Locagora. Seus dados de contato só são solicitados depois do resultado.</p><div className="simTrust"><span><ShieldCheck/> Premissas versionadas</span><span><BadgeCheck/> Cenário publicado</span><span><Calculator/> Sem cadastro para simular</span></div></div>
      <div className="simHeroCard"><small>COMO FUNCIONA</small><ol><li><b>1</b><span>Informe o capital</span></li><li><b>2</b><span>Veja a composição calculada</span></li><li><b>3</b><span>Se quiser, peça contato</span></li></ol></div>
    </section>

    <section className="simWorkspace">
      <div className="simInputCard">
        <div className="simSectionHead"><div><small>PASSO 01</small><h2>Capital de referência</h2></div><CircleDollarSign/></div>
        {!premises&&!premiseError&&<div className="simStatus"><Loader2 className="spin"/> Carregando premissas publicadas…</div>}
        {premiseError&&<div className="simStatus error"><ShieldCheck/> O simulador público está temporariamente indisponível porque não há uma versão publicada de premissas disponível. Nenhum cenário legado será exibido como aprovado.</div>}
        {premises&&<>
          <label className="simMoneyInput"><span>Quanto você pretende avaliar?</span><div><small>R$</small><input aria-label="Capital para simulação" type="number" min={minimum||1} step="1000" value={capital} onChange={e=>setCapital(Number(e.target.value)||0)}/></div><small>Referência mínima atual: {money(minimum)}</small></label>
          <div className="simQuickValues">{[50000,75000,100000,150000].map(value=><button key={value} type="button" className={capital===value?"active":""} onClick={()=>setCapital(value)}>{money(value)}</button>)}</div>
          <button className="simPrimary" onClick={simulate}>Calcular cenário <ArrowRight size={18}/></button>
          {calcError&&<p className="simInlineError">{calcError}</p>}
          <p className="simVersion">Versão de premissas #{premises.version}{premises.publishedAt?` • publicada em ${new Date(premises.publishedAt).toLocaleDateString("pt-BR")}`:""}</p>
        </>}
      </div>

      <div className={`simResultCard ${result?"ready":""}`}>
        {!result?<div className="simEmpty"><Calculator/><h2>Seu resultado aparece aqui</h2><p>O cálculo só usa parâmetros da versão comercial publicada, sem criar cenários otimistas ou alterar premissas.</p></div>:<>
          <div className="simSectionHead"><div><small>PASSO 02 • CENÁRIO PUBLICADO</small><h2>Composição estimada</h2></div><CheckCircle2/></div>
          <div className="simMainMetric"><span>Renda mensal estimada</span><strong>{money(result.monthly)}</strong><small>{money(result.annual)} em 12 meses, sem reajustes</small></div>
          <div className="simMetrics"><article><span>Capital alocado</span><b>{money(result.invested)}</b></article><article><span>Ativos na composição</span><b>{result.qty}</b></article><article><span>Saldo não alocado</span><b>{money(result.leftover)}</b></article></div>
          <div className="simComposition"><small>COMPOSIÇÃO AUTOMÁTICA</small>{result.plans.map((plan,index)=><div key={`${plan.label}-${index}`}><span>{plan.count}× plano {plan.label}</span><b>{plan.qty} {plan.qty===1?"ativo":"ativos"} por pacote</b></div>)}</div>
          <p className="simDisclaimer">Simulação informativa baseada nas premissas comerciais publicadas. Projeções não constituem garantia de rentabilidade e podem depender de contrato, operação, tributos, disponibilidade e demais condições aplicáveis.</p>
        </>}
      </div>
    </section>

    {result&&<section className="simLeadSection">
      <div className="simLeadCopy"><small>PASSO 03 • OPCIONAL</small><h2>Quer conversar sobre este cenário?</h2><p>Agora que você já viu a simulação, deixe seus dados apenas se quiser que o time comercial dê continuidade. O cenário e a versão das premissas serão enviados vinculados ao seu contato.</p><div className="simLeadSummary"><span>LocInvest</span><b>{money(result.capital)}</b><small>Premissas v{result.premiseVersion}</small></div></div>
      {sent?<div className="simSuccess"><CheckCircle2/><h3>Interesse registrado</h3><p>Seu contato e esta simulação foram vinculados com sucesso.</p>{notification?.status==="sent"&&<p className="simNotificationDetail">Notificação enviada ao time comercial em <b>{notification.destination}</b>.</p>}{notification?.status==="failed"&&<p className="simNotificationDetail warn">O lead está salvo no CRM, mas a notificação por e-mail não foi concluída. A equipe pode visualizar a oportunidade no pipeline.</p>}{notification?.status==="not_configured"&&<p className="simNotificationDetail warn">O lead está salvo no CRM. O administrador ainda não configurou o e-mail comercial de notificação.</p>}</div>:<form className="simLeadForm" onSubmit={submit}>
        <label>Nome<input required minLength={2} value={lead.name} onChange={e=>setLead({...lead,name:e.target.value})} placeholder="Seu nome"/></label>
        <label>E-mail<input required type="email" value={lead.email} onChange={e=>setLead({...lead,email:e.target.value})} placeholder="voce@exemplo.com"/></label>
        <label>Telefone / WhatsApp<input required minLength={10} value={lead.phone} onChange={e=>setLead({...lead,phone:e.target.value})} placeholder="(00) 00000-0000"/></label>
        <label className="simConsent"><input required type="checkbox" checked={lead.consent} onChange={e=>setLead({...lead,consent:e.target.checked})}/><span>Autorizo o contato da equipe Locagora sobre esta simulação e oportunidades relacionadas.</span></label>
        <button className="simPrimary" disabled={sending}>{sending?<><Loader2 className="spin"/> Registrando…</>:<>Quero falar com um consultor <ArrowRight size={18}/></>}</button>
        {sendError&&<p className="simInlineError">{sendError}</p>}
      </form>}
    </section>}
  </main>;
}
