// frontend/src/pages/planification/PlanifWorkflow.jsx
// Sprint 9 — Refonte UI blanc épuré + produits libres + édition brouillon + commandes non planifiées
// PATCH: produitsLibres intégrés dans calculs poids/palettes/taux + commandeQte StockCLRBox
import { useState, useEffect } from "react";
import api from "../../utils/api";

// ═══════════════════════════════════════════════════════════════
// DESIGN SYSTEM — Thème blanc épuré professionnel
// ═══════════════════════════════════════════════════════════════
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700&display=swap');

  :root {
    --bg: #f9f9f8;
    --surface: #ffffff;
    --surface-2: #f4f4f2;
    --border: #e8e8e5;
    --border-2: #d4d4cf;
    --ink: #111110;
    --ink-2: #5a5a57;
    --ink-3: #9a9a96;
    --accent: #1a1a18;
    --red: #d63b3b;
    --red-soft: rgba(214,59,59,.08);
    --green: #1a7a4a;
    --green-soft: rgba(26,122,74,.08);
    --amber: #b45309;
    --amber-soft: rgba(180,83,9,.08);
    --blue: #1d4ed8;
    --blue-soft: rgba(29,78,216,.08);
    --radius: 6px;
    --shadow-sm: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
    --shadow: 0 4px 12px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.04);
    --shadow-lg: 0 12px 32px rgba(0,0,0,.09), 0 4px 12px rgba(0,0,0,.05);
    --font: 'DM Sans', system-ui, sans-serif;
    --font-mono: 'DM Mono', monospace;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .pw-app {
    min-height: 100vh;
    background: var(--bg);
    font-family: var(--font);
    color: var(--ink);
    -webkit-font-smoothing: antialiased;
  }

  /* ── Header ── */
  .pw-header {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 0 32px;
    display: flex; align-items: center; gap: 32px;
    height: 60px;
    position: sticky; top: 0; z-index: 100;
  }
  .pw-header-logo {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem; letter-spacing: -.01em;
    color: var(--ink); flex-shrink: 0;
  }
  .pw-header-logo span { color: var(--red); }
  .pw-header-tabs { display: flex; gap: 2px; flex: 1; }
  .pw-tab {
    padding: 8px 16px; font-size: .82rem; font-weight: 500;
    color: var(--ink-3); cursor: pointer; border-radius: var(--radius);
    transition: all .15s; border: none; background: none;
    letter-spacing: .01em;
  }
  .pw-tab:hover { color: var(--ink); background: var(--surface-2); }
  .pw-tab.active { color: var(--ink); background: var(--surface-2); font-weight: 600; }
  .pw-tab-count {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 18px; height: 18px; padding: 0 5px;
    background: var(--border); border-radius: 20px;
    font-size: .68rem; font-weight: 700; margin-left: 6px;
    color: var(--ink-2);
  }
  .pw-tab-count.alert { background: var(--red); color: #fff; }

  /* ── Layout ── */
  .pw-layout {
    display: grid; grid-template-columns: 320px 1fr;
    gap: 0; min-height: calc(100vh - 60px);
  }
  @media(max-width:1024px) { .pw-layout { grid-template-columns: 1fr; } }

  /* ── Sidebar ── */
  .pw-sidebar {
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
  }
  .pw-sidebar-head {
    padding: 20px 20px 14px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .pw-sidebar-title {
    font-size: .7rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .1em; color: var(--ink-3);
  }
  .pw-sidebar-list { flex: 1; overflow-y: auto; padding: 10px; }

  /* ── Session card ── */
  .pw-scard {
    padding: 12px 14px; border-radius: var(--radius);
    cursor: pointer; transition: all .15s;
    border: 1px solid transparent; margin-bottom: 4px;
  }
  .pw-scard:hover { background: var(--surface-2); border-color: var(--border); }
  .pw-scard.active {
    background: var(--surface-2);
    border-color: var(--border-2);
    box-shadow: var(--shadow-sm);
  }
  .pw-scard-date {
    font-size: .88rem; font-weight: 600; margin-bottom: 5px;
    color: var(--ink);
  }
  .pw-scard-meta {
    display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  }

  /* ── Status badges ── */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: .65rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .08em; padding: 2px 8px; border-radius: 20px;
  }
  .badge-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .badge-brouillon { background: var(--amber-soft); color: var(--amber); }
  .badge-brouillon .badge-dot { background: var(--amber); }
  .badge-validee { background: var(--blue-soft); color: var(--blue); }
  .badge-validee .badge-dot { background: var(--blue); }
  .badge-envoyee { background: var(--green-soft); color: var(--green); }
  .badge-envoyee .badge-dot { background: var(--green); }
  .badge-neutral { background: var(--surface-2); color: var(--ink-2); }
  .badge-red { background: var(--red-soft); color: var(--red); }

  /* ── Main content ── */
  .pw-main { padding: 28px 32px; }
  .pw-main-empty {
    display: flex; align-items: center; justify-content: center;
    min-height: calc(100vh - 120px); flex-direction: column; gap: 12px;
    color: var(--ink-3);
  }
  .pw-main-empty-icon { font-size: 2.5rem; opacity: .3; margin-bottom: 4px; }
  .pw-main-empty p { font-size: .88rem; }

  /* ── Panel / Card ── */
  .pw-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    margin-bottom: 16px;
  }
  .pw-card-head {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px;
  }
  .pw-card-title {
    font-size: .82rem; font-weight: 700; color: var(--ink);
    text-transform: uppercase; letter-spacing: .06em;
  }
  .pw-card-body { padding: 20px; }

  /* ── KPI row ── */
  .pw-kpi-row {
    display: flex; border-bottom: 1px solid var(--border);
  }
  .pw-kpi {
    flex: 1; padding: 16px 20px; text-align: center;
    border-right: 1px solid var(--border);
  }
  .pw-kpi:last-child { border-right: none; }
  .pw-kpi-num {
    font-size: 1.6rem; font-weight: 700; line-height: 1;
    margin-bottom: 4px; color: var(--ink);
    font-family: var(--font-mono);
  }
  .pw-kpi-lbl {
    font-size: .62rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: .1em; color: var(--ink-3);
  }

  /* ── Buttons ── */
  .btn {
    display: inline-flex; align-items: center; gap: 7px;
    font-family: var(--font); font-size: .82rem; font-weight: 600;
    padding: 9px 16px; border-radius: var(--radius);
    border: 1px solid transparent; cursor: pointer;
    transition: all .15s; white-space: nowrap; text-decoration: none;
  }
  .btn:disabled { opacity: .45; cursor: not-allowed; }
  .btn-primary {
    background: var(--ink); color: #fff; border-color: var(--ink);
  }
  .btn-primary:hover:not(:disabled) { background: #2a2a28; }
  .btn-outline {
    background: transparent; color: var(--ink); border-color: var(--border-2);
  }
  .btn-outline:hover:not(:disabled) { background: var(--surface-2); border-color: var(--ink); }
  .btn-red { background: var(--red); color: #fff; border-color: var(--red); }
  .btn-red:hover:not(:disabled) { background: #b82e2e; }
  .btn-ghost {
    background: none; border-color: transparent;
    color: var(--ink-3); padding: 7px 10px;
  }
  .btn-ghost:hover:not(:disabled) { background: var(--surface-2); color: var(--ink); }
  .btn-sm { font-size: .75rem; padding: 6px 12px; }
  .btn-xs { font-size: .7rem; padding: 4px 9px; border-radius: 4px; }

  /* ── Form elements ── */
  .field { margin-bottom: 14px; }
  .field-label {
    display: block; font-size: .72rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: .07em;
    color: var(--ink-2); margin-bottom: 6px;
  }
  .field-label .req { color: var(--red); margin-left: 2px; }
  .input, .select-input {
    width: 100%; padding: 9px 12px;
    border: 1px solid var(--border-2); border-radius: var(--radius);
    font-family: var(--font); font-size: .85rem; color: var(--ink);
    background: var(--surface);
    transition: border-color .15s, box-shadow .15s;
    outline: none;
  }
  .input:focus, .select-input:focus {
    border-color: var(--ink); box-shadow: 0 0 0 3px rgba(0,0,0,.06);
  }
  .input:disabled, .select-input:disabled {
    background: var(--surface-2); color: var(--ink-3); cursor: not-allowed;
  }
  textarea.input { resize: vertical; min-height: 72px; }

  /* ── Diapason selector ── */
  .diap-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 6px; margin-bottom: 14px; }
  @media(max-width:900px) { .diap-grid { grid-template-columns: repeat(3,1fr); } }
  .diap-opt {
    padding: 10px 8px; border: 1px solid var(--border);
    border-radius: var(--radius); background: var(--surface);
    cursor: pointer; text-align: center; transition: all .15s;
  }
  .diap-opt:hover { border-color: var(--border-2); background: var(--surface-2); }
  .diap-opt.active { border-color: var(--ink); background: var(--ink); color: #fff; }
  .diap-opt-title {
    font-size: .78rem; font-weight: 700; display: block; margin-bottom: 2px;
  }
  .diap-opt-sub { font-size: .62rem; opacity: .6; }
  .diap-opt.active .diap-opt-sub { opacity: .75; }

  /* Flux visuel */
  .diap-flux {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 12px; margin-bottom: 14px;
    background: var(--surface-2); border: 1px solid var(--border);
    border-radius: var(--radius); font-size: .72rem; font-weight: 600;
    color: var(--ink-2); flex-wrap: wrap;
  }
  .diap-flux .node {
    padding: 2px 8px; border-radius: 4px;
    background: var(--border); color: var(--ink-2);
  }
  .diap-flux .node.on { background: var(--ink); color: #fff; }
  .diap-flux .arr { color: var(--ink-3); font-size: .8rem; }

  /* ── Produit sélection row ── */
  .prod-row {
    display: grid; grid-template-columns: 24px 1fr auto;
    align-items: center; gap: 10px;
    padding: 9px 0; border-bottom: 1px solid var(--border);
    transition: opacity .15s;
  }
  .prod-row:last-child { border-bottom: none; }
  .prod-row.inactive { opacity: .38; }
  .prod-info-name { font-size: .84rem; font-weight: 500; color: var(--ink); }
  .prod-info-meta { font-size: .7rem; color: var(--ink-3); margin-top: 2px; display: flex; gap: 10px; }
  .prod-sku {
    font-family: var(--font-mono); font-size: .7rem;
    background: var(--surface-2); border: 1px solid var(--border);
    color: var(--ink-2); padding: 1px 5px; border-radius: 3px;
  }
  .prod-fam-badge {
    font-size: .62rem; font-weight: 700; padding: 1px 6px;
    border-radius: 20px; letter-spacing: .04em;
  }
  .prod-qty-input {
    width: 76px; padding: 6px 8px; text-align: right;
    border: 1px solid var(--border-2); border-radius: var(--radius);
    font-family: var(--font-mono); font-size: .82rem; font-weight: 600;
    background: var(--surface); outline: none;
    transition: border-color .15s;
  }
  .prod-qty-input:focus { border-color: var(--ink); }
  .prod-qty-input:disabled { background: var(--surface-2); cursor: not-allowed; }

  /* ── Chargement camion ── */
  .load-bar-wrap {
    background: var(--surface-2); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 16px;
    margin-top: 14px;
  }
  .load-bar-track {
    height: 6px; background: var(--border); border-radius: 3px;
    overflow: hidden; margin: 8px 0;
  }
  .load-bar-fill { height: 100%; border-radius: 3px; transition: width .4s ease; }

  /* ── Stock CLR ── */
  .stock-box {
    border-radius: var(--radius); padding: 14px 16px;
    border: 1px solid var(--border); margin-bottom: 14px;
    transition: border-color .3s;
  }
  .stock-box.green { border-color: #22c55e; background: rgba(34,197,94,.04); }
  .stock-box.orange { border-color: #f59e0b; background: rgba(245,158,11,.04); }
  .stock-box.red { border-color: #ef4444; background: rgba(239,68,68,.04); }
  .stock-box.grey { border-color: var(--border); background: var(--surface-2); }

  .stock-box-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 10px;
  }
  .stock-box-name { font-size: .82rem; font-weight: 600; }
  .stock-nums { display: flex; gap: 18px; flex-wrap: wrap; }
  .stock-kv-label { font-size: .62rem; font-weight: 600; text-transform: uppercase; letter-spacing: .07em; color: var(--ink-3); margin-bottom: 2px; }
  .stock-kv-val { font-size: .95rem; font-weight: 700; font-family: var(--font-mono); color: var(--ink); }

  /* Stock table */
  .stock-table { width: 100%; border-collapse: collapse; font-size: .75rem; margin-top: 12px; }
  .stock-table th {
    text-align: left; padding: 5px 8px;
    font-size: .62rem; text-transform: uppercase; letter-spacing: .08em;
    color: var(--ink-3); font-weight: 700;
    border-bottom: 1px solid var(--border);
  }
  .stock-table td { padding: 6px 8px; border-bottom: 1px solid var(--border); }
  .stock-table tr:last-child td { border-bottom: none; }

  /* ── Ligne planif card ── */
  .lp-card {
    border: 1px solid var(--border); border-radius: var(--radius);
    background: var(--surface); margin-bottom: 10px;
    overflow: hidden; transition: box-shadow .15s;
  }
  .lp-card:hover { box-shadow: var(--shadow-sm); }
  .lp-card-head {
    padding: 12px 16px; display: flex; align-items: center; gap: 10px;
  }
  .lp-order-num {
    font-family: var(--font-mono); font-size: .8rem; font-weight: 600;
    color: var(--ink); flex-shrink: 0;
  }
  .lp-dest { flex: 1; font-size: .78rem; color: var(--ink-2); line-height: 1.4; }
  .lp-badges { display: flex; gap: 5px; align-items: center; flex-shrink: 0; }
  .lp-actions { display: flex; gap: 4px; flex-shrink: 0; }

  .lp-toggle {
    width: 100%; text-align: left; padding: 8px 16px;
    background: var(--surface-2); border: none; border-top: 1px solid var(--border);
    font-size: .72rem; font-weight: 600; color: var(--ink-3);
    cursor: pointer; display: flex; align-items: center; gap: 6px;
    transition: color .15s;
  }
  .lp-toggle:hover { color: var(--ink); }

  .lp-prod-list { padding: 8px 16px 12px; }
  .lp-prod-row {
    display: flex; align-items: center; gap: 8px;
    padding: 5px 0; border-bottom: 1px solid var(--border);
    font-size: .76rem;
  }
  .lp-prod-row:last-child { border-bottom: none; }
  .lp-prod-sku { font-family: var(--font-mono); font-size: .68rem; color: var(--ink-3); min-width: 60px; }
  .lp-prod-nom { flex: 1; color: var(--ink); }
  .lp-prod-qty { font-weight: 700; font-family: var(--font-mono); }
  .lp-prod-unit { font-size: .65rem; color: var(--ink-3); }

  /* ── Commandes non planifiées ── */
  .cmd-table { width: 100%; border-collapse: collapse; }
  .cmd-table th {
    text-align: left; padding: 10px 14px;
    font-size: .65rem; text-transform: uppercase; letter-spacing: .08em;
    color: var(--ink-3); font-weight: 700; border-bottom: 2px solid var(--border);
    background: var(--surface-2);
  }
  .cmd-table td {
    padding: 10px 14px; font-size: .82rem;
    border-bottom: 1px solid var(--border); vertical-align: middle;
  }
  .cmd-table tr:hover td { background: var(--surface-2); }
  .cmd-table tr:last-child td { border-bottom: none; }

  /* ── Suggestion IA ── */
  .ia-banner {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 14px; border: 1px solid var(--border);
    border-radius: var(--radius); background: var(--surface);
    margin-bottom: 12px;
  }
  .ia-banner-icon { color: var(--amber); font-size: .9rem; margin-top: 1px; flex-shrink: 0; }
  .ia-tag {
    font-size: .62rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .1em; color: var(--ink-3); margin-bottom: 2px;
  }
  .ia-suggestion { font-size: .84rem; font-weight: 700; margin-bottom: 2px; }
  .ia-raison { font-size: .76rem; color: var(--ink-2); }

  /* ── Section ajout produit libre ── */
  .free-prod-section {
    border: 1px dashed var(--border-2); border-radius: var(--radius);
    padding: 14px; margin-bottom: 14px;
  }
  .free-prod-section-title {
    font-size: .7rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .08em; color: var(--ink-3); margin-bottom: 10px;
  }
  .free-prod-add-row {
    display: grid; grid-template-columns: 1fr 80px 36px;
    gap: 6px; margin-bottom: 6px;
  }
  .free-prod-list { margin-top: 10px; }
  .free-prod-item {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 0; border-bottom: 1px solid var(--border);
    font-size: .8rem;
  }
  .free-prod-item:last-child { border-bottom: none; }
  .free-prod-item-name { flex: 1; }
  .free-prod-item-qty { font-weight: 700; font-family: var(--font-mono); min-width: 50px; text-align: right; }

  /* ── Séparateur section ── */
  .section-divider {
    display: flex; align-items: center; gap: 10px;
    margin: 20px 0 16px;
  }
  .section-divider-line { flex: 1; height: 1px; background: var(--border); }
  .section-divider-txt {
    font-size: .65rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .1em; color: var(--ink-3); white-space: nowrap;
  }

  /* ── Formulaire drawer ── */
  .pw-drawer {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 20px; margin-bottom: 16px;
    box-shadow: var(--shadow);
  }
  .pw-drawer-title {
    font-size: .88rem; font-weight: 700; margin-bottom: 18px;
    padding-bottom: 12px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 8px;
  }

  /* ── Actions bar ── */
  .pw-actions-bar {
    display: flex; gap: 8px; flex-wrap: wrap;
    padding-top: 14px; margin-top: 4px;
    border-top: 1px solid var(--border);
  }

  /* ── Loader / Empty ── */
  .pw-loading { text-align: center; padding: 32px; color: var(--ink-3); font-size: .84rem; }
  .pw-empty {
    text-align: center; padding: 32px 20px;
    color: var(--ink-3); font-size: .84rem;
  }
  .pw-empty i { font-size: 1.8rem; opacity: .25; margin-bottom: 10px; display: block; }

  /* ── Mini progress bar ── */
  .mini-bar { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .mini-bar-fill { height: 100%; border-radius: 2px; }

  /* ── Inline info bloc ── */
  .info-row {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 12px; border-radius: var(--radius);
    font-size: .78rem; font-weight: 500;
  }
  .info-row.warn { background: var(--amber-soft); color: var(--amber); }
  .info-row.success { background: var(--green-soft); color: var(--green); }
  .info-row.danger { background: var(--red-soft); color: var(--red); }
  .info-row.info { background: var(--blue-soft); color: var(--blue); }

  /* ── Checkbox custom ── */
  input[type=checkbox] {
    width: 15px; height: 15px; cursor: pointer;
    accent-color: var(--ink);
  }

  /* ── Number input sans flèches ── */
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
  input[type=number] { -moz-appearance: textfield; }

  /* ── Couverture résumé ── */
  .couv-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 12px; }
  .couv-kpi {
    padding: 10px 8px; text-align: center;
    background: var(--surface-2); border-radius: var(--radius);
    border-top: 3px solid transparent;
  }
  .couv-kpi-num { font-size: 1.2rem; font-weight: 800; font-family: var(--font-mono); line-height: 1; }
  .couv-kpi-lbl { font-size: .6rem; text-transform: uppercase; letter-spacing: .08em; color: var(--ink-3); margin-top: 3px; font-weight: 600; }
`;

// ── Constantes ──────────────────────────────────────────────
const POIDS_CAMION = 24000;
const FAMILLE_COLOR = {
  HUILE: "#b45309",
  MARGARINE: "#be185d",
  SUCRE: "#7c3aed",
  SMEN: "#c2410c",
  CHOCOLAT: "#dc2626",
  SAUCE: "#16a34a",
  EAU: "#2563eb",
  MIEL: "#ca8a04",
  CONFITURE: "#a21caf",
  BOISSON: "#0d9488",
  AUTRE: "#6b7280",
};

// ── Helpers ─────────────────────────────────────────────────
function calcPoids(item, qte) {
  const p = item.produit;
  if (!p?.poidsKg || !qte) return 0;
  return Math.round(parseFloat(p.poidsKg) * parseFloat(qte) * 10) / 10;
}
function calcPalettes(item, qte) {
  const p = item.produit;
  if (!p?.qteParCarton || !p?.qteParPalette || !qte) return 0;
  const ctn = Math.ceil(parseFloat(qte) / parseFloat(p.qteParCarton));
  return Math.ceil(ctn / parseFloat(p.qteParPalette));
}

// ── Helpers pour produits libres (données physiques stockées directement) ──
function calcPoidsLibre(p) {
  if (!p?.poidsKg || !p?.qte) return 0;
  return Math.round(parseFloat(p.poidsKg) * parseFloat(p.qte) * 10) / 10;
}
function calcPalettesLibre(p) {
  if (!p?.qteParCarton || !p?.qteParPalette || !p?.qte) return 0;
  const ctn = Math.ceil(parseFloat(p.qte) / parseFloat(p.qteParCarton));
  return Math.ceil(ctn / parseFloat(p.qteParPalette));
}

function stockCouleur(ratio, hasActivity) {
  if (!hasActivity) return "grey";
  if (ratio < 1) return "red";
  if (ratio < 1.2) return "orange";
  return "green";
}

// ════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════════════════

// ── StockCLRBox ─────────────────────────────────────────────
function StockCLRBox({ clrId, commandeQte, orderId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clrId) {
      setData(null);
      return;
    }
    setLoading(true);
    const url = orderId
      ? `/modules/planning-intel/suggestion-diapason/${clrId}?orderId=${orderId}`
      : `/modules/planning-intel/suggestion-diapason/${clrId}`;
    api
      .get(url)
      .then(({ data: d }) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [clrId, orderId]);

  if (!clrId) return null;
  if (loading)
    return (
      <div
        style={{ fontSize: ".76rem", color: "var(--ink-3)", padding: "8px 0" }}
      >
        Chargement stock CLR…
      </div>
    );
  if (!data) return null;

  const stock = data.stockActuelCLR || 0;
  const ratio = commandeQte > 0 ? stock / commandeQte : stock > 0 ? 2 : 0;
  const couleur = stockCouleur(ratio, stock > 0 || commandeQte > 0);
  const manque = commandeQte > 0 ? commandeQte - stock : 0;

  const badgeMap = {
    green: "✓ Suffisant",
    orange: "⚠ Faible",
    red: "✗ Rupture",
    grey: "— Inactif",
  };
  const colorMap = {
    green: "#22c55e",
    orange: "#f59e0b",
    red: "#ef4444",
    grey: "var(--ink-3)",
  };

  return (
    <div className={`stock-box ${couleur}`}>
      <div className="stock-box-head">
        <div className="stock-box-name">
          {data.clr.code} — {data.clr.nom}
        </div>
        <span
          className="badge"
          style={{
            background: `${colorMap[couleur]}20`,
            color: colorMap[couleur],
          }}
        >
          {badgeMap[couleur]}
        </span>
      </div>
      <div className="stock-nums">
        <div>
          <div className="stock-kv-label">Stock actuel</div>
          <div className="stock-kv-val">{stock.toLocaleString()} u</div>
        </div>
        {commandeQte > 0 && (
          <>
            <div>
              <div className="stock-kv-label">Commande</div>
              <div className="stock-kv-val">
                {commandeQte.toLocaleString()} u
              </div>
            </div>
            <div>
              <div className="stock-kv-label">Écart</div>
              <div
                className="stock-kv-val"
                style={{ color: manque > 0 ? "#ef4444" : "#22c55e" }}
              >
                {manque > 0
                  ? `−${manque.toLocaleString()}`
                  : `+${(stock - commandeQte).toLocaleString()}`}{" "}
                u
              </div>
            </div>
          </>
        )}
        {data.stockPlateforme > 0 && (
          <div>
            <div className="stock-kv-label">Plateforme</div>
            <div className="stock-kv-val">
              {data.stockPlateforme.toLocaleString()} u
            </div>
          </div>
        )}
      </div>

      {data.stockParProduit?.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {data.resumeCouverture && (
            <div className="couv-grid">
              {[
                {
                  lbl: "Couverts",
                  nb: data.resumeCouverture.couverts,
                  c: "#22c55e",
                },
                {
                  lbl: "Partiels",
                  nb: data.resumeCouverture.partiels,
                  c: "#f59e0b",
                },
                {
                  lbl: "Rupture",
                  nb: data.resumeCouverture.impossibles,
                  c: "#ef4444",
                },
              ].map((r) => (
                <div
                  key={r.lbl}
                  className="couv-kpi"
                  style={{ borderTopColor: r.c }}
                >
                  <div className="couv-kpi-num" style={{ color: r.c }}>
                    {r.nb}
                  </div>
                  <div className="couv-kpi-lbl">{r.lbl}</div>
                </div>
              ))}
            </div>
          )}
          <table className="stock-table">
            <thead>
              <tr>
                <th></th>
                <th>SKU</th>
                <th>Produit</th>
                <th>Demandé</th>
                <th>Dispo</th>
                <th>Couverture</th>
              </tr>
            </thead>
            <tbody>
              {data.stockParProduit.map((p, i) => (
                <tr key={i}>
                  <td>
                    <span
                      style={{
                        display: "inline-block",
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background:
                          p.feu === "VERT"
                            ? "#22c55e"
                            : p.feu === "ORANGE"
                              ? "#f59e0b"
                              : "#ef4444",
                      }}
                    ></span>
                  </td>
                  <td>
                    <span className="prod-sku">{p.sku}</span>
                  </td>
                  <td
                    style={{
                      fontWeight: 500,
                      maxWidth: 140,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.nom}
                  </td>
                  <td>{p.demande} u</td>
                  <td
                    style={{
                      fontWeight: 700,
                      color: p.dispo >= p.demande ? "#22c55e" : "#ef4444",
                    }}
                  >
                    {p.dispo} u
                  </td>
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: 4,
                          background: "var(--border)",
                          borderRadius: 2,
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            borderRadius: 2,
                            width: `${Math.min(100, p.couverture)}%`,
                            background:
                              p.feu === "VERT"
                                ? "#22c55e"
                                : p.feu === "ORANGE"
                                  ? "#f59e0b"
                                  : "#ef4444",
                          }}
                        ></div>
                      </div>
                      <span
                        style={{
                          fontSize: ".65rem",
                          fontWeight: 700,
                          color: "var(--ink-2)",
                          minWidth: 30,
                        }}
                      >
                        {p.couverture}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {manque > 0 && (
        <div className="info-row danger" style={{ marginTop: 10 }}>
          <i className="fas fa-exclamation-triangle"></i> Stock insuffisant —
          manque {manque.toLocaleString()} u
        </div>
      )}
    </div>
  );
}

// ── CommandePreview ──────────────────────────────────────────
// PATCH: accepte produitsLibres pour intégrer poids/palettes/taux dans la barre de chargement
function CommandePreview({
  ordre,
  itemsSelectionnes,
  onItemsChange,
  produitsLibres = [],
}) {
  if (!ordre) return null;
  const items = ordre.OrderItems || [];
  if (!items.length && !produitsLibres.length) return null;

  const toggleItem = (id) => {
    const next = { ...itemsSelectionnes };
    if (next[id] !== undefined) delete next[id];
    else {
      const it = items.find((i) => i.id === id);
      next[id] = it?.quantity || 0;
    }
    onItemsChange(next);
  };
  const updateQte = (id, val) => {
    const it = items.find((i) => i.id === id);
    const max = it?.quantity || 0;
    const q = Math.min(max, Math.max(0, parseFloat(val) || 0));
    onItemsChange({ ...itemsSelectionnes, [id]: q });
  };

  const actifs = items.filter((i) => itemsSelectionnes[i.id] !== undefined);

  // PATCH: poids et palettes incluent maintenant les produits libres
  const poidsTotal =
    actifs.reduce(
      (s, it) => s + (calcPoids(it, itemsSelectionnes[it.id]) || 0),
      0,
    ) + produitsLibres.reduce((s, p) => s + (calcPoidsLibre(p) || 0), 0);

  const palettesTotal =
    actifs.reduce(
      (s, it) => s + (calcPalettes(it, itemsSelectionnes[it.id]) || 0),
      0,
    ) + produitsLibres.reduce((s, p) => s + (calcPalettesLibre(p) || 0), 0);

  const taux = Math.min(100, Math.round((poidsTotal / POIDS_CAMION) * 100));
  const tauxColor = taux >= 85 ? "#22c55e" : taux >= 50 ? "#f59e0b" : "#ef4444";

  const hasAnyContent = actifs.length > 0 || produitsLibres.length > 0;

  return (
    <div style={{ marginBottom: 14 }}>
      {items.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                fontSize: ".72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".07em",
                color: "var(--ink-3)",
              }}
            >
              Articles de la commande
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ fontSize: ".72rem", color: "var(--ink-3)" }}>
                {actifs.length}/{items.length} sél.
              </span>
              <button
                className="btn btn-xs btn-outline"
                onClick={() => {
                  const a = {};
                  items.forEach((i) => {
                    a[i.id] = i.quantity || 0;
                  });
                  onItemsChange(a);
                }}
              >
                Tout
              </button>
              <button
                className="btn btn-xs btn-outline"
                onClick={() => onItemsChange({})}
              >
                Aucun
              </button>
            </div>
          </div>

          {items.map((item) => {
            const sel = itemsSelectionnes[item.id] !== undefined;
            const qte = itemsSelectionnes[item.id] ?? item.quantity;
            const poids = calcPoids(item, qte);
            const palettes = calcPalettes(item, qte);
            const fc = FAMILLE_COLOR[item.produit?.famille] || "#6b7280";

            return (
              <div
                key={item.id}
                className={`prod-row ${sel ? "" : "inactive"}`}
              >
                <input
                  type="checkbox"
                  checked={sel}
                  onChange={() => toggleItem(item.id)}
                />
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 2,
                    }}
                  >
                    {item.sku && <span className="prod-sku">{item.sku}</span>}
                    <span
                      className="prod-fam-badge"
                      style={{ background: `${fc}18`, color: fc }}
                    >
                      {item.produit?.famille || "—"}
                    </span>
                    <span className="prod-info-name">{item.productName}</span>
                  </div>
                  <div className="prod-info-meta">
                    {poids > 0 && <span>⚖ {poids} kg</span>}
                    {palettes > 0 && <span>📦 {palettes} plt</span>}
                    {item.produit?.qteParCarton && (
                      <span>{item.produit.qteParCarton} u/ctn</span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <input
                    type="number"
                    min="0"
                    max={item.quantity}
                    value={sel ? qte : item.quantity}
                    disabled={!sel}
                    onChange={(e) => updateQte(item.id, e.target.value)}
                    className="prod-qty-input"
                  />
                  <span
                    style={{
                      fontSize: ".68rem",
                      color: "var(--ink-3)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    /{item.quantity} u
                  </span>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* PATCH: barre de chargement affichée si articles commande OU produits libres */}
      {hasAnyContent && (
        <div className="load-bar-wrap">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 2,
            }}
          >
            <span
              style={{
                fontSize: ".7rem",
                fontWeight: 600,
                color: "var(--ink-2)",
              }}
            >
              Chargement estimé
              {produitsLibres.length > 0 && (
                <span
                  style={{
                    color: "var(--ink-3)",
                    fontWeight: 400,
                    marginLeft: 6,
                  }}
                >
                  (commande + {produitsLibres.length} produit
                  {produitsLibres.length > 1 ? "s" : ""} additionnel
                  {produitsLibres.length > 1 ? "s" : ""})
                </span>
              )}
            </span>
            <span
              style={{ fontSize: ".7rem", fontWeight: 700, color: tauxColor }}
            >
              {taux}%
            </span>
          </div>
          <div className="load-bar-track">
            <div
              className="load-bar-fill"
              style={{ width: `${taux}%`, background: tauxColor }}
            ></div>
          </div>
          <div
            style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}
          >
            {[
              { lbl: "Poids", val: `${poidsTotal.toLocaleString()} kg` },
              { lbl: "Palettes", val: `${palettesTotal} plt` },
              {
                lbl: "Camions 24T",
                val: Math.ceil(poidsTotal / POIDS_CAMION) || "—",
              },
            ].map((s) => (
              <div key={s.lbl}>
                <div
                  style={{
                    fontSize: ".62rem",
                    textTransform: "uppercase",
                    letterSpacing: ".07em",
                    color: "var(--ink-3)",
                    fontWeight: 600,
                  }}
                >
                  {s.lbl}
                </div>
                <div
                  style={{
                    fontSize: ".88rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                    color: tauxColor,
                  }}
                >
                  {s.val}
                </div>
              </div>
            ))}
          </div>
          {taux < 50 && (
            <div className="info-row warn" style={{ marginTop: 8 }}>
              <i className="fas fa-info-circle"></i> Chargement partiel —
              envisager de regrouper des commandes
            </div>
          )}
          {taux >= 85 && (
            <div className="info-row success" style={{ marginTop: 8 }}>
              <i className="fas fa-check-circle"></i> Chargement optimal
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ProduitLibreSection ──────────────────────────────────────
// PATCH: stocke poidsKg, qteParCarton, qteParPalette pour les calculs physiques
function ProduitLibreSection({
  produits,
  produitsLibres,
  onProduitsLibresChange,
}) {
  const [addSku, setAddSku] = useState("");
  const [addQte, setAddQte] = useState("");

  const ajouter = () => {
    if (!addSku || !addQte || parseFloat(addQte) <= 0) return;
    const prod = produits.find((p) => String(p.id) === String(addSku));
    if (!prod) return;
    const next = [
      ...produitsLibres,
      {
        produitId: prod.id,
        sku: prod.sku,
        nom: prod.nom,
        famille: prod.famille,
        qte: parseFloat(addQte),
        // PATCH: données physiques nécessaires pour calculs poids/palettes
        poidsKg: prod.poidsKg,
        qteParCarton: prod.qteParCarton,
        qteParPalette: prod.qteParPalette,
      },
    ];
    onProduitsLibresChange(next);
    setAddSku("");
    setAddQte("");
  };

  const retirer = (idx) => {
    const next = [...produitsLibres];
    next.splice(idx, 1);
    onProduitsLibresChange(next);
  };

  const updateQteFree = (idx, val) => {
    const next = [...produitsLibres];
    next[idx] = { ...next[idx], qte: parseFloat(val) || 0 };
    onProduitsLibresChange(next);
  };

  return (
    <div className="free-prod-section">
      <div className="free-prod-section-title">
        <i className="fas fa-plus-circle" style={{ marginRight: 6 }}></i>
        Produits additionnels (sans commande)
      </div>
      <div className="free-prod-add-row">
        <select
          className="select-input"
          value={addSku}
          onChange={(e) => setAddSku(e.target.value)}
          style={{ fontSize: ".8rem" }}
        >
          <option value="">— Choisir un produit —</option>
          {produits.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku} — {p.nom} {p.famille ? `(${p.famille})` : ""}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          placeholder="Qté"
          value={addQte}
          onChange={(e) => setAddQte(e.target.value)}
          className="prod-qty-input"
          style={{ width: "100%" }}
        />
        <button
          className="btn btn-primary btn-sm"
          onClick={ajouter}
          style={{ padding: "6px 10px" }}
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      {produitsLibres.length > 0 && (
        <div className="free-prod-list">
          {produitsLibres.map((p, i) => {
            const fc = FAMILLE_COLOR[p.famille] || "#6b7280";
            const poids = calcPoidsLibre(p);
            const palettes = calcPalettesLibre(p);
            return (
              <div key={i} className="free-prod-item">
                <span
                  className="prod-fam-badge"
                  style={{ background: `${fc}18`, color: fc }}
                >
                  {p.famille || "—"}
                </span>
                {p.sku && <span className="prod-sku">{p.sku}</span>}
                <span className="free-prod-item-name">{p.nom}</span>
                {/* PATCH: affichage poids/palettes pour les libres */}
                {poids > 0 && (
                  <span style={{ fontSize: ".68rem", color: "var(--ink-3)" }}>
                    ⚖ {poids} kg
                  </span>
                )}
                {palettes > 0 && (
                  <span style={{ fontSize: ".68rem", color: "var(--ink-3)" }}>
                    📦 {palettes} plt
                  </span>
                )}
                <input
                  type="number"
                  min="1"
                  value={p.qte}
                  onChange={(e) => updateQteFree(i, e.target.value)}
                  className="prod-qty-input"
                  style={{ width: 70 }}
                />
                <span style={{ fontSize: ".68rem", color: "var(--ink-3)" }}>
                  u
                </span>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => retirer(i)}
                  style={{ color: "var(--red)" }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── LignePlanifCard ──────────────────────────────────────────
function LignePlanifCard({ ligne, peutModifier, onDelete, onEdit }) {
  const [open, setOpen] = useState(false);
  const items = ligne.order?.OrderItems || [];
  const niv = ligne.clrStockNiveau;

  const itemsPlanifies =
    ligne.itemsJson?.length > 0
      ? ligne.itemsJson.map((ij) => {
          const orig = items.find((i) => i.id === ij.orderItemId);
          return {
            sku: orig?.sku || ij.sku || "—",
            productName:
              orig?.productName || ij.nom || `Article #${ij.orderItemId}`,
            quantity: ij.quantitePlanifiee,
            quantiteOriginale: orig?.quantity,
            unit: orig?.unit || "u",
            partiel: orig && ij.quantitePlanifiee < orig.quantity,
            libre: ij.libre || false,
          };
        })
      : items.map((i) => ({ ...i, partiel: false, libre: false }));

  const totalQ = itemsPlanifies.reduce((s, i) => s + (i.quantity || 0), 0);

  const stockColors = { VERT: "#22c55e", ORANGE: "#f59e0b", ROUGE: "#ef4444" };
  const stockLbls = { VERT: "Stock OK", ORANGE: "Faible", ROUGE: "Rupture" };

  return (
    <div className="lp-card">
      <div className="lp-card-head">
        <span className="lp-order-num">
          {ligne.order?.orderNumber || "— Sans commande —"}
        </span>
        <div className="lp-dest">
          {ligne.plateforme && (
            <>
              <i
                className="fas fa-warehouse"
                style={{ opacity: 0.6, marginRight: 3 }}
              ></i>
              {ligne.plateforme.nom} →{" "}
            </>
          )}
          <i
            className="fas fa-map-pin"
            style={{ opacity: 0.6, marginRight: 3 }}
          ></i>
          {ligne.clr?.code} — {ligne.clr?.nom}
          {ligne.clr?.wilaya && (
            <span style={{ opacity: 0.5 }}> ({ligne.clr.wilaya})</span>
          )}
        </div>
        <div className="lp-badges">
          <span className="badge badge-neutral">{ligne.diapason}</span>
          {niv && (
            <span
              className="badge"
              style={{
                background: `${stockColors[niv]}18`,
                color: stockColors[niv],
              }}
            >
              {stockLbls[niv]}
            </span>
          )}
        </div>
        {peutModifier && (
          <div className="lp-actions">
            <button
              className="btn btn-ghost btn-xs"
              onClick={() => onEdit(ligne)}
              title="Modifier"
            >
              <i className="fas fa-pencil-alt"></i>
            </button>
            <button
              className="btn btn-ghost btn-xs"
              onClick={onDelete}
              title="Supprimer"
              style={{ color: "var(--red)" }}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        )}
      </div>
      {itemsPlanifies.length > 0 && (
        <>
          <button className="lp-toggle" onClick={() => setOpen(!open)}>
            <i className={`fas fa-chevron-${open ? "up" : "down"}`}></i>
            {itemsPlanifies.length} produit(s) · {totalQ.toLocaleString()} u
          </button>
          {open && (
            <div className="lp-prod-list">
              {itemsPlanifies.map((item, i) => (
                <div key={i} className="lp-prod-row">
                  {item.sku && <span className="lp-prod-sku">{item.sku}</span>}
                  <span className="lp-prod-nom">{item.productName}</span>
                  <span className="lp-prod-qty">
                    {(item.quantity || 0).toLocaleString()}
                  </span>
                  <span className="lp-prod-unit">{item.unit || "u"}</span>
                  {item.libre && (
                    <span
                      className="badge badge-neutral"
                      style={{ fontSize: ".58rem" }}
                    >
                      Libre
                    </span>
                  )}
                  {item.partiel && (
                    <span
                      className="badge badge-red"
                      style={{ fontSize: ".58rem" }}
                    >
                      Partiel/{item.quantiteOriginale}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── CommandesNonPlanifiees ───────────────────────────────────
function CommandesNonPlanifiees({ commandes, loading }) {
  if (loading)
    return (
      <div className="pw-loading">
        <i className="fas fa-spinner fa-spin" style={{ marginRight: 6 }}></i>
        Chargement…
      </div>
    );
  if (!commandes.length)
    return (
      <div className="pw-empty">
        <i
          className="fas fa-check-circle"
          style={{ color: "var(--green)" }}
        ></i>
        Toutes les commandes sont planifiées.
      </div>
    );
  return (
    <div className="pw-card">
      <div className="pw-card-head">
        <div className="pw-card-title">
          <i className="fas fa-inbox" style={{ marginRight: 8 }}></i>Commandes
          en attente de planification
        </div>
        <span className="badge badge-red">{commandes.length}</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="cmd-table">
          <thead>
            <tr>
              <th>N° Commande</th>
              <th>Date</th>
              <th>Client / Destination</th>
              <th>Articles</th>
              <th>Quantité</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {commandes.map((o) => {
              const qte = (o.OrderItems || []).reduce(
                (s, i) => s + (i.quantity || 0),
                0,
              );
              return (
                <tr key={o.id}>
                  <td>
                    <span className="prod-sku" style={{ fontSize: ".78rem" }}>
                      {o.orderNumber}
                    </span>
                  </td>
                  <td style={{ color: "var(--ink-2)", fontSize: ".8rem" }}>
                    {o.date}
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {o.clientNom || o.destination || "—"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {o.OrderItems?.length || 0}
                  </td>
                  <td
                    style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
                  >
                    {qte.toLocaleString()} u
                  </td>
                  <td>
                    <span className="badge badge-neutral">
                      <span
                        className="badge-dot"
                        style={{ background: "var(--amber)" }}
                      ></span>
                      {o.statut || "En attente"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// FORMULAIRE LIGNE (création + édition)
// ════════════════════════════════════════════════════════════
function LigneForm({
  sessionId,
  commandesDispo,
  plateformes,
  clrs,
  produits,
  ligneEditee,
  onSuccess,
  onCancel,
}) {
  const isEdit = !!ligneEditee;

  const [form, setForm] = useState(() => ({
    orderId: ligneEditee?.orderId ? String(ligneEditee.orderId) : "",
    diapason: ligneEditee?.diapason || "D1",
    plateformeId: ligneEditee?.plateformeId
      ? String(ligneEditee.plateformeId)
      : "",
    clrId: ligneEditee?.clrId ? String(ligneEditee.clrId) : "",
    clrSourceId: ligneEditee?.clrSourceId
      ? String(ligneEditee.clrSourceId)
      : "",
    notes: ligneEditee?.notes || "",
  }));

  const [itemsSelectionnes, setItemsSelectionnes] = useState(() => {
    if (ligneEditee?.itemsJson?.length) {
      const m = {};
      ligneEditee.itemsJson.forEach((ij) => {
        if (!ij.libre) m[ij.orderItemId] = ij.quantitePlanifiee;
      });
      return m;
    }
    return {};
  });

  const [produitsLibres, setProduitsLibres] = useState(() => {
    if (ligneEditee?.itemsJson?.length) {
      return ligneEditee.itemsJson
        .filter((ij) => ij.libre)
        .map((ij) => ({
          produitId: ij.produitId,
          sku: ij.sku,
          nom: ij.nom,
          famille: ij.famille,
          qte: ij.quantitePlanifiee,
          // Récupère les données physiques depuis la liste produits si disponibles
          poidsKg: produits.find((p) => p.id === ij.produitId)?.poidsKg,
          qteParCarton: produits.find((p) => p.id === ij.produitId)
            ?.qteParCarton,
          qteParPalette: produits.find((p) => p.id === ij.produitId)
            ?.qteParPalette,
        }));
    }
    return [];
  });

  const [suggIA, setSuggIA] = useState(null);
  const [suggLoading, setSuggLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedOrdre = commandesDispo.find(
    (o) => String(o.id) === String(form.orderId),
  );

  // PATCH: commandeQte inclut la somme des produits libres
  const commandeQteBase = (selectedOrdre?.OrderItems || []).reduce(
    (s, i) => s + (i.quantity || 0),
    0,
  );
  const commandeQteExtras = produitsLibres.reduce(
    (s, p) => s + (p.qte || 0),
    0,
  );
  const commandeQte = commandeQteBase + commandeQteExtras;

  // Filtre CLR selon plateforme
  const clrsFiltres =
    form.diapason === "D2" || form.diapason === "D3"
      ? clrs
      : form.plateformeId
        ? clrs.filter((c) => c.plateformeId === parseInt(form.plateformeId))
        : [];

  // Suggestion IA
  useEffect(() => {
    if (!form.clrId || !form.orderId) {
      setSuggIA(null);
      return;
    }
    setSuggLoading(true);
    api
      .get(
        `/modules/planning-intel/suggestion-diapason/${form.clrId}?orderId=${form.orderId}`,
      )
      .then(({ data }) => setSuggIA(data))
      .catch(() => setSuggIA(null))
      .finally(() => setSuggLoading(false));
  }, [form.clrId, form.orderId]);

  const handleOrderChange = (orderId) => {
    setForm((f) => ({ ...f, orderId }));
    const ordre = commandesDispo.find((o) => String(o.id) === String(orderId));
    if (ordre) {
      const all = {};
      (ordre.OrderItems || []).forEach((i) => {
        all[i.id] = i.quantity || 0;
      });
      setItemsSelectionnes(all);
    } else {
      setItemsSelectionnes({});
    }
  };

  const handleDiapasonChange = (d) => {
    setForm((f) => ({
      ...f,
      diapason: d,
      plateformeId: "",
      clrId: "",
      clrSourceId: "",
    }));
  };

  const hasItems =
    Object.keys(itemsSelectionnes).length > 0 || produitsLibres.length > 0;

  const save = async () => {
    if (!form.clrId && form.diapason !== "D4")
      return alert("CLR de destination requis");
    if (form.diapason === "D1" && !form.plateformeId)
      return alert("Plateforme requise pour D1");
    if (!hasItems) return alert("Ajoutez au moins un article ou un produit");

    const itemsPayload = [
      ...Object.entries(itemsSelectionnes).map(([id, q]) => ({
        orderItemId: parseInt(id),
        quantitePlanifiee: q,
        libre: false,
      })),
      ...produitsLibres.map((p) => ({
        produitId: p.produitId,
        quantitePlanifiee: p.qte,
        libre: true,
        sku: p.sku,
        nom: p.nom,
        famille: p.famille,
        poidsKg: p.poidsKg ?? null,
        qteParCarton: p.qteParCarton ?? null,
        qteParPalette: p.qteParPalette ?? null,
      })),
    ];

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(
          `/planification/sessions/${sessionId}/lignes/${ligneEditee.id}`,
          {
            orderId: form.orderId ? parseInt(form.orderId) : null,
            diapason: form.diapason,
            plateformeId: ["D1", "D4", "D5"].includes(form.diapason)
              ? parseInt(form.plateformeId)
              : null,
            clrId: form.diapason !== "D4" ? parseInt(form.clrId) : null,
            clrSourceId: ["D3", "D5"].includes(form.diapason)
              ? parseInt(form.clrSourceId)
              : null,
            notes: form.notes,
            itemsSelectionnes: itemsPayload,
          },
        );
      } else {
        await api.post(`/planification/sessions/${sessionId}/lignes`, {
          orderId: form.orderId ? parseInt(form.orderId) : null,
          diapason: form.diapason,
          plateformeId: ["D1", "D4", "D5"].includes(form.diapason)
            ? parseInt(form.plateformeId)
            : null,
          clrId: form.diapason !== "D4" ? parseInt(form.clrId) : null,
          clrSourceId: ["D3", "D5"].includes(form.diapason)
            ? parseInt(form.clrSourceId)
            : null,
          notes: form.notes,
          itemsSelectionnes: itemsPayload,
        });
      }
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const diapasons = [
    { d: "D1", sub: "Via Plateforme → CLR" },
    { d: "D2", sub: "Direct Usine → CLR" },
    { d: "D3", sub: "Transfert CLR → CLR" },
    { d: "D4", sub: "Usine → Plateforme" },
    { d: "D5", sub: "Retour CLR → PLF" },
  ];

  return (
    <div className="pw-drawer">
      <div className="pw-drawer-title">
        <i
          className={`fas fa-${isEdit ? "pencil-alt" : "plus"}`}
          style={{ color: "var(--red)" }}
        ></i>
        {isEdit ? "Modifier la ligne" : "Nouvelle ligne de planification"}
        {isEdit && (
          <span className="badge badge-neutral" style={{ marginLeft: "auto" }}>
            Édition
          </span>
        )}
      </div>

      {/* Commande (optionnelle) */}
      <div className="field">
        <label className="field-label">
          Commande{" "}
          <span
            style={{
              fontWeight: 400,
              color: "var(--ink-3)",
              textTransform: "none",
              letterSpacing: 0,
            }}
          >
            (optionnelle)
          </span>
        </label>
        <select
          className="select-input"
          value={form.orderId}
          onChange={(e) => handleOrderChange(e.target.value)}
        >
          <option value="">— Sans commande associée —</option>
          {commandesDispo.map((o) => {
            const qte = (o.OrderItems || []).reduce(
              (s, i) => s + (i.quantity || 0),
              0,
            );
            return (
              <option key={o.id} value={o.id}>
                {o.orderNumber} — {o.date} — {qte} u (
                {o.OrderItems?.length || 0} art.)
              </option>
            );
          })}
        </select>
      </div>

      {/* Preview articles commande — PATCH: passe produitsLibres */}
      {selectedOrdre && (
        <CommandePreview
          ordre={selectedOrdre}
          itemsSelectionnes={itemsSelectionnes}
          onItemsChange={setItemsSelectionnes}
          produitsLibres={produitsLibres}
        />
      )}

      {/* Séparateur */}
      <div className="section-divider">
        <div className="section-divider-line"></div>
        <div className="section-divider-txt">Produits additionnels</div>
        <div className="section-divider-line"></div>
      </div>

      {/* Produits libres */}
      <ProduitLibreSection
        produits={produits}
        produitsLibres={produitsLibres}
        onProduitsLibresChange={setProduitsLibres}
      />

      {/* Diapason */}
      <div className="field">
        <label className="field-label">
          Mode de distribution <span className="req">*</span>
        </label>
        <div className="diap-grid">
          {diapasons.map(({ d, sub }) => (
            <div
              key={d}
              className={`diap-opt ${form.diapason === d ? "active" : ""}`}
              onClick={() => handleDiapasonChange(d)}
            >
              <span className="diap-opt-title">Diap. {d}</span>
              <span className="diap-opt-sub">{sub}</span>
            </div>
          ))}
        </div>
        {/* Flux visuel */}
        <div className="diap-flux">
          {form.diapason === "D1" && (
            <>
              <span className="node on">Usine</span>
              <span className="arr">→</span>
              <span className="node on">Plateforme</span>
              <span className="arr">→</span>
              <span className="node on">CLR</span>
            </>
          )}
          {form.diapason === "D2" && (
            <>
              <span className="node on">Usine</span>
              <span className="arr">→</span>
              <span className="node">Plateforme</span>
              <span className="arr" style={{ opacity: 0.3 }}>
                →
              </span>
              <span className="node on">CLR</span>
            </>
          )}
          {form.diapason === "D3" && (
            <>
              <span className="node on">CLR source</span>
              <span className="arr">→</span>
              <span className="node on">CLR dest.</span>
            </>
          )}
          {form.diapason === "D4" && (
            <>
              <span className="node on">Usine</span>
              <span className="arr">→</span>
              <span className="node on">Plateforme</span>
            </>
          )}
          {form.diapason === "D5" && (
            <>
              <span className="node on">CLR</span>
              <span className="arr">→</span>
              <span className="node on">Plateforme</span>
            </>
          )}
        </div>
      </div>

      {/* Plateforme */}
      {["D1", "D4", "D5"].includes(form.diapason) && (
        <div className="field">
          <label className="field-label">
            Plateforme <span className="req">*</span>
          </label>
          <select
            className="select-input"
            value={form.plateformeId}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                plateformeId: e.target.value,
                clrId: "",
              }))
            }
          >
            <option value="">— Sélectionner —</option>
            {plateformes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom} ({p.ville}) — {p.capacite?.toLocaleString()} palettes
              </option>
            ))}
          </select>
        </div>
      )}

      {/* CLR source (D3, D5) */}
      {["D3", "D5"].includes(form.diapason) && (
        <div className="field">
          <label className="field-label">
            CLR expéditeur <span className="req">*</span>
          </label>
          <select
            className="select-input"
            value={form.clrSourceId}
            onChange={(e) =>
              setForm((f) => ({ ...f, clrSourceId: e.target.value }))
            }
          >
            <option value="">— CLR source —</option>
            {clrs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.nom} ({c.wilaya})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* CLR destination */}
      {form.diapason !== "D4" && (
        <div className="field">
          <label className="field-label">
            CLR de destination <span className="req">*</span>
          </label>
          <select
            className="select-input"
            value={form.clrId}
            onChange={(e) => setForm((f) => ({ ...f, clrId: e.target.value }))}
            disabled={form.diapason === "D1" && !form.plateformeId}
          >
            <option value="">
              {form.diapason === "D1" && !form.plateformeId
                ? "— Choisir d'abord une plateforme —"
                : "— Sélectionner un CLR —"}
            </option>
            {clrsFiltres.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.nom} ({c.wilaya})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Suggestion IA + Stock — PATCH: commandeQte inclut les extras */}
      {form.clrId && (
        <div style={{ marginBottom: 14 }}>
          {form.orderId &&
            (suggLoading ? (
              <div
                style={{
                  fontSize: ".76rem",
                  color: "var(--ink-3)",
                  padding: "8px 0",
                }}
              >
                Analyse IA…
              </div>
            ) : (
              suggIA && (
                <>
                  <div className="ia-banner">
                    <i className="fas fa-lightbulb ia-banner-icon"></i>
                    <div style={{ flex: 1 }}>
                      <div className="ia-tag">Suggestion IA</div>
                      <div className="ia-suggestion">
                        Diapason {suggIA.suggestion} recommandé
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: ".72rem",
                            fontWeight: 400,
                            color: "var(--ink-3)",
                          }}
                        >
                          (confiance {suggIA.score}%)
                        </span>
                      </div>
                      <div className="ia-raison">{suggIA.raison}</div>
                    </div>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() =>
                        setForm((f) => ({ ...f, diapason: suggIA.suggestion }))
                      }
                    >
                      Appliquer
                    </button>
                  </div>
                  {suggIA.resumeCouverture?.impossibles > 0 && (
                    <div
                      className="info-row danger"
                      style={{ marginBottom: 10 }}
                    >
                      <i className="fas fa-exclamation-triangle"></i>
                      {suggIA.resumeCouverture.impossibles} produit(s) en
                      rupture au CLR {suggIA.clr?.code}
                    </div>
                  )}
                  {suggIA.resumeCouverture && (
                    <div className="couv-grid" style={{ marginBottom: 10 }}>
                      {[
                        {
                          lbl: "Couverts",
                          nb: suggIA.resumeCouverture.couverts,
                          c: "#22c55e",
                        },
                        {
                          lbl: "Partiels",
                          nb: suggIA.resumeCouverture.partiels,
                          c: "#f59e0b",
                        },
                        {
                          lbl: "Rupture",
                          nb: suggIA.resumeCouverture.impossibles,
                          c: "#ef4444",
                        },
                      ].map((r) => (
                        <div
                          key={r.lbl}
                          className="couv-kpi"
                          style={{ borderTopColor: r.c }}
                        >
                          <div className="couv-kpi-num" style={{ color: r.c }}>
                            {r.nb}
                          </div>
                          <div className="couv-kpi-lbl">{r.lbl}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )
            ))}
          <StockCLRBox
            clrId={form.clrId}
            commandeQte={commandeQte}
            orderId={form.orderId ? parseInt(form.orderId) : null}
          />
        </div>
      )}

      {/* Notes */}
      <div className="field">
        <label className="field-label">Notes</label>
        <input
          className="input"
          placeholder="Optionnel…"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
      </div>

      <div className="pw-actions-bar">
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>{" "}
              {isEdit ? "Enregistrement…" : "Ajout…"}
            </>
          ) : (
            <>
              <i className={`fas fa-${isEdit ? "save" : "plus"}`}></i>{" "}
              {isEdit ? "Enregistrer" : "Ajouter la ligne"}
            </>
          )}
        </button>
        <button className="btn btn-outline" onClick={onCancel}>
          Annuler
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════
export default function PlanifWorkflow() {
  const [tab, setTab] = useState("sessions");
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelected] = useState(null);
  const [loadingSessions, setLoadingS] = useState(true);
  const [commandesDispo, setCommandesDispo] = useState([]);
  const [commandesNonPlanifiees, setCommandesNonPlanifiees] = useState([]);
  const [cmdNpLoading, setCmdNpLoading] = useState(false);
  const [plateformes, setPlateformes] = useState([]);
  const [clrs, setClrs] = useState([]);
  const [produits, setProduits] = useState([]);

  const [showNew, setShowNew] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [creatingSess, setCreatingSess] = useState(false);

  const [showLigneForm, setShowLigneForm] = useState(false);
  const [ligneEditee, setLigneEditee] = useState(null);
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    fetchSessions(null);
    api
      .get("/infrastructure/plateformes")
      .then(({ data }) => setPlateformes(data))
      .catch(() => {});
    api
      .get("/infrastructure/clrs")
      .then(({ data }) => setClrs(data))
      .catch(() => {});
    api
      .get("/stock/produits")
      .then(({ data }) => setProduits(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (
      selectedSession?.statut === "BROUILLON" ||
      selectedSession?.statut === "VALIDEE"
    ) {
      fetchCommandesDispo();
    }
  }, [selectedSession]);

  useEffect(() => {
    if (tab === "commandes") {
      setCmdNpLoading(true);
      api
        .get("/planification/commandes-non-planifiees")
        .then(({ data }) => setCommandesNonPlanifiees(data))
        .catch(() => setCommandesNonPlanifiees([]))
        .finally(() => setCmdNpLoading(false));
    }
  }, [tab]);

  const fetchSessions = async (currentId) => {
    setLoadingS(true);
    try {
      const { data } = await api.get("/planification/sessions");
      setSessions(data);
      if (currentId != null) {
        const updated = data.find((s) => s.id === currentId);
        if (updated) setSelected(updated);
      }
    } finally {
      setLoadingS(false);
    }
  };

  const fetchCommandesDispo = async () => {
    api
      .get("/planification/commandes-disponibles")
      .then(({ data }) => setCommandesDispo(data))
      .catch(() => {});
  };

  const createSession = async () => {
    if (!newDate) return alert("Date requise");
    setCreatingSess(true);
    try {
      const { data } = await api.post("/planification/sessions", {
        date: newDate,
        notes: newNotes,
      });
      await fetchSessions(data.id);
      setSelected(data);
      setShowNew(false);
      setNewDate("");
      setNewNotes("");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally {
      setCreatingSess(false);
    }
  };

  const deleteLigne = async (ligneId) => {
    if (!window.confirm("Supprimer cette ligne ?")) return;
    await api.delete(
      `/planification/sessions/${selectedSession.id}/lignes/${ligneId}`,
    );
    await fetchSessions(selectedSession.id);
    await fetchCommandesDispo();
  };

  const openEdit = (ligne) => {
    setLigneEditee(ligne);
    setShowLigneForm(true);
  };

  const handleLigneSuccess = async () => {
    setShowLigneForm(false);
    setLigneEditee(null);
    await fetchSessions(selectedSession.id);
    await fetchCommandesDispo();
  };

  const actionSession = async (action) => {
    setActioning(true);
    try {
      await api.patch(
        `/planification/sessions/${selectedSession.id}/${action}`,
      );
      await fetchSessions(selectedSession.id);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally {
      setActioning(false);
    }
  };

  const lignes = selectedSession?.lignes || [];
  const totalProd = lignes.reduce(
    (s, l) =>
      s +
      (l.order?.OrderItems || []).reduce((ss, i) => ss + (i.quantity || 0), 0),
    0,
  );
  const nbD1 = lignes.filter((l) => l.diapason === "D1").length;
  const nbD2 = lignes.filter((l) => l.diapason === "D2").length;
  const nbD3 = lignes.filter((l) => l.diapason === "D3").length;
  const nbAutres = lignes.filter((l) =>
    ["D4", "D5"].includes(l.diapason),
  ).length;
  const peutModifier =
    selectedSession?.statut === "BROUILLON" ||
    selectedSession?.statut === "VALIDEE";

  return (
    <div className="pw-app">
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      {/* Header */}
      <header className="pw-header">
        <div className="pw-header-logo">
          Planifi<span>cation</span>
        </div>
        <nav className="pw-header-tabs">
          <button
            className={`pw-tab ${tab === "sessions" ? "active" : ""}`}
            onClick={() => setTab("sessions")}
          >
            <i className="fas fa-calendar-alt" style={{ marginRight: 6 }}></i>
            Sessions
            <span className="pw-tab-count">{sessions.length}</span>
          </button>
          <button
            className={`pw-tab ${tab === "commandes" ? "active" : ""}`}
            onClick={() => setTab("commandes")}
          >
            <i className="fas fa-inbox" style={{ marginRight: 6 }}></i>
            Commandes non planifiées
            {commandesNonPlanifiees.length > 0 && (
              <span className="pw-tab-count alert">
                {commandesNonPlanifiees.length}
              </span>
            )}
          </button>
        </nav>
      </header>

      {/* Onglet Commandes non planifiées */}
      {tab === "commandes" && (
        <div style={{ padding: "28px 32px" }}>
          <CommandesNonPlanifiees
            commandes={commandesNonPlanifiees}
            loading={cmdNpLoading}
          />
        </div>
      )}

      {/* Onglet Sessions */}
      {tab === "sessions" && (
        <div className="pw-layout">
          {/* Sidebar */}
          <aside className="pw-sidebar">
            <div className="pw-sidebar-head">
              <div className="pw-sidebar-title">Sessions</div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowNew(true)}
              >
                <i className="fas fa-plus"></i> Nouvelle
              </button>
            </div>

            {showNew && (
              <div
                style={{
                  padding: "16px",
                  borderBottom: "1px solid var(--border)",
                  background: "var(--surface-2)",
                }}
              >
                <div className="field">
                  <label className="field-label">
                    Date de livraison <span className="req">*</span>
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label className="field-label">Notes</label>
                  <input
                    className="input"
                    placeholder="Optionnel…"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={createSession}
                    disabled={creatingSess}
                  >
                    {creatingSess ? "Création…" : "Créer"}
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowNew(false)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            <div className="pw-sidebar-list">
              {loadingSessions ? (
                <div className="pw-loading">
                  <i
                    className="fas fa-spinner fa-spin"
                    style={{ marginRight: 6 }}
                  ></i>
                  Chargement…
                </div>
              ) : sessions.length === 0 ? (
                <div className="pw-empty">
                  <i className="fas fa-calendar-plus"></i>
                  <p>Aucune session</p>
                </div>
              ) : (
                sessions.map((s) => {
                  const lTotal = (s.lignes || []).reduce(
                    (sum, l) =>
                      sum +
                      (l.order?.OrderItems || []).reduce(
                        (ss, i) => ss + (i.quantity || 0),
                        0,
                      ),
                    0,
                  );
                  const statutClass =
                    s.statut === "BROUILLON"
                      ? "badge-brouillon"
                      : s.statut === "VALIDEE"
                        ? "badge-validee"
                        : "badge-envoyee";
                  return (
                    <div
                      key={s.id}
                      className={`pw-scard ${selectedSession?.id === s.id ? "active" : ""}`}
                      onClick={() => setSelected(s)}
                    >
                      <div className="pw-scard-date">
                        <i
                          className="fas fa-calendar-alt"
                          style={{
                            color: "var(--red)",
                            marginRight: 8,
                            fontSize: ".8rem",
                          }}
                        ></i>
                        {s.date}
                      </div>
                      <div className="pw-scard-meta">
                        <span className={`badge ${statutClass}`}>
                          <span className="badge-dot"></span>
                          {s.statut}
                        </span>
                        <span className="badge badge-neutral">
                          {s.lignes?.length || 0} lignes
                        </span>
                        {lTotal > 0 && (
                          <span
                            style={{
                              fontSize: ".68rem",
                              color: "var(--ink-3)",
                            }}
                          >
                            {lTotal.toLocaleString()} u
                          </span>
                        )}
                      </div>
                      {s.createur && (
                        <div
                          style={{
                            fontSize: ".68rem",
                            color: "var(--ink-3)",
                            marginTop: 4,
                          }}
                        >
                          <i
                            className="fas fa-user"
                            style={{ marginRight: 4 }}
                          ></i>
                          {s.createur.email?.split("@")[0]}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* Main */}
          <main className="pw-main">
            {!selectedSession ? (
              <div className="pw-main-empty">
                <div className="pw-main-empty-icon">
                  <i className="fas fa-hand-pointer"></i>
                </div>
                <p>Sélectionnez une session pour voir les détails</p>
              </div>
            ) : (
              <>
                {/* En-tête session */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 20,
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "1.15rem",
                        fontWeight: 700,
                        marginBottom: 5,
                      }}
                    >
                      Session du {selectedSession.date}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <span
                        className={`badge ${selectedSession.statut === "BROUILLON" ? "badge-brouillon" : selectedSession.statut === "VALIDEE" ? "badge-validee" : "badge-envoyee"}`}
                      >
                        <span className="badge-dot"></span>
                        {selectedSession.statut}
                      </span>
                      {selectedSession.notes && (
                        <span
                          style={{ fontSize: ".78rem", color: "var(--ink-3)" }}
                        >
                          {selectedSession.notes}
                        </span>
                      )}
                    </div>
                  </div>
                  {peutModifier && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setLigneEditee(null);
                        setShowLigneForm(true);
                      }}
                    >
                      <i className="fas fa-plus"></i> Ajouter une ligne
                    </button>
                  )}
                </div>

                {/* KPIs */}
                {lignes.length > 0 && (
                  <div className="pw-card" style={{ marginBottom: 16 }}>
                    <div className="pw-kpi-row">
                      {[
                        { nb: lignes.length, lbl: "Lignes" },
                        { nb: totalProd.toLocaleString(), lbl: "Unités" },
                        { nb: nbD1, lbl: "D1 Via PLF" },
                        { nb: nbD2, lbl: "D2 Direct" },
                        { nb: nbD3, lbl: "D3 Transfert" },
                        { nb: nbAutres, lbl: "D4/D5" },
                      ].map((k) => (
                        <div key={k.lbl} className="pw-kpi">
                          <div className="pw-kpi-num">{k.nb}</div>
                          <div className="pw-kpi-lbl">{k.lbl}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formulaire ajout / édition ligne */}
                {showLigneForm && peutModifier && (
                  <LigneForm
                    sessionId={selectedSession.id}
                    commandesDispo={commandesDispo}
                    plateformes={plateformes}
                    clrs={clrs}
                    produits={produits}
                    ligneEditee={ligneEditee}
                    onSuccess={handleLigneSuccess}
                    onCancel={() => {
                      setShowLigneForm(false);
                      setLigneEditee(null);
                    }}
                  />
                )}

                {/* Lignes session */}
                {lignes.length === 0 ? (
                  <div className="pw-card">
                    <div className="pw-empty">
                      <i className="fas fa-list"></i>
                      <p>
                        Aucune ligne — cliquez sur "Ajouter une ligne" pour
                        commencer
                      </p>
                    </div>
                  </div>
                ) : (
                  lignes.map((ligne) => (
                    <LignePlanifCard
                      key={ligne.id}
                      ligne={ligne}
                      peutModifier={peutModifier}
                      onDelete={() => deleteLigne(ligne.id)}
                      onEdit={() => openEdit(ligne)}
                    />
                  ))
                )}

                {/* Actions session */}
                <div className="pw-actions-bar" style={{ marginTop: 8 }}>
                  {selectedSession.statut === "BROUILLON" && (
                    <button
                      className="btn btn-primary"
                      onClick={() => actionSession("valider")}
                      disabled={actioning || lignes.length === 0}
                    >
                      <i className="fas fa-check"></i> Valider la session
                    </button>
                  )}
                  {selectedSession.statut === "VALIDEE" && (
                    <button
                      className="btn btn-red"
                      onClick={() => actionSession("envoyer")}
                      disabled={actioning}
                    >
                      <i className="fas fa-paper-plane"></i> Envoyer au
                      Transport
                    </button>
                  )}
                  {selectedSession.statut === "ENVOYEE" && (
                    <div className="info-row success">
                      <i className="fas fa-check-circle"></i>Session transmise
                      au transport
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
