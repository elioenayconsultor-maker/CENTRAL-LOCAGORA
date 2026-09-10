"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getAuthenticatedCorporateEmail, getMyConsultantProfile, saveMyConsultantProfile, uploadMyConsultantAvatar, type ConsultantProfile } from "@/lib/consultant-profile";
import styles from "./ConsultantProfileGate.module.css";

const digits=(v:string)=>v.replace(/\D/g,"");
const initials=(name:string)=>name.split(/\s+/).filter(Boolean).slice(0,2).map(v=>v[0]).join("").toUpperCase()||"LC";

export default function ConsultantProfileGate({children}:{children:ReactNode}){
  const [profile,setProfile]=useState<ConsultantProfile|null>(null);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const [avatarPath,setAvatarPath]=useState<string|null>(null);
  const [preview,setPreview]=useState<string|null>(null);
  const [email,setEmail]=useState("");
  const [error,setError]=useState("");

  const load=async()=>{try{const [p,authEmail]=await Promise.all([getMyConsultantProfile(),getAuthenticatedCorporateEmail()]);setProfile(p);setEmail(authEmail||p?.email||"");setName(p?.name||"");setPhone(p?.phone||"");setAvatarPath(p?.avatarPath||null);setPreview(p?.avatarUrl||null);}catch(e){setError(e instanceof Error?e.message:"Não foi possível carregar seu perfil.");}finally{setLoading(false)}};
  useEffect(()=>{void load()},[]);
  const valid=useMemo(()=>name.trim().length>=3&&digits(phone).length>=10,[name,phone]);

  const choosePhoto=async(file?:File)=>{if(!file)return;setError("");try{const path=await uploadMyConsultantAvatar(file);setAvatarPath(path);setPreview(URL.createObjectURL(file));}catch(e){setError(e instanceof Error?e.message:"Não foi possível enviar a foto.")}};
  const save=async()=>{if(!valid)return;setSaving(true);setError("");try{await saveMyConsultantProfile({name,phone,avatarPath});await load();window.dispatchEvent(new CustomEvent("locagora:consultant-profile-updated"));}catch(e){setError(e instanceof Error?e.message:"Não foi possível salvar seu cadastro.");}finally{setSaving(false)}};

  if(loading)return <div className={styles.loading}>Carregando seu perfil comercial...</div>;
  if(profile?.completed)return <>{children}</>;

  return <div className={styles.backdrop}><section className={styles.card}>
    <div className={styles.eyebrow}>PRIMEIRO ACESSO • ETAPA 2 DE 2 • PERFIL PROFISSIONAL</div>
    <h1>Complete seu perfil profissional</h1>
    <p>Esses dados ficam vinculados ao seu acesso e serão usados automaticamente nas propostas comerciais. A foto é opcional.</p>
    <div className={styles.grid}>
      <label>Nome completo<input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" placeholder="Seu nome completo"/></label>
      <label>E-mail corporativo<input value={email} readOnly aria-label="E-mail corporativo" title="E-mail vinculado ao seu acesso"/></label>
      <label>Celular / WhatsApp<input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="(31) 99999-9999"/></label>
      <div className={styles.photo}><div className={styles.avatar}>{preview?<img src={preview} alt="Foto do consultor" className={styles.avatar}/>:initials(name)}</div><div className={styles.photoText}><b>Foto do consultor (opcional)</b><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>void choosePhoto(e.target.files?.[0])}/><small>PNG, JPG ou WebP • até 2 MB. Para a proposta, recomendamos PNG com fundo transparente.</small></div></div>
    </div>
    {error&&<div className={styles.warn}>{error}</div>}
    <div className={styles.actions}><button className={styles.save} disabled={!valid||saving} onClick={()=>void save()}>{saving?"Salvando...":"Salvar perfil e acessar a Central"}</button></div>
  </section></div>;
}
