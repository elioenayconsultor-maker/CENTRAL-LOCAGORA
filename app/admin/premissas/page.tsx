import AuthGate from "@/components/AuthGate";
import MarketAssumptionsAdmin from "@/components/MarketAssumptionsAdmin";

export default function MarketAssumptionsPage(){
  return <AuthGate><MarketAssumptionsAdmin/></AuthGate>;
}
