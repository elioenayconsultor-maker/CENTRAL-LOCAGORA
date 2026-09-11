"use client";
import { useEffect,useMemo,useState } from "react";
import { TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./NetworkMetricsSummary.module.css";
const keys=["franchises_sold","stores_brazil","stores_portugal_active","stores_portugal_structuring","stores_spain_active","stores_spain_structuring"];
const fmt=(v:number|null|undefined)=>v==null||v<=0?"N/D":new Intl.NumberFormat("pt-BR",{maximumFractionDigits:0}).format(v);
export default function NetworkMetricsSummary(){
 const supabase=useMemo(()=>createClient(),[]);const [m,setM]=useState<Record<string,number>>({});
 useEffect(()=>{let alive=true;(async()=>{const {data}=await supabase.from("commercial_network_metrics").select("metric_key,value").in("metric_key",keys);if(alive&&data)setM(Object.fromEntries(data.map(x=>[x.metric_key,Number(x.value)])))} )();return()=>{alive=false}},[supabase]);
 const country=(flag:string,name:string,active:number,structuring:number,totalOverride?:number)=><div className={styles.card}><div className={styles.flag}>{flag}</div><div className={styles.name}>{name.toUpperCase()}</div><strong>{fmt(totalOverride??(active+structuring))}</strong>{totalOverride!=null?<small>lojas • editável pelo ADM</small>:<div className={styles.status}><span><i className={`${styles.dot} ${styles.active}`}/>{active} ativa{active===1?"":"s"}</span><span><i className={`${styles.dot} ${styles.structuring}`}/>{structuring} estruturando</span></div>}</div>;
 return <section className={`panel ${styles.panel}`}><div className={styles.top}><div className={styles.title}><span className={styles.icon}><TrendingUp size={27}/></span><div><small className={styles.kicker}>REDE LOCAGORA • INDICADOR COMERCIAL</small><h2>Franquias vendidas</h2></div></div><div className={styles.total}><span>TOTAL PUBLICADO</span><strong>{fmt(m.franchises_sold)}</strong><small>Atualização controlada pelo ADM</small></div></div><div className={styles.countries}>{country("🇧🇷","Brasil",0,0,m.stores_brazil)}{country("🇵🇹","Portugal",m.stores_portugal_active??0,m.stores_portugal_structuring??0)}{country("🇪🇸","Espanha",m.stores_spain_active??0,m.stores_spain_structuring??0)}</div></section>;
}