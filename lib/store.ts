"use client";

import { useEffect, useMemo, useState } from "react";
import type { CommercialState } from "./types";

const KEY = "locagora_commercial_state_v2";

export const defaultState: CommercialState = {
  version: 2,
  step: "client",
  client: {
    name: "",
    phone: "",
    capital: 0,
    goal: "Renda mensal",
    income: "Renda variável",
    priority: "Rentabilidade",
    notes: "",
  },
  selectedProductRoute: "",
  activeSimulationId: null,
  simulations: [],
  proposal: {
    title: "Proposta Locagora",
    date: new Date().toISOString().slice(0, 10),
    validityDays: 7,
    orientation: "landscape",
    extraInfo: "",
    consultant: "",
    consultantPhone: "",
    consultantEmail: "",
  },
};

export function useCommercialState() {
  const [state, setState] = useState<CommercialState>(defaultState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);

      if (raw) {
        // Hidratação inicial intencional a partir de armazenamento externo.
        setState({
          ...defaultState,
          ...JSON.parse(raw),
        });
      } else {
        const legacyClient = JSON.parse(
          localStorage.getItem("locagoraJourneyClient") || "null"
        );

        const legacySims = JSON.parse(
          localStorage.getItem("locinvest_simulations") || "[]"
        );

        const active =
          Number(
            localStorage.getItem("locagora_active_proposal_sim") || 0
          ) || null;

        // Migração única de dados legados durante a hidratação.
         
        setState((current) => ({
          ...current,
          client: legacyClient
            ? { ...current.client, ...legacyClient }
            : current.client,
          simulations: Array.isArray(legacySims) ? legacySims : [],
          activeSimulationId: active,
        }));
      }
    } catch {
      // Mantém defaultState se os dados persistidos forem inválidos.
    }

    // A flag ready faz parte do protocolo de hidratação deste hook.
     
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    localStorage.setItem(KEY, JSON.stringify(state));
    localStorage.setItem(
      "locagoraJourneyClient",
      JSON.stringify(state.client)
    );
    localStorage.setItem(
      "locinvest_simulations",
      JSON.stringify(state.simulations)
    );

    if (state.activeSimulationId) {
      localStorage.setItem(
        "locagora_active_proposal_sim",
        String(state.activeSimulationId)
      );
    }
  }, [state, ready]);

  const activeSimulation = useMemo(
    () =>
      state.simulations.find(
        (simulation) => simulation.id === state.activeSimulationId
      ) ??
      state.simulations.at(-1) ??
      null,
    [state.simulations, state.activeSimulationId]
  );

  return {
    state,
    setState,
    ready,
    activeSimulation,
  };
}