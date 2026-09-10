import { createAdminClient } from "@/lib/supabase/admin";

export async function requireCommercialRole(request:Request,roles:string[]){
  const admin=createAdminClient();
  if(!admin)return {ok:false as const,status:503,reason:"server_not_configured"};
  const auth=request.headers.get("authorization")||"";
  const token=auth.toLowerCase().startsWith("bearer ")?auth.slice(7).trim():"";
  if(!token)return {ok:false as const,status:401,reason:"missing_token"};
  const {data:{user},error}=await admin.auth.getUser(token);
  if(error||!user)return {ok:false as const,status:401,reason:"invalid_token"};
  const {data:membership}=await admin.from("commercial_memberships").select("role,active").eq("auth_user_id",user.id).maybeSingle();
  if(!membership?.active||!roles.includes(String(membership.role)))return {ok:false as const,status:403,reason:"forbidden"};
  return {ok:true as const,admin,user,role:String(membership.role)};
}
