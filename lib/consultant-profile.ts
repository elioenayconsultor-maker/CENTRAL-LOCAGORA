"use client";

import { createClient } from "@/lib/supabase/client";

export type ConsultantProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarPath: string | null;
  avatarUrl: string | null;
  completed: boolean;
};

export async function getAuthenticatedCorporateEmail(): Promise<string> {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return String(user?.email || "").trim().toLowerCase();
}

export async function getMyConsultantProfile(): Promise<ConsultantProfile | null> {
  const supabase = createClient();
  const [{ data, error }, { data: authData, error: authError }] = await Promise.all([
    supabase.rpc("get_my_commercial_profile"),
    supabase.auth.getUser(),
  ]);
  if (error) throw error;
  if (authError) throw authError;
  const authEmail = String(authData.user?.email || "").trim().toLowerCase();
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  let avatarUrl: string | null = null;
  if (row.avatar_path) {
    const { data: signed } = await supabase.storage.from("commercial-user-avatars").createSignedUrl(String(row.avatar_path), 60 * 60 * 8);
    avatarUrl = signed?.signedUrl || null;
  }
  return {
    id: String(row.id),
    name: String(row.name || ""),
    // O login autenticado é a fonte de verdade do e-mail corporativo.
    email: authEmail || String(row.email || ""),
    phone: String(row.phone || ""),
    avatarPath: row.avatar_path ? String(row.avatar_path) : null,
    avatarUrl,
    completed: Boolean(row.profile_completed),
  };
}

export async function saveMyConsultantProfile(input: { name: string; phone: string; avatarPath?: string | null; }) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("complete_my_commercial_profile", {
    p_name: input.name.trim(),
    p_phone: input.phone.trim(),
    p_avatar_path: input.avatarPath ?? null,
  });
  if (error) throw error;
  return data;
}

export async function uploadMyConsultantAvatar(file: File): Promise<string> {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError || new Error("not_authenticated");
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) throw new Error("Formato de foto não suportado.");
  if (file.size > 2_000_000) throw new Error("A foto deve ter no máximo 2 MB.");
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${user.id}/profile-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("commercial-user-avatars").upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
  if (error) {
    if (/bucket not found/i.test(error.message || "")) {
      throw new Error("Armazenamento de fotos ainda não foi ativado. Aplique a migration V9.2.5 no Supabase.");
    }
    throw error;
  }
  return path;
}
