export const COMMERCIAL_ROLES = ["admin","gestor","closer","visualizacao"] as const;
export type CommercialRole = (typeof COMMERCIAL_ROLES)[number];
export type Permission =
  | "dashboard.read" | "crm.read" | "crm.write" | "simulation.read" | "simulation.write"
  | "materials.read" | "tasks.read" | "tasks.write" | "premises.read" | "premises.review"
  | "premises.publish" | "users.manage" | "audit.read";

const matrix: Record<CommercialRole, ReadonlySet<Permission>> = {
  admin: new Set(["dashboard.read","crm.read","crm.write","simulation.read","simulation.write","materials.read","tasks.read","tasks.write","premises.read","premises.review","premises.publish","users.manage","audit.read"]),
  gestor: new Set(["dashboard.read","crm.read","crm.write","simulation.read","simulation.write","materials.read","tasks.read","tasks.write","premises.read","premises.review","premises.publish","audit.read"]),
  closer: new Set(["dashboard.read","crm.read","crm.write","simulation.read","simulation.write","materials.read","tasks.read","tasks.write","premises.read"]),
  visualizacao: new Set(["dashboard.read","crm.read","simulation.read","materials.read","premises.read"]),
};

export function isCommercialRole(value: unknown): value is CommercialRole {
  return typeof value === "string" && (COMMERCIAL_ROLES as readonly string[]).includes(value);
}
export function can(role: CommercialRole, permission: Permission) { return matrix[role].has(permission); }
