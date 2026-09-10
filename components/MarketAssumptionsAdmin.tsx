"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, History, RefreshCw, Save, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./MarketAssumptionsAdmin.module.css";

type Row = {
  id: string;
  assumption_key: string;
  label: string;
  value: number | null;
  value_unit: string;
  source_name: string | null;
  reference_date: string | null;
  updated_at: string;
  metadata: Record<string, unknown>;
};

type Draft = { value: string; source_name: string; reference_date: string };

type AuditRow = {
  id: string;
  assumption_key: string;
  old_value: number | null;
  new_value: number | null;
  old_source_name: string | null;
  new_source_name: string | null;
  changed_at: string;
};

const ADMIN_KEYS = [
  "IPCA_PLUS_REAL",
  "FII_DY",
  "FII_APPRECIATION",
  "PROPERTY_RENT_YIELD",
  "PROPERTY_APPRECIATION",
  "FRANCHISES_SOLD",
];

const OFFICIAL_KEYS = ["CDI", "SELIC", "IPCA"];

const fmt = (value: number | null, unit: string) => {
  if (value == null) return "N/D";
  if (unit === "number") return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value);
  return `${Number(value).toFixed(2).replace(".", ",")}% a.a.`;
};

export default function MarketAssumptionsAdmin() {
  const supabase = useMemo(() => createClient(), []);
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    setStatus("");
    try {
      const { data: isAdmin, error: adminError } = await supabase.rpc("is_commercial_admin");
      if (adminError) throw adminError;
      setAllowed(Boolean(isAdmin));
      if (!isAdmin) return;

      const { data, error } = await supabase
        .from("commercial_market_assumptions")
        .select("id,assumption_key,label,value,value_unit,source_name,reference_date,updated_at,metadata")
        .order("assumption_key");
      if (error) throw error;
      const loaded = (data || []) as Row[];
      setRows(loaded);
      setDrafts(Object.fromEntries(loaded.map(row => [row.assumption_key, {
        value: row.value == null ? "" : String(row.value),
        source_name: row.source_name || "",
        reference_date: row.reference_date || "",
      }])));

      const { data: auditData } = await supabase
        .from("commercial_market_assumption_audit")
        .select("id,assumption_key,old_value,new_value,old_source_name,new_source_name,changed_at")
        .order("changed_at", { ascending: false })
        .limit(20);
      setAudit((auditData || []) as AuditRow[]);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Não foi possível carregar as premissas.");
    } finally {
      setChecked(true);
    }
  }

  useEffect(() => { void load(); }, []);

  function patch(key: string, field: keyof Draft, value: string) {
    setDrafts(prev => ({ ...prev, [key]: { ...(prev[key] || { value: "", source_name: "", reference_date: "" }), [field]: value } }));
  }

  async function save(row: Row) {
    const draft = drafts[row.assumption_key];
    if (!draft) return;
    if (!draft.source_name.trim()) {
      setStatus("Informe a fonte da premissa antes de publicar.");
      return;
    }
    if (!draft.reference_date) {
      setStatus("Informe a data de referência antes de publicar.");
      return;
    }
    if (draft.value.trim() === "") {
      setStatus("Informe o valor da premissa. Para remover um valor publicado, use uma alteração administrativa específica.");
      return;
    }
    const numeric = Number(draft.value.replace(",", "."));
    if (!Number.isFinite(numeric) || numeric < 0) {
      setStatus("Informe um valor numérico válido, maior ou igual a zero.");
      return;
    }

    const currentText = `${fmt(row.value, row.value_unit)} • ${row.source_name || "sem fonte"} • ${row.reference_date || "sem data"}`;
    const nextText = `${fmt(numeric, row.value_unit)} • ${draft.source_name.trim()} • ${draft.reference_date}`;
    if (!window.confirm(`Publicar alteração?\n\nAtual: ${currentText}\nNovo: ${nextText}\n\nA mudança valerá para novas comparações. Propostas já congeladas não devem ser recalculadas.`)) return;

    setSaving(row.assumption_key);
    setStatus("Publicando premissa administrativa...");
    try {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("commercial_market_assumptions")
        .update({
          value: numeric,
          source_name: draft.source_name.trim(),
          reference_date: draft.reference_date,
          updated_by: auth.user?.id || null,
          metadata: { ...(row.metadata || {}), governance: "admin", last_published_at: new Date().toISOString() },
        })
        .eq("id", row.id);
      if (error) throw error;
      setStatus(`${row.label} publicada com sucesso. A alteração foi registrada na trilha de auditoria.`);
      await load();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Não foi possível publicar a premissa.");
    } finally {
      setSaving(null);
    }
  }

  if (!checked) return <main className={styles.screen}><div className={styles.loading}>Validando acesso administrativo...</div></main>;
  if (!allowed) return <main className={styles.screen}><section className={styles.denied}><ShieldCheck/><h1>Acesso administrativo necessário</h1><p>Somente administradores autorizados podem publicar premissas de mercado.</p><Link href="/admin">Voltar ao Admin</Link></section></main>;

  const official = rows.filter(row => OFFICIAL_KEYS.includes(row.assumption_key));
  const managed = rows.filter(row => ADMIN_KEYS.includes(row.assumption_key));

  return <main className={styles.screen}>
    <header className={styles.header}>
      <div><Link href="/admin"><ArrowLeft size={16}/> Voltar ao Admin</Link><small>V9.3.5 • GOVERNANÇA FINANCEIRA</small><h1>Premissas de Mercado</h1><p>Referências oficiais são somente leitura. Premissas administrativas exigem valor, fonte e data e geram auditoria automática.</p></div>
      <button className={styles.refresh} onClick={() => void load()}><RefreshCw size={16}/> Recarregar</button>
    </header>

    {status && <div className={styles.status}><CheckCircle2 size={18}/>{status}</div>}

    <section className={styles.section}>
      <div className={styles.sectionHead}><small>FONTES OFICIAIS</small><h2>Referências automáticas</h2><p>CDI, Selic e IPCA são atualizados pela integração oficial e não são publicados manualmente nesta tela.</p></div>
      <div className={styles.officialGrid}>{official.map(row => <article key={row.id} className={styles.officialCard}><span>{row.assumption_key}</span><b>{row.label}</b><strong>{fmt(row.value, row.value_unit)}</strong><small>{row.source_name || "Fonte automática"}{row.reference_date ? ` • ${new Date(`${row.reference_date}T12:00:00`).toLocaleDateString("pt-BR")}` : ""}</small></article>)}</div>
    </section>

    <section className={styles.section}>
      <div className={styles.sectionHead}><small>PREMISSAS ADM</small><h2>Publicação controlada</h2><p>Valores ausentes permanecem como N/D no comparador. Nenhuma premissa é estimada automaticamente.</p></div>
      <div className={styles.cards}>{managed.map(row => { const draft = drafts[row.assumption_key] || { value:"",source_name:"",reference_date:"" }; return <article key={row.id} className={styles.card}>
        <div className={styles.cardTitle}><div><span>{row.assumption_key}</span><h3>{row.label}</h3></div><div className={styles.current}><small>Publicado</small><b>{fmt(row.value, row.value_unit)}</b></div></div>
        <div className={styles.formGrid}>
          <label><span>{row.value_unit === "number" ? "Valor" : "Taxa (% a.a.)"}</span><input type="text" inputMode="decimal" value={draft.value} onChange={e => patch(row.assumption_key,"value",e.target.value)}/></label>
          <label><span>Fonte</span><input value={draft.source_name} placeholder="Ex.: relatório interno / fonte de mercado" onChange={e => patch(row.assumption_key,"source_name",e.target.value)}/></label>
          <label><span>Data de referência</span><input type="date" value={draft.reference_date} onChange={e => patch(row.assumption_key,"reference_date",e.target.value)}/></label>
        </div>
        <div className={styles.meta}>Última atualização: {new Date(row.updated_at).toLocaleString("pt-BR")}</div>
        <button className={styles.save} disabled={saving === row.assumption_key} onClick={() => void save(row)}><Save size={16}/>{saving === row.assumption_key ? "Publicando..." : "Revisar e publicar"}</button>
      </article>})}</div>
    </section>

    <section className={styles.section}>
      <div className={styles.sectionHead}><small>AUDITORIA</small><h2><History size={20}/> Alterações recentes</h2><p>Histórico das últimas publicações registradas no banco.</p></div>
      <div className={styles.audit}>{audit.length ? audit.map(item => <div key={item.id}><b>{item.assumption_key}</b><span>{item.old_value == null ? "N/D" : item.old_value} → {item.new_value == null ? "N/D" : item.new_value}</span><small>{item.new_source_name || item.old_source_name || "Sem fonte"} • {new Date(item.changed_at).toLocaleString("pt-BR")}</small></div>) : <p>Nenhuma alteração administrativa registrada ainda.</p>}</div>
    </section>
  </main>;
}
