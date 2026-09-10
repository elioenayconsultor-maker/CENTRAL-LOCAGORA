"use client";
import { useEffect,useState } from "react";
import { Cloud,CloudOff,LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentAppUser } from "@/lib/commercial-repository";
export default function CloudSyncStatus(){
 const [user,setUser]=useState<any>(null); const [checked,setChecked]=useState(false);
 useEffect(()=>{getCurrentAppUser().then(x=>{setUser(x);setChecked(true)}).catch(()=>setChecked(true))},[]);
 if(!checked)return null;
 if(!user)return <span className="cloudStatus"><CloudOff size={14}/>Modo local / usuário não vinculado</span>;
 return <div className="cloudStatusBox"><span className="cloudStatus ok"><Cloud size={14}/><span><b>Supabase conectado</b><small>{user.name||user.email}</small></span></span><button title="Sair" onClick={()=>createClient().auth.signOut()}><LogOut size={14}/></button></div>;
}
