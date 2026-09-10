import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyticsEvents, type AnalyticsEventName } from "@/lib/analytics";

const allowed=new Set<string>(analyticsEvents);
const clean=(v:unknown,max=100)=>String(v??"").trim().slice(0,max);
const safeMetadata=(input:unknown)=>{
  if(!input||typeof input!=="object"||Array.isArray(input))return {};
  const out:Record<string,string|number|boolean|null>={};
  for(const [key,value] of Object.entries(input as Record<string,unknown>).slice(0,12)){
    const safeKey=key.replace(/[^a-zA-Z0-9_]/g,"").slice(0,40);
    if(!safeKey)continue;
    if(typeof value==="number"&&Number.isFinite(value))out[safeKey]=value;
    else if(typeof value==="boolean"||value===null)out[safeKey]=value;
    else if(typeof value==="string")out[safeKey]=value.slice(0,80);
  }
  return out;
};

export async function POST(request:Request){
  try{
    const body=await request.json() as Record<string,unknown>;
    const event=clean(body.event,64) as AnalyticsEventName;
    if(!allowed.has(event))return NextResponse.json({ok:false,reason:"invalid_event"},{status:400});
    const sessionId=clean(body.sessionId,80);
    if(sessionId.length<8)return NextResponse.json({ok:false,reason:"invalid_session"},{status:400});
    const supabase=await createClient();
    const {error}=await supabase.rpc("track_commercial_analytics_event",{
      p_event_name:event,
      p_session_id:sessionId,
      p_route:clean(body.route,120)||null,
      p_product_route:clean(body.productRoute,80)||null,
      p_premise_version:Number(body.premiseVersion||0)||null,
      p_metadata:safeMetadata(body.metadata)
    });
    if(error)return NextResponse.json({ok:false,reason:"analytics_unavailable"},{status:202});
    return NextResponse.json({ok:true});
  }catch{return NextResponse.json({ok:false,reason:"invalid_request"},{status:400});}
}
