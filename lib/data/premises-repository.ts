import { createClient } from "@/lib/supabase/client";
import { defaultPremises, normalizePremises, type PremiseVersion } from "@/lib/domain/premises";

type Row={id:string;version:number;status:string;config:unknown;created_at:string;published_at:string|null;created_by:string|null;notes:string|null};
const toVersion=(r:Row):PremiseVersion=>({id:r.id,version:r.version,status:r.status as PremiseVersion["status"],config:normalizePremises(r.config),createdAt:r.created_at,publishedAt:r.published_at,createdBy:r.created_by,notes:r.notes});

export async function getPublishedPremises():Promise<PremiseVersion>{
  const {data,error}=await createClient().from("commercial_premise_versions").select("id,version,status,config,created_at,published_at,created_by,notes").eq("status","published").order("version",{ascending:false}).limit(1).maybeSingle();
  if(error || !data) return {id:"legacy-default",version:0,status:"published",config:defaultPremises(),createdAt:new Date(0).toISOString(),publishedAt:null,createdBy:null,notes:"Fallback local: premissas publicadas indisponíveis."};
  return toVersion(data as Row);
}
