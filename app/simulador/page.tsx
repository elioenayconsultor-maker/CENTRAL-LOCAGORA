import type { Metadata } from "next";
import PublicShell from "@/components/PublicShell";
import PublicSimulator from "@/components/PublicSimulator";
import PublicModelSimulator from "@/components/PublicModelSimulator";

export const metadata:Metadata={title:"Simulador | Central LOC",description:"Conheça a apresentação de cada modelo Locagora e avance para a simulação correspondente."};
export default async function SimulatorPage({searchParams}:{searchParams:Promise<{produto?:string}>}){const {produto}=await searchParams;return <PublicShell>{produto?<PublicModelSimulator slug={produto}/>:<PublicSimulator/>}</PublicShell>;}
