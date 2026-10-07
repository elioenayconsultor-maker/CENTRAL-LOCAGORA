import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_ACTIVATION_PASSWORD, isCorporateEmail, normalizeCorporateEmail } from "@/lib/corporate-auth";

function nameFromEmail(email: string) {
  const local = email.split("@")[0] || "Colaborador";
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ") || "Colaborador";
}

const apiRole=(role:unknown)=>{
  const value=String(role||"CLOSER").toLowerCase();
  return ["admin","gestor","sdr","closer"].includes(value)?value:"closer";
};

async function listAllUsers(admin:any){
  const out:any[]=[];
  for(let page=1;page<=10;page++){
    const {data,error}=await admin.auth.admin.listUsers({page,perPage:100});
    if(error)throw error;
    out.push(...(data.users||[]));
    if((data.users||[]).length<100)break;
  }
  return out;
}

async function linkProfile(admin:any, profile:any, authUserId:string){
  const now=new Date().toISOString();
  const {data:conflict}=await admin.from("users").select("id,email").eq("auth_user_id",authUserId).neq("id",profile.id).maybeSingle();
  if(conflict)throw new Error("auth_link_conflict");

  const {error:profileError}=await admin.from("users").update({auth_user_id:authUserId,must_change_password:true,updated_at:now}).eq("id",profile.id);
  if(profileError)throw profileError;

  const {error:membershipError}=await admin.from("commercial_memberships").upsert({
    auth_user_id:authUserId,
    app_user_id:profile.id,
    role:apiRole(profile.role),
    team_name:profile.team_name||null,
    active:true,
    updated_at:now,
  },{onConflict:"auth_user_id"});
  if(membershipError)throw membershipError;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = normalizeCorporateEmail(String(body?.email || ""));

    if (!isCorporateEmail(email)) {
      return NextResponse.json({ ok: false, reason: "invalid_domain" }, { status: 400 });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ ok: false, reason: "server_not_configured" }, { status: 503 });
    }

    let { data: profile, error: profileError } = await admin
      .from("users")
      .select("id,auth_user_id,email,active,role,team_name,must_change_password")
      .eq("email", email)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ ok: false, reason: "profile_lookup_failed" }, { status: 500 });
    }

    const selfPreregistered = false;
    if (!profile) {
      return NextResponse.json({ ok: false, reason: "approval_required", message: "Solicite seu cadastro ao administrador da intranet." }, { status: 403 });
    }

    if (profile.active !== true) {
      return NextResponse.json({ ok: false, reason: "inactive" }, { status: 403 });
    }

    const authUsers=await listAllUsers(admin);
    const existingAuth=authUsers.find((u:any)=>normalizeCorporateEmail(String(u.email||""))===email)||null;

    if(existingAuth){
      try{
        await linkProfile(admin,profile,existingAuth.id);
      }catch(error){
        if(error instanceof Error&&error.message==="auth_link_conflict")return NextResponse.json({ok:false,reason:"auth_link_conflict",message:"Esta credencial já está vinculada a outro perfil. Solicite revisão ao administrador."},{status:409});
        throw error;
      }

      // Senha padrão só é restaurada para contas que nunca concluíram o primeiro acesso
      // ou que foram explicitamente resetadas pelo ADM. Isso evita sobrescrever senha pessoal.
      const activationRequired=existingAuth.user_metadata?.activation_required===true||!existingAuth.last_sign_in_at;
      if(activationRequired){
        const metadata={
          ...(existingAuth.user_metadata||{}),
          activation_required:true,
          activation_origin:existingAuth.user_metadata?.activation_origin||"central_locagora_reconciled",
        };
        const {error:updateError}=await admin.auth.admin.updateUserById(existingAuth.id,{password:DEFAULT_ACTIVATION_PASSWORD,user_metadata:metadata});
        if(updateError)return NextResponse.json({ok:false,reason:"auth_repair_failed",message:updateError.message},{status:500});
      }

      await admin.from("commercial_audit_log").insert({
        action:"first_access_auth_reconciled",
        entity_type:"user",
        entity_id:profile.id,
        actor_email:email,
        metadata:{target_email:email,auth_user_id:existingAuth.id,activation_required:activationRequired},
      });
      return NextResponse.json({ok:true,created:false,selfPreregistered,reconciled:true,activationRequired});
    }

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: DEFAULT_ACTIVATION_PASSWORD,
      email_confirm: true,
      user_metadata: {
        activation_required: true,
        activation_origin: "central_locagora_direct",
      },
    });

    if (error) {
      return NextResponse.json({ ok: false, reason: "auth_create_failed", message: error.message }, { status: 500 });
    }

    if(data.user){
      await linkProfile(admin,profile,data.user.id);
    }

    return NextResponse.json({ ok: true, created: Boolean(data.user), selfPreregistered, reconciled:false, activationRequired:true });
  } catch (error) {
    return NextResponse.json({ ok: false, reason: "first_access_error", message: error instanceof Error ? error.message : "Erro inesperado" }, { status: 500 });
  }
}
