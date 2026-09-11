"use client";
import { useEffect,useMemo,useState } from "react";
import { TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./NetworkMetricsSummary.module.css";
const keys=["franchises_sold","stores_brazil","stores_portugal_active","stores_portugal_structuring","stores_spain_active","stores_spain_structuring"];
const fmt=(v:number|null|undefined)=>v==null||v<=0?"N/D":new Intl.NumberFormat("pt-BR",{maximumFractionDigits:0}).format(v);

type CountryCode="BR"|"PT"|"ES";
function CountryFlag({code}:{code:CountryCode}){
 if(code==="BR")return <svg className={styles.flagSvg} viewBox="0 0 48 32" role="img" aria-label="Bandeira do Brasil"><rect width="48" height="32" rx="4" fill="#159447"/><path d="M24 4 43 16 24 28 5 16Z" fill="#FFDF00"/><circle cx="24" cy="16" r="7" fill="#002776"/><path d="M18 14.8c4.2-1.4 8.6-.6 12.2 1.8" fill="none" stroke="#fff" strokeWidth="1.2"/></svg>;
 if(code==="PT")return <svg className={styles.flagSvg} viewBox="0 0 48 32" role="img" aria-label="Bandeira de Portugal"><rect width="19" height="32" rx="4" fill="#046A38"/><path d="M19 0h25a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H19Z" fill="#DA291C"/><circle cx="19" cy="16" r="5" fill="#FFCC29"/><circle cx="19" cy="16" r="3.2" fill="none" stroke="#fff" strokeWidth="1"/></svg>;
 return <svg className={styles.flagSvg} viewBox="0 0 48 32" role="img" aria-label="Bandeira da Espanha"><rect width="48" height="32" rx="4" fill="#AA151B"/><rect y="8" width="48" height="16" fill="#F1BF00"/><rect x="12" y="12" width="4" height="8" rx="1" fill="#AA151B"/></svg>;
}

export default function NetworkMetricsSummary(){
 const supabase=useMemo(()=>createClient(),[]);const [m,setM]=useState<Record<string,number>>({});
 useEffect(()=>{let alive=true;(async()=>{const {data}=await supabase.from("commercial_network_metrics").select("metric_key,value").in("metric_key",keys);if(alive&&data)setM(Object.fromEntries(data.map(x=>[x.metric_key,Number(x.value)])))} )();return()=>{alive=false}},[supabase]);
 const country=(code:CountryCode,name:string,active:number,structuring:number,totalOverride?:number)=><div className={styles.card}><div className={styles.flag}><CountryFlag code={code}/></div><div className={styles.name}>{name.toUpperCase()}</div><strong>{fmt(totalOverride??(active+structuring))}</strong>{totalOverride!=null?<small>lojas • editável pelo ADM</small>:<div className={styles.status}><span><i className={`${styles.dot} ${styles.active}`}/>{active} ativa{active===1?"":"s"}</span><span><i className={`${styles.dot} ${styles.structuring}`}/>{structuring} estruturando</span></div>}</div>;
 return <section className={`panel ${styles.panel}`}><div className={styles.top}><div className={styles.title}><span className={styles.icon}><TrendingUp size={27}/></span><div><small className={styles.kicker}>REDE LOCAGORA • INDICADOR COMERCIAL</small><h2>Franquias vendidas</h2></div></div><div className={styles.total}><span>TOTAL PUBLICADO</span><strong>{fmt(m.franchises_sold)}</strong><small>Atualização controlada pelo ADM</small></div></div><div className={styles.countries}>{country("BR","Brasil",0,0,m.stores_brazil)}{country("PT","Portugal",m.stores_portugal_active??0,m.stores_portugal_structuring??0)}{country("ES","Espanha",m.stores_spain_active??0,m.stores_spain_structuring??0)}</div></section>;
}