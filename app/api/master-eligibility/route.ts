import { NextRequest, NextResponse } from "next/server";
import { NETWORK_POINTS } from "@/lib/network";

type Municipality = {
  id: number;
  nome: string;
  microrregiao?: { mesorregiao?: { UF?: { sigla?: string; nome?: string } } };
  "regiao-imediata"?: { "regiao-intermediaria"?: { UF?: { sigla?: string; nome?: string } } };
};

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const ufOf = (m: Municipality) =>
  m.microrregiao?.mesorregiao?.UF?.sigla ||
  m["regiao-imediata"]?.["regiao-intermediaria"]?.UF?.sigla ||
  "";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const r = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getMunicipalities(): Promise<Municipality[]> {
  const res = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios", {
    next: { revalidate: 86400 },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("IBGE localities unavailable");
  return res.json();
}

async function getPopulation(municipalityId: number) {
  const url = `https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/-1/variaveis/9324?localidades=N6[${municipalityId}]`;
  const res = await fetch(url, {
    next: { revalidate: 86400 },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("IBGE population unavailable");
  const data = await res.json();
  const serie = data?.[0]?.resultados?.[0]?.series?.[0]?.serie || {};
  const value = Number(Object.values(serie)[0]);
  if (!Number.isFinite(value)) throw new Error("Population not found");
  return value;
}

async function geocode(city: string, uf: string) {
  const params = new URLSearchParams({
    q: `${city}, ${uf}, Brasil`,
    format: "jsonv2",
    limit: "1",
    countrycodes: "br",
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    next: { revalidate: 604800 },
    headers: {
      Accept: "application/json",
      "User-Agent": "CentralLocagora/1.0 (territory eligibility)",
    },
  });
  if (!res.ok) throw new Error("Geocoding unavailable");
  const data = await res.json();
  const lat = Number(data?.[0]?.lat);
  const lng = Number(data?.[0]?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error("Coordinates not found");
  return { lat, lng };
}

export async function GET(req: NextRequest) {
  const raw = (req.nextUrl.searchParams.get("city") || "").trim();
  if (raw.length < 2 || raw.length > 100) {
    return NextResponse.json({ error: "Informe uma cidade válida." }, { status: 400 });
  }

  try {
    const municipalities = await getMunicipalities();
    const cleaned = raw.replace(/\s+-\s+/g, ",");
    const [cityPart, statePart] = cleaned.split(",").map((v) => v.trim());
    const wantedCity = normalize(cityPart);
    const wantedUf = normalize(statePart || "");

    let matches = municipalities.filter((m) => normalize(m.nome) === wantedCity);
    if (wantedUf) {
      matches = matches.filter((m) => normalize(ufOf(m)) === wantedUf);
    }

    if (!matches.length) {
      const suggestions = municipalities
        .filter((m) => normalize(m.nome).includes(wantedCity))
        .slice(0, 8)
        .map((m) => ({ city: m.nome, state: ufOf(m) }));
      return NextResponse.json(
        { error: "Cidade não localizada no cadastro do IBGE.", suggestions },
        { status: 404 },
      );
    }

    if (matches.length > 1) {
      return NextResponse.json(
        {
          error: "Há mais de uma cidade com esse nome. Informe também a UF.",
          suggestions: matches.map((m) => ({ city: m.nome, state: ufOf(m) })),
        },
        { status: 409 },
      );
    }

    const municipality = matches[0];
    const state = ufOf(municipality);
    const [population, coords] = await Promise.all([
      getPopulation(municipality.id),
      geocode(municipality.nome, state),
    ]);

    const masters = NETWORK_POINTS.filter(
      (p) => p.country === "Brasil" && p.type === "master" && Number.isFinite(p.lat) && Number.isFinite(p.lng),
    );

    const distances = masters
      .map((master) => ({
        master,
        distanceKm: haversineKm(coords.lat, coords.lng, master.lat, master.lng),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const nearest = distances[0] || null;
    const hasMasterInCity = masters.some(
      (m) => normalize(m.city) === normalize(municipality.nome) && normalize(m.state) === normalize(state),
    );

    let eligibility: "eligible" | "ineligible" | "review" = "ineligible";
    let reason = "";

    if (hasMasterInCity) {
      eligibility = "ineligible";
      reason = "A cidade já possui uma Master Locagora cadastrada.";
    } else if (population <= 200000) {
      eligibility = "ineligible";
      reason = "A população estimada não ultrapassa 200 mil habitantes.";
    } else if (nearest && nearest.distanceKm < 50) {
      eligibility = "ineligible";
      reason = `Existe uma Master a aproximadamente ${nearest.distanceKm.toFixed(0)} km, dentro do raio de 50 km.`;
    } else if (nearest && nearest.distanceKm < 60) {
      eligibility = "review";
      reason = `A Master mais próxima está a aproximadamente ${nearest.distanceKm.toFixed(0)} km. Como a distância está entre 50 e 60 km, a praça precisa de validação territorial.`;
    } else {
      eligibility = "eligible";
      reason = "A cidade supera 200 mil habitantes e não há Master Locagora em um raio de 60 km.";
    }

    return NextResponse.json({
      city: municipality.nome,
      state,
      municipalityId: municipality.id,
      population,
      coordinates: coords,
      eligibility,
      reason,
      nearestMaster: nearest
        ? {
            name: nearest.master.name,
            city: nearest.master.city,
            state: nearest.master.state,
            distanceKm: Math.round(nearest.distanceKm * 10) / 10,
          }
        : null,
      rules: {
        minimumPopulationExclusive: 200000,
        eligibleMasterRadiusKm: 60,
        ineligibleMasterRadiusKm: 50,
        reviewBandKm: [50, 60],
      },
      populationSource: "IBGE - estimativa populacional mais recente disponível na API",
      distanceMethod: "distância geodésica aproximada entre o centro do município e a Master cadastrada",
    });
  } catch (error) {
    console.error("master-eligibility", error);
    return NextResponse.json(
      { error: "Não foi possível avaliar esta cidade agora. Tente novamente em instantes." },
      { status: 503 },
    );
  }
}
