import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import { DS_STYLE } from "../design-system";

// Coordonnées approximatives des CLR Cevital en Algérie (SVG viewBox 0 0 100 65)
const CLR_GEO = {
  Béjaïa: { x: 72, y: 22 },
  Alger: { x: 55, y: 25 },
  Oran: { x: 18, y: 27 },
  Constantine: { x: 75, y: 20 },
  Annaba: { x: 82, y: 18 },
  Blida: { x: 53, y: 28 },
  Sétif: { x: 70, y: 24 },
  "Tizi Ouzou": { x: 62, y: 24 },
  Batna: { x: 74, y: 28 },
  Tlemcen: { x: 12, y: 26 },
  Bouira: { x: 62, y: 26 },
  Médéa: { x: 54, y: 30 },
};

// Position déterministe pour les CLR sans correspondance géo (pas de Math.random)
const seededPos = (nom = "") => {
  let h = 0;
  for (let i = 0; i < nom.length; i++) h = (h * 31 + nom.charCodeAt(i)) >>> 0;
  return {
    x: 12 + ((h % 1000) / 1000) * 66,
    y: 14 + (((h >> 10) % 1000) / 1000) * 34,
  };
};

const getNiveauConfig = (pct) => {
  if (pct === null || pct === undefined)
    return {
      stroke: "var(--ds-ink-3)",
      fill: "var(--ds-surface-2)",
      badgeClass: "ds-badge-neutral",
      label: "Inconnu",
      barColor: "var(--ds-ink-3)",
    };
  if (pct <= 0)
    return {
      stroke: "var(--ds-red)",
      fill: "var(--ds-red-soft)",
      badgeClass: "ds-badge-red",
      label: "Rupture",
      barColor: "var(--ds-red)",
    };
  if (pct < 20)
    return {
      stroke: "#f97316",
      fill: "rgba(249,115,22,.08)",
      badgeClass: "ds-badge-amber",
      label: "Critique",
      barColor: "#f97316",
    };
  if (pct < 50)
    return {
      stroke: "var(--ds-amber)",
      fill: "var(--ds-amber-soft)",
      badgeClass: "ds-badge-amber",
      label: "Bas",
      barColor: "var(--ds-amber)",
    };
  return {
    stroke: "var(--ds-green)",
    fill: "var(--ds-green-soft)",
    badgeClass: "ds-badge-green",
    label: "OK",
    barColor: "var(--ds-green)",
  };
};

const LEGENDE = [
  { label: "OK (≥ 50%)", color: "var(--ds-green)" },
  { label: "Bas (20–50%)", color: "var(--ds-amber)" },
  { label: "Critique (< 20%)", color: "#f97316" },
  { label: "Rupture", color: "var(--ds-red)" },
];

export default function CarteStocks() {
  const [carteData, setCarteData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    api
      .get("/modules/stock-intel/carte")
      .then((r) => {
        const clrs = r.data.clrs || [];
        setCarteData(clrs.map((c) => ({ ...c, id: c.clrId ?? c.id })));
      })
      .catch(() => toast.error("Erreur chargement carte stocks"))
      .finally(() => setLoading(false));
  }, []);

  // Positions stables : recalculées uniquement quand carteData change.
  // On n'utilise plus Math.random() (qui recalcule à chaque render).
  const clrsPositioned = useMemo(
    () =>
      carteData.map((clr) => {
        const geo = Object.entries(CLR_GEO).find(([k]) =>
          clr.nom?.toLowerCase().includes(k.toLowerCase()),
        );
        const pos = geo ? geo[1] : seededPos(clr.nom);
        return { ...clr, x: pos.x, y: pos.y };
      }),
    [carteData],
  );

  // KPIs
  const total = clrsPositioned.length;
  const enRupture = clrsPositioned.filter(
    (c) => (c.niveauPct ?? 0) <= 0,
  ).length;
  const critique = clrsPositioned.filter(
    (c) => (c.niveauPct ?? 0) > 0 && (c.niveauPct ?? 0) < 20,
  ).length;
  const ok = clrsPositioned.filter((c) => (c.niveauPct ?? 0) >= 50).length;

  return (
    <>
      <style>{DS_STYLE}</style>

      <div className="ds-layout">
        <div className="ds-main">
          {/* ── Page Header ── */}
          <div className="ds-page-header">
            <div className="ds-eyebrow">Stock Intel</div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <h1 className="ds-page-title">
                  Carte des <span>Stocks CLR</span>
                </h1>
                <p className="ds-page-sub">
                  Niveau de stock global par plateforme de distribution
                </p>
              </div>
              <Link to="/stock" className="ds-btn ds-btn-outline ds-btn-sm">
                ← Tableau de bord
              </Link>
            </div>
          </div>

          {/* ── KPI Strip ── */}
          <div className="ds-kpi-strip">
            <div className="ds-kpi">
              <div className="ds-kpi-lbl">Total CLR</div>
              <div className="ds-kpi-val blue">{loading ? "—" : total}</div>
              <div className="ds-kpi-icon">🏭</div>
            </div>
            <div className="ds-kpi">
              <div className="ds-kpi-lbl">En rupture</div>
              <div className="ds-kpi-val red">{loading ? "—" : enRupture}</div>
              <div className="ds-kpi-icon">⚠️</div>
            </div>
            <div className="ds-kpi">
              <div className="ds-kpi-lbl">Critiques</div>
              <div className="ds-kpi-val amber">{loading ? "—" : critique}</div>
              <div className="ds-kpi-icon">🔸</div>
            </div>
            <div className="ds-kpi">
              <div className="ds-kpi-lbl">Niveau OK</div>
              <div className="ds-kpi-val green">{loading ? "—" : ok}</div>
              <div className="ds-kpi-icon">✅</div>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="ds-content">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 300px",
                gap: 20,
              }}
            >
              {/* ── Carte SVG ── */}
              <div className="ds-card">
                <div className="ds-card-head">
                  <div className="ds-card-title">
                    <span className="ds-card-dot" />
                    Carte géographique — Algérie
                  </div>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                    {LEGENDE.map((l) => (
                      <div
                        key={l.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: "0.7rem",
                          color: "var(--ds-ink-2)",
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: l.color,
                            flexShrink: 0,
                          }}
                        />
                        {l.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ds-card-body">
                  {loading ? (
                    <div className="ds-loading">Chargement de la carte…</div>
                  ) : (
                    <svg
                      viewBox="0 0 100 65"
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                      }}
                    >
                      {/* Fond */}
                      <rect
                        x="5"
                        y="8"
                        width="87"
                        height="52"
                        rx="3"
                        fill="var(--ds-surface-2)"
                        stroke="var(--ds-border)"
                        strokeWidth="0.4"
                      />

                      {/* Grille légère */}
                      <line
                        x1="5"
                        y1="34"
                        x2="92"
                        y2="34"
                        stroke="var(--ds-border)"
                        strokeWidth="0.25"
                        strokeDasharray="1.5,1.5"
                      />
                      <line
                        x1="48"
                        y1="8"
                        x2="48"
                        y2="60"
                        stroke="var(--ds-border)"
                        strokeWidth="0.25"
                        strokeDasharray="1.5,1.5"
                      />

                      <text
                        x="48.5"
                        y="57.5"
                        fontSize="2.5"
                        fill="var(--ds-border-2)"
                        textAnchor="middle"
                        fontFamily="sans-serif"
                        letterSpacing="0.3"
                      >
                        ALGÉRIE
                      </text>

                      {/* Marqueurs CLR — key stable sur clr.id, pas sur index */}
                      {clrsPositioned.map((clr) => {
                        const cfg = getNiveauConfig(clr.niveauPct);
                        const isSelected = selected?.id === clr.id;
                        const isAlert = (clr.niveauPct ?? 100) < 20;

                        return (
                          <g
                            key={clr.id}
                            onClick={() => setSelected(isSelected ? null : clr)}
                            style={{ cursor: "pointer" }}
                          >
                            {/* Pulse uniquement si alerte */}
                            {isAlert && (
                              <circle
                                cx={clr.x}
                                cy={clr.y}
                                r="5"
                                fill="none"
                                stroke={cfg.stroke}
                                strokeWidth="0.4"
                                opacity="0.4"
                              >
                                <animate
                                  attributeName="r"
                                  from="3.5"
                                  to="6.5"
                                  dur="1.6s"
                                  repeatCount="indefinite"
                                />
                                <animate
                                  attributeName="opacity"
                                  from="0.5"
                                  to="0"
                                  dur="1.6s"
                                  repeatCount="indefinite"
                                />
                              </circle>
                            )}
                            {/* Cercle principal */}
                            <circle
                              cx={clr.x}
                              cy={clr.y}
                              r={isSelected ? 4 : 3}
                              fill={cfg.fill}
                              stroke={cfg.stroke}
                              strokeWidth={isSelected ? 0.9 : 0.5}
                              opacity="0.95"
                            />
                            {/* Label */}
                            <text
                              x={clr.x + 4}
                              y={clr.y + 1.2}
                              fontSize="1.9"
                              fill="var(--ds-ink-2)"
                              fontFamily="sans-serif"
                              fontWeight={isSelected ? "700" : "400"}
                            >
                              {clr.nom}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  )}
                </div>
              </div>

              {/* ── Panneau latéral ── */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {/* Détail CLR sélectionné */}
                {selected ? (
                  <div
                    className="ds-card"
                    style={{ borderColor: "var(--ds-blue)", margin: 0 }}
                  >
                    <div className="ds-card-head">
                      <div
                        className="ds-card-title"
                        style={{
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 2,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.88rem",
                            color: "var(--ds-ink)",
                          }}
                        >
                          {selected.nom}
                        </span>
                        {selected.region && (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              color: "var(--ds-ink-3)",
                              textTransform: "none",
                              fontWeight: 400,
                              letterSpacing: 0,
                            }}
                          >
                            {selected.region}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setSelected(null)}
                        className="ds-btn ds-btn-ghost ds-btn-sm"
                        style={{ padding: "4px 8px", fontSize: "1rem" }}
                      >
                        ×
                      </button>
                    </div>

                    <div
                      className="ds-card-body"
                      style={{ padding: "16px 18px" }}
                    >
                      {/* Badge statut */}
                      <div style={{ marginBottom: 14 }}>
                        <span
                          className={`ds-badge ${getNiveauConfig(selected.niveauPct).badgeClass}`}
                        >
                          <span
                            className="ds-badge-dot"
                            style={{
                              background: getNiveauConfig(selected.niveauPct)
                                .stroke,
                            }}
                          />
                          {getNiveauConfig(selected.niveauPct).label}
                        </span>
                      </div>

                      {/* Stats 2×2 */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                          marginBottom: 14,
                        }}
                      >
                        {[
                          { label: "Produits", val: selected.nbProduits ?? 0 },
                          {
                            label: "Stock total",
                            val: selected.stockTotal ?? 0,
                          },
                          {
                            label: "Niveau global",
                            val: `${(selected.niveauPct ?? 0).toFixed(0)}%`,
                          },
                          { label: "Statut", val: selected.statut ?? "—" },
                        ].map((s) => (
                          <div
                            key={s.label}
                            style={{
                              background: "var(--ds-surface-2)",
                              borderRadius: "var(--ds-radius)",
                              padding: "10px 12px",
                              border: "1px solid var(--ds-border)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "0.62rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.07em",
                                color: "var(--ds-ink-3)",
                                marginBottom: 3,
                              }}
                            >
                              {s.label}
                            </div>
                            <div
                              className="mono"
                              style={{
                                fontWeight: 700,
                                color: "var(--ds-ink)",
                              }}
                            >
                              {s.val}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Barre niveau */}
                      <div style={{ marginBottom: 16 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "0.7rem",
                            color: "var(--ds-ink-3)",
                            marginBottom: 5,
                          }}
                        >
                          <span>Niveau de stock</span>
                          <span
                            style={{
                              fontWeight: 700,
                              color: "var(--ds-ink-2)",
                            }}
                          >
                            {(selected.niveauPct ?? 0).toFixed(0)} %
                          </span>
                        </div>
                        <div className="ds-bar-track">
                          <div
                            className="ds-bar-fill"
                            style={{
                              width: `${Math.min(100, selected.niveauPct ?? 0)}%`,
                              background: getNiveauConfig(selected.niveauPct)
                                .barColor,
                            }}
                          />
                        </div>
                      </div>

                      <Link
                        to={`/stock/clr/${selected.clrId ?? selected.id}`}
                        className="ds-btn ds-btn-primary"
                        style={{ width: "100%", justifyContent: "center" }}
                      >
                        Voir détail complet →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="ds-card" style={{ margin: 0 }}>
                    <div className="ds-empty" style={{ padding: "32px 20px" }}>
                      <i>📍</i>
                      <p>
                        Cliquez sur un point de la carte pour voir le détail du
                        CLR
                      </p>
                    </div>
                  </div>
                )}

                {/* Liste tous CLR */}
                <div className="ds-card" style={{ margin: 0, flex: 1 }}>
                  <div className="ds-card-head">
                    <div className="ds-card-title">
                      <span className="ds-card-dot" />
                      Tous les CLR
                    </div>
                    <span className="ds-badge ds-badge-neutral">{total}</span>
                  </div>

                  {loading ? (
                    <div className="ds-loading">Chargement…</div>
                  ) : (
                    <div style={{ maxHeight: 340, overflowY: "auto" }}>
                      {clrsPositioned.map((clr) => {
                        const cfg = getNiveauConfig(clr.niveauPct);
                        const isActive = selected?.id === clr.id;
                        return (
                          <div
                            key={clr.id}
                            onClick={() => setSelected(isActive ? null : clr)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "10px 18px",
                              borderBottom: "1px solid var(--ds-border)",
                              cursor: "pointer",
                              background: isActive
                                ? "var(--ds-blue-soft)"
                                : "transparent",
                              transition: "background 0.12s",
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive)
                                e.currentTarget.style.background =
                                  "var(--ds-surface-2)";
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive)
                                e.currentTarget.style.background =
                                  "transparent";
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 9,
                              }}
                            >
                              <div
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  background: cfg.stroke,
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                style={{
                                  fontSize: "0.82rem",
                                  color: "var(--ds-ink)",
                                  fontWeight: isActive ? 600 : 400,
                                }}
                              >
                                {clr.nom}
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: 44,
                                  height: 3,
                                  background: "var(--ds-border)",
                                  borderRadius: 2,
                                }}
                              >
                                <div
                                  style={{
                                    width: `${Math.min(100, clr.niveauPct ?? 0)}%`,
                                    height: "100%",
                                    borderRadius: 2,
                                    background: cfg.stroke,
                                  }}
                                />
                              </div>
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                  color: cfg.stroke,
                                  minWidth: 32,
                                  textAlign: "right",
                                  fontFamily: "var(--ds-mono)",
                                }}
                              >
                                {(clr.niveauPct ?? 0).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
