import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_BODY_BYTES=64*1024;

export class PublicApiSecurityError extends Error{
 constructor(public readonly status:number,public readonly reason:string,public readonly retryAfter?:number){super(reason);}
}

function normalizeHost(value:string|null){
 if(!value)return "";
 return value.trim().toLowerCase().replace(/\.$/,"");
}

export function assertSameOrigin(request:Request){
 const origin=request.headers.get("origin");
 if(!origin)throw new PublicApiSecurityError(403,"forbidden_origin");
 try{
  const originHost=normalizeHost(new URL(origin).host);
  const allowed=new Set<string>();
  allowed.add(normalizeHost(request.headers.get("x-forwarded-host")));
  allowed.add(normalizeHost(request.headers.get("host")));
  allowed.add(normalizeHost(new URL(request.url).host));
  const configured=process.env.NEXT_PUBLIC_APP_URL;
  if(configured){
   try{allowed.add(normalizeHost(new URL(configured).host));}catch{}
  }
  allowed.delete("");
  if(!originHost||!allowed.has(originHost))throw new PublicApiSecurityError(403,"forbidden_origin");
 }catch(error){
  if(error instanceof PublicApiSecurityError)throw error;
  throw new PublicApiSecurityError(403,"forbidden_origin");
 }
}

export async function readPublicJson(request:Request){
 const declared=Number(request.headers.get("content-length")||0);
 if(Number.isFinite(declared)&&declared>MAX_BODY_BYTES)throw new PublicApiSecurityError(413,"payload_too_large");
 const text=await request.text();
 if(Buffer.byteLength(text,"utf8")>MAX_BODY_BYTES)throw new PublicApiSecurityError(413,"payload_too_large");
 try{
  const parsed=JSON.parse(text);
  if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw new Error("invalid_json");
  return parsed as Record<string,unknown>;
 }catch{throw new PublicApiSecurityError(400,"invalid_request");}
}

export function requestFingerprint(request:Request){
 const forwarded=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
 const ip=forwarded||request.headers.get("x-real-ip")||"unknown";
 const ua=(request.headers.get("user-agent")||"").slice(0,300);
 return hashRateLimitKey(`ip:${ip}|ua:${ua}`);
}

export function hashRateLimitKey(value:string){return createHash("sha256").update(value).digest("hex");}

export async function enforceRateLimit(admin:SupabaseClient,params:{scope:string;keyHash:string;limit:number;windowSeconds:number}){
 const {data,error}=await admin.rpc("consume_commercial_public_rate_limit",{p_scope:params.scope,p_key_hash:params.keyHash,p_limit:params.limit,p_window_seconds:params.windowSeconds});
 if(error)throw new PublicApiSecurityError(503,"security_unavailable");
 if(data!==true)throw new PublicApiSecurityError(429,"rate_limited",params.windowSeconds);
}

export function securityResponse(error:unknown){
 if(error instanceof PublicApiSecurityError){
  const headers:Record<string,string>={"Cache-Control":"no-store"};
  if(error.retryAfter)headers["Retry-After"]=String(error.retryAfter);
  return Response.json({ok:false,reason:error.reason},{status:error.status,headers});
 }
 return null;
}
