import AdminOnlyGate from "@/components/AdminOnlyGate";
import CorporateProfilesAdmin from "@/components/CorporateProfilesAdmin";

export default function CorporateProfilesPage(){
 return <AdminOnlyGate><main className="adminWorkspace"><div className="phase7TopNav"><a href="/admin">← Voltar ao Admin</a><span>Administração • perfis corporativos</span></div><header className="adminHero"><div><small>ADMIN • PESSOAS & ACESSOS</small><h1>Perfis corporativos</h1><p>Defina departamento, cargo, perfil de acesso e módulos adicionais para cada colaborador.</p></div></header><CorporateProfilesAdmin/></main></AdminOnlyGate>;
}
