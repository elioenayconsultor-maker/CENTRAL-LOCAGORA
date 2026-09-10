"use client";

import type { CommercialState } from "./types";
import { createClient } from "./supabase/client";

export type CancellationResult =
  | { ok: true; sessionId?: string }
  | { ok: false; reason: string };

export async function cancelCommercialSession(
  state: CommercialState,
  reason: string,
  notes?: string
): Promise<CancellationResult> {
  const sessionId = localStorage.getItem("locagora_commercial_session_id");
  if (!sessionId) return { ok: true };

  const supabase = createClient();
  const closedAt = new Date().toISOString();
  const clientSnapshot = {
    ...state.client,
    commercial_closure: {
      reason,
      notes: String(notes || "").trim() || null,
      closed_at: closedAt,
    },
  };

  const { error: sessionError } = await supabase
    .from("commercial_sessions")
    .update({
      status: "cancelled",
      client: clientSnapshot,
      updated_at: closedAt,
    })
    .eq("id", sessionId);

  if (sessionError) return { ok: false, reason: sessionError.message };

  // Cancela apenas rascunhos. Propostas já geradas permanecem preservadas no histórico.
  const { error: proposalError } = await supabase
    .from("commercial_proposals")
    .update({ status: "cancelled", updated_at: closedAt })
    .eq("session_id", sessionId)
    .eq("status", "draft");

  if (proposalError) return { ok: false, reason: proposalError.message };
  return { ok: true, sessionId };
}
