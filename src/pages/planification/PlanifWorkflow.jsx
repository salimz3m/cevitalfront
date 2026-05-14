// frontend/src/pages/planification/PlanifWorkflow.jsx
// Sprint 8 — Refonte avec détail produits, stock CLR live, indicateurs visuels
// Nettoyage : stockInfo dead code supprimé, useCallback retiré,
//             clrsFiltres NaN-safe, fetchSessions sans stale closure
import { useState, useEffect } from "react";
import api from "../../utils/api";
import { DS_STYLE } from "../ds";

const EXTRA = `
  .pw-layout { display: grid; grid-template-columns: 380px 1fr; gap: 24px; }
  @media(max-width:1100px) { .pw-layout { grid-template-columns: 1fr; } }

  /* ── Sessions list ── */
  .pw-session-card {
    background: var(--dark); color: #fff;
    border-left: 4px solid transparent;
    padding: 18px 20px; margin-bottom: 10px;
    cursor: pointer; transition: border-color .2s, background .2s;
  }
  .pw-session-card:hover    { border-color: rgba(230,57,70,.5); background: #161616; }
  .pw-session-card.selected { border-color: var(--red); background: #161616; }

  .pw-session-meta {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    margin-bottom: 6px;
  }
  .pw-session-date {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.05rem; letter-spacing: .08em;
  }
  .pw-session-nb {
    font-size: .6rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .2em; color: rgba(255,255,255,.35);
  }
  .pw-statut {
    font-size: .58rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .18em; padding: 3px 10px;
  }
  .pw-statut-BROUILLON { background: rgba(245,158,11,.15); color: #f59e0b; }
  .pw-statut-VALIDEE   { background: rgba(59,130,246,.15);  color: #3b82f6; }
  .pw-statut-ENVOYEE   { background: rgba(16,185,129,.15);  color: #10b981; }

  /* ── Diapason selector ── */
  .diap-btns { display: flex; gap: 10px; margin-bottom: 16px; }
  .diap-btn {
    flex: 1; padding: 12px;
    border: 2px solid rgba(0,0,0,.12);
    background: #fff; cursor: pointer;
    transition: all .25s; text-align: center;
    font-family: 'DM Sans', sans-serif;
  }
  .diap-btn:hover { border-color: var(--dark); }
  .diap-btn.active { border-color: var(--red); background: rgba(230,57,70,.05); }
  .diap-btn-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1rem; letter-spacing: .08em; color: var(--dark);
    display: block; margin-bottom: 3px;
  }
  .diap-btn-sub { font-size: .7rem; color: #888; }

  /* ── Flux visual ── */
  .diap-flux-vis {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px; margin-bottom: 16px;
    background: var(--dark); color: #fff;
    font-size: .68rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .12em;
    flex-wrap: wrap;
  }
  .diap-flux-vis .node {
    background: rgba(255,255,255,.1); padding: 3px 9px;
  }
  .diap-flux-vis .node.active { background: var(--red); }
  .diap-flux-vis .arr { color: rgba(255,255,255,.4); }

  /* ── Commande preview (articles) ── */
  .cmd-preview {
    background: #f8f8f8;
    border: 1px solid rgba(0,0,0,.07);
    padding: 12px 14px;
    margin-bottom: 14px;
  }
  .cmd-preview-title {
    font-size: .62rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .15em; color: #999; margin-bottom: 8px;
  }
  .cmd-item-row {
    display: flex; align-items: center; gap: 8px;
    padding: 5px 0;
    border-bottom: 1px solid rgba(0,0,0,.05);
    font-size: .78rem;
  }
  .cmd-item-row:last-child { border-bottom: none; }
  .cmd-item-sku {
    font-family: 'Bebas Neue', sans-serif;
    font-size: .75rem; letter-spacing: .06em;
    background: var(--dark); color: #fff;
    padding: 1px 6px; flex-shrink: 0;
  }
  .cmd-item-nom { flex: 1; color: #333; }
  .cmd-item-qty {
    font-weight: 800; font-size: .82rem;
    color: var(--dark);
  }
  .cmd-item-unit { font-size: .65rem; color: #aaa; }
  .cmd-total {
    display: flex; justify-content: flex-end; margin-top: 8px;
    font-size: .72rem; font-weight: 700; color: #555;
  }

  /* ── Stock CLR indicator ── */
  .clr-stock-box {
    padding: 10px 14px; margin-bottom: 14px;
    border-left: 3px solid transparent;
    background: rgba(0,0,0,.03);
    transition: all .3s;
  }
  .clr-stock-box.green  { border-color: #10b981; background: rgba(16,185,129,.06); }
  .clr-stock-box.orange { border-color: #f59e0b; background: rgba(245,158,11,.06); }
  .clr-stock-box.red    { border-color: #ef4444; background: rgba(239,68,68,.06); }
  .clr-stock-box.grey   { border-color: #94a3b8; background: rgba(148,163,184,.06); }

  .clr-stock-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 6px;
  }
  .clr-stock-name { font-weight: 700; font-size: .82rem; }
  .clr-stock-badge {
    font-size: .6rem; font-weight: 800; text-transform: uppercase;
    letter-spacing: .12em; padding: 2px 8px;
  }
  .clr-stock-badge.green  { background: #10b981; color: #fff; }
  .clr-stock-badge.orange { background: #f59e0b; color: #fff; }
  .clr-stock-badge.red    { background: #ef4444; color: #fff; }
  .clr-stock-badge.grey   { background: #94a3b8; color: #fff; }

  .clr-stock-numbers {
    display: flex; gap: 16px; flex-wrap: wrap;
  }
  .clr-stock-kv { }
  .clr-stock-kv-label { font-size: .6rem; text-transform: uppercase; letter-spacing: .12em; color: #aaa; font-weight: 700; }
  .clr-stock-kv-val { font-size: .95rem; font-weight: 800; color: var(--dark); }

  .clr-stock-warning {
    margin-top: 8px; font-size: .72rem; font-weight: 700;
    color: #ef4444; display: flex; align-items: center; gap: 6px;
  }

  .clr-stock-loading { font-size: .73rem; color: #aaa; font-style: italic; }

  /* ── Lignes session ── */
  .lp-ligne {
    padding: 14px 16px; margin-bottom: 10px;
    background: var(--dark); color: #fff;
    border-left: 3px solid transparent;
    transition: border-color .2s;
  }
  .lp-ligne:hover { border-color: var(--red); }

  .lp-ligne-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 0;
  }
  .lp-ligne-order {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1rem; letter-spacing: .08em; flex-shrink: 0;
  }
  .lp-ligne-dest {
    flex: 1; font-size: .75rem;
    color: rgba(255,255,255,.55);
    line-height: 1.4;
  }
  .lp-ligne-badges { display: flex; gap: 6px; flex-shrink: 0; align-items: center; }
  .lp-badge-d {
    font-size: .6rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .15em; padding: 3px 8px;
    background: var(--red); color: #fff;
  }
  .lp-badge-clr {
    font-size: .6rem; font-weight: 700;
    padding: 3px 8px; background: rgba(255,255,255,.1); color: #fff;
  }
  .lp-del-btn {
    background: none; border: none; cursor: pointer;
    color: rgba(255,255,255,.25); font-size: .85rem;
    transition: color .2s; padding: 4px; flex-shrink: 0;
  }
  .lp-del-btn:hover { color: var(--red); }

  /* Produits dans la ligne (accordéon) */
  .lp-produits-toggle {
    margin-top: 8px;
    font-size: .62rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .12em; color: rgba(255,255,255,.3);
    cursor: pointer; display: flex; align-items: center; gap: 6px;
    background: none; border: none; padding: 0;
    transition: color .2s;
  }
  .lp-produits-toggle:hover { color: rgba(255,255,255,.65); }

  .lp-produits-list {
    margin-top: 8px; padding: 10px 12px;
    background: rgba(255,255,255,.04);
    border-top: 1px solid rgba(255,255,255,.07);
  }
  .lp-prod-row {
    display: flex; align-items: center; gap: 8px;
    padding: 4px 0;
    border-bottom: 1px solid rgba(255,255,255,.05);
    font-size: .73rem;
  }
  .lp-prod-row:last-child { border-bottom: none; }
  .lp-prod-sku {
    font-family: 'Bebas Neue', sans-serif; font-size: .7rem;
    letter-spacing: .05em; color: rgba(255,255,255,.4);
    min-width: 60px;
  }
  .lp-prod-nom { flex: 1; color: rgba(255,255,255,.7); }
  .lp-prod-qty { font-weight: 800; color: #fff; }
  .lp-prod-unit { font-size: .62rem; color: rgba(255,255,255,.35); }

  /* Stock badge sur ligne */
  .lp-stock-indicator {
    font-size: .6rem; font-weight: 700; padding: 2px 7px;
    text-transform: uppercase; letter-spacing: .1em;
  }
  .lp-stock-indicator.ok      { background: rgba(16,185,129,.2); color: #10b981; }
  .lp-stock-indicator.warn    { background: rgba(245,158,11,.2); color: #f59e0b; }
  .lp-stock-indicator.rupture { background: rgba(239,68,68,.2);  color: #ef4444; }

  /* ── Actions session ── */
  .session-actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }

  /* ── Résumé session ── */
  .session-resume {
    display: flex; gap: 0; margin-bottom: 20px;
    border: 1px solid rgba(0,0,0,.07);
  }
  .session-resume-kpi {
    flex: 1; padding: 12px 14px; text-align: center;
    border-right: 1px solid rgba(0,0,0,.07);
  }
  .session-resume-kpi:last-child { border-right: none; }
  .session-resume-nb {
    font-size: 1.5rem; font-weight: 800; line-height: 1;
    margin-bottom: 3px; color: var(--dark);
  }
  .session-resume-lbl {
    font-size: .6rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .15em; color: #aaa;
  }
`;

// ── Helpers ────────────────────────────────────────────────────────────────
function stockCouleur(ratio, hasActivity) {
  if (!hasActivity) return "grey";
  if (ratio < 1) return "red";
  if (ratio < 1.2) return "orange";
  return "green";
}
// ── Calculs conditionnement ──────────────────────────────────
function calcPoidsItem(item, qte) {
  const p = item.produit;
  if (!p?.poidsKg || !qte) return 0;
  // qte = nombre d'unités, poidsKg = poids par unité
  return Math.round(parseFloat(p.poidsKg) * parseFloat(qte) * 10) / 10;
}

function calcPalettesItem(item, qte) {
  const p = item.produit;
  if (!p?.qteParCarton || !p?.qteParPalette || !qte) return 0;
  const cartons = Math.ceil(parseFloat(qte) / parseFloat(p.qteParCarton));
  return Math.ceil(cartons / parseFloat(p.qteParPalette));
}

const POIDS_CAMION_KG = 24000;
const FAMILLE_COLOR = {
  HUILE: "#f59e0b",
  MARGARINE: "#ec4899",
  SUCRE: "#8b5cf6",
  SMEN: "#f97316",
  CHOCOLAT: "#ef4444",
  SAUCE: "#22c55e",
  EAU: "#3b82f6",
  MIEL: "#eab308",
  CONFITURE: "#d946ef",
  BOISSON: "#10b981",
  AUTRE: "#6b7280",
};
// ── StockCLRBox ─────────────────────────────────────────────────────────────
// Fait sa propre requête — aucun state externe nécessaire
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
    return <div className="clr-stock-loading">Chargement stock CLR…</div>;
  if (!data) return null;

  const stock = data.stockActuelCLR || 0;
  const ratio = commandeQte > 0 ? stock / commandeQte : stock > 0 ? 2 : 0;
  const couleur = stockCouleur(ratio, stock > 0 || commandeQte > 0);
  const manque = commandeQte > 0 ? commandeQte - stock : 0;

  return (
    <div className={`clr-stock-box ${couleur}`}>
      <div className="clr-stock-header">
        <div className="clr-stock-name">
          Stock {data.clr.code} — {data.clr.nom}
        </div>
        <span className={`clr-stock-badge ${couleur}`}>
          {couleur === "green"
            ? "✓ SUFFISANT"
            : couleur === "orange"
              ? "⚠ FAIBLE"
              : couleur === "red"
                ? "✗ RUPTURE"
                : "— INACTIF"}
        </span>
      </div>
      <div className="clr-stock-numbers">
        <div className="clr-stock-kv">
          <div className="clr-stock-kv-label">Stock actuel</div>
          <div className="clr-stock-kv-val">{stock.toLocaleString()} u</div>
        </div>
        {commandeQte > 0 && (
          <>
            <div className="clr-stock-kv">
              <div className="clr-stock-kv-label">Commande</div>
              <div className="clr-stock-kv-val">
                {commandeQte.toLocaleString()} u
              </div>
            </div>
            <div className="clr-stock-kv">
              <div className="clr-stock-kv-label">Écart</div>
              <div
                className="clr-stock-kv-val"
                style={{ color: manque > 0 ? "#ef4444" : "#10b981" }}
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
          <div className="clr-stock-kv">
            <div className="clr-stock-kv-label">Plateforme</div>
            <div className="clr-stock-kv-val">
              {data.stockPlateforme.toLocaleString()} u
            </div>
          </div>
        )}
      </div>

      {/* ── NOUVEAU : tableau croisé par produit ── */}
      {data.stockParProduit?.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              fontSize: ".6rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".12em",
              color: "#888",
              marginBottom: 8,
            }}
          >
            COUVERTURE PAR PRODUIT
          </div>
          {/* Résumé feux */}
          {data.resumeCouverture && (
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {[
                {
                  lbl: "Couverts",
                  nb: data.resumeCouverture.couverts,
                  color: "#10b981",
                },
                {
                  lbl: "Partiels",
                  nb: data.resumeCouverture.partiels,
                  color: "#f59e0b",
                },
                {
                  lbl: "Manquants",
                  nb: data.resumeCouverture.impossibles,
                  color: "#ef4444",
                },
              ].map((r) => (
                <div
                  key={r.lbl}
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    textAlign: "center",
                    background: "rgba(0,0,0,.04)",
                    borderTop: `3px solid ${r.color}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: r.color,
                    }}
                  >
                    {r.nb}
                  </div>
                  <div
                    style={{
                      fontSize: ".58rem",
                      textTransform: "uppercase",
                      letterSpacing: ".1em",
                      color: "#999",
                    }}
                  >
                    {r.lbl}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Tableau produits */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: ".74rem",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(0,0,0,.08)" }}>
                {["", "SKU", "Produit", "Demandé", "Dispo", "Couverture"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "5px 8px",
                        textAlign: "left",
                        fontSize: ".58rem",
                        textTransform: "uppercase",
                        letterSpacing: ".1em",
                        color: "#999",
                        fontWeight: 700,
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {data.stockParProduit.map((p, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: "1px solid rgba(0,0,0,.05)" }}
                >
                  <td style={{ padding: "6px 8px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background:
                          p.feu === "VERT"
                            ? "#10b981"
                            : p.feu === "ORANGE"
                              ? "#f59e0b"
                              : "#ef4444",
                      }}
                    ></span>
                  </td>
                  <td
                    style={{
                      padding: "6px 8px",
                      fontFamily: "monospace",
                      fontSize: ".68rem",
                      color: "#666",
                    }}
                  >
                    {p.sku}
                  </td>
                  <td
                    style={{
                      padding: "6px 8px",
                      fontWeight: 600,
                      maxWidth: 140,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.nom}
                  </td>
                  <td style={{ padding: "6px 8px" }}>{p.demande} u</td>
                  <td
                    style={{
                      padding: "6px 8px",
                      color: p.dispo >= p.demande ? "#10b981" : "#ef4444",
                      fontWeight: 700,
                    }}
                  >
                    {p.dispo} u
                  </td>
                  <td style={{ padding: "6px 8px", minWidth: 80 }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: 4,
                          background: "rgba(0,0,0,.08)",
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
                                ? "#10b981"
                                : p.feu === "ORANGE"
                                  ? "#f59e0b"
                                  : "#ef4444",
                          }}
                        ></div>
                      </div>
                      <span
                        style={{
                          fontSize: ".62rem",
                          fontWeight: 700,
                          color: "#666",
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
        <div className="clr-stock-warning">
          ⚠ Stock global insuffisant — manque {manque.toLocaleString()} u
        </div>
      )}
    </div>
  );
}
// ── CommandePreview ──────────────────────────────────────────────────────────
// Affiche les articles d'une commande sélectionnée dans le formulaire
function CommandePreview({ ordre, itemsSelectionnes, onItemsChange }) {
  if (!ordre) return null;
  const items = ordre.OrderItems || [];
  if (!items.length) return null;

  const toggleItem = (itemId) => {
    const next = { ...itemsSelectionnes };
    if (next[itemId] !== undefined) {
      delete next[itemId];
    } else {
      const item = items.find((i) => i.id === itemId);
      next[itemId] = item?.quantity || 0;
    }
    onItemsChange(next);
  };

  const updateQte = (itemId, val) => {
    const item = items.find((i) => i.id === itemId);
    const max = item?.quantity || 0;
    const qte = Math.min(max, Math.max(0, parseFloat(val) || 0));
    onItemsChange({ ...itemsSelectionnes, [itemId]: qte });
  };

  // Calculs globaux
  const itemsActifs = items.filter(
    (i) => itemsSelectionnes[i.id] !== undefined,
  );
  const poidsTotal = itemsActifs.reduce((sum, item) => {
    const qte = itemsSelectionnes[item.id] || 0;
    return sum + (calcPoidsItem(item, qte) || 0);
  }, 0);
  const palettesTotal = itemsActifs.reduce((sum, item) => {
    const qte = itemsSelectionnes[item.id] || 0;
    return sum + (calcPalettesItem(item, qte) || 0);
  }, 0);
  const tauxRemplissage = Math.min(
    100,
    Math.round((poidsTotal / POIDS_CAMION_KG) * 100),
  );
  const remplissageCouleur =
    tauxRemplissage >= 85
      ? "#10b981"
      : tauxRemplissage >= 50
        ? "#f59e0b"
        : "#ef4444";

  return (
    <div className="cmd-preview">
      <div className="cmd-preview-title">
        <i className="fas fa-box-open" style={{ marginRight: 5 }}></i>
        {ordre.orderNumber} — Sélectionnez les articles à planifier
        <span style={{ marginLeft: 8, color: "#10b981" }}>
          ({itemsActifs.length}/{items.length} sélectionnés)
        </span>
      </div>

      {/* Sélectionner tout / aucun */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button
          className="ds-btn ds-btn-outline"
          style={{ fontSize: ".68rem", padding: "4px 10px" }}
          onClick={() => {
            const all = {};
            items.forEach((i) => {
              all[i.id] = i.quantity || 0;
            });
            onItemsChange(all);
          }}
        >
          Tout sélectionner
        </button>
        <button
          className="ds-btn ds-btn-outline"
          style={{ fontSize: ".68rem", padding: "4px 10px" }}
          onClick={() => onItemsChange({})}
        >
          Tout désélectionner
        </button>
      </div>

      {/* Liste articles */}
      {items.map((item) => {
        console.log("item:", item.sku, "produit:", item.produit); // ← temporaire

        const selected = itemsSelectionnes[item.id] !== undefined;
        const qte = itemsSelectionnes[item.id] ?? item.quantity;
        const poids = calcPoidsItem(item, qte);
        const palettes = calcPalettesItem(item, qte);
        const famColor = FAMILLE_COLOR[item.produit?.famille] || "#6b7280";

        return (
          <div
            key={item.id}
            style={{
              display: "grid",
              gridTemplateColumns: "20px 1fr auto",
              gap: 10,
              alignItems: "center",
              padding: "8px 0",
              borderBottom: "1px solid rgba(0,0,0,.05)",
              opacity: selected ? 1 : 0.45,
            }}
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={selected}
              onChange={() => toggleItem(item.id)}
              style={{ cursor: "pointer", width: 16, height: 16 }}
            />

            {/* Info produit */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 3,
                }}
              >
                {item.sku && (
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: ".68rem",
                      background: "var(--dark)",
                      color: "#fff",
                      padding: "1px 5px",
                      flexShrink: 0,
                    }}
                  >
                    {item.sku}
                  </span>
                )}
                <span
                  style={{
                    fontSize: ".62rem",
                    padding: "1px 6px",
                    borderRadius: 20,
                    background: `${famColor}22`,
                    color: famColor,
                    fontWeight: 700,
                  }}
                >
                  {item.produit?.famille || "—"}
                </span>
                <span
                  style={{ fontSize: ".78rem", fontWeight: 600, color: "#333" }}
                >
                  {item.productName}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  fontSize: ".68rem",
                  color: "#999",
                }}
              >
                {poids !== null && <span>⚖ {poids} kg</span>}
                {palettes !== null && <span>📦 {palettes} plt</span>}
                {item.produit?.qteParCarton && (
                  <span>{item.produit.qteParCarton} u/ctn</span>
                )}
              </div>
            </div>

            {/* Quantité modifiable */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 2,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  type="number"
                  min="0"
                  max={item.quantity}
                  value={selected ? qte : item.quantity}
                  disabled={!selected}
                  onChange={(e) => updateQte(item.id, e.target.value)}
                  style={{
                    width: 70,
                    textAlign: "right",
                    border: "1px solid rgba(0,0,0,.15)",
                    padding: "4px 6px",
                    fontSize: ".78rem",
                    fontWeight: 700,
                    background: selected ? "#fff" : "#f5f5f5",
                  }}
                />
                <span style={{ fontSize: ".65rem", color: "#aaa" }}>
                  /{item.quantity} u
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* ── Indicateur remplissage camion ── */}
      {itemsActifs.length > 0 && (
        <div
          style={{
            marginTop: 14,
            padding: "12px 14px",
            background: "var(--dark)",
            color: "#fff",
          }}
        >
          <div
            style={{
              fontSize: ".62rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".15em",
              color: "rgba(255,255,255,.4)",
              marginBottom: 10,
            }}
          >
            CHARGEMENT ESTIMÉ
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              marginBottom: 12,
            }}
          >
            {[
              { lbl: "Poids total", val: `${poidsTotal.toLocaleString()} kg` },
              { lbl: "Palettes", val: `${palettesTotal} plt` },
              {
                lbl: "Camions 24T",
                val: Math.ceil(poidsTotal / POIDS_CAMION_KG) || "—",
              },
            ].map((s) => (
              <div key={s.lbl} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: remplissageCouleur,
                  }}
                >
                  {s.val}
                </div>
                <div
                  style={{
                    fontSize: ".58rem",
                    textTransform: "uppercase",
                    letterSpacing: ".12em",
                    color: "rgba(255,255,255,.35)",
                  }}
                >
                  {s.lbl}
                </div>
              </div>
            ))}
          </div>
          {/* Barre remplissage */}
          <div
            style={{
              fontSize: ".6rem",
              color: "rgba(255,255,255,.4)",
              marginBottom: 4,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Taux remplissage camion</span>
            <span style={{ color: remplissageCouleur, fontWeight: 700 }}>
              {tauxRemplissage}%
            </span>
          </div>
          <div
            style={{
              height: 6,
              background: "rgba(255,255,255,.1)",
              borderRadius: 3,
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 3,
                width: `${tauxRemplissage}%`,
                background: remplissageCouleur,
                transition: "width .4s ease",
              }}
            />
          </div>
          {tauxRemplissage < 50 && (
            <div style={{ marginTop: 8, fontSize: ".68rem", color: "#f59e0b" }}>
              ⚠ Chargement partiel — envisager de regrouper avec d'autres
              commandes
            </div>
          )}
          {tauxRemplissage >= 85 && (
            <div style={{ marginTop: 8, fontSize: ".68rem", color: "#10b981" }}>
              ✓ Chargement optimal
            </div>
          )}
        </div>
      )}
    </div>
  );
}
// ── LignePlanifCard ──────────────────────────────────────────────────────────
// Ligne de session avec accordéon produits et badge stock
function LignePlanifCard({ ligne, peutSupprimer, onDelete }) {
  const [open, setOpen] = useState(false);
  const items = ligne.order?.OrderItems || [];
  const total = items.reduce((s, i) => s + (i.quantity || 0), 0);
  const niv = ligne.clrStockNiveau; // injecté par le backend si disponible

  return (
    <div className="lp-ligne">
      <div className="lp-ligne-header">
        <span className="lp-ligne-order">{ligne.order?.orderNumber}</span>
        <div className="lp-ligne-dest">
          {ligne.plateforme && (
            <span>
              <i
                className="fas fa-warehouse"
                style={{ marginRight: 4, opacity: 0.6 }}
              ></i>
              {ligne.plateforme.nom} →{" "}
            </span>
          )}
          <i
            className="fas fa-map-pin"
            style={{ marginRight: 4, opacity: 0.6 }}
          ></i>
          {ligne.clr?.code} — {ligne.clr?.nom}
          {ligne.clr?.wilaya && (
            <span style={{ opacity: 0.4 }}> ({ligne.clr.wilaya})</span>
          )}
        </div>
        <div className="lp-ligne-badges">
          <span className="lp-badge-d">{ligne.diapason}</span>
          {niv && (
            <span
              className={`lp-stock-indicator ${
                niv === "VERT" ? "ok" : niv === "ORANGE" ? "warn" : "rupture"
              }`}
            >
              {niv === "VERT"
                ? "STOCK OK"
                : niv === "ORANGE"
                  ? "STOCK FAIBLE"
                  : "RUPTURE"}
            </span>
          )}
        </div>
        {peutSupprimer && (
          <button className="lp-del-btn" onClick={onDelete}>
            <i className="fas fa-trash"></i>
          </button>
        )}
      </div>
      {(() => {
        // Utiliser itemsJson si disponible, sinon fallback sur OrderItems
        const itemsJson = ligne.itemsJson;
        const itemsPlanifies =
          itemsJson?.length > 0
            ? itemsJson.map((ij) => {
                const original = items.find((i) => i.id === ij.orderItemId);
                return {
                  sku: original?.sku || "—",
                  productName:
                    original?.productName || `Article #${ij.orderItemId}`,
                  quantity: ij.quantitePlanifiee,
                  quantiteOriginale: original?.quantity,
                  unit: original?.unit || "u",
                  partiel: original && ij.quantitePlanifiee < original.quantity,
                };
              })
            : items.map((i) => ({ ...i, partiel: false }));

        const totalPlanifie = itemsPlanifies.reduce(
          (s, i) => s + (i.quantity || 0),
          0,
        );

        if (!itemsPlanifies.length) return null;
        return (
          <>
            <button
              className="lp-produits-toggle"
              onClick={() => setOpen(!open)}
            >
              <i className={`fas fa-chevron-${open ? "up" : "down"}`}></i>
              {itemsPlanifies.length} produit(s) ·{" "}
              {totalPlanifie.toLocaleString()} u
              {itemsJson?.length > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: ".58rem",
                    color: "rgba(255,255,255,.4)",
                  }}
                >
                  SÉLECTION PLANIF
                </span>
              )}
            </button>
            {open && (
              <div className="lp-produits-list">
                {itemsPlanifies.map((item, i) => (
                  <div key={i} className="lp-prod-row">
                    {item.sku && (
                      <span className="lp-prod-sku">{item.sku}</span>
                    )}
                    <span className="lp-prod-nom">{item.productName}</span>
                    <span className="lp-prod-qty">
                      {(item.quantity || 0).toLocaleString()}
                    </span>
                    <span className="lp-prod-unit">{item.unit || "u"}</span>
                    {item.partiel && (
                      <span
                        style={{
                          fontSize: ".58rem",
                          padding: "1px 6px",
                          background: "rgba(245,158,11,.2)",
                          color: "#f59e0b",
                          fontWeight: 700,
                          marginLeft: 4,
                        }}
                      >
                        PARTIEL /{item.quantiteOriginale}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════
export default function PlanifWorkflow() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelected] = useState(null);
  const [loadingSessions, setLoadingS] = useState(true);
  const [commandesDispo, setCommandesDispo] = useState([]);
  const [plateformes, setPlateformes] = useState([]);
  const [clrs, setClrs] = useState([]);

  const [showNew, setShowNew] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [creatingSess, setCreatingSess] = useState(false);

  const [showAddLigne, setShowAddLigne] = useState(false);
  const [suggIA, setSuggIA] = useState(null);
  const [suggIALoading, setSuggIALoading] = useState(false);
  const [itemsSelectionnes, setItemsSelectionnes] = useState({});
  const [ligneForm, setLigneForm] = useState({
    orderId: "",
    diapason: "D1",
    plateformeId: "",
    clrId: "",
    clrSourceId: "",
    notes: "",
  });
  const [addingLigne, setAddingLigne] = useState(false);
  const [actioning, setActioning] = useState(false);

  // Commande sélectionnée (pour prévisualisation et calcul qte)
  const selectedOrdre = commandesDispo.find(
    (o) => String(o.id) === String(ligneForm.orderId),
  );
  const commandeQte = (selectedOrdre?.OrderItems || []).reduce(
    (s, i) => s + (i.quantity || 0),
    0,
  );

  // ── Init ──────────────────────────────────────────────────────
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
  }, []);

  useEffect(() => {
    if (selectedSession?.statut === "BROUILLON") fetchCommandesDispo();
  }, [selectedSession]);

  useEffect(() => {
    if (!ligneForm.clrId || !ligneForm.orderId) {
      setSuggIA(null);
      return;
    }
    setSuggIALoading(true);
    api
      .get(
        `/modules/planning-intel/suggestion-diapason/${ligneForm.clrId}?orderId=${ligneForm.orderId}`,
      )
      .then(({ data }) => setSuggIA(data))
      .catch(() => setSuggIA(null))
      .finally(() => setSuggIALoading(false));
  }, [ligneForm.clrId, ligneForm.orderId]);

  // ── fetchSessions — prend l'id courant en param pour éviter stale closure ──
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

  // ── Créer session ──────────────────────────────────────────────
  const createSession = async () => {
    if (!newDate) return alert("Date requise");
    setCreatingSess(true);
    try {
      const { data } = await api.post("/planification/sessions", {
        date: newDate,
        notes: newNotes,
      });
      // Passer l'id fraîchement créé pour sélection immédiate
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

  const addLigne = async () => {
    if (!ligneForm.orderId || !ligneForm.clrId)
      return alert("Commande et CLR requis");
    if (ligneForm.diapason === "D1" && !ligneForm.plateformeId)
      return alert("Plateforme requise pour D1");
    if (Object.keys(itemsSelectionnes).length === 0)
      return alert("Sélectionnez au moins un article");

    setAddingLigne(true);
    try {
      const itemsPayload = Object.entries(itemsSelectionnes).map(
        ([itemId, qte]) => ({
          orderItemId: parseInt(itemId),
          quantitePlanifiee: qte,
        }),
      );
      console.log("itemsPayload:", itemsPayload);
      console.log("itemsSelectionnes state:", itemsSelectionnes);
      await api.post(`/planification/sessions/${selectedSession.id}/lignes`, {
        orderId: parseInt(ligneForm.orderId),
        diapason: ligneForm.diapason,
        plateformeId: ["D1", "D4", "D5"].includes(ligneForm.diapason)
          ? parseInt(ligneForm.plateformeId)
          : null,
        clrId: ligneForm.diapason !== "D4" ? parseInt(ligneForm.clrId) : null,
        clrSourceId: ["D3", "D5"].includes(ligneForm.diapason)
          ? parseInt(ligneForm.clrSourceId)
          : null,
        notes: ligneForm.notes,
        itemsSelectionnes: itemsPayload,
      });

      await fetchSessions(selectedSession.id);
      await fetchCommandesDispo();
      setLigneForm({
        orderId: "",
        diapason: "D1",
        plateformeId: "",
        clrId: "",
        clrSourceId: "",
        notes: "",
      });
      setItemsSelectionnes({}); // ← reset
      setShowAddLigne(false);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally {
      setAddingLigne(false);
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

  // Fix NaN-safe : on vérifie d'abord que plateformeId est défini et non vide
  const clrsFiltres =
    ligneForm.diapason === "D2" || ligneForm.diapason === "D3"
      ? clrs
      : ligneForm.plateformeId
        ? clrs.filter(
            (c) => c.plateformeId === parseInt(ligneForm.plateformeId),
          )
        : [];
  // Résumé session sélectionnée
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
  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div className="ds-page">
      <style dangerouslySetInnerHTML={{ __html: DS_STYLE + EXTRA }} />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      {/* Header */}
      <div className="ds-header">
        <div className="ds-header-eyebrow">
          <span>Workflow Réel</span>
        </div>
        <h1 className="ds-title">
          PLANIFI<span>CATION</span>
        </h1>
        <p className="ds-subtitle">
          Sessions de planification — D1 / D2 — détail produits — stock CLR live
        </p>
      </div>

      <div className="pw-layout">
        {/* ── COLONNE GAUCHE : sessions ── */}
        <div>
          <div className="ds-panel">
            <div className="ds-panel-head">
              <span className="ds-panel-title">Sessions</span>
              <button
                className="ds-btn ds-btn-dark"
                style={{ padding: "8px 14px" }}
                onClick={() => setShowNew(true)}
              >
                <i className="fas fa-plus"></i> Nouvelle
              </button>
            </div>

            {showNew && (
              <div
                style={{
                  padding: "18px 20px",
                  borderBottom: "1px solid rgba(0,0,0,.07)",
                  background: "#fafafa",
                }}
              >
                <div className="ds-field">
                  <label className="ds-field-label">Date de livraison *</label>
                  <input
                    type="date"
                    className="ds-input"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <div className="ds-field">
                  <label className="ds-field-label">Notes</label>
                  <input
                    className="ds-input"
                    placeholder="Optionnel…"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="ds-btn ds-btn-dark"
                    onClick={createSession}
                    disabled={creatingSess}
                  >
                    {creatingSess ? "Création…" : "Créer"}
                  </button>
                  <button
                    className="ds-btn ds-btn-outline"
                    onClick={() => setShowNew(false)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            <div style={{ padding: "14px" }}>
              {loadingSessions ? (
                <div className="ds-loading">Chargement</div>
              ) : sessions.length === 0 ? (
                <div className="ds-empty">
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
                  return (
                    <div
                      key={s.id}
                      className={`pw-session-card ${
                        selectedSession?.id === s.id ? "selected" : ""
                      }`}
                      onClick={() => setSelected(s)}
                    >
                      <div className="pw-session-meta">
                        <span className="pw-session-date">
                          <i
                            className="fas fa-calendar-alt"
                            style={{
                              color: "var(--red)",
                              marginRight: 7,
                              fontSize: ".72rem",
                            }}
                          ></i>
                          {s.date}
                        </span>
                        <span className={`pw-statut pw-statut-${s.statut}`}>
                          {s.statut}
                        </span>
                      </div>
                      <div className="pw-session-nb">
                        {s.lignes?.length || 0} ligne(s)
                        {lTotal > 0 && (
                          <span style={{ marginLeft: 8, opacity: 0.5 }}>
                            · {lTotal.toLocaleString()} u
                          </span>
                        )}
                        {s.createur && (
                          <span style={{ marginLeft: 8 }}>
                            · {s.createur.email?.split("@")[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── COLONNE DROITE : détail session ── */}
        <div>
          {!selectedSession ? (
            <div className="ds-panel">
              <div className="ds-empty">
                <i className="fas fa-hand-pointer"></i>
                <p>Sélectionnez une session</p>
              </div>
            </div>
          ) : (
            <div className="ds-panel">
              <div className="ds-panel-head">
                <div>
                  <span className="ds-panel-title">
                    Session du {selectedSession.date}
                  </span>
                  <div style={{ marginTop: 4 }}>
                    <span
                      className={`pw-statut pw-statut-${selectedSession.statut}`}
                    >
                      {selectedSession.statut}
                    </span>
                  </div>
                </div>
                {selectedSession.statut === "BROUILLON" && (
                  <button
                    className="ds-btn ds-btn-dark"
                    style={{ padding: "8px 14px" }}
                    onClick={() => setShowAddLigne(true)}
                  >
                    <i className="fas fa-plus"></i> Ajouter ligne
                  </button>
                )}
              </div>

              {/* Résumé KPI session */}

              {lignes.length > 0 && (
                <div className="session-resume">
                  {[
                    { nb: lignes.length, lbl: "Lignes" },
                    { nb: totalProd.toLocaleString(), lbl: "Unités total" },
                    { nb: nbD1, lbl: "Via PLF (D1)" },
                    { nb: nbD2, lbl: "Direct (D2)" },
                    { nb: nbD3, lbl: "Transfert (D3)" },
                    { nb: nbAutres, lbl: "D4/D5" },
                  ].map((k) => (
                    <div key={k.lbl} className="session-resume-kpi">
                      <div className="session-resume-nb">{k.nb}</div>
                      <div className="session-resume-lbl">{k.lbl}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Formulaire ajout ligne ── */}
              {showAddLigne && selectedSession.statut === "BROUILLON" && (
                <div
                  style={{
                    padding: "18px 22px",
                    borderBottom: "1px solid rgba(0,0,0,.07)",
                    background: "#fafafa",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "1rem",
                      letterSpacing: ".1em",
                      marginBottom: 16,
                      color: "var(--dark)",
                    }}
                  >
                    NOUVELLE LIGNE DE PLANIFICATION
                  </div>
                  {/* Commande */}
                  <div className="ds-field">
                    <label className="ds-field-label">Commande *</label>
                    <select
                      className="ds-input"
                      value={ligneForm.orderId}
                      onChange={(e) => {
                        setLigneForm({ ...ligneForm, orderId: e.target.value });
                        // Pré-sélectionner tous les articles avec leur quantité max
                        const ordre = commandesDispo.find(
                          (o) => String(o.id) === String(e.target.value),
                        );
                        if (ordre) {
                          const all = {};
                          (ordre.OrderItems || []).forEach((i) => {
                            all[i.id] = i.quantity || 0;
                          });
                          setItemsSelectionnes(all);
                        } else {
                          setItemsSelectionnes({});
                        }
                      }}
                    >
                      <option value="">— Sélectionner une commande —</option>
                      {commandesDispo.map((o) => {
                        const qte = (o.OrderItems || []).reduce(
                          (s, i) => s + (i.quantity || 0),
                          0,
                        );
                        return (
                          <option key={o.id} value={o.id}>
                            {o.orderNumber} — {o.date} — {qte} u (
                            {o.OrderItems?.length || 0} articles)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  {/* Preview commande sélectionnée */}
                  {selectedOrdre && (
                    <CommandePreview
                      ordre={selectedOrdre}
                      itemsSelectionnes={itemsSelectionnes}
                      onItemsChange={setItemsSelectionnes}
                    />
                  )}{" "}
                  {/* Diapason */}
                  <div className="ds-field">
                    <label className="ds-field-label">
                      Mode de distribution *
                    </label>
                    <div className="diap-btns" style={{ flexWrap: "wrap" }}>
                      {[
                        { d: "D1", sub: "Via Plateforme → CLR" },
                        { d: "D2", sub: "Direct Usine → CLR" },
                        { d: "D3", sub: "Transfert CLR → CLR" },
                        { d: "D4", sub: "Usine → Plateforme" },
                        { d: "D5", sub: "Retour CLR → PLF" },
                      ].map(({ d, sub }) => (
                        <div
                          key={d}
                          className={`diap-btn ${ligneForm.diapason === d ? "active" : ""}`}
                          onClick={() =>
                            setLigneForm({
                              ...ligneForm,
                              diapason: d,
                              plateformeId: "",
                              clrId: "",
                              clrSourceId: "",
                            })
                          }
                          style={{ minWidth: 110 }}
                        >
                          <span className="diap-btn-title">Diapason {d}</span>
                          <span className="diap-btn-sub">{sub}</span>
                        </div>
                      ))}
                    </div>
                    <div className="diap-flux-vis">
                      {ligneForm.diapason === "D1" && (
                        <>
                          <span className="node active">Usine</span>
                          <span className="arr">→</span>
                          <span className="node active">Plateforme</span>
                          <span className="arr">→</span>
                          <span className="node active">CLR</span>
                        </>
                      )}
                      {ligneForm.diapason === "D2" && (
                        <>
                          <span className="node active">Usine</span>
                          <span className="arr">→</span>
                          <span className="node" style={{ opacity: 0.3 }}>
                            Plateforme
                          </span>
                          <span className="arr" style={{ opacity: 0.3 }}>
                            →
                          </span>
                          <span className="node active">CLR</span>
                        </>
                      )}
                      {ligneForm.diapason === "D3" && (
                        <>
                          <span className="node active">CLR source</span>
                          <span className="arr">→</span>
                          <span className="node active">CLR dest.</span>
                        </>
                      )}
                      {ligneForm.diapason === "D4" && (
                        <>
                          <span className="node active">Usine</span>
                          <span className="arr">→</span>
                          <span className="node active">Plateforme</span>
                        </>
                      )}
                      {ligneForm.diapason === "D5" && (
                        <>
                          <span className="node active">CLR</span>
                          <span className="arr">→</span>
                          <span className="node active">Plateforme</span>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Plateforme — D1, D4, D5 */}
                  {["D1", "D4", "D5"].includes(ligneForm.diapason) && (
                    <div className="ds-field">
                      <label className="ds-field-label">Plateforme *</label>
                      <select
                        className="ds-input"
                        value={ligneForm.plateformeId}
                        onChange={(e) =>
                          setLigneForm({
                            ...ligneForm,
                            plateformeId: e.target.value,
                            clrId: "",
                          })
                        }
                      >
                        <option value="">— Sélectionner —</option>
                        {plateformes.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nom} ({p.ville}) — {p.capacite?.toLocaleString()}{" "}
                            palettes
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {/* CLR source — D3 et D5 */}
                  {["D3", "D5"].includes(ligneForm.diapason) && (
                    <div className="ds-field">
                      <label className="ds-field-label">CLR expéditeur *</label>
                      <select
                        className="ds-input"
                        value={ligneForm.clrSourceId || ""}
                        onChange={(e) =>
                          setLigneForm({
                            ...ligneForm,
                            clrSourceId: e.target.value,
                          })
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
                  {/* CLR destination — pas D4 */}
                  {ligneForm.diapason !== "D4" && (
                    <div className="ds-field">
                      <label className="ds-field-label">
                        CLR de destination *
                      </label>
                      <select
                        className="ds-input"
                        value={ligneForm.clrId}
                        onChange={(e) =>
                          setLigneForm({ ...ligneForm, clrId: e.target.value })
                        }
                        disabled={
                          ligneForm.diapason === "D1" && !ligneForm.plateformeId
                        }
                      >
                        <option value="">
                          {ligneForm.diapason === "D1" &&
                          !ligneForm.plateformeId
                            ? "— Choisissez d'abord une plateforme —"
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
                  {/* Stock CLR live — le composant gère sa propre requête */}
                  {/* ── Suggestion IA + Stock CLR live ── */}
                  {ligneForm.clrId && ligneForm.orderId && (
                    <div style={{ marginBottom: 14 }}>
                      {suggIALoading ? (
                        <div className="clr-stock-loading">
                          Analyse IA en cours…
                        </div>
                      ) : suggIA ? (
                        <>
                          {/* Bandeau recommandation diapason */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              padding: "10px 14px",
                              marginBottom: 10,
                              background: "rgba(230,57,70,.05)",
                              borderLeft: "3px solid var(--red)",
                            }}
                          >
                            <i
                              className="fas fa-lightbulb"
                              style={{
                                color: "var(--red)",
                                fontSize: "1rem",
                                flexShrink: 0,
                              }}
                            ></i>
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontSize: ".68rem",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  letterSpacing: ".12em",
                                  color: "#999",
                                  marginBottom: 2,
                                }}
                              >
                                SUGGESTION IA
                              </div>
                              <div
                                style={{
                                  fontSize: ".82rem",
                                  fontWeight: 700,
                                  color: "var(--dark)",
                                }}
                              >
                                Diapason {suggIA.suggestion} recommandé
                                <span
                                  style={{
                                    marginLeft: 8,
                                    fontSize: ".7rem",
                                    fontWeight: 400,
                                    color: "#888",
                                  }}
                                >
                                  (confiance {suggIA.score}%)
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: ".73rem",
                                  color: "#666",
                                  marginTop: 2,
                                }}
                              >
                                {suggIA.raison}
                              </div>
                            </div>
                            <button
                              className="ds-btn ds-btn-outline"
                              style={{
                                fontSize: ".68rem",
                                padding: "5px 10px",
                                flexShrink: 0,
                              }}
                              onClick={() =>
                                setLigneForm({
                                  ...ligneForm,
                                  diapason: suggIA.suggestion,
                                })
                              }
                            >
                              Appliquer
                            </button>
                          </div>

                          {/* Alerte rupture si stock insuffisant */}
                          {suggIA.resumeCouverture &&
                            suggIA.resumeCouverture.impossibles > 0 && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  padding: "8px 14px",
                                  marginBottom: 10,
                                  background: "rgba(239,68,68,.07)",
                                  borderLeft: "3px solid #ef4444",
                                }}
                              >
                                <i
                                  className="fas fa-exclamation-triangle"
                                  style={{ color: "#ef4444", flexShrink: 0 }}
                                ></i>
                                <div
                                  style={{
                                    fontSize: ".75rem",
                                    color: "#ef4444",
                                    fontWeight: 600,
                                  }}
                                >
                                  {suggIA.resumeCouverture.impossibles}{" "}
                                  produit(s) en rupture au CLR {suggIA.clr.code}{" "}
                                  — stock insuffisant pour couvrir cette
                                  commande
                                </div>
                              </div>
                            )}

                          {/* Résumé couverture produits */}
                          {suggIA.resumeCouverture && (
                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                marginBottom: 10,
                              }}
                            >
                              {[
                                {
                                  lbl: "Couverts",
                                  nb: suggIA.resumeCouverture.couverts,
                                  color: "#10b981",
                                },
                                {
                                  lbl: "Partiels",
                                  nb: suggIA.resumeCouverture.partiels,
                                  color: "#f59e0b",
                                },
                                {
                                  lbl: "Rupture",
                                  nb: suggIA.resumeCouverture.impossibles,
                                  color: "#ef4444",
                                },
                              ].map((r) => (
                                <div
                                  key={r.lbl}
                                  style={{
                                    flex: 1,
                                    padding: "6px 8px",
                                    textAlign: "center",
                                    background: "rgba(0,0,0,.03)",
                                    borderTop: `3px solid ${r.color}`,
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: "1.1rem",
                                      fontWeight: 800,
                                      color: r.color,
                                    }}
                                  >
                                    {r.nb}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: ".58rem",
                                      textTransform: "uppercase",
                                      letterSpacing: ".1em",
                                      color: "#999",
                                    }}
                                  >
                                    {r.lbl}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : null}

                      {/* Stock CLR live — inchangé */}
                      {ligneForm.clrId && (
                        <StockCLRBox
                          clrId={ligneForm.clrId}
                          commandeQte={commandeQte}
                          orderId={
                            ligneForm.orderId
                              ? parseInt(ligneForm.orderId)
                              : null
                          }
                        />
                      )}
                    </div>
                  )}
                  <div className="ds-field">
                    <label className="ds-field-label">Notes</label>
                    <input
                      className="ds-input"
                      placeholder="Optionnel…"
                      value={ligneForm.notes}
                      onChange={(e) =>
                        setLigneForm({ ...ligneForm, notes: e.target.value })
                      }
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="ds-btn ds-btn-dark"
                      onClick={addLigne}
                      disabled={addingLigne}
                    >
                      {addingLigne ? (
                        "Ajout…"
                      ) : (
                        <>
                          <i className="fas fa-plus"></i> Ajouter la ligne
                        </>
                      )}
                    </button>
                    <button
                      className="ds-btn ds-btn-outline"
                      onClick={() => setShowAddLigne(false)}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* ── Lignes de la session ── */}
              <div style={{ padding: "16px 18px" }}>
                {lignes.length === 0 ? (
                  <div className="ds-empty" style={{ padding: 32 }}>
                    <i className="fas fa-list"></i>
                    <p>Aucune ligne — ajoutez des commandes à planifier</p>
                  </div>
                ) : (
                  lignes.map((ligne) => (
                    <LignePlanifCard
                      key={ligne.id}
                      ligne={ligne}
                      peutSupprimer={selectedSession.statut === "BROUILLON"}
                      onDelete={() => deleteLigne(ligne.id)}
                    />
                  ))
                )}
              </div>

              {/* ── Actions session ── */}
              <div style={{ padding: "0 18px 18px" }}>
                <div className="session-actions">
                  {selectedSession.statut === "BROUILLON" && (
                    <button
                      className="ds-btn ds-btn-dark"
                      onClick={() => actionSession("valider")}
                      disabled={actioning || lignes.length === 0}
                    >
                      <i className="fas fa-check"></i> Valider la session
                    </button>
                  )}
                  {selectedSession.statut === "VALIDEE" && (
                    <button
                      className="ds-btn ds-btn-red"
                      onClick={() => actionSession("envoyer")}
                      disabled={actioning}
                    >
                      <i className="fas fa-paper-plane"></i> Envoyer au
                      Transport
                    </button>
                  )}
                  {selectedSession.statut === "ENVOYEE" && (
                    <div
                      style={{
                        fontSize: ".8rem",
                        color: "#10b981",
                        fontWeight: 700,
                        padding: "10px 0",
                      }}
                    >
                      <i
                        className="fas fa-check-circle"
                        style={{ marginRight: 8 }}
                      ></i>
                      Session transmise au transport
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
