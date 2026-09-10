import { NextResponse } from "next/server";
import { requireCommercialRole } from "@/lib/server-access";
import { sendCommercialInterestEmail } from "@/lib/lead-notification";

export async function POST(request:Request){
  const access=await requireCommercialRole(request,["admin","gestor","closer"]);
  if(!access.ok)return NextResponse.json({ok:false,reason:access.reason},{status:access.status});
  try{
    const body=await request.json() as Record<string,unknown>;
    const leadId=String(body.leadId||"");
    if(!leadId)return NextResponse.json({ok:false,reason:"invalid_lead"},{status:400});
    const {data:lead,error}=await access.admin.from("commercial_public_leads").select("id,name,email,phone,product_interest,commercial_public_simulations(id,product_name,premise_version,inputs,outputs,created_at)").eq("id",leadId).maybeSingle();
    if(error||!lead)return NextResponse.json({ok:false,reason:"lead_not_found"},{status:404});
    const sim=(lead.commercial_public_simulations||[]).sort((a:any,b:any)=>String(b.created_at).localeCompare(String(a.created_at)))[0];
    const {data:cfg}=await access.admin.from("commercial_lead_notification_config").select("recipient_email,enabled").eq("singleton",true).maybeSingle();
    const to=String(cfg?.recipient_email||"").trim();
    if(!cfg?.enabled||!to)return NextResponse.json({ok:false,reason:"notification_not_configured"},{status:409});
    const outputs=(sim?.outputs||{}) as Record<string,unknown>,inputs=(sim?.inputs||{}) as Record<string,unknown>;
    const simulation=sim?{capital:Number(inputs.capital||0),monthly:Number(outputs.monthly||0),annual:Number(outputs.annual||0),details:outputs.details||null}:null;
    const {data:row,error:insertError}=await access.admin.from("commercial_lead_notifications").insert({lead_id:lead.id,simulation_id:sim?.id||null,recipient_email:to,status:"pending"}).select("id").single();
    if(insertError)throw insertError;
    const result=await sendCommercialInterestEmail({to,lead:{name:lead.name,email:lead.email,phone:lead.phone},productName:sim?.product_name||lead.product_interest||"Locagora",simulation,leadId:lead.id,simulationId:sim?.id});
    await access.admin.from("commercial_lead_notifications").update({status:result.ok?"sent":"failed",provider_message_id:result.ok?result.id:null,last_error:result.ok?null:result.error,sent_at:result.ok?new Date().toISOString():null}).eq("id",row.id);
    await access.admin.from("commercial_audit_log").insert({action:"lead_notification_resent",entity_type:"lead",entity_id:lead.id,actor_user_id:access.user.id,actor_email:access.user.email||null,metadata:{recipient:to,status:result.ok?"sent":"failed",simulation_id:sim?.id||null}});
    return NextResponse.json({ok:result.ok,status:result.ok?"sent":"failed",error:result.ok?null:result.error},{status:result.ok?200:502});
  }catch(e){return NextResponse.json({ok:false,reason:e instanceof Error?e.message:"resend_failed"},{status:500});}
}
