import Link from "next/link";
import AuthGate from "@/components/AuthGate";
import AdminPanel from "@/components/AdminPanel";

export default function AdminPage(){
  return <AuthGate>
    <div style={{position:"fixed",right:18,bottom:18,zIndex:50}}>
      <Link href="/admin/premissas" style={{display:"inline-flex",padding:"12px 16px",borderRadius:12,background:"#18202a",color:"white",fontWeight:700,boxShadow:"0 8px 24px rgba(0,0,0,.14)"}}>
        Premissas de mercado
      </Link>
    </div>
    <AdminPanel/>
  </AuthGate>;
}
