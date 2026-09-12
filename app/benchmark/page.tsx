import PublicShell from "@/components/PublicShell";
import Benchmark from "@/components/Benchmark";

export const metadata={
  title:"Benchmark Locagora | Mercado e referências",
  description:"Consulte o benchmark público da Locagora com referências de mercado, reputação e indicadores comparativos.",
};

export default function PublicBenchmarkPage(){
  return <PublicShell><Benchmark/></PublicShell>;
}
