"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bike, Plus, RefreshCcw, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loadMotorcycles, saveMotorcycle, setMotorcycleActive, type Motorcycle, type MotorcycleCurrency } from "@/lib/motorcycle-catalog";

const money=(v:number,currency:MotorcycleCurrency)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency}).format(Number(v)||0);
const newBlank=()=>({brand:"",model:"",base_price:0,intermediation_fee:0,currency:"BRL" as MotorcycleCurrency,available_brazil:true,available_international:false,active:true,metadata:{}});

export default function MotorcycleCatalogAdmin(){
 const supabase=useMemo(()=>createClient(),[]);
 const [rows,setRows]=useState<Motorcycle[]>([]);
 const [form,setForm]=useState(newBlank());
 const [editingId,setEditingId]=useState<string|null>(null);
 const [checked,setChecked]=useState(false);
 const [admin,setAdmin]=useState(false);
 const [status,setStatus]=useState("");
 const [saving,setSaving]=useState(false);
 const [toggling,setToggling]=useState<string|null>(null);

 const refresh=async()=>{
   setStatus("");
   const {data:isAdmin}=await supabase.rpc("is_commercial_admin");
   setAdmin(Boolean(isAdmin));
   if(isAdmin)setRows(await loadMotorcycles(undefined,true));
   setChecked(true);
 };
 useEffect(()=>{void refresh()},[]);

 const edit=(m:Motorcycle)=>{
   setEditingId(m.id);
   setForm({brand:m.brand,model:m.model,base_price:m.base_price,intermediation_fee:m.intermediation_fee||0,currency:m.currency,available_brazil:m.available_brazil,available_international:m.available_international,active:m.active,metadata:m.metadata||{}});
   window.scrollTo({top:0,behavior:"smooth"});
 };
 const reset=()=>{setEditingId(null);setForm(newBlank())};
 const save=async()=>{
   if(!form.brand.trim()||!form.model.trim()){setStatus("Informe marca e modelo.");return}
   if(form.base_price<0||form.intermediation_fee<0){setStatus("Preço base e intermediação não podem ser negativos.");return}
   if(!form.available_brazil&&!form.available_international){setStatus("Marque Brasil, Exterior ou ambos.");return}
   setSaving(true);setStatus("Salvando moto...");
   try{
     await saveMotorcycle({...form,id:editingId||undefined});
     setStatus(editingId?"Moto atualizada. O cadastro continua registrado abaixo.":"Moto cadastrada. O formulário foi liberado para cadastrar a próxima.");
     reset();
     setRows(await loadMotorcycles(undefined,true));
   }catch(e){setStatus(e instanceof Error?e.message:"Não foi possível salvar a moto.")}
   finally{setSaving(false)}
 };
 const toggle=async(m:Motorcycle)=>{
   setToggling(m.id);setStatus("");
   try{
     await setMotorcycleActive(m.id,!m.active);
     setStatus(!m.active?`${m.display_name} ativada. Voltará a aparecer nos simuladores compatíveis.`:`${m.display_name} desativada. Não aparecerá em novas simulações.`);
     setRows(await loadMotorcycles(undefined,true));
   }catch(e){setStatus(e instanceof Error?e.message:"Não foi possível alterar o status da moto.")}
   finally{setToggling(null)}
 };

 if(!checked)return <div className="adminLoading">Validando acesso administrativo...</div>;
 if(!admin)return <main className="adminScreen"><section className="adminCard"><Bike/><h1>Catálogo de motos</h1><p>Seu usuário não possui permissão administrativa para manter a frota.</p><Link href="/admin">Voltar ao Admin</Link></section></main>;

 return <main className="adminWorkspace">
   <div className="phase7TopNav"><Link href="/admin"><ArrowLeft size={16}/> Voltar ao Admin</Link><span>ADM • catálogo compartilhado de motos</span></div>
   <header className="adminHero"><div><small>V9.3.5 • FROTA CENTRAL</small><h1>Cadastro único de motos</h1><p>Cadastre quantas motos forem necessárias. Cada moto permanece registrada em um card próprio e pode ser ativada ou desativada sem apagar seu histórico.</p></div><button className="secondary" onClick={()=>void refresh()}><RefreshCcw/> Recarregar</button></header>
   {status&&<div className="adminStatus">{status}</div>}
   <section className="adminSection"><div className="sectionHead"><small>{editingId?"EDIÇÃO":"NOVO CADASTRO"}</small><h2>{editingId?"Editar moto cadastrada":"Cadastrar nova moto"}</h2><p>Depois de salvar, esta área fica vazia novamente para a próxima moto. A moto anterior permanece registrada abaixo.</p></div>
     <div className="adminFormGrid">
       <label>Marca<input value={form.brand} onChange={e=>setForm(x=>({...x,brand:e.target.value}))} placeholder="Ex.: Yamaha"/></label>
       <label>Modelo<input value={form.model} onChange={e=>setForm(x=>({...x,model:e.target.value}))} placeholder="Ex.: Factor 150"/></label>
       <label>Preço base<input type="number" min="0" step="0.01" value={form.base_price||""} onChange={e=>setForm(x=>({...x,base_price:Number(e.target.value)||0}))}/><small>Valor unitário usado como base da moto nos simuladores.</small></label>
       <label>Taxa de intermediação / moto<input type="number" min="0" step="0.01" value={form.intermediation_fee||""} onChange={e=>setForm(x=>({...x,intermediation_fee:Number(e.target.value)||0}))}/><small>Valor unitário de intermediação associado a este modelo.</small></label>
       <label>Moeda<select value={form.currency} onChange={e=>setForm(x=>({...x,currency:e.target.value as MotorcycleCurrency}))}><option value="BRL">BRL — Real</option><option value="EUR">EUR — Euro</option></select></label>
     </div>
     <div className="adminFormGrid">
       <label><span>Disponível no Brasil</span><input type="checkbox" checked={form.available_brazil} onChange={e=>setForm(x=>({...x,available_brazil:e.target.checked}))}/></label>
       <label><span>Disponível no Exterior</span><input type="checkbox" checked={form.available_international} onChange={e=>setForm(x=>({...x,available_international:e.target.checked}))}/></label>
       <label><span>Ativa</span><input type="checkbox" checked={form.active} onChange={e=>setForm(x=>({...x,active:e.target.checked}))}/></label>
     </div>
     <div className="quickValues"><button className="primary" disabled={saving} onClick={()=>void save()}><Save/> {saving?"Salvando...":editingId?"Salvar alterações":"Cadastrar moto e abrir novo cadastro"}</button>{editingId&&<button className="secondary" onClick={reset}><Plus/> Nova moto</button>}</div>
   </section>
   <section className="adminSection"><div className="sectionHead"><small>CATÁLOGO REGISTRADO</small><h2>Motos cadastradas</h2><p>Desativar remove a moto das novas seleções em investimentos e franquias compatíveis, mas mantém o cadastro e histórico. Ativar devolve a moto aos simuladores.</p></div>
     <div className="adminPlanGrid">{rows.length?rows.map(m=><article className="adminGroup" key={m.id} style={{opacity:m.active?1:.66}}><div className="assetIcon"><Bike/></div><h3>{m.display_name}</h3><p><b>{money(m.base_price,m.currency)}</b> • preço base</p><p><b>{money(m.intermediation_fee||0,m.currency)}</b> • intermediação/moto</p><p>{m.available_brazil?"Brasil":""}{m.available_brazil&&m.available_international?" • ":""}{m.available_international?"Exterior":""}</p><p><b>{m.active?"ATIVA":"INATIVA"}</b></p><div className="quickValues"><button className="secondary" onClick={()=>edit(m)}>Editar</button><button className={m.active?"secondary":"primary"} disabled={toggling===m.id} onClick={()=>void toggle(m)}>{m.active?<ToggleLeft/>:<ToggleRight/>}{toggling===m.id?"Atualizando...":m.active?"Desativar":"Ativar"}</button></div></article>):<div className="empty">Nenhuma moto cadastrada ainda. Cadastre a primeira acima.</div>}</div>
   </section>
 </main>;
}
