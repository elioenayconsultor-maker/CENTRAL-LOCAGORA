import Link from "next/link";
import AuthGate from "@/components/AuthGate";
import AdminOnlyGate from "@/components/AdminOnlyGate";
import RentalBannerAdmin from "@/components/RentalBannerAdmin";

export default function RentalAdminPage(){return <AuthGate><AdminOnlyGate><main className="adminWorkspace"><div className="phase7TopNav"><Link href="/admin">← Voltar ao ADM</Link><span>Aluguel de motos • campanhas públicas</span></div><header className="adminHero"><div><small>ADM • ALUGUEL DE MOTOS</small><h1>Banners, cidades e interessados</h1><p>Publique campanhas rotativas das praças atendidas e acompanhe os cadastros de motoboys.</p></div></header><RentalBannerAdmin/></main></AdminOnlyGate></AuthGate>}
