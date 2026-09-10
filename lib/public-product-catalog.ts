import { createClient } from "@/lib/supabase/server";
import { getPublicProduct, type PublicProduct, type PublicProductProfile } from "@/lib/public-products";

type CatalogRow={slug:string;name:string;eyebrow:string;category:string;description:string;audience:string;scope:string;structure:string;profiles:string[];tags:string[];status:string};
export async function getPublicProductWithCatalog(slug:string):Promise<PublicProduct|null>{
 const base=getPublicProduct(slug);try{const supabase=await createClient();const {data}=await supabase.from("commercial_public_product_catalog").select("slug,name,eyebrow,category,description,audience,scope,structure,profiles,tags,status").eq("slug",slug).maybeSingle();const row=data as CatalogRow|null;if(row&&row.status!=="active")return null;if(row){return {slug:row.slug,name:row.name,eyebrow:row.eyebrow,category:row.category,description:row.description,audience:row.audience,scope:row.scope,structure:row.structure,profiles:(row.profiles||["network"]) as PublicProductProfile[],tags:row.tags||[],slides:base?.slides||[],facts:base?.facts||[{label:"Modelo",value:row.name},{label:"Status",value:"Em comercialização"}]};}}catch{}return base||null;
}
