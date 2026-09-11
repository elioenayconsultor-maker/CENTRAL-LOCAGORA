"use client";
import { useEffect,useMemo,useState } from "react";
import { Bike,MapPin,MessageCircle,ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./RentalPublic.module.css";

type Banner={id:string;title:string;subtitle:string;city:string;state:string|null;country:string;image_url:string;target_url:string|null;display_order:number};

type FormState={name:string;mobile:string;email:string;city:string;state:string;hasCnhA:boolean;worksWithDelivery:boolean;preferredContact:"whatsapp"|"email";message:string;website:string};
const initial:FormState={name:"",mobile:"",email:"",city:"",state:"",hasCnhA:false,worksWithDelivery:false,preferredContact:"whatsapp",message:"",website:""};

export default function PublicRentalExperience(){
 const supabase=useMemo(()=>createClient(),[]);const [banners,setBanners]=useState<Banner[]>([]);const [current,setCurrent]=useState(0);const [loading,setLoading]=useState(true);const [form,setForm]=useState<FormState>(initial);const [sending,setSending]=useState(false);const [status,setStatus]=useState("");
 useEffect(()=>{void (async()=>{const {data}=await supabase.from("commercial_rental_banners").select("id,title,subtitle,city,state,country,image_url,target_url,display_order").eq("active",true).order("display_order").order("created_at");setBanners((data||[]) as Banner[]);setLoading(false)})()},[supabase]);
 useEffect(()=>{if(banners.length<2)return;const t=window.setInterval(()=>setCurrent(v=>(v+1)%banners.length),5500);return()=>window.clearInterval(t)},[banners.length]);
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setSending(true);setStatus("");try{const res=await fetch("/api/rental-interest",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(form)});const json=await res.json();if(!res.ok||!json.ok)throw new Error("Não foi possível enviar agora.");setStatus("Contato recebido. Nossa equipe vai falar com você pelo canal escolhido.");setForm(initial)}catch(err){setStatus(err instanceof Error?err.message:"Falha no envio.")}finally{setSending(false)}};
 return <main className={styles.page}>
   <section className={styles.hero}>
    <div className={styles.heroMain}><small>ALUGUEL DE MOTOS • LOCAGORA</small><h1>Uma moto para trabalhar, rodar e avançar.</h1><p>Consulte disponibilidade nas cidades atendidas pela rede Locagora. Nesta primeira fase, você deixa seu contato e nossa equipe orienta sobre os próximos passos.</p></div>
    <div className={styles.heroPoints}>
      <div className={styles.heroPoint}><Bike/><div><b>Foco em mobilidade para o trabalho</b><span>Atendimento para motoboys, entregadores e quem precisa de uma moto para sua rotina.</span></div></div>
      <div className={styles.heroPoint}><MapPin/><div><b>Atendimento por cidade</b><span>Os banners abaixo mostram praças com operação ou campanha ativa.</span></div></div>
      <div className={styles.heroPoint}><ShieldCheck/><div><b>Fluxo inicial simples</b><span>Sem contratação online nesta etapa: primeiro registramos o interesse e fazemos o contato.</span></div></div>
    </div>
   </section>
   <section className={styles.carousel} aria-label="Cidades com aluguel de motos">
    {loading?<div className={styles.loading}>Carregando cidades...</div>:banners.length===0?<div className={styles.emptyBanner}><div><Bike size={48}/><h2>Aluguel de motos Locagora</h2><p>Novas cidades e campanhas serão publicadas aqui.</p></div></div>:<>{banners.map((banner,index)=><a href={banner.target_url||"#cadastro-motoboy"} className={`${styles.banner} ${index===current?styles.active:""}`} key={banner.id} aria-hidden={index!==current}><img src={banner.image_url} alt={`${banner.title} - ${banner.city}`}/><div className={styles.shade}/><div className={styles.bannerCopy}><small>{banner.city}{banner.state?` • ${banner.state}`:""} • {banner.country}</small><h2>{banner.title}</h2>{banner.subtitle&&<p>{banner.subtitle}</p>}</div></a>)}<div className={styles.dots}>{banners.map((b,index)=><button key={b.id} className={index===current?styles.on:""} onClick={()=>setCurrent(index)} aria-label={`Mostrar banner ${index+1}`}/>)}</div></>}
   </section>
   <section className={styles.grid} id="cadastro-motoboy">
    <div className={styles.info}><MessageCircle size={34}/><h2>Quer alugar uma moto?</h2><p>Deixe seus dados para a equipe responsável pela sua região entrar em contato.</p><ul><li>Cadastro de interesse gratuito.</li><li>Disponibilidade depende da cidade e do estoque local.</li><li>Condições, documentação e valores serão confirmados no atendimento.</li><li>Em uma próxima fase, este fluxo poderá evoluir para contratação completa dentro do app.</li></ul></div>
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.formHead}><small>CADASTRO DE INTERESSE</small><h2>Deixe seu contato</h2><p>Preencha os dados abaixo. Não é uma reserva nem contratação.</p></div>
      <div className={styles.fields}>
       <label>Nome completo<input required minLength={2} value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
       <label>WhatsApp / celular<input required inputMode="tel" value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})} placeholder="(31) 99999-9999"/></label>
       <label>E-mail<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
       <label>Cidade<input required value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></label>
       <label>Estado<input value={form.state} onChange={e=>setForm({...form,state:e.target.value})}/></label>
       <label>Preferência de contato<select value={form.preferredContact} onChange={e=>setForm({...form,preferredContact:e.target.value as "whatsapp"|"email"})}><option value="whatsapp">WhatsApp</option><option value="email">E-mail</option></select></label>
       <div className={styles.checks}><label className={styles.check}><input type="checkbox" checked={form.hasCnhA} onChange={e=>setForm({...form,hasCnhA:e.target.checked})}/>Tenho CNH categoria A</label><label className={styles.check}><input type="checkbox" checked={form.worksWithDelivery} onChange={e=>setForm({...form,worksWithDelivery:e.target.checked})}/>Trabalho com entregas / delivery</label></div>
       <label className={styles.wide}>Observação<textarea rows={4} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Conte em qual região trabalha ou quando pretende começar."/></label>
       <input tabIndex={-1} autoComplete="off" value={form.website} onChange={e=>setForm({...form,website:e.target.value})} style={{position:"absolute",left:"-9999px"}} aria-hidden="true"/>
      </div>
      <button className={styles.submit} disabled={sending}>{sending?"Enviando...":"Quero receber contato sobre aluguel"}</button>
      {status&&<div className={styles.status}>{status}</div>}
      <div className={styles.notice}>Ao enviar, você autoriza o uso destes dados para contato comercial relacionado ao aluguel de motos Locagora.</div>
    </form>
   </section>
 </main>
}
