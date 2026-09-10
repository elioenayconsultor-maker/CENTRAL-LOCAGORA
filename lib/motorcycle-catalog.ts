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
  intermediation_fee: number;
  currency: MotorcycleCurrency;
  available_brazil: boolean;
  available_international: boolean;
  active: boolean;
  metadata: Record<string, unknown>;
  updated_at?: string;
};

export async function loadMotorcycles(market?: MotorcycleMarket, includeInactive=false): Promise<Motorcycle[]> {
  let query=createClient().from("commercial_motorcycles")
    .select("id,brand,model,display_name,base_price,intermediation_fee,currency,available_brazil,available_international,active,metadata,updated_at")
    .order("brand").order("model");
  if(!includeInactive)query=query.eq("active",true);
  if(market==="brazil")query=query.eq("available_brazil",true);
  if(market==="international")query=query.eq("available_international",true);
  const {data,error}=await query;
  if(error)return [];
  return (data||[]).map((row:any)=>({
    ...row,
    display_name:row.display_name||`${row.brand} ${row.model}`,
    base_price:Number(row.base_price)||0,
    intermediation_fee:Number(row.intermediation_fee)||0,
  })) as Motorcycle[];
}

export async function saveMotorcycle(input: Omit<Motorcycle,"id"|"display_name"|"updated_at"> & {id?:string}) {
  const supabase=createClient();
  const {data:userData}=await supabase.auth.getUser();
  const payload={
    brand:input.brand.trim(),
    model:input.model.trim(),
    display_name:`${input.brand.trim()} ${input.model.trim()}`.trim(),
    base_price:Number(input.base_price)||0,
    intermediation_fee:Number(input.intermediation_fee)||0,
    currency:input.currency,
    available_brazil:Boolean(input.available_brazil),
    available_international:Boolean(input.available_international),
    active:Boolean(input.active),
    metadata:input.metadata||{},
    updated_by:userData.user?.id||null,
    updated_at:new Date().toISOString(),
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

export async function setMotorcycleActive(id:string,active:boolean){
  const supabase=createClient();
  const {data:userData}=await supabase.auth.getUser();
  const {error}=await supabase.from("commercial_motorcycles").update({
    active,
    updated_by:userData.user?.id||null,
    updated_at:new Date().toISOString(),
  }).eq("id",id);
  if(error)throw error;
}

export function motorcyclePriceBRL(moto:Motorcycle, eurBrl:number){
  return moto.currency==="EUR"?moto.base_price*Math.max(0,Number(eurBrl)||0):moto.base_price;
}

export function motorcycleIntermediationBRL(moto:Motorcycle, eurBrl:number){
  return moto.currency==="EUR"?moto.intermediation_fee*Math.max(0,Number(eurBrl)||0):moto.intermediation_fee;
}
