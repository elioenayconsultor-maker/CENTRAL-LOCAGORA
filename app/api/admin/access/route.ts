import { NextResponse } from "next/server";
import { requireCommercialRole } from "@/lib/server-access";

const validRoles=new Set(["admin","gestor","closer","visualizacao"]);
const cleanEmail=(v:unknown)=>String(v??"").trim().toLowerCase().slice(0,180);
const cleanTeam=(v:unknown)=>String(v??"").trim().slice(0,120);
const emailOk=(v:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

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
    const users=await listAllUsers(access.admin);
    const {data:memberships,error}=await access.admin.from("commercial_memberships").select("auth_user_id,role,active,team_name,created_at,updated_at");
    if(error)throw error;
    const byId=new Map((memberships||[]).map((m:any)=>[m.auth_user_id,m]));
    const rows=users.map((u:any)=>{
      const m=byId.get(u.id) as any;
      return {
        userId:u.id,
        email:String(u.email||""),
        name:String(u.user_metadata?.full_name||u.user_metadata?.name||u.user_metadata?.display_name||""),
        role:m?.role||"closer",
        active:m?.active!==false,
        teamName:String(m?.team_name||""),
        createdAt:m?.created_at||u.created_at,
        updatedAt:m?.updated_at||u.updated_at||u.created_at
      };
    }).filter((x:any)=>x.email);
    return NextResponse.json({ok:true,members:rows});
  }catch(e){return NextResponse.json({ok:false,reason:e instanceof Error?e.message:"list_failed"},{status:500});}
}

export async function POST(request:Request){
  const access=await requireCommercialRole(request,["admin"]);
  if(!access.ok)return NextResponse.json({ok:false,reason:access.reason},{status:access.status});
  try{
    const body=await request.json() as Record<string,unknown>;
    const role=String(body.role||"closer").trim();
    const teamName=cleanTeam(body.teamName);
    if(!validRoles.has(role))return NextResponse.json({ok:false,reason:"invalid_role"},{status:400});

    const users=await listAllUsers(access.admin);
    let target:any=null;
    const userId=String(body.userId||"").trim();
    if(userId)target=users.find((u:any)=>u.id===userId);
    else{
      const email=cleanEmail(body.email);
      if(!emailOk(email))return NextResponse.json({ok:false,reason:"invalid_input"},{status:400});
      target=users.find((u:any)=>String(u.email||"").toLowerCase()===email);
    }
    if(!target)return NextResponse.json({ok:false,reason:"user_not_found",message:"Usuário não encontrado no Supabase."},{status:404});

    const {error}=await access.admin.from("commercial_memberships").upsert({auth_user_id:target.id,role,team_name:teamName||null,active:true,updated_at:new Date().toISOString(),updated_by:access.user.id},{onConflict:"auth_user_id"});
    if(error)throw error;
    if(role==="admin")await access.admin.from("commercial_admins").upsert({user_id:target.id,email:String(target.email||"")});
    else await access.admin.from("commercial_admins").delete().eq("user_id",target.id);
    await access.admin.from("commercial_audit_log").insert({action:"access_updated",entity_type:"membership",entity_id:target.id,actor_user_id:access.user.id,actor_email:access.user.email||null,metadata:{target_email:target.email||null,role,team_name:teamName||null}});
    return NextResponse.json({ok:true});
  }catch(e){return NextResponse.json({ok:false,reason:e instanceof Error?e.message:"save_failed"},{status:500});}
}

export async function DELETE(request:Request){
  const access=await requireCommercialRole(request,["admin"]);
  if(!access.ok)return NextResponse.json({ok:false,reason:access.reason},{status:access.status});
  try{
    const body=await request.json() as Record<string,unknown>;
    const userId=String(body.userId||"");
    if(!userId)return NextResponse.json({ok:false,reason:"invalid_input"},{status:400});
    const {data:target}=await access.admin.from("commercial_memberships").select("role,active").eq("auth_user_id",userId).maybeSingle();
    if(!target)return NextResponse.json({ok:false,reason:"not_found"},{status:404});
    if(target.role==="admin"&&target.active){
      const {count}=await access.admin.from("commercial_memberships").select("auth_user_id",{count:"exact",head:true}).eq("role","admin").eq("active",true);
      if((count||0)<=1)return NextResponse.json({ok:false,reason:"last_admin",message:"O último administrador ativo não pode ser removido."},{status:409});
    }
    const {error}=await access.admin.from("commercial_memberships").update({active:false,updated_at:new Date().toISOString(),updated_by:access.user.id}).eq("auth_user_id",userId);
    if(error)throw error;
    await access.admin.from("commercial_admins").delete().eq("user_id",userId);
    await access.admin.from("commercial_audit_log").insert({action:"access_revoked",entity_type:"membership",entity_id:userId,actor_user_id:access.user.id,actor_email:access.user.email||null,metadata:{previous_role:target.role}});
    return NextResponse.json({ok:true});
  }catch(e){return NextResponse.json({ok:false,reason:e instanceof Error?e.message:"delete_failed"},{status:500});}
}
