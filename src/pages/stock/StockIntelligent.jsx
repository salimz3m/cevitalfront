import { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";
import ModuleGate from "../../components/ModuleGate";
/* ── Helpers ── */
const pct = (v, max) =>
  Math.min(100, Math.max(0, max > 0 ? (v / max) * 100 : 0));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const FAMILLE_COLORS = {
  HUILE: "#f97316",
  MARGARINE: "#a78bfa",
  SUCRE: "#fbbf24",
  SMEN: "#34d399",
  CHOCOLAT: "#f472b6",
  SAUCE: "#38bdf8",
  EAU: "#60a5fa",
  MIEL: "#facc15",
  CONFITURE: "#fb7185",
  BOISSON: "#4ade80",
  PALETTE: "#94a3b8",
};

/* ── Score couleur ── */
const scoreColor = (s) =>
  s >= 75 ? "#22c55e" : s >= 50 ? "#f97316" : "#ef4444";

export default function StockIntelligent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ruptures"); // ruptures | rotations | previsions | carte

  const [ruptures, setRuptures] = useState([]);
  const [rotations, setRotations] = useState([]);
  const [previsions, setPrevisions] = useState([]);
  const [carteData, setCarteData] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rRup, rRot, rPrev, rCarte] = await Promise.allSettled([
        api.get("/modules/stock-intel/ruptures"),
        api.get("/modules/stock-intel/rotations"),
        api.get("/modules/stock-intel/previsions"),
        api.get("/modules/stock-intel/carte"),
      ]);
      if (rRup.status === "fulfilled")
        setRuptures(rRup.value.data?.alertes || rRup.value.data || []);
      if (rRot.status === "fulfilled")
        setRotations(rRot.value.data?.rotations || []);
      if (rPrev.status === "fulfilled")
        setPrevisions(rPrev.value.data?.previsions || rPrev.value.data || []);
      if (rCarte.status === "fulfilled")
        setCarteData(rCarte.value.data?.clrs || rCarte.value.data || []);
    } catch {
      /* silent */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ── Score santé global ── */
  const scoreGlobal =
    ruptures.length === 0
      ? 95
      : clamp(
          Math.round(
            100 -
              ruptures.filter((r) => r.critique).length * 15 -
              ruptures.length * 5,
          ),
          0,
          100,
        );

  return (
    <ModuleGate module="STOCK_INTEL">
      <div
        style={{
          padding: "2rem",
          background: "#0f1117",
          minHeight: "100vh",
          color: "#e2e8f0",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "#f8fafc",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
              }}
            >
              <span
                style={{
                  background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                  borderRadius: "0.5rem",
                  width: "2.2rem",
                  height: "2.2rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                }}
              >
                <i className="fa fa-brain" style={{ color: "#fff" }} />
              </span>
              Stock Intelligent
            </h1>
            <p
              style={{
                color: "#64748b",
                margin: "0.3rem 0 0",
                fontSize: "0.9rem",
              }}
            >
              Analyse IA · Ruptures · Rotations · Prévisions J+7
            </p>
          </div>
          <button
            onClick={load}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#1e293b",
              color: "#94a3b8",
              border: "1px solid #334155",
              borderRadius: "0.5rem",
              padding: "0.6rem 1.2rem",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            <i className="fa fa-arrows-rotate" /> Actualiser
          </button>
        </div>

        {/* ── Score global + KPI cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "1.5rem",
            marginBottom: "2rem",
            alignItems: "center",
          }}
        >
          {/* Score circulaire */}
          <div
            style={{
              background: "#181c27",
              borderRadius: "1rem",
              border: "1px solid #1e293b",
              padding: "1.5rem",
              textAlign: "center",
              minWidth: "160px",
            }}
          >
            <div style={{ position: "relative", display: "inline-block" }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={scoreColor(scoreGlobal)}
                  strokeWidth="10"
                  strokeDasharray={`${(scoreGlobal / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  style={{ transition: "stroke-dasharray 1s ease" }}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    color: scoreColor(scoreGlobal),
                  }}
                >
                  {scoreGlobal}
                </div>
                <div style={{ fontSize: "0.6rem", color: "#64748b" }}>
                  / 100
                </div>
              </div>
            </div>
            <div
              style={{
                color: "#94a3b8",
                fontSize: "0.8rem",
                marginTop: "0.5rem",
              }}
            >
              Santé Stock
            </div>
          </div>

          {/* KPI mini cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {[
              {
                label: "Ruptures critiques",
                value: ruptures.filter((r) => r.critique).length,
                color: "#ef4444",
                icon: "fa-circle-exclamation",
              },
              {
                label: "En alerte",
                value: ruptures.length,
                color: "#f97316",
                icon: "fa-triangle-exclamation",
              },
              {
                label: "Fort. rotation",
                value: rotations.filter((r) => r.categorie === "FORTE").length,
                color: "#22c55e",
                icon: "fa-arrow-trend-up",
              },
              {
                label: "Faib. rotation",
                value: rotations.filter((r) => r.categorie === "FAIBLE").length,
                color: "#64748b",
                icon: "fa-arrow-trend-down",
              },
            ].map((k) => (
              <div
                key={k.label}
                style={{
                  background: "#181c27",
                  borderRadius: "0.75rem",
                  border: "1px solid #1e293b",
                  padding: "1rem",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#64748b", fontSize: "0.75rem" }}>
                    {k.label}
                  </span>
                  <i
                    className={`fa ${k.icon}`}
                    style={{ color: k.color, fontSize: "0.9rem" }}
                  />
                </div>
                <div
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 800,
                    color: k.color,
                    marginTop: "0.4rem",
                  }}
                >
                  {loading ? "…" : k.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.5rem",
            borderBottom: "1px solid #1e293b",
            paddingBottom: "0.5rem",
          }}
        >
          {[
            {
              id: "ruptures",
              label: "Ruptures & Alertes",
              icon: "fa-triangle-exclamation",
            },
            { id: "rotations", label: "Rotations Produits", icon: "fa-rotate" },
            {
              id: "previsions",
              label: "Prévisions J+7",
              icon: "fa-calendar-days",
            },
            { id: "carte", label: "Carte de Chaleur", icon: "fa-map" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 600,
                transition: "all 0.2s",
                background: tab === t.id ? "#3b82f6" : "transparent",
                color: tab === t.id ? "#fff" : "#64748b",
              }}
            >
              <i className={`fa ${t.icon}`} style={{ fontSize: "0.8rem" }} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Contenu tabs ── */}
        {loading ? (
          <Loader />
        ) : (
          <>
            {tab === "ruptures" && <TabRuptures data={ruptures} />}
            {tab === "rotations" && <TabRotations data={rotations} />}
            {tab === "previsions" && <TabPrevisions data={previsions} />}
            {tab === "carte" && <TabCarte data={carteData} />}
          </>
        )}
      </div>
    </ModuleGate>
  );
}

/* ── Tab Ruptures ── */
function TabRuptures({ data }) {
  if (!data.length)
    return (
      <Empty
        message="Aucune alerte de rupture détectée 🎉"
        icon="fa-check-circle"
      />
    );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {data.map((r, i) => (
        <div
          key={i}
          style={{
            background: "#181c27",
            borderRadius: "0.75rem",
            border: `1px solid ${r.critique ? "rgba(239,68,68,0.3)" : "rgba(249,115,22,0.2)"}`,
            padding: "1.25rem",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                marginBottom: "0.4rem",
              }}
            >
              <span
                style={{
                  background: r.critique
                    ? "rgba(239,68,68,0.15)"
                    : "rgba(249,115,22,0.12)",
                  color: r.critique ? "#ef4444" : "#f97316",
                  borderRadius: "0.375rem",
                  padding: "0.2rem 0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                {r.critique ? "🔴 CRITIQUE" : "🟠 ALERTE"}
              </span>
              <span style={{ color: "#f8fafc", fontWeight: 600 }}>
                {r.nomProduit || r.nom || "—"}
              </span>
              <span style={{ color: "#64748b", fontSize: "0.8rem" }}>
                {r.nomCLR || r.clr || "—"}
              </span>
            </div>
            <div
              style={{ display: "flex", gap: "1.5rem", fontSize: "0.82rem" }}
            >
              <span style={{ color: "#94a3b8" }}>
                Stock actuel :{" "}
                <strong style={{ color: "#ef4444" }}>
                  {r.qteDisponible ?? r.qtéActuelle ?? "—"}
                </strong>
              </span>
              <span style={{ color: "#94a3b8" }}>
                Seuil min :{" "}
                <strong style={{ color: "#f97316" }}>
                  {r.seuilMinimum ?? r.seuilMin ?? "—"}
                </strong>
              </span>
              {r.joursCouverture !== undefined && (
                <span style={{ color: "#94a3b8" }}>
                  Couverture :{" "}
                  <strong style={{ color: "#fbbf24" }}>
                    {r.joursCouverture}j
                  </strong>
                </span>
              )}
            </div>
            {r.suggestion && (
              <div
                style={{
                  marginTop: "0.5rem",
                  color: "#60a5fa",
                  fontSize: "0.82rem",
                }}
              >
                💡 {r.suggestion}
              </div>
            )}
          </div>
          {/* Mini jauge */}
          <div style={{ width: "80px", textAlign: "center" }}>
            <div
              style={{
                background: "#0f1117",
                borderRadius: "999px",
                height: "8px",
                overflow: "hidden",
                marginBottom: "0.3rem",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct(r.qteDisponible ?? r.qtéActuelle ?? r.stock ?? 0, r.seuilOptimal ?? r.optimal ?? 100)}%`,
                  background: r.critique ? "#ef4444" : "#f97316",
                  borderRadius: "999px",
                  transition: "width 0.8s",
                }}
              />
            </div>
            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
              {Math.round(pct(r.qteDisponible ?? 0, r.seuilOptimal ?? 100))}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Tab Rotations ── */
function TabRotations({ data }) {
  if (!data.length)
    return (
      <Empty message="Données de rotation indisponibles" icon="fa-rotate" />
    );
  const forte = data.filter((r) => r.categorie === "FORTE");
  const faible = data.filter((r) => r.categorie === "FAIBLE");
  const normale = data.filter(
    (r) => !["FORTE", "FAIBLE"].includes(r.categorie),
  );
  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}
    >
      <Section
        title="🔥 Forte rotation — top produits"
        color="#22c55e"
        items={forte}
      />
      <Section
        title="🐢 Faible rotation — à surveiller"
        color="#64748b"
        items={faible}
      />
      {normale.length > 0 && (
        <Section
          title="📊 Rotation normale"
          color="#3b82f6"
          items={normale}
          style={{ gridColumn: "1/-1" }}
        />
      )}
    </div>
  );
}

function Section({ title, color, items, style }) {
  return (
    <div
      style={{
        background: "#181c27",
        borderRadius: "0.75rem",
        border: "1px solid #1e293b",
        padding: "1.25rem",
        ...style,
      }}
    >
      <h3
        style={{
          color,
          fontSize: "0.9rem",
          fontWeight: 700,
          marginBottom: "1rem",
          margin: "0 0 1rem",
        }}
      >
        {title}
      </h3>
      {items.length === 0 ? (
        <div style={{ color: "#475569", fontSize: "0.85rem" }}>
          Aucun produit
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {items.slice(0, 8).map((r, i) => {
            const famColor = FAMILLE_COLORS[r.famille] || "#94a3b8";
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.5rem 0.75rem",
                  background: "#0f1117",
                  borderRadius: "0.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: famColor,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: "#e2e8f0", fontSize: "0.85rem" }}>
                    {r.nom || r.produit}
                  </span>
                </div>
                <span style={{ color, fontSize: "0.8rem", fontWeight: 600 }}>
                  {r.sorties ?? r.mouvements ?? "—"} mvt/sem
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Tab Prévisions ── */
function TabPrevisions({ data }) {
  if (!data.length)
    return (
      <Empty
        message="Prévisions indisponibles — données insuffisantes"
        icon="fa-calendar-days"
      />
    );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div
        style={{
          background: "rgba(59,130,246,0.08)",
          border: "1px solid rgba(59,130,246,0.2)",
          borderRadius: "0.5rem",
          padding: "0.75rem 1rem",
          fontSize: "0.85rem",
          color: "#60a5fa",
        }}
      >
        <i className="fa fa-info-circle" style={{ marginRight: "0.5rem" }} />
        Prévisions calculées sur 7 jours basées sur l'historique de
        planification et les tendances de consommation.
      </div>
      {data.map((p, i) => (
        <div
          key={i}
          style={{
            background: "#181c27",
            borderRadius: "0.75rem",
            border: "1px solid #1e293b",
            padding: "1.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <div>
              <div
                style={{
                  color: "#f8fafc",
                  fontWeight: 600,
                  marginBottom: "0.25rem",
                }}
              >
                {p.nom || p.produit}
              </div>
              <div style={{ color: "#64748b", fontSize: "0.82rem" }}>
                {p.clr || "Tous CLR"} · SKU: {p.sku || "—"}
              </div>
            </div>
            <span
              style={{
                background: p.risqueRupture
                  ? "rgba(239,68,68,0.12)"
                  : "rgba(34,197,94,0.12)",
                color: p.risqueRupture ? "#ef4444" : "#22c55e",
                borderRadius: "0.375rem",
                padding: "0.2rem 0.6rem",
                fontSize: "0.78rem",
                fontWeight: 700,
              }}
            >
              {p.risqueRupture ? "⚠️ Risque rupture" : "✅ Stock suffisant"}
            </span>
          </div>
          {/* Barre prévision */}
          <div
            style={{
              marginTop: "1rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "0.75rem",
            }}
          >
            {[
              {
                label: "Stock actuel",
                value: p.stockActuel ?? p.stock,
                color: "#3b82f6",
              },
              {
                label: "Prévu consommé J+7",
                value: p.prevuConsomme > 0 ? p.prevuConsomme : "—",
                color: "#f97316",
              },
              {
                label: "Stock final estimé",
                value: p.stockFinal ?? "—",
                color: p.risqueRupture ? "#ef4444" : "#22c55e",
              },
            ].map((m) => (
              <div key={m.label}>
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "0.75rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  {m.label}
                </div>
                <div
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: m.color,
                  }}
                >
                  {m.value ?? "—"}
                </div>
              </div>
            ))}
          </div>
          {p.suggestion && (
            <div
              style={{
                marginTop: "0.75rem",
                background: "rgba(59,130,246,0.08)",
                borderRadius: "0.375rem",
                padding: "0.5rem 0.75rem",
                color: "#60a5fa",
                fontSize: "0.82rem",
              }}
            >
              💡 {p.suggestion}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Tab Carte de Chaleur ── */
function TabCarte({ data }) {
  if (!data.length)
    return <Empty message="Données de carte indisponibles" icon="fa-map" />;
  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "0.75rem",
        }}
      >
        {data.map((clr, i) => {
          const score = clr.scoreStock ?? clr.score ?? 50;
          const color = scoreColor(score);
          const alertCount = clr.alertes ?? 0;
          return (
            <div
              key={i}
              style={{
                background: "#181c27",
                borderRadius: "0.75rem",
                border: `1px solid ${color}33`,
                padding: "1.25rem",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: color,
                }}
              />
              <div
                style={{
                  color: "#f8fafc",
                  fontWeight: 600,
                  marginBottom: "0.25rem",
                }}
              >
                {clr.nom}
              </div>
              <div
                style={{
                  color: "#64748b",
                  fontSize: "0.78rem",
                  marginBottom: "0.75rem",
                }}
              >
                {clr.plateforme || clr.region || ""}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      color,
                      lineHeight: 1,
                    }}
                  >
                    {score}
                  </div>
                  <div style={{ color: "#64748b", fontSize: "0.72rem" }}>
                    score santé
                  </div>
                </div>
                {alertCount > 0 && (
                  <span
                    style={{
                      background: "rgba(239,68,68,0.15)",
                      color: "#ef4444",
                      borderRadius: "0.375rem",
                      padding: "0.2rem 0.5rem",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    {alertCount} alerte{alertCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {/* Mini bar produits */}
              <div style={{ marginTop: "0.75rem" }}>
                <div
                  style={{
                    background: "#0f1117",
                    borderRadius: "999px",
                    height: "6px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${score}%`,
                      background: color,
                      borderRadius: "999px",
                      transition: "width 0.8s",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Légende */}
      <div
        style={{
          marginTop: "1.5rem",
          display: "flex",
          gap: "1.5rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {[
          { color: "#22c55e", label: "Score ≥ 75 — Bon" },
          { color: "#f97316", label: "50–74 — À surveiller" },
          { color: "#ef4444", label: "< 50 — Critique" },
        ].map((l) => (
          <div
            key={l.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.8rem",
              color: "#64748b",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: l.color,
              }}
            />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Utilitaires ── */
function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
      <i
        className="fa fa-spinner fa-spin"
        style={{
          fontSize: "1.5rem",
          marginBottom: "0.75rem",
          display: "block",
          color: "#3b82f6",
        }}
      />
      Analyse en cours…
    </div>
  );
}

function Empty({ message, icon }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "3rem",
        color: "#64748b",
        background: "#181c27",
        borderRadius: "0.75rem",
        border: "1px solid #1e293b",
      }}
    >
      <i
        className={`fa ${icon}`}
        style={{ fontSize: "2rem", marginBottom: "0.75rem", display: "block" }}
      />
      {message}
    </div>
  );
}

const FAMILLE_COLORS_REF = FAMILLE_COLORS; // keep lint happy
