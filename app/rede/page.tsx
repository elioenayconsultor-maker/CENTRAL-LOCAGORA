import PublicShell from "@/components/PublicShell";
import NetworkPage from "@/components/NetworkPage";

export const metadata={
  title:"Rede Locagora | Onde estamos",
  description:"Consulte as unidades, Masters e bases da Rede Locagora.",
};

export default function PublicNetworkPage(){
  return <PublicShell><NetworkPage/></PublicShell>;
}
