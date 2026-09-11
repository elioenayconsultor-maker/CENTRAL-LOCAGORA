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
  if(profile.auth_user_id&&profile.auth_user_id!==authUserId){
    const {data:conflict}=await admin.from("users").select("id,email").eq("auth_user_id",authUserId).neq("id",profile.id).maybeSingle();
    if(conflict)throw new Error("auth_link_conflict");
  }
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

    let selfPreregistered = false;
    if (!profile) {
      const { data: createdProfile, error: createProfileError } = await admin
        .from("users")
        .insert({
          name: nameFromEmail(email),
          email,
          role: "CLOSER",
          active: true,
          must_change_password: true,
          team_name: null,
        })
        .select("id,auth_user_id,email,active,role,team_name,must_change_password")
        .single();

      if (createProfileError) {
        const { data: concurrentProfile, error: retryError } = await admin
          .from("users")
          .select("id,auth_user_id,email,active,role,team_name,must_change_password")
          .eq("email", email)
          .maybeSingle();
        if (retryError || !concurrentProfile) {
          return NextResponse.json({ ok: false, reason: "profile_create_failed", message: createProfileError.message }, { status: 500 });
        }
        profile = concurrentProfile;
      } else {
        profile = createdProfile;
        selfPreregistered = true;
        await admin.from("commercial_audit_log").insert({
          action: "access_self_preregistered",
          entity_type: "user",
          entity_id: createdProfile.id,
          actor_email: email,
          metadata: { target_email: email, role: "closer", origin: "first_access" },
        });
      }
    }

    if (profile.active !== true) {
      return NextResponse.json({ ok: false, reason: "inactive" }, { status: 403 });
    }

    // Procura primeiro uma credencial já existente. Isso corrige o caso em que alguém
    // tentou entrar antes do pré-cadastro e ficou com um auth.users órfão de public.users.
    const authUsers=await listAllUsers(admin);
    const existingAuth=authUsers.find((u:any)=>normalizeCorporateEmail(String(u.email||""))===email)||null;
    if(existingAuth){
      try{
        await linkProfile(admin,profile,existingAuth.id);
      }catch(error){
        if(error instanceof Error&&error.message==="auth_link_conflict")return NextResponse.json({ok:false,reason:"auth_link_conflict",message:"Esta credencial já está vinculada a outro perfil. Solicite revisão ao administrador."},{status:409});
        throw error;
      }

      // Só restaura a senha padrão quando a conta ainda está em ativação/reset.
      // Usuários já ativados não têm sua senha pessoal alterada por simplesmente digitarem a senha padrão.
      const activationRequired=existingAuth.user_metadata?.activation_required===true||profile.must_change_password===true;
      if(activationRequired){
        const metadata={...(existingAuth.user_metadata||{}),activation_required:true,activation_origin:existingAuth.user_metadata?.activation_origin||"central_locagora_reconciled"};
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
      return NextResponse.json({ok:true,created:false,selfPreregistered,reconciled:true});
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

    return NextResponse.json({ ok: true, created: Boolean(data.user), selfPreregistered, reconciled:false });
  } catch (error) {
    return NextResponse.json({ ok: false, reason: "first_access_error", message: error instanceof Error ? error.message : "Erro inesperado" }, { status: 500 });
  }
}
