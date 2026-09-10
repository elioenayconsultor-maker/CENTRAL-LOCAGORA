import { createClient } from "./supabase/client";

export const CORPORATE_DOMAIN = "locgrupo.com.br";
export const DEFAULT_ACTIVATION_PASSWORD = "locagora@@";

export type CorporateAccessStatus =
  | "active"
  | "profile_missing"
  | "inactive"
  | "already_linked"
  | "invalid_domain"
  | "not_authenticated"
  | "error";

export type CorporateAccessResult = {
  status: CorporateAccessStatus;
  appUserId?: string | null;
  role?: string | null;
  name?: string | null;
  message?: string;
};

export function normalizeCorporateEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isCorporateEmail(value: string) {
  return normalizeCorporateEmail(value).endsWith(`@${CORPORATE_DOMAIN}`);
}

export async function activateCorporateAccess(): Promise<CorporateAccessResult> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("activate_corporate_access");
  if (error) return { status: "error", message: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { status: "error", message: "Resposta de ativação vazia." };
  return {
    status: row.status as CorporateAccessStatus,
    appUserId: row.app_user_id,
    role: row.app_role,
    name: row.app_name,
  };
}
