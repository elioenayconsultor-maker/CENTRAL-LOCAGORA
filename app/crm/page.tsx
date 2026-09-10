import AuthGate from "@/components/AuthGate";
import AdminOnlyGate from "@/components/AdminOnlyGate";
import CommercialCRM from "@/components/CommercialCRM";
export default function CRMPage(){return <AuthGate><AdminOnlyGate><CommercialCRM/></AdminOnlyGate></AuthGate>}
