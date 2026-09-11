import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCorporateEmail } from "@/lib/corporate-auth";

export async function POST(request:Request){
  const admin=createAdminClient();
  if(!admin)return NextResponse.json({ok:false,reason:"server_not_configured"},{status:503});

  const auth=request.headers.get("authorization")||"";
  const token=auth.toLowerCase().startsWith("bearer ")?auth.slice(7).trim():"";
  if(!token)return NextResponse.json({ok:false,reason:"missing_token"},{status:401});

  const {data:{user},error}=await admin.auth.getUser(token);
  if(error||!user)return NextResponse.json({ok:false,reason:"invalid_token"},{status:401});
  if(!user.email||!isCorporateEmail(user.email))return NextResponse.json({ok:false,reason:"invalid_domain"},{status:403});

  const now=new Date().toISOString();
  const {data:profile,error:profileError}=await admin.from("users").select("id,email").eq("auth_user_id",user.id).maybeSingle();
  if(profileError)return NextResponse.json({ok:false,reason:"profile_lookup_failed"},{status:500});
  if(!profile)return NextResponse.json({ok:false,reason:"profile_missing"},{status:409});

  const {error:updateError}=await admin.from("users").update({must_change_password:false,updated_at:now}).eq("id",profile.id);
  if(updateError)return NextResponse.json({ok:false,reason:"profile_update_failed"},{status:500});

  await admin.from("commercial_audit_log").insert({
    action:"password_activation_completed",
    entity_type:"user",
    entity_id:profile.id,
    actor_user_id:user.id,
    actor_email:user.email,
    metadata:{target_email:profile.email||user.email},
  });

  return NextResponse.json({ok:true});
}
