import Link from "next/link";
import AuthGate from "@/components/AuthGate";
import AdminPanel from "@/components/AdminPanel";

export default function AdminPage(){
  return <AuthGate>
    <div style={{position:"fixed",right:18,bottom:18,zIndex:50,display:"flex",gap:10,flexWrap:"wrap",justifyContent:"flex-end"}}>
      <Link href="/admin/aluguel" style={{display:"inline-flex",padding:"12px 16px",borderRadius:12,background:"#08755e",color:"white",fontWeight:700,boxShadow:"0 8px 24px rgba(0,0,0,.14)"}}>
        Aluguel • banners e leads
      </Link>
      <Link href="/admin/motos" style={{display:"inline-flex",padding:"12px 16px",borderRadius:12,background:"#0b6b57",color:"white",fontWeight:700,boxShadow:"0 8px 24px rgba(0,0,0,.14)"}}>
        Cadastro de motos
      </Link>
      <Link href="/admin/premissas" style={{display:"inline-flex",padding:"12px 16px",borderRadius:12,background:"#18202a",color:"white",fontWeight:700,boxShadow:"0 8px 24px rgba(0,0,0,.14)"}}>
        Premissas de mercado
      </Link>
    </div>
    <AdminPanel/>
  </AuthGate>;
}
