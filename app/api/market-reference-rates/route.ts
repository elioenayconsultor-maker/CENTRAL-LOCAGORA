import { NextResponse } from "next/server";
import { inflateSync } from "node:zlib";

type SgsRow = { data: string; valor: string };
type LiveRate = { annualRate: number; date: string; source: string; sourceUrl: string };
type CkanPackage = { success?: boolean; result?: { resources?: Array<{ format?: string; url?: string }> } };

const BCB_API = "https://api.bcb.gov.br/dados/serie/bcdata.sgs";
const BCB_SOURCE = "https://www3.bcb.gov.br/sgspub/consultarvalores/consultarValoresSeries.do";
const TESOURO_PACKAGE = "https://www.tesourotransparente.gov.br/ckan/api/3/action/package_show?id=taxas-dos-titulos-ofertados-pelo-tesouro-direto";
const TESOURO_SOURCE = "https://www.tesourotransparente.gov.br/ckan/dataset/taxas-dos-titulos-ofertados-pelo-tesouro-direto";
const BRAPI_IFIX = "https://brapi.dev/api/quote/IFIX.SA?range=1y&interval=1d";
const B3_IFIX = "https://www.b3.com.br/pt_br/market-data-e-indices/indices/indices-de-segmentos-e-setoriais/indice-de-fundos-de-investimentos-imobiliarios-ifix-b3.htm";
const FIPEZAP_SOURCE = "https://www.fipe.org.br/pt-br/indices/fipezap";

function brDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(date);
}

function isoDate(value: string) {
  const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : value;
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
  return { annualRate, date: last.data, source, sourceUrl: `${BCB_SOURCE}?method=consultarGraficoPorId&hdOidSeriesSelecionadas=${code}` };
}

function parseCsvLine(line: string, separator = ";") {
  const out: string[] = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { value += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === separator && !quoted) { out.push(value.trim()); value = ""; }
    else value += char;
  }
  out.push(value.trim());
  return out;
}

function numericBr(value: string | undefined) {
  if (!value) return null;
  const n = Number(value.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

async function latestTesouroIpcaReal(): Promise<LiveRate | null> {
  try {
    const pkgResponse = await fetch(TESOURO_PACKAGE, { next: { revalidate: 21_600 } });
    if (!pkgResponse.ok) return null;
    const pkg = (await pkgResponse.json()) as CkanPackage;
    const csvUrl = pkg.result?.resources?.find(r => String(r.format || "").toUpperCase() === "CSV")?.url;
    if (!csvUrl) return null;
    const csvResponse = await fetch(csvUrl, { next: { revalidate: 21_600 } });
    if (!csvResponse.ok) return null;
    const text = await csvResponse.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return null;
    const headers = parseCsvLine(lines[0]).map(x => x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    const idxType = headers.findIndex(h => h.includes("tipo") && h.includes("titulo"));
    const idxBase = headers.findIndex(h => h.includes("data base"));
    const idxMaturity = headers.findIndex(h => h.includes("vencimento"));
    const idxRate = headers.findIndex(h => h.includes("taxa compra"));
    if ([idxType, idxBase, idxRate].some(i => i < 0)) return null;

    const now = Date.now();
    const candidates = lines.slice(1).map(line => parseCsvLine(line)).map(cols => ({
      type: cols[idxType] || "",
      base: cols[idxBase] || "",
      maturity: idxMaturity >= 0 ? cols[idxMaturity] || "" : "",
      rate: numericBr(cols[idxRate]),
    })).filter(r => /tesouro\s+ipca\+/i.test(r.type) && !/juros\s+semestrais/i.test(r.type) && r.rate != null);
    if (!candidates.length) return null;

    const latestBase = candidates.map(r => isoDate(r.base)).sort().at(-1);
    const sameDay = candidates.filter(r => isoDate(r.base) === latestBase);
    sameDay.sort((a, b) => {
      const da = Date.parse(isoDate(a.maturity)) || Number.MAX_SAFE_INTEGER;
      const db = Date.parse(isoDate(b.maturity)) || Number.MAX_SAFE_INTEGER;
      const aa = da > now ? da : Number.MAX_SAFE_INTEGER;
      const bb = db > now ? db : Number.MAX_SAFE_INTEGER;
      return aa - bb;
    });
    const chosen = sameDay[0] || candidates[0];
    return {
      annualRate: Number(chosen.rate),
      date: chosen.base,
      source: `Tesouro Nacional • Tesouro Direto • ${chosen.type}${chosen.maturity ? ` • venc. ${chosen.maturity}` : ""} • taxa real de compra`,
      sourceUrl: TESOURO_SOURCE,
    };
  } catch { return null; }
}

async function latestIfix12m(): Promise<LiveRate | null> {
  try {
    const response = await fetch(BRAPI_IFIX, { next: { revalidate: 21_600 } });
    if (!response.ok) return null;
    const json = await response.json() as any;
    const result = json?.results?.[0];
    const history = Array.isArray(result?.historicalDataPrice) ? result.historicalDataPrice : [];
    const closes = history.map((x: any) => ({ close: Number(x?.close), date: Number(x?.date) })).filter((x: any) => Number.isFinite(x.close) && x.close > 0);
    if (closes.length < 2) return null;
    const first = closes[0];
    const last = closes.at(-1);
    if (!last) return null;
    const annualRate = ((last.close / first.close) - 1) * 100;
    if (!Number.isFinite(annualRate)) return null;
    return {
      annualRate,
      date: new Date(last.date * 1000).toISOString().slice(0, 10),
      source: "IFIX • retorno total acumulado em 12 meses • índice de FIIs da B3 (série via brapi)",
      sourceUrl: B3_IFIX,
    };
  } catch { return null; }
}

function decodePdfStrings(buffer: Buffer) {
  const latin = buffer.toString("latin1");
  const chunks: string[] = [];
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match: RegExpExecArray | null;
  while ((match = streamRegex.exec(latin))) {
    const raw = Buffer.from(match[1], "latin1");
    let decoded: Buffer | null = raw;
    const prefix = latin.slice(Math.max(0, match.index - 300), match.index);
    if (/\/FlateDecode/.test(prefix)) {
      try { decoded = inflateSync(raw); } catch { decoded = null; }
    }
    if (!decoded) continue;
    const text = decoded.toString("latin1");
    for (const m of text.matchAll(/\(([^()]*)\)\s*Tj/g)) chunks.push(m[1]);
    for (const m of text.matchAll(/\[([\s\S]*?)\]\s*TJ/g)) {
      for (const s of m[1].matchAll(/\(([^()]*)\)/g)) chunks.push(s[1]);
    }
  }
  return chunks.join(" ").replace(/\\[nrtbf]/g, " ").replace(/\\([()\\])/g, "$1").replace(/\s+/g, " ");
}

async function latestFipeZapRentalYield(): Promise<LiveRate | null> {
  const now = new Date();
  for (let back = 1; back <= 6; back += 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1));
    const ym = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const urls = [
      `https://downloads.fipe.org.br/indices/fipezap/fipezap-${ym}-residencial-locacao-pub.pdf`,
      `https://downloads.fipe.org.br/indices/fipezap/fipezap-${ym}-residencial-locacao.pdf`,
    ];
    for (const url of urls) {
      try {
        const response = await fetch(url, { next: { revalidate: 86_400 } });
        if (!response.ok) continue;
        const text = decodePdfStrings(Buffer.from(await response.arrayBuffer()));
        const anchor = text.toLowerCase().indexOf("rentabilidade do aluguel");
        const scope = anchor >= 0 ? text.slice(anchor, anchor + 2500) : text;
        const patterns = [
          /retorno\s+m[eé]dio[^%]{0,180}?(\d{1,2}[,.]\d{1,2})\s*%\s*(?:ao\s+ano|a\.a\.)/i,
          /rental\s+yield[^%]{0,250}?(\d{1,2}[,.]\d{1,2})\s*%\s*(?:ao\s+ano|a\.a\.)/i,
          /(\d{1,2}[,.]\d{1,2})\s*%\s*a\.a\./i,
        ];
        for (const pattern of patterns) {
          const m = scope.match(pattern);
          if (!m) continue;
          const annualRate = Number(m[1].replace(",", "."));
          if (!Number.isFinite(annualRate) || annualRate <= 0 || annualRate > 30) continue;
          return {
            annualRate,
            date: `${ym.slice(0, 4)}-${ym.slice(4, 6)}-01`,
            source: "Índice FipeZAP • rental yield residencial médio anualizado",
            sourceUrl: FIPEZAP_SOURCE,
          };
        }
      } catch { /* tenta o próximo arquivo */ }
    }
  }
  return null;
}

export async function GET() {
  try {
    const [selic, cdi, ipca12m, ipcaPlusReal, fii12m, propertyRentalYield] = await Promise.all([
      latest(1178, 14, "Banco Central do Brasil • SGS 1178 • Selic anualizada base 252"),
      latest(4389, 14, "Banco Central do Brasil • SGS 4389 • CDI anualizado base 252"),
      latest(13522, 550, "Banco Central do Brasil / IBGE • SGS 13522 • IPCA acumulado em 12 meses"),
      latestTesouroIpcaReal(),
      latestIfix12m(),
      latestFipeZapRentalYield(),
    ]);

    return NextResponse.json({
      ok: true,
      selic,
      cdi,
      ipca12m,
      ipcaPlusReal,
      fii12m,
      propertyRentalYield,
      methodology: {
        selic: "Último valor disponível da série diária SGS 1178.",
        cdi: "Último valor disponível da série diária SGS 4389.",
        ipca12m: "Último valor disponível da série mensal SGS 13522.",
        ipcaPlusReal: "Taxa real de compra do Tesouro IPCA+ sem juros semestrais, usando o título disponível de vencimento mais próximo.",
        fii12m: "Retorno total do IFIX acumulado em aproximadamente 12 meses; não é dividend yield isolado.",
        propertyRentalYield: "Rental yield residencial médio anualizado do último informe FipeZAP disponível.",
      },
      updatedAt: new Date().toISOString(),
    }, { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } });
  } catch (error) {
    return NextResponse.json({ ok: false, reason: error instanceof Error ? error.message : "market_rate_error" }, { status: 502 });
  }
}
