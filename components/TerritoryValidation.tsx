"use client";
import { useState } from "react";
import { CheckCircle2, Loader2, MapPin, ShieldAlert } from "lucide-react";
import type { TerritoryProduct, TerritoryResult } from "@/lib/territory";

export default function TerritoryValidation({
  product,city,state,population,onValidated
}:{
  product:TerritoryProduct;
  city:string;
  state?:string;
  population:number;
  onValidated?:(result:TerritoryResult)=>void;
}){
  const [result,setResult]=useState<TerritoryResult|null>(null);
  const [loading,setLoading]=useState(false);

  async function validate(){
    setLoading(true);
    try{
      const params=new URLSearchParams({
        product,city,state:state||"",population:String(population||0)
      });
      const res=await fetch(`/api/territory?${params.toString()}`,{cache:"no-store"});
      const data=await res.json() as TerritoryResult;
      setResult(data); onValidated?.(data);
    }catch{
      const fallback:TerritoryResult={
        status:"review",label:"Validação indisponível",
        message:"Não foi possível consultar a base territorial agora. Encaminhe para validação manual da gestão.",
        matched:[],populationRuleOk:false,registryRuleOk:false
      };
      setResult(fallback); onValidated?.(fallback);
    }finally{setLoading(false)}
  }

  const cls=result?.status==="available"?"territoryResult ok":
    result?.status==="blocked"?"territoryResult blocked":
    result?"territoryResult review":"territoryResult";

  return <div className="territoryValidation">
    <div className="territoryValidationHead">
      <div><small>VALIDAÇÃO DA REDE</small><b>Base operacional Locagora</b></div>
      <button type="button" className="secondary" onClick={validate} disabled={loading||!city||!population}>
        {loading?<Loader2 size={15} className="spin"/>:<MapPin size={15}/>}
        {loading?"Consultando...":"Validar território"}
      </button>
    </div>
    {result&&<div className={cls}>
      <div>{result.status==="available"?<CheckCircle2 size={18}/>:<ShieldAlert size={18}/>}</div>
      <div><b>{result.label}</b><p>{result.message}</p>
        {result.matched.length>0&&<ul>{result.matched.map(p=><li key={p.id}>{p.name} — {p.city}{p.state?`/${p.state}`:""} • {p.status}</li>)}</ul>}
      </div>
    </div>}
    <small className="territoryDisclaimer">Pré-validação baseada na base operacional cadastrada. Exclusividade e liberação comercial só são definitivas após aprovação da gestão Locagora.</small>
  </div>
}
