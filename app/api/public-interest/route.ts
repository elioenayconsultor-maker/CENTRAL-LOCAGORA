import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertSameOrigin, enforceRateLimit, hashRateLimitKey, readPublicJson, requestFingerprint, securityResponse } from "@/lib/public-api-security";
import { canonicalProductMetadata } from "@/lib/product-registry";

const clean=(v:unknown,max=180)=>String(v??"").trim().slice(0,max);
const emailOk=(v:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function POST(request:Request){
 try{
  assertSameOrigin(request);
  const admin=createAdminClient();
  if(!admin)return NextResponse.json({ok:false,reason:"service_unavailable"},{status:503});

  await enforceRateLimit(admin,{
   scope:"public-interest:request",
   keyHash:requestFingerprint(request),
   limit:8,
   windowSeconds:900
  });

  const body=await readPublicJson(request);
  const lead=(body.lead&&typeof body.lead==="object"?body.lead:{}) as Record<string,unknown>;
  const product=(body.product&&typeof body.product==="object"?body.product:{}) as Record<string,unknown>;
  const sim=(body.simulation&&typeof body.simulation==="object"?body.simulation:null) as Record<string,unknown>|null;
  const name=clean(lead.name,120),email=clean(lead.email,160).toLowerCase(),phone=clean(lead.phone,40),route=clean(product.route,80),productName=clean(product.name,120),consent=lead.consent===true;
  const identity=canonicalProductMetadata(route);

  if(clean(lead.website,200))return NextResponse.json({ok:true});
  if(name.length<2||!emailOk(email)||phone.replace(/\D/g,"").length<10||!consent||!route||!productName){
   return NextResponse.json({ok:false,reason:"invalid_lead"},{status:400});
  }

  await enforceRateLimit(admin,{
   scope:"public-interest:email",
   keyHash:hashRateLimitKey(`email:${email}`),
   limit:3,
   windowSeconds:3600
  });

  const {data,error}=await admin.rpc("capture_public_commercial_interest",{
   p_name:name,
   p_email:email,
   p_phone:phone,
   p_consent:true,
   p_product_route:route,
   p_product_name:productName,
   p_mode:clean(body.mode,30)||"personalized",
   p_simulation:{...(sim||{}),...(identity?{product_identity:identity}:{})}
  });
  if(error)return NextResponse.json({ok:false,reason:"persistence_failed"},{status:503});

  const ref=(data||{}) as {lead_id?:string;simulation_id?:string|null};
  return NextResponse.json({
   ok:true,
   reference:{leadId:ref.lead_id,simulationId:ref.simulation_id},
   channel:"whatsapp",
   crm:"local",
   product:identity
  });
 }catch(error){
  const response=securityResponse(error);
  if(response)return response;
  return NextResponse.json({ok:false,reason:"invalid_request"},{status:400});
 }
}
