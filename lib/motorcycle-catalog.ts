"use client";

import { createClient } from "./supabase/client";

export type MotorcycleMarket = "brazil" | "international";
export type MotorcycleCurrency = "BRL" | "EUR";

export type Motorcycle = {
  id: string;
  brand: string;
  model: string;
  display_name: string;
  base_price: number;
  currency: MotorcycleCurrency;
  available_brazil: boolean;
  available_international: boolean;
  active: boolean;
  metadata: Record<string, unknown>;
  updated_at?: string;
};

export async function loadMotorcycles(market?: MotorcycleMarket, includeInactive=false): Promise<Motorcycle[]> {
  let query=createClient().from("commercial_motorcycles")
    .select("id,brand,model,display_name,base_price,currency,available_brazil,available_international,active,metadata,updated_at")
    .order("brand").order("model");
  if(!includeInactive)query=query.eq("active",true);
  if(market==="brazil")query=query.eq("available_brazil",true);
  if(market==="international")query=query.eq("available_international",true);
  const {data,error}=await query;
  if(error)return [];
  return (data||[]).map((row:any)=>({...row,base_price:Number(row.base_price)||0})) as Motorcycle[];
}

export async function saveMotorcycle(input: Omit<Motorcycle,"id"|"display_name"|"updated_at"> & {id?:string}) {
  const supabase=createClient();
  const {data:userData}=await supabase.auth.getUser();
  const payload={
    brand:input.brand.trim(), model:input.model.trim(), base_price:Number(input.base_price)||0,
    currency:input.currency, available_brazil:Boolean(input.available_brazil),
    available_international:Boolean(input.available_international), active:Boolean(input.active),
    metadata:input.metadata||{}, updated_by:userData.user?.id||null,
    ...(input.id?{}:{created_by:userData.user?.id||null})
  };
  if(input.id){
    const {error}=await supabase.from("commercial_motorcycles").update(payload).eq("id",input.id);
    if(error)throw error;
    return input.id;
  }
  const {data,error}=await supabase.from("commercial_motorcycles").insert(payload).select("id").single();
  if(error)throw error;
  return data.id as string;
}

export function motorcyclePriceBRL(moto:Motorcycle, eurBrl:number){
  return moto.currency==="EUR"?moto.base_price*Math.max(0,Number(eurBrl)||0):moto.base_price;
}
