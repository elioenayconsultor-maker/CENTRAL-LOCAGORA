import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertSameOrigin,enforceRateLimit,readPublicJson,requestFingerprint,securityResponse } from "@/lib/public-api-security";

const clean=(value:unknown,max:number)=>String(value??"").trim().slice(0,max);
const boolOrNull=(value:unknown)=>typeof value==="boolean"?value:null;

export async function POST(request:Request){
  try{
    assertSameOrigin(request);
    const admin=createAdminClient();
    if(!admin)return NextResponse.json({ok:false,reason:"service_unavailable"},{status:503});
    await enforceRateLimit(admin,{scope:"public-rental-interest",keyHash:requestFingerprint(request),limit:6,windowSeconds:900});
    const body=await readPublicJson(request);
    if(clean(body.website,100))return NextResponse.json({ok:true});
    const name=clean(body.name,120);
    const mobile=clean(body.mobile,40);
    const email=clean(body.email,160).toLowerCase()||null;
    const city=clean(body.city,120);
    const state=clean(body.state,80)||null;
    const preferredContact=clean(body.preferredContact,20)==="email"?"email":"whatsapp";
    const message=clean(body.message,1200)||null;
    if(name.length<2||mobile.length<8||city.length<2)return NextResponse.json({ok:false,reason:"invalid_fields"},{status:400});
    if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return NextResponse.json({ok:false,reason:"invalid_email"},{status:400});
    const {error}=await admin.from("commercial_rental_leads").insert({
      name,mobile,email,city,state,
      has_cnh_a:boolOrNull(body.hasCnhA),
      works_with_delivery:boolOrNull(body.worksWithDelivery),
      preferred_contact:preferredContact,
      message,source:"public_rental_page"
    });
    if(error)return NextResponse.json({ok:false,reason:"persistence_failed"},{status:503});
    return NextResponse.json({ok:true});
  }catch(error){
    const response=securityResponse(error);
    if(response)return response;
    return NextResponse.json({ok:false,reason:"invalid_request"},{status:400});
  }
}
