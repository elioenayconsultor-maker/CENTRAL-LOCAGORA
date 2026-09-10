import { IncomeProfile, Product } from "./types";
import { PRODUCT_REGISTRY } from "./product-registry";

// Compatibility adapter for the corporate simulation portfolio.
// Products without a published minimum/calculator remain in the canonical/public
// catalog, but are handled as assisted commercial simulations instead of being
// exposed as a zero-value investment card in the legacy corporate selector.
export const PRODUCTS: Product[] = PRODUCT_REGISTRY
  .filter((product) => product.min !== null && product.calculatorKey !== null)
  .map((product) => ({
    route: product.internalRoute,
    name: product.name,
    category: product.category,
    min: product.min as number,
    profiles: [...product.profiles],
    description: product.description,
  }));

export function normalizeIncomeProfile(value: string): IncomeProfile {
  const v = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (v.includes("fixa")) return "fixed";
  if (v.includes("empres") || v.includes("empreendedor")) return "entrepreneur";
  return "variable";
}

export function eligibleProducts(capital: number, income: string) {
  const profile = normalizeIncomeProfile(income);
  return PRODUCTS
    .filter((product) => product.profiles.includes(profile))
    .map((product) => ({
      ...product,
      eligible: capital >= product.min,
      missing: Math.max(0, product.min - capital),
    }));
}
