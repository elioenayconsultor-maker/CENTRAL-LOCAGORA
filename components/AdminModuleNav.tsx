"use client";
import Link from "next/link";
import { ArrowLeft, BarChart3, Settings, UsersRound } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function AdminModuleNav({current}:{current:"admin"|"crm"|"analytics"}){
 const params=useSearchParams();const from=params.get("from");const backHref=from==="admin"?"/admin":from==="crm"?"/crm":from==="analytics"?"/analytics":"/";const backLabel=from==="admin"?"Voltar ao Admin":from==="crm"?"Voltar ao CRM":from==="analytics"?"Voltar ao Analytics":"Voltar à Central Comercial";
 return <div className="adminModuleNav"><Link href={backHref}><ArrowLeft size={15}/>{backLabel}</Link><nav>{current!=="admin"&&<Link href="/admin"><Settings size={14}/>Admin</Link>}{current!=="crm"&&<Link href="/crm?from=admin"><UsersRound size={14}/>CRM / Pipeline</Link>}{current!=="analytics"&&<Link href="/analytics?from=admin"><BarChart3 size={14}/>Analytics</Link>}</nav></div>
}
