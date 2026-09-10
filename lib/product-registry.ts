import type { IncomeProfile } from "./types";

export type CanonicalProductId =
  | "locinvest"
  | "euroloc"
  | "locmillion"
  | "locinternacional"
  | "franquia_nacional"
  | "exclusive_internacional"
  | "franquia_internacional_2x1"
  | "mini_master"
  | "master_regional";

export type ProductCalculatorKey =
  | "locinvest"
  | "euroloc"
  | "locinternacional"
  | "franquia-nacional"
  | "franquia-internacional"
  | "mini-master"
  | "master-regional"
  | "locmillion";

export type ProductRegistryEntry = {
  id: CanonicalProductId;
  crmCode: string;
  internalRoute: string;
  primaryPublicSlug: string;
  publicAliases: readonly string[];
  calculatorKey: ProductCalculatorKey | null;
  name: string;
  category: "INVESTIMENTOS BRASIL E INTERNACIONAL" | "FRANQUIAS BRASIL E INTERNACIONAL";
  min: number | null;
  profiles: readonly IncomeProfile[];
  description: string;
};

export const PRODUCT_REGISTRY: readonly ProductRegistryEntry[] = [
  {
    id: "locinvest",
    crmCode: "LOC-LOCINVEST",
    internalRoute: "locinvest",
    primaryPublicSlug: "locinvest",
    publicAliases: ["locinvest"],
    calculatorKey: "locinvest",
    name: "LOCINVEST",
    category: "INVESTIMENTOS BRASIL E INTERNACIONAL",
    min: 30598,
    profiles: ["fixed", "variable", "entrepreneur"],
    description: "Investimento em ativos de mobilidade no Brasil com geração de renda recorrente.",
  },
  {
    id: "euroloc",
    crmCode: "LOC-EUROLOC",
    internalRoute: "euroloc",
    primaryPublicSlug: "euroloc",
    publicAliases: ["euroloc", "locinvest-europa"],
    calculatorKey: "euroloc",
    name: "LOCINVEST EUROPA",
    category: "INVESTIMENTOS BRASIL E INTERNACIONAL",
    min: 31998,
    profiles: ["fixed", "variable", "entrepreneur"],
    description: "Versão internacional do LocInvest para exposição operacional na Europa.",
  },
  {
    id: "locmillion",
    crmCode: "LOC-LOCMILLION",
    internalRoute: "locmillion",
    primaryPublicSlug: "locmillion",
    publicAliases: ["locmillion"],
    calculatorKey: "locmillion",
    name: "LOCMILLION",
    category: "INVESTIMENTOS BRASIL E INTERNACIONAL",
    min: 1000000,
    profiles: ["fixed", "variable", "entrepreneur"],
    description: "Projeto estruturado de maior escala dentro do ecossistema Locagora.",
  },
  {
    id: "locinternacional",
    crmCode: "LOC-LOCINT",
    internalRoute: "locinternacional",
    primaryPublicSlug: "cotas",
    publicAliases: ["cotas", "cotas-internacionais", "internacional", "locinternacional"],
    calculatorKey: "locinternacional",
    name: "COTAS INTERNACIONAIS",
    category: "INVESTIMENTOS BRASIL E INTERNACIONAL",
    min: 100000,
    profiles: ["fixed", "variable", "entrepreneur"],
    description: "Participação por cotas em estruturas internacionais da Locagora.",
  },
  {
    id: "franquia_nacional",
    crmCode: "LOC-FRANQ-N",
    internalRoute: "franq-n",
    primaryPublicSlug: "exclusive",
    publicAliases: ["exclusive", "exclusive-brasil", "franq-n"],
    calculatorKey: "franquia-nacional",
    name: "EXCLUSIVE BRASIL",
    category: "FRANQUIAS BRASIL E INTERNACIONAL",
    min: 91634,
    profiles: ["variable", "entrepreneur"],
    description: "Franquia Exclusive para operação nacional com ativos de mobilidade.",
  },
  {
    id: "exclusive_internacional",
    crmCode: "LOC-EXCLUSIVE-INT",
    internalRoute: "franq-intl",
    primaryPublicSlug: "franquia-internacional",
    publicAliases: ["franquia-internacional", "exclusive-internacional"],
    calculatorKey: null,
    name: "EXCLUSIVE INTERNACIONAL",
    category: "FRANQUIAS BRASIL E INTERNACIONAL",
    min: null,
    profiles: ["variable", "entrepreneur"],
    description: "Franquia Exclusive para implantação e operação em mercado internacional, com simulação personalizada.",
  },
  {
    id: "franquia_internacional_2x1",
    crmCode: "LOC-FRANQ-I-2X1",
    internalRoute: "franq-i",
    primaryPublicSlug: "franquia-2x1",
    publicAliases: ["franquia-2x1", "exclusive-2x1", "franq-i"],
    calculatorKey: "franquia-internacional",
    name: "EXCLUSIVE 2X1",
    category: "FRANQUIAS BRASIL E INTERNACIONAL",
    min: 307982,
    profiles: ["variable", "entrepreneur"],
    description: "Estrutura combinada Brasil + Europa em uma única jornada comercial.",
  },
  {
    id: "mini_master",
    crmCode: "LOC-MINI-MASTER",
    internalRoute: "mini",
    primaryPublicSlug: "mini-master",
    publicAliases: ["mini-master", "mini"],
    calculatorKey: "mini-master",
    name: "MINI-MASTER",
    category: "FRANQUIAS BRASIL E INTERNACIONAL",
    min: 380000,
    profiles: ["variable", "entrepreneur"],
    description: "Modelo de expansão territorial em escala intermediária.",
  },
  {
    id: "master_regional",
    crmCode: "LOC-MASTER-REGIONAL",
    internalRoute: "master",
    primaryPublicSlug: "master",
    publicAliases: ["master", "master-regional"],
    calculatorKey: "master-regional",
    name: "MASTER",
    category: "FRANQUIAS BRASIL E INTERNACIONAL",
    min: 928000,
    profiles: ["variable", "entrepreneur"],
    description: "Estrutura Master para expansão, desenvolvimento e suporte territorial da rede.",
  },
] as const;

const byId = new Map(PRODUCT_REGISTRY.map((product) => [product.id, product]));
const byInternalRoute = new Map(PRODUCT_REGISTRY.map((product) => [product.internalRoute, product]));
const byCrmCode = new Map(PRODUCT_REGISTRY.map((product) => [product.crmCode, product]));
const byPublicSlug = new Map<string, ProductRegistryEntry>();
for (const product of PRODUCT_REGISTRY) {
  for (const slug of product.publicAliases) byPublicSlug.set(slug, product);
}

export function getProductById(id: string | null | undefined) {
  return id ? byId.get(id as CanonicalProductId) ?? null : null;
}

export function getProductByInternalRoute(route: string | null | undefined) {
  return route ? byInternalRoute.get(route) ?? null : null;
}

export function getProductByPublicSlug(slug: string | null | undefined) {
  return slug ? byPublicSlug.get(slug) ?? null : null;
}

export function getProductByCrmCode(code: string | null | undefined) {
  return code ? byCrmCode.get(code) ?? null : null;
}

export function resolveProductIdentity(value: string | null | undefined) {
  if (!value) return null;
  return getProductById(value) ?? getProductByInternalRoute(value) ?? getProductByPublicSlug(value) ?? getProductByCrmCode(value);
}

export function getCalculatorKeyForPublicSlug(slug: string | null | undefined) {
  return getProductByPublicSlug(slug)?.calculatorKey ?? null;
}

export function canonicalProductMetadata(value: string | null | undefined) {
  const product = resolveProductIdentity(value);
  if (!product) return null;
  return {
    id: product.id,
    crmCode: product.crmCode,
    internalRoute: product.internalRoute,
    publicSlug: product.primaryPublicSlug,
    name: product.name,
  } as const;
}
