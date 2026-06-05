// pages/modules/KeepContact.jsx — Sprint 10 — Redesign blanc épuré
import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import Sidebar, { sidebarWidth } from "../components/Sidebar";
// ═══════════════════════════════════════════════════════════════
// DESIGN SYSTEM — Blanc sobre, accents noir/rouge
// ═══════════════════════════════════════════════════════════════
const KC_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;900&display=swap');

  :root {
    --kc-bg: #f8f8f7;
    --kc-surface: #ffffff;
    --kc-surface-2: #f2f2f0;
    --kc-border: #e6e6e3;
    --kc-border-2: #d0d0cc;
    --kc-ink: #111110;
    --kc-ink-2: #555553;
    --kc-ink-3: #9a9a96;
    --kc-red: #c0392b;
    --kc-red-soft: rgba(192,57,43,.07);
    --kc-red-mid: rgba(192,57,43,.15);
    --kc-green: #1a7a4a;
    --kc-green-soft: rgba(26,122,74,.07);
    --kc-amber: #b45309;
    --kc-amber-soft: rgba(180,83,9,.08);
    --kc-blue: #1d4ed8;
    --kc-blue-soft: rgba(29,78,216,.07);
    --kc-radius: 5px;
    --kc-radius-lg: 10px;
    --kc-shadow-sm: 0 1px 3px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.03);
    --kc-shadow: 0 4px 14px rgba(0,0,0,.07);
    --kc-font: 'DM Sans', system-ui, sans-serif;
    --kc-mono: 'DM Mono', monospace;
  }

  .kc-layout {
    display: flex;
    min-height: 100vh;
    background: var(--kc-bg);
    font-family: var(--kc-font);
    color: var(--kc-ink);
    -webkit-font-smoothing: antialiased;
  }

  .kc-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
      margin-left: ${sidebarWidth}px;   /* ← ajouter cette ligne */

  }

  /* ── Page header ── */
  .kc-page-header {
    background: var(--kc-surface);
    border-bottom: 1px solid var(--kc-border);
    padding: 28px 36px 24px;
  }
  .kc-page-eyebrow {
    font-size: .62rem; font-weight: 700; letter-spacing: .18em;
    text-transform: uppercase; color: var(--kc-red);
    margin-bottom: 6px; display: flex; align-items: center; gap: 7px;
  }
  .kc-page-eyebrow::before {
    content: ''; width: 18px; height: 2px; background: var(--kc-red);
  }
  .kc-page-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem; font-weight: 900; line-height: 1;
    letter-spacing: -.02em; color: var(--kc-ink); margin-bottom: 4px;
  }
  .kc-page-title span { color: var(--kc-red); }
  .kc-page-sub { font-size: .82rem; color: var(--kc-ink-3); font-weight: 400; }

  /* ── KPI strip ── */
  .kc-kpi-strip {
    display: flex; gap: 0;
    background: var(--kc-surface);
    border-bottom: 1px solid var(--kc-border);
  }
  .kc-kpi {
    flex: 1; padding: 16px 28px;
    border-right: 1px solid var(--kc-border);
    position: relative; overflow: hidden;
  }
  .kc-kpi:last-child { border-right: none; }
  .kc-kpi-lbl {
    font-size: .62rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .1em; color: var(--kc-ink-3); margin-bottom: 4px;
  }
  .kc-kpi-val {
    font-size: 1.7rem; font-weight: 700; font-family: var(--kc-mono);
    line-height: 1; color: var(--kc-ink);
  }
  .kc-kpi-val.red { color: var(--kc-red); }
  .kc-kpi-val.green { color: var(--kc-green); }
  .kc-kpi-val.amber { color: var(--kc-amber); }
  .kc-kpi-icon {
    position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
    font-size: 1.4rem; opacity: .06; color: var(--kc-ink);
  }

  /* ── Tabs ── */
  .kc-tabs {
    display: flex; padding: 0 36px;
    background: var(--kc-surface);
    border-bottom: 2px solid var(--kc-border);
    gap: 0;
  }
  .kc-tab {
    padding: 14px 20px; font-size: .8rem; font-weight: 600;
    color: var(--kc-ink-3); cursor: pointer; border: none;
    background: none; border-bottom: 2px solid transparent;
    margin-bottom: -2px; transition: all .15s; display: flex;
    align-items: center; gap: 7px; letter-spacing: .01em;
    white-space: nowrap;
  }
  .kc-tab:hover { color: var(--kc-ink); }
  .kc-tab.active { color: var(--kc-ink); border-bottom-color: var(--kc-red); }
  .kc-tab-badge {
    min-width: 18px; height: 18px; padding: 0 5px;
    display: inline-flex; align-items: center; justify-content: center;
    background: var(--kc-red); color: #fff;
    border-radius: 20px; font-size: .62rem; font-weight: 800;
  }
  .kc-tab-badge.neutral {
    background: var(--kc-surface-2); color: var(--kc-ink-2);
  }

  /* ── Content area ── */
  .kc-content { padding: 28px 36px; flex: 1; }

  /* ── Card / Panel ── */
  .kc-card {
    background: var(--kc-surface);
    border: 1px solid var(--kc-border);
    border-radius: var(--kc-radius-lg);
    box-shadow: var(--kc-shadow-sm);
    overflow: hidden; margin-bottom: 16px;
  }
  .kc-card-head {
    padding: 16px 22px;
    border-bottom: 1px solid var(--kc-border);
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px;
  }
  .kc-card-title {
    font-size: .75rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .09em; color: var(--kc-ink); display: flex;
    align-items: center; gap: 8px;
  }
  .kc-card-title-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--kc-red); flex-shrink: 0;
  }
  .kc-card-body { padding: 22px; }

  /* ── Drop zone ── */
  .kc-drop-zone {
    border: 2px dashed var(--kc-border-2);
    border-radius: var(--kc-radius-lg);
    padding: 40px 32px; text-align: center;
    cursor: pointer; transition: all .2s;
    background: var(--kc-surface);
  }
  .kc-drop-zone:hover {
    border-color: var(--kc-red);
    background: var(--kc-red-soft);
  }
  .kc-drop-zone-icon {
    font-size: 2rem; color: var(--kc-ink-3); margin-bottom: 12px;
    transition: color .2s;
  }
  .kc-drop-zone:hover .kc-drop-zone-icon { color: var(--kc-red); }
  .kc-drop-zone-title {
    font-size: .9rem; font-weight: 600; color: var(--kc-ink); margin-bottom: 4px;
  }
  .kc-drop-zone-sub { font-size: .76rem; color: var(--kc-ink-3); }

  /* ── Format spec ── */
  .kc-format-spec {
    display: flex; flex-wrap: wrap; gap: 6px; margin-top: 18px;
    justify-content: center;
  }
  .kc-col-tag {
    font-size: .62rem; font-weight: 600; padding: 3px 9px;
    border-radius: 3px; background: var(--kc-surface-2);
    border: 1px solid var(--kc-border); color: var(--kc-ink-2);
    font-family: var(--kc-mono);
  }

  /* ── Buttons ── */
  .kc-btn {
    display: inline-flex; align-items: center; gap: 7px;
    font-family: var(--kc-font); font-size: .8rem; font-weight: 600;
    padding: 9px 18px; border-radius: var(--kc-radius);
    border: 1px solid transparent; cursor: pointer;
    transition: all .15s; white-space: nowrap; text-decoration: none;
  }
  .kc-btn:disabled { opacity: .4; cursor: not-allowed; }
  .kc-btn-primary {
    background: var(--kc-ink); color: #fff; border-color: var(--kc-ink);
  }
  .kc-btn-primary:hover:not(:disabled) { background: #2a2a28; }
  .kc-btn-red {
    background: var(--kc-red); color: #fff; border-color: var(--kc-red);
  }
  .kc-btn-red:hover:not(:disabled) { background: #a93226; }
  .kc-btn-outline {
    background: transparent; color: var(--kc-ink); border-color: var(--kc-border-2);
  }
  .kc-btn-outline:hover:not(:disabled) { border-color: var(--kc-ink); background: var(--kc-surface-2); }
  .kc-btn-ghost {
    background: none; border: none; color: var(--kc-ink-3);
    padding: 7px 10px;
  }
  .kc-btn-ghost:hover:not(:disabled) { color: var(--kc-red); background: var(--kc-red-soft); }
  .kc-btn-sm { font-size: .74rem; padding: 6px 13px; }
  .kc-btn-xs { font-size: .68rem; padding: 4px 9px; border-radius: 3px; }

  /* ── Alert banners ── */
  .kc-alert {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 16px; border-radius: var(--kc-radius);
    font-size: .82rem; margin-top: 16px;
  }
  .kc-alert-success { background: var(--kc-green-soft); color: var(--kc-green); border: 1px solid #bbf7d0; }
  .kc-alert-error { background: var(--kc-red-soft); color: var(--kc-red); border: 1px solid var(--kc-red-mid); }
  .kc-alert-warn { background: var(--kc-amber-soft); color: var(--kc-amber); border: 1px solid #fde68a; }

  /* ── Import stats ── */
  .kc-import-stats {
    display: flex; gap: 20px; margin-top: 12px; flex-wrap: wrap;
  }
  .kc-import-stat-val {
    font-size: 1.4rem; font-weight: 800; font-family: var(--kc-mono); line-height: 1;
  }
  .kc-import-stat-lbl {
    font-size: .6rem; text-transform: uppercase; letter-spacing: .1em;
    color: var(--kc-ink-3); margin-top: 2px; font-weight: 600;
  }

  /* ── Filter chips ── */
  .kc-filter-bar {
    display: flex; gap: 6px; padding: 14px 22px;
    border-bottom: 1px solid var(--kc-border);
    flex-wrap: wrap;
  }
  .kc-chip {
    padding: 5px 13px; font-size: .7rem; font-weight: 700;
    border-radius: 20px; border: 1.5px solid var(--kc-border);
    background: transparent; color: var(--kc-ink-3); cursor: pointer;
    transition: all .15s;
  }
  .kc-chip:hover { border-color: var(--kc-border-2); color: var(--kc-ink); }
  .kc-chip.active-all { background: var(--kc-ink); color: #fff; border-color: var(--kc-ink); }
  .kc-chip.active-ok { background: var(--kc-green-soft); color: var(--kc-green); border-color: #bbf7d0; }
  .kc-chip.active-doublon { background: var(--kc-amber-soft); color: var(--kc-amber); border-color: #fde68a; }
  .kc-chip.active-erreur { background: var(--kc-red-soft); color: var(--kc-red); border-color: var(--kc-red-mid); }

  /* ── Table ── */
  .kc-table-wrap { overflow-x: auto; }
  .kc-table { width: 100%; border-collapse: collapse; }
  .kc-table th {
    padding: 10px 14px; text-align: left;
    font-size: .62rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .09em; color: var(--kc-ink-3);
    border-bottom: 2px solid var(--kc-border);
    background: var(--kc-surface-2); white-space: nowrap;
  }
  .kc-table td {
    padding: 11px 14px; font-size: .8rem;
    border-bottom: 1px solid var(--kc-border); vertical-align: middle;
  }
  .kc-table tbody tr:hover td { background: var(--kc-surface-2); }
  .kc-table tbody tr:last-child td { border-bottom: none; }
  .mono { font-family: var(--kc-mono); font-size: .72rem !important; }

  /* ── Status badge ── */
  .kc-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: .62rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .07em; padding: 2px 8px; border-radius: 20px;
  }
  .kc-badge-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .kc-badge-ok { background: var(--kc-green-soft); color: var(--kc-green); }
  .kc-badge-doublon { background: var(--kc-amber-soft); color: var(--kc-amber); }
  .kc-badge-erreur { background: var(--kc-red-soft); color: var(--kc-red); }
  .kc-badge-pending { background: var(--kc-amber-soft); color: var(--kc-amber); }
  .kc-badge-planned { background: var(--kc-blue-soft); color: var(--kc-blue); }
  .kc-badge-source-excel { background: var(--kc-green-soft); color: var(--kc-green); }
  .kc-badge-source-manuel { background: var(--kc-blue-soft); color: var(--kc-blue); }
  .kc-badge-source-api { background: rgba(139,92,246,.08); color: #7c3aed; }

  /* ── Form elements ── */
  .kc-form-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 14px; margin-bottom: 24px;
  }
  @media(max-width:900px) { .kc-form-grid { grid-template-columns: repeat(2, 1fr); } }
  .kc-field { display: flex; flex-direction: column; gap: 5px; }
  .kc-label {
    font-size: .68rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .08em; color: var(--kc-ink-2);
  }
  .kc-label .req { color: var(--kc-red); margin-left: 2px; }
  .kc-input, .kc-select {
    width: 100%; padding: 9px 11px;
    border: 1px solid var(--kc-border-2);
    border-radius: var(--kc-radius);
    font-family: var(--kc-font); font-size: .84rem; color: var(--kc-ink);
    background: var(--kc-surface); outline: none;
    transition: border-color .15s, box-shadow .15s;
  }
  .kc-input:focus, .kc-select:focus {
    border-color: var(--kc-ink); box-shadow: 0 0 0 3px rgba(0,0,0,.05);
  }
  .kc-input::placeholder { color: var(--kc-ink-3); }

  /* ── Articles section ── */
  .kc-articles-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 12px;
  }
  .kc-articles-title {
    font-size: .68rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .1em; color: var(--kc-ink-3); display: flex;
    align-items: center; gap: 7px;
  }
  .kc-articles-title-count {
    background: var(--kc-red); color: #fff; border-radius: 20px;
    min-width: 20px; height: 20px; display: inline-flex;
    align-items: center; justify-content: center;
    font-size: .65rem; font-weight: 800; padding: 0 5px;
  }

  .kc-article-row {
    display: grid;
    grid-template-columns: 1fr 2.5fr 90px 130px 80px 90px 36px;
    gap: 6px; margin-bottom: 6px; align-items: center;
  }
  @media(max-width:1100px) {
    .kc-article-row { grid-template-columns: 1fr 1fr 80px 80px 36px; }
    .kc-article-row .kc-article-hide { display: none; }
  }

  .kc-article-num {
    display: flex; align-items: center; justify-content: center;
    width: 22px; height: 22px; border-radius: 50%;
    background: var(--kc-surface-2); border: 1px solid var(--kc-border);
    font-size: .65rem; font-weight: 700; color: var(--kc-ink-3);
    flex-shrink: 0;
  }

  /* ── Section divider ── */
  .kc-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 20px 0 16px;
  }
  .kc-divider-line { flex: 1; height: 1px; background: var(--kc-border); }
  .kc-divider-txt {
    font-size: .62rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .12em; color: var(--kc-ink-3); white-space: nowrap;
  }

  /* ── Empty / loading ── */
  .kc-empty {
    text-align: center; padding: 48px 20px; color: var(--kc-ink-3);
  }
  .kc-empty i { font-size: 2rem; opacity: .2; margin-bottom: 12px; display: block; }
  .kc-empty p { font-size: .84rem; }
  .kc-loading { text-align: center; padding: 32px; color: var(--kc-ink-3); font-size: .84rem; }

  /* ── Excel template banner ── */
  .kc-template-banner {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px; border-radius: var(--kc-radius);
    background: var(--kc-surface-2); border: 1px solid var(--kc-border);
    margin-bottom: 20px;
  }
  .kc-template-icon { font-size: 1.4rem; color: var(--kc-green); flex-shrink: 0; }
  .kc-template-info { flex: 1; }
  .kc-template-info-title { font-size: .82rem; font-weight: 600; color: var(--kc-ink); margin-bottom: 2px; }
  .kc-template-info-sub { font-size: .72rem; color: var(--kc-ink-3); }

  /* ── Row highlight for rapport ── */
  .kc-row-ok td { background: transparent !important; }
  .kc-row-doublon td { background: rgba(180,83,9,.04) !important; }
  .kc-row-erreur td { background: rgba(192,57,43,.04) !important; }
`;

// ── Constantes / données de référence ─────────────────────────
const FAMILLES = [
  "HUILE",
  "MARGARINE",
  "SUCRE",
  "SMEN",
  "CHOCOLAT",
  "SAUCE",
  "EAU",
  "MIEL",
  "CONFITURE",
  "BOISSON",
  "AUTRE",
];
const CONDITIONNEMENTS = [
  "Carton 4u",
  "Carton 6u",
  "Carton 12u",
  "Carton 20u",
  "Carton 24u",
  "Sac 25kg",
  "Sac 50kg",
  "Palette",
  "Bidon 5L",
  "Bidon 20L",
  "Autre",
];
const UNITS = ["unité", "kg", "litre", "carton", "palette", "sac"];
const TABS = ["Import Excel", "Vérification", "Commande manuelle", "Commandes"];

const ITEM_VIDE = {
  sku: "",
  productName: "",
  quantity: "",
  conditionnement: "",
  quantitePLT: "",
  netAPayer: "",
  unit: "unité",
};

const STATUS_CHIP = {
  pending: { cls: "kc-badge kc-badge-pending", label: "En attente" },
  planned: { cls: "kc-badge kc-badge-planned", label: "Planifiée" },
  delivered: { cls: "kc-badge", label: "Livrée" },
};

// ════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════
export default function KeepContact() {
  const [tab, setTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, planned: 0 });
  const fileRef = useRef();

  // Rapport
  const [rapport, setRapport] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState("TOUS");

  // Formulaire commande manuelle
  const [manForm, setManForm] = useState({
    codeCommande: "",
    codeClient: "",
    date: "",
    clrCode: "",
    famille: "",
  });
  const [manItems, setManItems] = useState([{ ...ITEM_VIDE }]);
  const [manLoading, setManLoading] = useState(false);
  const [manResult, setManResult] = useState(null);

  // ── Data fetching ──────────────────────────────────────────
  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders");
      const list = Array.isArray(data) ? data : data.orders || [];
      setOrders(list);
      setStats({
        total: list.length,
        pending: list.filter((o) => o.status === "pending").length,
        planned: list.filter((o) => o.status === "planned").length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ── Import Excel ───────────────────────────────────────────
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    setRapport([]);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/keep-contact/import", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImportResult(data);
      if (data.rapport?.length > 0) {
        setRapport(data.rapport);
        setTab(1);
      }
      fetchOrders();
    } catch (err) {
      setImportResult({
        ok: false,
        headerErrors: [err.response?.data?.message || "Erreur import"],
      });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // ── Commande manuelle ──────────────────────────────────────
  const addItem = () => setManItems([...manItems, { ...ITEM_VIDE }]);
  const removeItem = (i) => setManItems(manItems.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => {
    const next = [...manItems];
    next[i] = { ...next[i], [field]: val };
    setManItems(next);
  };

  const submitManuelle = async () => {
    setManLoading(true);
    setManResult(null);
    try {
      await api.post("/keep-contact/commande-manuelle", {
        ...manForm,
        items: manItems.map((it) => ({
          ...it,
          quantity: parseFloat(it.quantity) || 0,
          quantitePLT: parseFloat(it.quantitePLT) || null,
          netAPayer: parseFloat(it.netAPayer) || null,
        })),
      });
      setManResult({ ok: true, message: "Commande créée avec succès" });
      setManForm({
        codeCommande: "",
        codeClient: "",
        date: "",
        clrCode: "",
        famille: "",
      });
      setManItems([{ ...ITEM_VIDE }]);
      fetchOrders();
    } catch (err) {
      setManResult({
        ok: false,
        message: err.response?.data?.message || "Erreur",
      });
    } finally {
      setManLoading(false);
    }
  };

  // ── Rapport filtré ─────────────────────────────────────────
  const rapportFiltré =
    filtreStatut === "TOUS"
      ? rapport
      : rapport.filter((r) => r.statut === filtreStatut);

  const nbProblemes = rapport.filter((r) => r.statut !== "OK").length;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="kc-layout">
      <style dangerouslySetInnerHTML={{ __html: KC_STYLE }} />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />{" "}
      <Sidebar /> {/* ← ajouter ici */}
      {/* Sidebar existante */}
      <div className="kc-main" style={{ marginLeft: sidebarWidth }}>
        {" "}
        {/* Page header */}
        <div className="kc-page-header">
          <div className="kc-page-eyebrow">Module actif</div>
          <h1 className="kc-page-title">
            Keep <span>Contact</span>
          </h1>
          <p className="kc-page-sub">Import et gestion des commandes J+1</p>
        </div>
        {/* KPI strip */}
        <div className="kc-kpi-strip">
          {[
            {
              lbl: "Total commandes",
              val: stats.total,
              cls: "",
              icon: "fa-box",
            },
            {
              lbl: "En attente",
              val: stats.pending,
              cls: "amber",
              icon: "fa-clock",
            },
            {
              lbl: "Planifiées",
              val: stats.planned,
              cls: "green",
              icon: "fa-calendar-check",
            },
          ].map((k) => (
            <div key={k.lbl} className="kc-kpi">
              <div className="kc-kpi-lbl">{k.lbl}</div>
              <div className={`kc-kpi-val ${k.cls}`}>{k.val}</div>
              <i className={`fas ${k.icon} kc-kpi-icon`}></i>
            </div>
          ))}
        </div>
        {/* Tabs */}
        <div className="kc-tabs">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`kc-tab ${tab === i ? "active" : ""}`}
              onClick={() => setTab(i)}
            >
              {i === 0 && <i className="fas fa-file-excel"></i>}
              {i === 1 && <i className="fas fa-clipboard-check"></i>}
              {i === 2 && <i className="fas fa-pen-to-square"></i>}
              {i === 3 && <i className="fas fa-list"></i>}
              {t}
              {i === 1 && nbProblemes > 0 && (
                <span className="kc-tab-badge">{nbProblemes}</span>
              )}
              {i === 3 && orders.length > 0 && (
                <span className="kc-tab-badge neutral">{orders.length}</span>
              )}
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="kc-content">
          {/* ── TAB 0 : Import Excel ── */}
          {tab === 0 && (
            <>
              {/* Template banner */}
              <div className="kc-template-banner">
                <i className="fas fa-file-excel kc-template-icon"></i>
                <div className="kc-template-info">
                  <div className="kc-template-info-title">
                    Fichier modèle disponible
                  </div>
                  <div className="kc-template-info-sub">
                    Téléchargez le modèle Excel pour préparer vos imports — 11
                    colonnes obligatoires, exemples inclus
                  </div>
                </div>
                <a
                  href="/templates/commande_template.xlsx"
                  download
                  className="kc-btn kc-btn-outline kc-btn-sm"
                >
                  <i className="fas fa-download"></i> Modèle .xlsx
                </a>
              </div>

              <div className="kc-card">
                <div className="kc-card-head">
                  <div className="kc-card-title">
                    <span className="kc-card-title-dot"></span>
                    Importer un fichier Excel
                  </div>
                </div>
                <div className="kc-card-body">
                  <label
                    className="kc-drop-zone"
                    style={{
                      display: "block",
                      cursor: importing ? "not-allowed" : "pointer",
                      opacity: importing ? 0.5 : 1,
                    }}
                  >
                    <div className="kc-drop-zone-icon">
                      <i
                        className={`fas ${importing ? "fa-spinner fa-spin" : "fa-cloud-arrow-up"}`}
                      ></i>
                    </div>
                    <div className="kc-drop-zone-title">
                      {importing
                        ? "Import en cours…"
                        : "Cliquer ou glisser-déposer"}
                    </div>
                    <div className="kc-drop-zone-sub">
                      Fichiers .xlsx / .xls acceptés
                    </div>
                    <div className="kc-format-spec">
                      {[
                        "Code",
                        "CodeClient",
                        "Code Commande",
                        "Date",
                        "Famille",
                        "Code Article",
                        "Désignation",
                        "Conditionnement",
                        "Quantité",
                        "Qté PLT",
                        "Net à payer",
                      ].map((c) => (
                        <span key={c} className="kc-col-tag">
                          {c}
                        </span>
                      ))}
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".xlsx,.xls"
                      style={{ display: "none" }}
                      onChange={handleImport}
                      disabled={importing}
                    />
                  </label>

                  {importResult && (
                    <>
                      {importResult.headerErrors?.length > 0 && (
                        <div className="kc-alert kc-alert-error">
                          <i
                            className="fas fa-exclamation-circle"
                            style={{ flexShrink: 0 }}
                          ></i>
                          <div>
                            <strong>Fichier invalide</strong>
                            <ul style={{ marginTop: 8, paddingLeft: 16 }}>
                              {importResult.headerErrors.map((e, i) => (
                                <li key={i}>{e}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {importResult.ok && importResult.stats && (
                        <div className="kc-alert kc-alert-success">
                          <i
                            className="fas fa-check-circle"
                            style={{ flexShrink: 0, fontSize: "1.1rem" }}
                          ></i>
                          <div style={{ flex: 1 }}>
                            <strong>Import terminé</strong>
                            <div className="kc-import-stats">
                              {[
                                {
                                  lbl: "Traitées",
                                  val: importResult.stats.total,
                                  c: "var(--kc-ink)",
                                },
                                {
                                  lbl: "Créées",
                                  val: importResult.stats.created,
                                  c: "var(--kc-green)",
                                },
                                {
                                  lbl: "Mises à jour",
                                  val: importResult.stats.updated,
                                  c: "var(--kc-blue)",
                                },
                                {
                                  lbl: "Doublons",
                                  val: importResult.stats.doublons,
                                  c: "var(--kc-amber)",
                                },
                                {
                                  lbl: "Erreurs",
                                  val: importResult.stats.errors,
                                  c: "var(--kc-red)",
                                },
                              ].map((s) => (
                                <div key={s.lbl}>
                                  <div
                                    className="kc-import-stat-val"
                                    style={{ color: s.c }}
                                  >
                                    {s.val}
                                  </div>
                                  <div className="kc-import-stat-lbl">
                                    {s.lbl}
                                  </div>
                                </div>
                              ))}
                            </div>
                            {rapport.length > 0 && (
                              <button
                                className="kc-btn kc-btn-outline kc-btn-sm"
                                style={{ marginTop: 12 }}
                                onClick={() => setTab(1)}
                              >
                                <i className="fas fa-table"></i> Voir rapport
                                ligne par ligne →
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── TAB 1 : Vérification ── */}
          {tab === 1 && (
            <div className="kc-card">
              <div className="kc-card-head">
                <div className="kc-card-title">
                  <span className="kc-card-title-dot"></span>
                  Rapport de vérification
                </div>
                <span
                  style={{
                    fontSize: ".72rem",
                    color: "var(--kc-ink-3)",
                    fontWeight: 600,
                  }}
                >
                  {rapport.length} ligne(s)
                </span>
              </div>

              {rapport.length === 0 ? (
                <div className="kc-empty">
                  <i className="fas fa-clipboard"></i>
                  <p>Aucun rapport — importez un fichier Excel d'abord</p>
                </div>
              ) : (
                <>
                  <div className="kc-filter-bar">
                    {[
                      { key: "TOUS", cls: "active-all", nb: rapport.length },
                      {
                        key: "OK",
                        cls: "active-ok",
                        nb: rapport.filter((r) => r.statut === "OK").length,
                      },
                      {
                        key: "DOUBLON",
                        cls: "active-doublon",
                        nb: rapport.filter((r) => r.statut === "DOUBLON")
                          .length,
                      },
                      {
                        key: "ERREUR",
                        cls: "active-erreur",
                        nb: rapport.filter((r) => r.statut === "ERREUR").length,
                      },
                    ].map((f) => (
                      <button
                        key={f.key}
                        className={`kc-chip ${filtreStatut === f.key ? f.cls : ""}`}
                        onClick={() => setFiltreStatut(f.key)}
                      >
                        {f.key} ({f.nb})
                      </button>
                    ))}
                  </div>

                  <div className="kc-table-wrap">
                    <table className="kc-table">
                      <thead>
                        <tr>
                          {[
                            "Ligne",
                            "Code Commande",
                            "Client",
                            "SKU",
                            "Produit",
                            "Qté",
                            "Statut",
                            "Erreurs",
                          ].map((h) => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rapportFiltré.map((r, i) => (
                          <tr
                            key={i}
                            className={`kc-row-${r.statut.toLowerCase()}`}
                          >
                            <td
                              className="mono"
                              style={{ color: "var(--kc-ink-3)" }}
                            >
                              {r.rowNum}
                            </td>
                            <td className="mono">{r.codeCommande || "—"}</td>
                            <td>{r.codeClient || "—"}</td>
                            <td
                              className="mono"
                              style={{
                                fontSize: ".68rem",
                                color: "var(--kc-ink-3)",
                              }}
                            >
                              {r.sku || "—"}
                            </td>
                            <td
                              style={{
                                maxWidth: 160,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {r.productName || "—"}
                            </td>
                            <td>{r.quantity ?? "—"}</td>
                            <td>
                              <span
                                className={`kc-badge kc-badge-${r.statut.toLowerCase()}`}
                              >
                                {r.statut}
                              </span>
                            </td>
                            <td
                              style={{
                                fontSize: ".72rem",
                                color: "var(--kc-red)",
                                maxWidth: 200,
                              }}
                            >
                              {r.errors?.join(" · ") || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── TAB 2 : Commande manuelle ── */}
          {tab === 2 && (
            <div className="kc-card">
              <div className="kc-card-head">
                <div className="kc-card-title">
                  <span className="kc-card-title-dot"></span>
                  Saisie manuelle d'une commande
                </div>
              </div>
              <div className="kc-card-body">
                {/* Section en-tête commande */}
                <div className="kc-divider" style={{ marginTop: 0 }}>
                  <div className="kc-divider-line"></div>
                  <div className="kc-divider-txt">Informations commande</div>
                  <div className="kc-divider-line"></div>
                </div>

                <div className="kc-form-grid">
                  {/* Code commande */}
                  <div className="kc-field">
                    <label className="kc-label">
                      Code Commande <span className="req">*</span>
                    </label>
                    <input
                      className="kc-input"
                      placeholder="ex: CMD-2025-001"
                      value={manForm.codeCommande}
                      onChange={(e) =>
                        setManForm({ ...manForm, codeCommande: e.target.value })
                      }
                    />
                  </div>

                  {/* Code client */}
                  <div className="kc-field">
                    <label className="kc-label">
                      Code Client <span className="req">*</span>
                    </label>
                    <input
                      className="kc-input"
                      placeholder="ex: CLI-001"
                      value={manForm.codeClient}
                      onChange={(e) =>
                        setManForm({ ...manForm, codeClient: e.target.value })
                      }
                    />
                  </div>

                  {/* Date */}
                  <div className="kc-field">
                    <label className="kc-label">
                      Date commande <span className="req">*</span>
                    </label>
                    <input
                      type="date"
                      className="kc-input"
                      value={manForm.date}
                      onChange={(e) =>
                        setManForm({ ...manForm, date: e.target.value })
                      }
                    />
                  </div>

                  {/* CLR Code — select si vous avez une liste, sinon input */}
                  <div className="kc-field">
                    <label className="kc-label">Code CLR</label>
                    <input
                      className="kc-input"
                      placeholder="ex: CLR-ALG-01"
                      value={manForm.clrCode}
                      onChange={(e) =>
                        setManForm({ ...manForm, clrCode: e.target.value })
                      }
                    />
                  </div>

                  {/* Famille — select */}
                  <div className="kc-field">
                    <label className="kc-label">Famille produit</label>
                    <select
                      className="kc-select"
                      value={manForm.famille}
                      onChange={(e) =>
                        setManForm({ ...manForm, famille: e.target.value })
                      }
                    >
                      <option value="">— Toutes familles —</option>
                      {FAMILLES.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section articles */}
                <div className="kc-divider">
                  <div className="kc-divider-line"></div>
                  <div className="kc-divider-txt">Articles</div>
                  <div className="kc-divider-line"></div>
                </div>

                <div className="kc-articles-header">
                  <div className="kc-articles-title">
                    Lignes articles
                    <span className="kc-articles-title-count">
                      {manItems.length}
                    </span>
                  </div>
                  <button
                    className="kc-btn kc-btn-outline kc-btn-sm"
                    onClick={addItem}
                  >
                    <i className="fas fa-plus"></i> Ajouter un article
                  </button>
                </div>

                {/* Labels colonnes */}
                <div className="kc-article-row" style={{ marginBottom: 4 }}>
                  {[
                    "Code Article (SKU)",
                    "Désignation produit",
                    "Quantité",
                    "Conditionnement",
                    "Qté PLT",
                    "Net DZD",
                    "",
                  ].map((lbl, i) => (
                    <div
                      key={i}
                      className={`kc-label ${[4, 5].includes(i) ? "kc-article-hide" : ""}`}
                      style={{ fontSize: ".6rem" }}
                    >
                      {lbl}
                    </div>
                  ))}
                </div>

                {manItems.map((item, i) => (
                  <div key={i} className="kc-article-row">
                    <input
                      className="kc-input"
                      placeholder="SKU-001"
                      value={item.sku}
                      onChange={(e) => updateItem(i, "sku", e.target.value)}
                      style={{
                        fontFamily: "var(--kc-mono)",
                        fontSize: ".78rem",
                      }}
                    />
                    <input
                      className="kc-input"
                      placeholder="Désignation produit"
                      value={item.productName}
                      onChange={(e) =>
                        updateItem(i, "productName", e.target.value)
                      }
                    />
                    <input
                      className="kc-input"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(i, "quantity", e.target.value)
                      }
                      style={{
                        textAlign: "right",
                        fontFamily: "var(--kc-mono)",
                      }}
                    />
                    {/* Conditionnement — select */}
                    <select
                      className="kc-select kc-article-hide"
                      value={item.conditionnement}
                      onChange={(e) =>
                        updateItem(i, "conditionnement", e.target.value)
                      }
                    >
                      <option value="">— Cond. —</option>
                      {CONDITIONNEMENTS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      className="kc-input kc-article-hide"
                      type="number"
                      min="0"
                      placeholder="PLT"
                      value={item.quantitePLT}
                      onChange={(e) =>
                        updateItem(i, "quantitePLT", e.target.value)
                      }
                      style={{
                        textAlign: "right",
                        fontFamily: "var(--kc-mono)",
                      }}
                    />
                    <input
                      className="kc-input kc-article-hide"
                      type="number"
                      min="0"
                      placeholder="Net"
                      value={item.netAPayer}
                      onChange={(e) =>
                        updateItem(i, "netAPayer", e.target.value)
                      }
                      style={{
                        textAlign: "right",
                        fontFamily: "var(--kc-mono)",
                      }}
                    />
                    <button
                      className="kc-btn kc-btn-ghost"
                      onClick={() => removeItem(i)}
                      disabled={manItems.length === 1}
                      title="Supprimer"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 24,
                    paddingTop: 18,
                    borderTop: "1px solid var(--kc-border)",
                  }}
                >
                  <button
                    className="kc-btn kc-btn-red"
                    onClick={submitManuelle}
                    disabled={
                      manLoading || !manForm.codeCommande || !manForm.date
                    }
                  >
                    {manLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>{" "}
                        Enregistrement…
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i> Enregistrer la commande
                      </>
                    )}
                  </button>
                  <button
                    className="kc-btn kc-btn-outline"
                    onClick={() => {
                      setManForm({
                        codeCommande: "",
                        codeClient: "",
                        date: "",
                        clrCode: "",
                        famille: "",
                      });
                      setManItems([{ ...ITEM_VIDE }]);
                      setManResult(null);
                    }}
                  >
                    <i className="fas fa-rotate-left"></i> Réinitialiser
                  </button>
                </div>

                {manResult && (
                  <div
                    className={`kc-alert ${manResult.ok ? "kc-alert-success" : "kc-alert-error"}`}
                  >
                    <i
                      className={`fas ${manResult.ok ? "fa-check-circle" : "fa-exclamation-circle"}`}
                      style={{ flexShrink: 0 }}
                    ></i>
                    <span>{manResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB 3 : Commandes ── */}
          {tab === 3 && (
            <div className="kc-card">
              <div className="kc-card-head">
                <div className="kc-card-title">
                  <span className="kc-card-title-dot"></span>
                  Commandes récentes
                </div>
                <span
                  style={{
                    fontSize: ".72rem",
                    color: "var(--kc-ink-3)",
                    fontWeight: 600,
                  }}
                >
                  {orders.length} entrée(s)
                </span>
              </div>

              {loading ? (
                <div className="kc-loading">
                  <i
                    className="fas fa-spinner fa-spin"
                    style={{ marginRight: 8 }}
                  ></i>
                  Chargement…
                </div>
              ) : orders.length === 0 ? (
                <div className="kc-empty">
                  <i className="fas fa-inbox"></i>
                  <p>
                    Aucune commande — importez un fichier Excel ou saisissez
                    manuellement
                  </p>
                </div>
              ) : (
                <div className="kc-table-wrap">
                  <table className="kc-table">
                    <thead>
                      <tr>
                        {[
                          "N° Commande",
                          "Code CMD",
                          "Source",
                          "Date",
                          "Client",
                          "Articles",
                          "Statut",
                        ].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const chip =
                          STATUS_CHIP[order.status] || STATUS_CHIP.pending;
                        const srcCls =
                          order.source === "MANUELLE"
                            ? "kc-badge-source-manuel"
                            : order.source === "API"
                              ? "kc-badge-source-api"
                              : "kc-badge-source-excel";
                        return (
                          <tr key={order.id}>
                            <td className="mono">{order.orderNumber}</td>
                            <td
                              className="mono"
                              style={{
                                color: "var(--kc-ink-3)",
                                fontSize: ".7rem",
                              }}
                            >
                              {order.codeCommande || "—"}
                            </td>
                            <td>
                              <span className={`kc-badge ${srcCls}`}>
                                {order.source || "EXCEL"}
                              </span>
                            </td>
                            <td style={{ color: "var(--kc-ink-2)" }}>
                              {order.date}
                            </td>
                            <td>{order.codeClient || "—"}</td>
                            <td>
                              <span style={{ fontWeight: 600 }}>
                                {order.OrderItems?.length || 0} art.
                              </span>
                              <div
                                style={{
                                  fontSize: ".68rem",
                                  color: "var(--kc-ink-3)",
                                  marginTop: 1,
                                }}
                              >
                                {order.OrderItems?.slice(0, 2)
                                  .map((i) => i.sku || i.productName)
                                  .join(", ")}
                                {order.OrderItems?.length > 2 && " …"}
                              </div>
                            </td>
                            <td>
                              <span className={chip.cls}>
                                <span
                                  className="kc-badge-dot"
                                  style={{
                                    background:
                                      order.status === "planned"
                                        ? "var(--kc-blue)"
                                        : order.status === "delivered"
                                          ? "var(--kc-green)"
                                          : "var(--kc-amber)",
                                  }}
                                ></span>
                                {chip.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
        {/* /kc-content */}
      </div>
      {/* /kc-main */}
    </div>
  );
}
