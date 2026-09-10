import { NextRequest } from "next/server";
import { validateNarrative } from "@/lib/proposal-ai";
import type { ProposalNarrative } from "@/lib/types";
import { requireCommercialRole } from "@/lib/server-access";

export const runtime="nodejs";

const schema={
  type:"object",
  properties:{
    opportunityTitle:{type:"string"},
    opportunityText:{type:"string"},
    operationSummary:{type:"string"},
    financialNarrative:{type:"string"},
    scaleNarrative:{type:"string"},
    executiveSummary:{type:"string"},
    closingText:{type:"string"}
  },
  required:[
    "opportunityTitle","opportunityText","operationSummary",
    "financialNarrative","scaleNarrative","executiveSummary","closingText"
  ],
  additionalProperties:false
};

function compactPayload(body:any){
  const sim=body.simulation||{};
  return {
    client:{
      name:body.client?.name||"",
      goal:body.client?.goal||"",
      income:body.client?.income||"",
      priority:body.client?.priority||"",
      notes:body.client?.notes||""
    },
    solution:{
      name:sim.name||"",
      route:sim.sourceRoute||"",
      // Values are supplied for contextual understanding, but the model
      // is explicitly forbidden from reproducing or recalculating them.
      lockedFinancials:{
        capital:sim.capital||0,
        monthly:sim.monthly||0,
        annual:sim.annual||0,
        details:sim.details||{}
      }
    },
    proposal:{
      title:body.proposal?.title||"",
      extraInfo:body.proposal?.extraInfo||""
    }
  };
}

export async function POST(req:NextRequest){
  const access=await requireCommercialRole(
    req,
    ["admin","gestor","closer"]
  );

  if(!access.ok){
    return Response.json(
      {error:access.reason},
      {status:access.status}
    );
  }

  const key=process.env.OPENAI_API_KEY;
  if(!key)return Response.json(
    {error:"openai_not_configured"},
    {status:503}
  );

  const body=await req.json();
  if(!body?.simulation||!body?.client)return Response.json({error:"invalid_payload"},{status:400});

  const instructions=`Você é o redator comercial da Locagora.
Sua função é SOMENTE produzir a narrativa executiva de uma proposta comercial.
Os números, taxas, ROI, payback, quantidades, capital, rendas, preços e condições estruturadas recebidos são BLOQUEADOS.
NÃO recalcule, NÃO corrija, NÃO arredonde e NÃO invente qualquer valor.
NÃO escreva algarismos, cifras ou percentuais na sua resposta. Os componentes determinísticos do sistema exibem os números.
NÃO prometa resultado, rentabilidade, ausência de risco ou garantia de retorno.
Use linguagem comercial premium, clara, objetiva e brasileira.
Diferencie projeção/estimativa de obrigação contratual.
Não invente fatos sobre a Locagora, presença territorial, contratos, ativos ou suporte.
Se uma informação não estiver nos dados, escreva de modo genérico sem adicioná-la.
Cada campo deve ter no máximo dois parágrafos curtos.`;

  const requestedModel=process.env.OPENAI_PROPOSAL_MODEL||"gpt-5.6-terra";
  const models=[requestedModel,...(requestedModel!=="gpt-5.6-terra"?["gpt-5.6-terra"]:[])];
  let response:Response|null=null; let lastDetail=""; let usedModel=requestedModel;
  for(const model of models){
    usedModel=model;
    response=await fetch("https://api.openai.com/v1/responses",{
      method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},
      body:JSON.stringify({model,reasoning:{effort:"low"},input:[{role:"system",content:instructions},{role:"user",content:JSON.stringify(compactPayload(body))}],text:{format:{type:"json_schema",name:"locagora_proposal_narrative",strict:true,schema}}})
    });
    if(response.ok)break;
    lastDetail=(await response.text()).slice(0,350);
  }
  if(!response||!response.ok){
    const low=lastDetail.toLowerCase();
    if(low.includes("credit_balance_exhausted")||low.includes("insufficient_quota")||low.includes("no credits remaining")){
      return Response.json({error:"openai_quota_exhausted",message:"Os créditos da API OpenAI desta organização estão esgotados. O sistema aplicou a narrativa segura local."},{status:402});
    }
    if(response?.status===401)return Response.json({error:"openai_invalid_key",message:"A chave da API OpenAI não foi aceita."},{status:502});
    return Response.json({error:"openai_request_failed",message:"A IA não respondeu agora. O sistema aplicou a narrativa segura local.",model:usedModel},{status:502});
  }

  const data=await response.json();
  const outputText=data.output_text || data.output?.flatMap((o:any)=>o.content||[]).find((x:any)=>x.type==="output_text")?.text;
  if(!outputText)return Response.json({error:"empty_ai_response"},{status:502});

  let narrative:ProposalNarrative;
  try{ narrative=JSON.parse(outputText); }
  catch{ return Response.json({error:"invalid_ai_json"},{status:502}); }

  const validation=validateNarrative(narrative);
  if(!validation.ok){
    return Response.json({error:"narrative_rejected",issues:validation.errors},{status:422});
  }

  return Response.json({
    narrative,
    generatedAt:new Date().toISOString(),
    model:usedModel
  });
}
