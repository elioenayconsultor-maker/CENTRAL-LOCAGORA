import { NextRequest } from "next/server";
import { requireCommercialRole } from "@/lib/server-access";

export const runtime="nodejs";

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
  if(!key) return Response.json({error:"openai_not_configured"},{status:503});

  const body=await req.json();
  const objection=String(body?.objection||"").trim();
  const baseAnswer=String(body?.baseAnswer||"").trim();
  const product=String(body?.product||"").trim();
  const context=String(body?.context||"").trim();

  if(!objection) return Response.json({error:"invalid_payload"},{status:400});

  const instructions=`Você é um assistente interno de apoio comercial da Locagora.
Ajude o consultor a responder uma objeção com clareza, empatia e condução consultiva.
Não invente números, condições, garantias, fatos sobre a empresa, contrato ou produto.
Não prometa rentabilidade, retorno, ausência de risco ou resultado.
Quando a resposta depender de contrato, DRE, política ou condição específica, diga explicitamente para validar a fonte oficial.
Use a resposta-base fornecida como referência prioritária.
Entregue apenas:
1) resposta_sugerida
2) pergunta_de_avanco
3) cuidado
Cada campo deve ser curto, em português brasileiro.`;

  const response=await fetch("https://api.openai.com/v1/responses",{
    method:"POST",
    headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},
    body:JSON.stringify({
      model:process.env.OPENAI_PROPOSAL_MODEL||"gpt-5.6-terra",
      reasoning:{effort:"low"},
      input:[
        {role:"system",content:instructions},
        {role:"user",content:JSON.stringify({objection,baseAnswer,product,context})}
      ],
      text:{format:{
        type:"json_schema",
        name:"locagora_support_answer",
        strict:true,
        schema:{
          type:"object",
          properties:{
            resposta_sugerida:{type:"string"},
            pergunta_de_avanco:{type:"string"},
            cuidado:{type:"string"}
          },
          required:["resposta_sugerida","pergunta_de_avanco","cuidado"],
          additionalProperties:false
        }
      }}
    })
  });

  if(!response.ok) return Response.json({error:"openai_request_failed"},{status:502});
  const data=await response.json();
  const outputText=data.output_text || data.output?.flatMap((o:any)=>o.content||[]).find((x:any)=>x.type==="output_text")?.text;
  if(!outputText) return Response.json({error:"empty_ai_response"},{status:502});
  try{return Response.json(JSON.parse(outputText));}
  catch{return Response.json({error:"invalid_ai_json"},{status:502});}
}
