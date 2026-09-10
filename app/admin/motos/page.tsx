import AuthGate from "@/components/AuthGate";
import MotorcycleCatalogAdmin from "@/components/MotorcycleCatalogAdmin";

export default function MotorcycleAdminPage(){
  return <AuthGate><MotorcycleCatalogAdmin/></AuthGate>;
}
