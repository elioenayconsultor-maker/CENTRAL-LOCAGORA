import { NextResponse } from "next/server";

type SgsRow = { data: string; valor: string };
type LiveRate = { annualRate: number; date: string; source: string; sourceUrl: string };

const BCB_API = "https://api.bcb.gov.br/dados/serie/bcdata.sgs";
const BCB_SOURCE = "https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do";

function brDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(date);
}

async function latest(code: number, lookbackDays: number, source: string): Promise<LiveRate | null> {
  const end = new Date();
  const start = new Date(Date.now() - lookbackDays * 86_400_000);
  const url = `${BCB_API}.${code}/dados?formato=json&dataInicial=${encodeURIComponent(brDate(start))}&dataFinal=${encodeURIComponent(brDate(end))}`;
  const response = await fetch(url, { next: { revalidate: 21_600 } });
  if (!response.ok) throw new Error(`BCB_${code}_${response.status}`);
  const rows = (await response.json()) as SgsRow[];
  const last = rows.at(-1);
  if (!last) return null;
  const annualRate = Number(String(last.valor).replace(",", "."));
  if (!Number.isFinite(annualRate)) return null;
  return {
    annualRate,
    date: last.data,
    source,
    sourceUrl: `${BCB_SOURCE}?method=consultarGraficoPorId&hdOidSeriesSelecionadas=${code}`,
  };
}

export async function GET() {
  try {
    const [selic, cdi, ipca12m] = await Promise.all([
      latest(1178, 14, "Banco Central do Brasil • SGS 1178 • Selic anualizada base 252"),
      latest(4389, 14, "Banco Central do Brasil • SGS 4389 • CDI anualizado base 252"),
      latest(13522, 550, "Banco Central do Brasil / IBGE • SGS 13522 • IPCA acumulado em 12 meses"),
    ]);

    return NextResponse.json(
      {
        ok: true,
        selic,
        cdi,
        ipca12m,
        methodology: {
          selic: "Último valor disponível da série diária SGS 1178.",
          cdi: "Último valor disponível da série diária SGS 4389.",
          ipca12m: "Último valor disponível da série mensal SGS 13522; usado apenas como componente inflacionário do IPCA+.",
        },
        updatedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, reason: error instanceof Error ? error.message : "market_rate_error" },
      { status: 502 },
    );
  }
}
