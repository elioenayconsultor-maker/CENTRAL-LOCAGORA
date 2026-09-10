import { NextResponse } from "next/server";
import { requireCommercialRole } from "@/lib/server-access";

const validRoles=new Set(["admin","gestor","closer","visualizacao"]);
const cleanEmail=(v:unknown)=>String(v??"").trim().toLowerCase().slice(0,180);
const cleanName=(v:unknown)=>String(v??"").trim().replace(/\s+/g," ").slice(0,160);
const cleanTeam=(v:unknown)=>String(v??"").trim().slice(0,120);
const emailOk=(v:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)&&v.endsWith("@locgrupo.com.br");

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

export async function GET(request:Request){
  const access=await requireCommercialRole(request,["admin"]);
  if(!access.ok)return NextResponse.json({ok:false,reason:access.reason},{status:access.status});
  try{
    const authUsers=await listAllUsers(access.admin);
    const {data:memberships,error}=await access.admin.from("commercial_memberships").select("auth_user_id,app_user_id,role,active,team_name,created_at,updated_at");
    if(error)throw error;
    const {data:profiles,error:profileError}=await access.admin.from("users").select("id,auth_user_id,name,email,active,team_name,created_at,updated_at").order("created_at",{ascending:true});
    if(profileError)throw profileError;
    const membershipByAuth=new Map((memberships||[]).map((m:any)=>[m.auth_user_id,m]));
    const authById=new Map(authUsers.map((u:any)=>[u.id,u]));
    const rows=(profiles||[]).map((p:any)=>{
      const auth=p.auth_user_id?authById.get(p.auth_user_id) as any:null;
      const m=p.auth_user_id?membershipByAuth.get(p.auth_user_id) as any:null;
      return {
        profileId:p.id,
        userId:p.auth_user_id||"",
        email:String(p.email||auth?.email||""),
        name:String(p.name||auth?.user_metadata?.full_name||""),
        role:m?.role||"closer",
        active:p.active!==false&&m?.active!==false,
        teamName:String(m?.team_name||p.team_name||""),
        accessCreated:Boolean(p.auth_user_id),
        createdAt:p.created_at||auth?.created_at||"",
        updatedAt:p.updated_at||m?.updated_at||auth?.updated_at||""
      };
    });
    return NextResponse.json({ok:true,members:rows});
  }catch(e){return NextResponse.json({ok:false,reason:e instanceof Error?e.message:"list_failed"},{status:500});}
}

export async function POST(request:Request){
  const access=await requireCommercialRole(request,["admin"]);
  if(!access.ok)return NextResponse.json({ok:false,reason:access.reason},{status:access.status});
  try{
    const body=await request.json() as Record<string,unknown>;
    const action=String(body.action||"update");
    const teamName=cleanTeam(body.teamName);

    if(action==="create"){
      const name=cleanName(body.name);
      const email=cleanEmail(body.email);
      if(name.length<2)return NextResponse.json({ok:false,reason:"invalid_name",message:"Informe o nome do colaborador."},{status:400});
      if(!emailOk(email))return NextResponse.json({ok:false,reason:"invalid_email",message:"Use um e-mail corporativo @locgrupo.com.br válido."},{status:400});
      const {data:existing}=await access.admin.from("users").select("id").ilike("email",email).maybeSingle();
      if(existing)return NextResponse.json({ok:false,reason:"already_exists",message:"Este e-mail já está cadastrado."},{status:409});
      const {data:created,error:createError}=await access.admin.from("users").insert({name,email,role:"CLOSER",active:true,must_change_password:true,team_name:teamName||null}).select("id").single();
      if(createError)throw createError;
      await access.admin.from("commercial_audit_log").insert({action:"access_preregistered",entity_type:"user",entity_id:created.id,actor_user_id:access.user.id,actor_email:access.user.email||null,metadata:{target_email:email,target_name:name,role:"closer",team_name:teamName||null}});
      return NextResponse.json({ok:true,profileId:created.id,message:"Colaborador cadastrado. O primeiro acesso será como Closer e exigirá troca de senha."});
    }

    const role=String(body.role||"closer").trim();
    if(!validRoles.has(role))return NextResponse.json({ok:false,reason:"invalid_role"},{status:400});
    const profileId=String(body.profileId||"").trim();
    const userId=String(body.userId||"").trim();
    let profile:any=null;
    if(profileId){
      const {data}=await access.admin.from("users").select("id,auth_user_id,email").eq("id",profileId).maybeSingle();
      profile=data;
    }else if(userId){
      const {data}=await access.admin.from("users").select("id,auth_user_id,email").eq("auth_user_id",userId).maybeSingle();
      profile=data;
    }
    if(!profile)return NextResponse.json({ok:false,reason:"user_not_found",message:"Colaborador não encontrado."},{status:404});
    const now=new Date().toISOString();
    const {error:profileUpdateError}=await access.admin.from("users").update({active:true,team_name:teamName||null,updated_at:now}).eq("id",profile.id);
    if(profileUpdateError)throw profileUpdateError;
    if(profile.auth_user_id){
      const {error}=await access.admin.from("commercial_memberships").upsert({auth_user_id:profile.auth_user_id,app_user_id:profile.id,role,team_name:teamName||null,active:true,updated_at:now,updated_by:access.user.id},{onConflict:"auth_user_id"});
      if(error)throw error;
      if(role==="admin")await access.admin.from("commercial_admins").upsert({user_id:profile.auth_user_id,email:String(profile.email||"")});
      else await access.admin.from("commercial_admins").delete().eq("user_id",profile.auth_user_id);
    }
    await access.admin.from("commercial_audit_log").insert({action:"access_updated",entity_type:"user",entity_id:profile.id,actor_user_id:access.user.id,actor_email:access.user.email||null,metadata:{target_email:profile.email||null,role,team_name:teamName||null}});
    return NextResponse.json({ok:true});
  }catch(e){return NextResponse.json({ok:false,reason:e instanceof Error?e.message:"save_failed"},{status:500});}
}

export async function DELETE(request:Request){
  const access=await requireCommercialRole(request,["admin"]);
  if(!access.ok)return NextResponse.json({ok:false,reason:access.reason},{status:access.status});
  try{
    const body=await request.json() as Record<string,unknown>;
    const profileId=String(body.profileId||"").trim();
    const userId=String(body.userId||"").trim();
    let profile:any=null;
    if(profileId){const {data}=await access.admin.from("users").select("id,auth_user_id,email").eq("id",profileId).maybeSingle();profile=data;}
    else if(userId){const {data}=await access.admin.from("users").select("id,auth_user_id,email").eq("auth_user_id",userId).maybeSingle();profile=data;}
    if(!profile)return NextResponse.json({ok:false,reason:"not_found"},{status:404});
    if(profile.auth_user_id){
      const {data:target}=await access.admin.from("commercial_memberships").select("role,active").eq("auth_user_id",profile.auth_user_id).maybeSingle();
      if(target?.role==="admin"&&target.active){
        const {count}=await access.admin.from("commercial_memberships").select("auth_user_id",{count:"exact",head:true}).eq("role","admin").eq("active",true);
        if((count||0)<=1)return NextResponse.json({ok:false,reason:"last_admin",message:"O último administrador ativo não pode ser removido."},{status:409});
      }
      await access.admin.from("commercial_memberships").update({active:false,updated_at:new Date().toISOString(),updated_by:access.user.id}).eq("auth_user_id",profile.auth_user_id);
      await access.admin.from("commercial_admins").delete().eq("user_id",profile.auth_user_id);
    }
    const {error}=await access.admin.from("users").update({active:false,updated_at:new Date().toISOString()}).eq("id",profile.id);
    if(error)throw error;
    await access.admin.from("commercial_audit_log").insert({action:"access_revoked",entity_type:"user",entity_id:profile.id,actor_user_id:access.user.id,actor_email:access.user.email||null,metadata:{target_email:profile.email||null}});
    return NextResponse.json({ok:true});
  }catch(e){return NextResponse.json({ok:false,reason:e instanceof Error?e.message:"delete_failed"},{status:500});}
}
