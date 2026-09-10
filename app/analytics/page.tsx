import AuthGate from "@/components/AuthGate";
import AdminOnlyGate from "@/components/AdminOnlyGate";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
export default function AnalyticsPage(){return <AuthGate><AdminOnlyGate><AnalyticsDashboard/></AdminOnlyGate></AuthGate>}
