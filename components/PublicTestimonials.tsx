"use client";
import { useEffect, useMemo, useState } from "react";
import { PlayCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Row={id:string;title:string;franchisee_name:string|null;location:string|null;youtube_video_id:string;placement:string[];sort_order:number;featured:boolean};

export default function PublicTestimonials({placement="history",title="Quem já vive a Locagora"}:{placement?:string;title?:string}){
 const supabase=useMemo(()=>createClient(),[]);const [rows,setRows]=useState<Row[]>([]);
 useEffect(()=>{void (async()=>{const {data}=await supabase.from("commercial_public_testimonials").select("id,title,franchisee_name,location,youtube_video_id,placement,sort_order,featured").eq("active",true).contains("placement",[placement]).order("featured",{ascending:false}).order("sort_order");setRows((data||[]) as Row[])})()},[placement,supabase]);
 if(!rows.length)return null;
 return <section className="publicTestimonials"><div className="testimonialHead"><small>DEPOIMENTOS DE FRANQUEADOS</small><h2>{title}</h2><p>Experiências selecionadas pela Locagora e publicadas a partir do canal oficial no YouTube.</p></div><div className="testimonialGrid">{rows.map(r=><article key={r.id}><div className="testimonialVideo"><iframe src={`https://www.youtube-nocookie.com/embed/${r.youtube_video_id}`} title={r.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/><span><PlayCircle size={15}/> YouTube</span></div><div><b>{r.title}</b>{r.franchisee_name&&<span>{r.franchisee_name}{r.location?` • ${r.location}`:""}</span>}</div></article>)}</div></section>
}
