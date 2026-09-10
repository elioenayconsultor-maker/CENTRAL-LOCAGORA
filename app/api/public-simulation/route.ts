import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { maskEmail, sendCommercialLeadEmail, sendCustomerConfirmationEmail } from "@/lib/lead-notification";

const clean=(value:unknown,max=180)=>String(value??"").trim().slice(0,max);
const emailOk=(value:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

type CaptureReference={
  lead_id?:string;
  simulation_id?:string;
  notification_id?:string|null;
  notification_enabled?:boolean;
};

export async function POST(request:Request){
  try{
    const body=await request.json() as Record<string,unknown>;
    const lead=(body.lead&&typeof body.lead==="object"?body.lead:{}) as Record<string,unknown>;
    const simulation=(body.simulation&&typeof body.simulation==="object"?body.simulation:{}) as Record<string,unknown>;
    const name=clean(lead.name,120),email=clean(lead.email,160).toLowerCase(),phone=clean(lead.phone,40);
    const consent=lead.consent===true;
    if(name.length<2 || !emailOk(email) || phone.replace(/\D/g,"").length<10 || !consent){
      return NextResponse.json({ok:false,reason:"invalid_lead"},{status:400});
    }
    const premiseVersionId=clean(simulation.premiseVersionId,80);
    const premiseVersion=Number(simulation.premiseVersion||0);
    const capital=Number(simulation.capital||0),invested=Number(simulation.invested||0),monthly=Number(simulation.monthly||0),annual=Number(simulation.annual||0),qty=Number(simulation.qty||0);
    if(!premiseVersionId || premiseVersion<=0 || capital<=0 || invested<=0 || monthly<0 || annual<0 || qty<=0){
      return NextResponse.json({ok:false,reason:"invalid_simulation"},{status:400});
    }
    const supabase=await createClient();
    const {data,error}=await supabase.rpc("capture_public_commercial_simulation",{
      p_name:name,p_email:email,p_phone:phone,p_consent:true,
      p_product_route:"locinvest",p_product_name:"LocInvest",
      p_premise_version_id:premiseVersionId,p_premise_version:premiseVersion,
      p_inputs:{capital},
      p_outputs:{invested,monthly,annual,qty,leftover:Number(simulation.leftover||0),plans:Array.isArray(simulation.plans)?simulation.plans:[]}
    });
    if(error)return NextResponse.json({ok:false,reason:"persistence_failed"},{status:503});

    const reference=(data||{}) as CaptureReference;
    let notification:{status:"sent"|"failed"|"not_configured";destination?:string}={status:"not_configured"};
    if(reference.notification_id){
      const admin=createAdminClient();
      if(!admin){
        notification={status:"failed"};
      }else{
        const {data:queued}=await admin.from("commercial_lead_notifications").select("recipient_email").eq("id",reference.notification_id).maybeSingle();
        const recipient=String(queued?.recipient_email||"");
        if(recipient){
          const sendResult=await sendCommercialLeadEmail({to:recipient,lead:{name,email,phone},simulation:{capital,invested,monthly,annual,qty,leftover:Number(simulation.leftover||0),premiseVersion},leadId:reference.lead_id||"",simulationId:reference.simulation_id||""});
          await admin.from("commercial_lead_notifications").update({status:sendResult.ok?"sent":"failed",provider_message_id:sendResult.ok?sendResult.id:null,last_error:sendResult.ok?null:sendResult.error,sent_at:sendResult.ok?new Date().toISOString():null}).eq("id",reference.notification_id).eq("status","pending");
          notification={status:sendResult.ok?"sent":"failed",destination:maskEmail(recipient)};
        }else notification={status:"failed"};
      }
    }
    let customerNotification:{status:"sent"|"failed"}={status:"failed"};
    if(reference.lead_id){
      const admin=createAdminClient();
      const customerResult=await sendCustomerConfirmationEmail({to:email,lead:{name,email,phone},simulation:{capital,invested,monthly,annual,qty,leftover:Number(simulation.leftover||0),premiseVersion},productName:"LocInvest"});
      customerNotification={status:customerResult.ok?"sent":"failed"};
      if(admin)await admin.from("commercial_public_leads").update({customer_notification_status:customerResult.ok?"sent":"failed",customer_notification_error:customerResult.ok?null:customerResult.error,customer_notified_at:customerResult.ok?new Date().toISOString():null}).eq("id",reference.lead_id);
    }
    return NextResponse.json({ok:true,reference:{leadId:reference.lead_id,simulationId:reference.simulation_id},notification,customerNotification});
  }catch{
    return NextResponse.json({ok:false,reason:"invalid_request"},{status:400});
  }
}
