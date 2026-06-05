import { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";
import ModuleGate from "../../components/ModuleGate";

const pct = (v, max) =>
  Math.min(100, Math.max(0, max > 0 ? (v / max) * 100 : 0));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const FAMILLE_COLORS = {
  HUILE: "#f97316",
  MARGARINE: "#a78bfa",
  SUCRE: "#fbbf24",
  SMEN: "#34d399",
  CHOCOLAT: "#c0392b",
  SAUCE: "#38bdf8",
  EAU: "#60a5fa",
  MIEL: "#facc15",
  CONFITURE: "#fb7185",
  BOISSON: "#4ade80",
  PALETTE: "#9a9a96",
};

const scoreColor = (s) =>
  s >= 75 ? "#1a7a4a" : s >= 50 ? "#b45309" : "#c0392b";
const scoreBg = (s) =>
  s >= 75
    ? "rgba(26,122,74,.08)"
    : s >= 50
      ? "rgba(180,83,9,.08)"
      : "rgba(192,57,43,.07)";

const SI_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;900&display=swap');

  :root {
    --si-bg: #f8f8f7;
    --si-surface: #ffffff;
    --si-surface-2: #f2f2f0;
    --si-border: #e6e6e3;
    --si-border-2: #d0d0cc;
    --si-ink: #111110;
    --si-ink-2: #555553;
    --si-ink-3: #9a9a96;
    --si-red: #c0392b;
    --si-red-soft: rgba(192,57,43,.07);
    --si-red-mid: rgba(192,57,43,.15);
    --si-green: #1a7a4a;
    --si-green-soft: rgba(26,122,74,.07);
    --si-amber: #b45309;
    --si-amber-soft: rgba(180,83,9,.08);
    --si-radius: 5px;
    --si-radius-lg: 10px;
    --si-shadow-sm: 0 1px 3px rgba(0,0,0,.05);
    --si-font: 'DM Sans', system-ui, sans-serif;
    --si-mono: 'DM Mono', monospace;
  }

  .si-root {
    min-height: 100vh;
    background: var(--si-bg);
    font-family: var(--si-font);
    color: var(--si-ink);
    -webkit-font-smoothing: antialiased;
  }

  .si-page-header {
    background: var(--si-surface);
    border-bottom: 1px solid var(--si-border);
    padding: 28px 36px 24px;
  }
  .si-eyebrow {
    font-size: .62rem; font-weight: 700; letter-spacing: .18em;
    text-transform: uppercase; color: var(--si-red);
    margin-bottom: 6px; display: flex; align-items: center; gap: 7px;
  }
  .si-eyebrow::before { content:''; width:18px; height:2px; background:var(--si-red); }
  .si-page-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem; font-weight: 900; line-height: 1;
    letter-spacing: -.02em; color: var(--si-ink); margin-bottom: 4px;
  }
  .si-page-title span { color: var(--si-red); }
  .si-page-sub { font-size: .82rem; color: var(--si-ink-3); }

  .si-header-row {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 16px; flex-wrap: wrap;
  }

  .si-btn {
    display: inline-flex; align-items: center; gap: 7px;
    font-family: var(--si-font); font-size: .8rem; font-weight: 600;
    padding: 9px 18px; border-radius: var(--si-radius);
    border: 1px solid var(--si-border-2); cursor: pointer;
    transition: all .15s; background: var(--si-surface); color: var(--si-ink);
  }
  .si-btn:hover { border-color: var(--si-ink); background: var(--si-surface-2); }

  /* KPI strip */
  .si-kpi-strip {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 0;
    background: var(--si-surface);
    border-bottom: 1px solid var(--si-border);
  }

  .si-score-cell {
    padding: 24px 28px;
    border-right: 1px solid var(--si-border);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 10px;
  }
  .si-score-label {
    font-size: .62rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .1em; color: var(--si-ink-3);
  }

  .si-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }
  .si-kpi {
    padding: 16px 22px;
    border-right: 1px solid var(--si-border);
    position: relative; overflow: hidden;
  }
  .si-kpi:last-child { border-right: none; }
  .si-kpi-lbl {
    font-size: .62rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .09em; color: var(--si-ink-3); margin-bottom: 4px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .si-kpi-val {
    font-size: 1.7rem; font-weight: 700; font-family: var(--si-mono); line-height: 1;
  }

  /* Tabs */
  .si-tabs {
    display: flex; padding: 0 36px;
    background: var(--si-surface);
    border-bottom: 2px solid var(--si-border);
  }
  .si-tab {
    padding: 14px 20px; font-size: .8rem; font-weight: 600;
    color: var(--si-ink-3); cursor: pointer; border: none;
    background: none; border-bottom: 2px solid transparent;
    margin-bottom: -2px; transition: all .15s;
    display: flex; align-items: center; gap: 7px; white-space: nowrap;
  }
  .si-tab:hover { color: var(--si-ink); }
  .si-tab.active { color: var(--si-ink); border-bottom-color: var(--si-red); }

  /* Content */
  .si-content { padding: 28px 36px; }

  /* Card */
  .si-card {
    background: var(--si-surface);
    border: 1px solid var(--si-border);
    border-radius: var(--si-radius-lg);
    box-shadow: var(--si-shadow-sm);
    overflow: hidden; margin-bottom: 10px;
  }
  .si-card-head {
    padding: 14px 20px;
    border-bottom: 1px solid var(--si-border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .si-card-title {
    font-size: .72rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .09em; color: var(--si-ink);
    display: flex; align-items: center; gap: 8px;
  }
  .si-dot { width:6px; height:6px; border-radius:50%; background:var(--si-red); flex-shrink:0; }

  /* Rupture row */
  .si-rupture-row {
    display: grid; grid-template-columns: 1fr auto;
    gap: 16px; align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--si-border);
    transition: background .15s;
  }
  .si-rupture-row:last-child { border-bottom: none; }
  .si-rupture-row:hover { background: var(--si-surface-2); }

  /* Badge */
  .si-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: .62rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .07em; padding: 2px 8px; border-radius: 20px;
  }
  .si-badge-critique { background: var(--si-red-soft); color: var(--si-red); border: 1px solid var(--si-red-mid); }
  .si-badge-alerte { background: var(--si-amber-soft); color: var(--si-amber); border: 1px solid #fde68a; }
  .si-badge-ok { background: var(--si-green-soft); color: var(--si-green); border: 1px solid #bbf7d0; }

  /* Rotation grid */
  .si-rot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .si-rot-section { background: var(--si-surface); border: 1px solid var(--si-border); border-radius: var(--si-radius-lg); overflow: hidden; }
  .si-rot-head { padding: 14px 20px; border-bottom: 1px solid var(--si-border); font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.09em; }
  .si-rot-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 20px; border-bottom: 1px solid var(--si-border);
    font-size: .82rem;
  }
  .si-rot-row:last-child { border-bottom: none; }
  .si-rot-row:hover { background: var(--si-surface-2); }

  /* Prevision card */
  .si-prev-info {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 12px 16px; border-radius: var(--si-radius);
    background: var(--si-surface-2); border: 1px solid var(--si-border);
    font-size: .82rem; color: var(--si-ink-2); margin-bottom: 16px;
  }
  .si-prev-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 14px; }

  /* Carte */
  .si-carte-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }
  .si-carte-card {
    background: var(--si-surface); border: 1px solid var(--si-border);
    border-radius: var(--si-radius-lg); padding: 18px; position: relative; overflow: hidden;
  }
  .si-carte-bar { position:absolute; top:0; left:0; right:0; height:3px; }

  /* Empty / loader */
  .si-empty { text-align:center; padding:48px 20px; color:var(--si-ink-3); }
  .si-empty i { font-size:2rem; opacity:.15; margin-bottom:12px; display:block; }
  .si-empty p { font-size:.84rem; }
  .si-loading { text-align:center; padding:48px; color:var(--si-ink-3); font-size:.84rem; }

  /* Legende */
  .si-legende {
    display: flex; gap: 24px; justify-content: center; flex-wrap: wrap;
    margin-top: 20px; font-size:.75rem; color:var(--si-ink-3);
  }
  .si-legende-item { display:flex; align-items:center; gap:6px; }
  .si-legende-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

  /* Suggestion */
  .si-suggestion {
    margin-top: 10px; padding: 8px 12px;
    background: var(--si-surface-2); border-left: 2px solid var(--si-ink-3);
    border-radius: 0 var(--si-radius) var(--si-radius) 0;
    font-size: .78rem; color: var(--si-ink-2);
  }

  /* Gauge */
  .si-gauge-wrap { width:72px; text-align:center; }
  .si-gauge-track { background: var(--si-surface-2); border-radius:99px; height:6px; overflow:hidden; margin-bottom:4px; border: 1px solid var(--si-border); }
  .si-gauge-fill { height:100%; border-radius:99px; transition:width .8s; }
  .si-gauge-pct { font-size:.68rem; color:var(--si-ink-3); font-family:var(--si-mono); }

  /* Meta row */
  .si-meta { display:flex; gap:20px; flex-wrap:wrap; margin-top:6px; }
  .si-meta-item { font-size:.78rem; color:var(--si-ink-3); }
  .si-meta-item strong { font-family:var(--si-mono); }
`;

export default function StockIntelligent() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ruptures");
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

  const TABS = [
    {
      id: "ruptures",
      label: "Ruptures & Alertes",
      icon: "fa-triangle-exclamation",
    },
    { id: "rotations", label: "Rotations", icon: "fa-rotate" },
    { id: "previsions", label: "Previsions J+7", icon: "fa-calendar-days" },
    { id: "carte", label: "Carte de chaleur", icon: "fa-map" },
  ];

  const KPI = [
    {
      label: "Ruptures critiques",
      value: ruptures.filter((r) => r.critique).length,
      color: "var(--si-red)",
      icon: "fa-circle-exclamation",
    },
    {
      label: "En alerte",
      value: ruptures.length,
      color: "var(--si-amber)",
      icon: "fa-triangle-exclamation",
    },
    {
      label: "Forte rotation",
      value: rotations.filter((r) => r.categorie === "FORTE").length,
      color: "var(--si-green)",
      icon: "fa-arrow-trend-up",
    },
    {
      label: "Faible rotation",
      value: rotations.filter((r) => r.categorie === "FAIBLE").length,
      color: "var(--si-ink-3)",
      icon: "fa-arrow-trend-down",
    },
  ];

  return (
    <ModuleGate module="STOCK_INTEL">
      <style dangerouslySetInnerHTML={{ __html: SI_STYLE }} />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      <div className="si-root">
        {/* Header */}
        <div className="si-page-header">
          <div className="si-header-row">
            <div>
              <div className="si-eyebrow">Module IA</div>
              <h1 className="si-page-title">
                Stock <span>Intelligent</span>
              </h1>
              <p className="si-page-sub">
                Analyse IA — Ruptures — Rotations — Previsions J+7
              </p>
            </div>
            <button className="si-btn" onClick={load}>
              <i className="fas fa-arrows-rotate"></i> Actualiser
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="si-kpi-strip">
          <div className="si-score-cell">
            <svg width="88" height="88" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--si-border)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={scoreColor(scoreGlobal)}
                strokeWidth="8"
                strokeDasharray={`${(scoreGlobal / 100) * 251.2} 251.2`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{ transition: "stroke-dasharray 1s ease" }}
              />
              <text
                x="50"
                y="46"
                textAnchor="middle"
                fill={scoreColor(scoreGlobal)}
                fontSize="18"
                fontWeight="800"
                fontFamily="DM Mono, monospace"
              >
                {scoreGlobal}
              </text>
              <text
                x="50"
                y="60"
                textAnchor="middle"
                fill="#9a9a96"
                fontSize="8"
              >
                /100
              </text>
            </svg>
            <div className="si-score-label">Sante stock</div>
          </div>

          <div className="si-kpi-grid">
            {KPI.map((k) => (
              <div key={k.label} className="si-kpi">
                <div className="si-kpi-lbl">
                  {k.label}
                  <i
                    className={`fas ${k.icon}`}
                    style={{ color: k.color, opacity: 0.6 }}
                  ></i>
                </div>
                <div className="si-kpi-val" style={{ color: k.color }}>
                  {loading ? "—" : k.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="si-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`si-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <i className={`fas ${t.icon}`}></i>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="si-content">
          {loading ? (
            <div className="si-loading">
              <i
                className="fas fa-spinner fa-spin"
                style={{ marginRight: 8 }}
              ></i>
              Analyse en cours…
            </div>
          ) : (
            <>
              {tab === "ruptures" && <TabRuptures data={ruptures} />}
              {tab === "rotations" && <TabRotations data={rotations} />}
              {tab === "previsions" && <TabPrevisions data={previsions} />}
              {tab === "carte" && <TabCarte data={carteData} />}
            </>
          )}
        </div>
      </div>
    </ModuleGate>
  );
}

function TabRuptures({ data }) {
  if (!data.length)
    return (
      <Empty
        message="Aucune alerte de rupture detectee"
        icon="fa-check-circle"
      />
    );
  return (
    <div className="si-card">
      <div className="si-card-head">
        <div className="si-card-title">
          <span className="si-dot"></span>Alertes de rupture
        </div>
        <span
          style={{
            fontSize: ".72rem",
            color: "var(--si-ink-3)",
            fontWeight: 600,
          }}
        >
          {data.length} ligne(s)
        </span>
      </div>
      {data.map((r, i) => {
        const isCrit = r.critique;
        const gaugeVal = pct(
          r.qteDisponible ?? r.stock ?? 0,
          r.seuilOptimal ?? r.optimal ?? 100,
        );
        return (
          <div key={i} className="si-rupture-row">
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <span
                  className={`si-badge ${isCrit ? "si-badge-critique" : "si-badge-alerte"}`}
                >
                  {isCrit ? "CRITIQUE" : "ALERTE"}
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: ".88rem",
                    color: "var(--si-ink)",
                  }}
                >
                  {r.nomProduit || r.nom || "—"}
                </span>
                <span style={{ fontSize: ".78rem", color: "var(--si-ink-3)" }}>
                  {r.nomCLR || r.clr || "—"}
                </span>
              </div>
              <div className="si-meta">
                <span className="si-meta-item">
                  Stock actuel :{" "}
                  <strong style={{ color: "var(--si-red)" }}>
                    {r.qteDisponible ?? r.qtéActuelle ?? "—"}
                  </strong>
                </span>
                <span className="si-meta-item">
                  Seuil min :{" "}
                  <strong style={{ color: "var(--si-amber)" }}>
                    {r.seuilMinimum ?? r.seuilMin ?? "—"}
                  </strong>
                </span>
                {r.joursCouverture !== undefined && (
                  <span className="si-meta-item">
                    Couverture : <strong>{r.joursCouverture}j</strong>
                  </span>
                )}
              </div>
              {r.suggestion && (
                <div className="si-suggestion">
                  <i
                    className="fas fa-lightbulb"
                    style={{ marginRight: 6, color: "var(--si-ink-3)" }}
                  ></i>
                  {r.suggestion}
                </div>
              )}
            </div>
            <div className="si-gauge-wrap">
              <div className="si-gauge-track">
                <div
                  className="si-gauge-fill"
                  style={{
                    width: `${gaugeVal}%`,
                    background: isCrit ? "var(--si-red)" : "var(--si-amber)",
                  }}
                />
              </div>
              <div className="si-gauge-pct">{Math.round(gaugeVal)}%</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TabRotations({ data }) {
  if (!data.length)
    return (
      <Empty message="Donnees de rotation indisponibles" icon="fa-rotate" />
    );
  const forte = data.filter((r) => r.categorie === "FORTE");
  const faible = data.filter((r) => r.categorie === "FAIBLE");
  const normale = data.filter(
    (r) => !["FORTE", "FAIBLE"].includes(r.categorie),
  );
  return (
    <div>
      <div className="si-rot-grid">
        <RotSection
          title="Forte rotation"
          color="var(--si-green)"
          items={forte}
          icon="fa-arrow-trend-up"
        />
        <RotSection
          title="Faible rotation"
          color="var(--si-ink-3)"
          items={faible}
          icon="fa-arrow-trend-down"
        />
      </div>
      {normale.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <RotSection
            title="Rotation normale"
            color="var(--si-ink-2)"
            items={normale}
            icon="fa-minus"
            full
          />
        </div>
      )}
    </div>
  );
}

function RotSection({ title, color, items, icon, full }) {
  return (
    <div
      className="si-rot-section"
      style={{ gridColumn: full ? "1/-1" : undefined }}
    >
      <div className="si-rot-head" style={{ color }}>
        <i className={`fas ${icon}`} style={{ marginRight: 8 }}></i>
        {title}
        <span
          style={{ marginLeft: 8, color: "var(--si-ink-3)", fontWeight: 400 }}
        >
          ({items.length})
        </span>
      </div>
      {items.length === 0 ? (
        <div
          style={{
            padding: "16px 20px",
            fontSize: ".82rem",
            color: "var(--si-ink-3)",
          }}
        >
          Aucun produit
        </div>
      ) : (
        items.slice(0, 8).map((r, i) => (
          <div key={i} className="si-rot-row">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: FAMILLE_COLORS[r.famille] || "var(--si-ink-3)",
                  flexShrink: 0,
                  display: "inline-block",
                }}
              ></span>
              <span style={{ color: "var(--si-ink)", fontSize: ".82rem" }}>
                {r.nom || r.produit || "—"}
              </span>
            </div>
            <span
              style={{
                color,
                fontWeight: 700,
                fontFamily: "var(--si-mono)",
                fontSize: ".78rem",
              }}
            >
              {r.sorties ?? r.mouvements ?? "—"} mvt/sem
            </span>
          </div>
        ))
      )}
    </div>
  );
}

function TabPrevisions({ data }) {
  if (!data.length)
    return (
      <Empty
        message="Previsions indisponibles — donnees insuffisantes"
        icon="fa-calendar-days"
      />
    );
  return (
    <div>
      <div className="si-prev-info">
        <i
          className="fas fa-info-circle"
          style={{ color: "var(--si-ink-3)", flexShrink: 0, marginTop: 1 }}
        ></i>
        Previsions calculees sur 7 jours basees sur l'historique de
        planification et les tendances de consommation.
      </div>
      {data.map((p, i) => (
        <div key={i} className="si-card" style={{ marginBottom: 10 }}>
          <div className="si-card-head">
            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: ".88rem",
                  color: "var(--si-ink)",
                }}
              >
                {p.nom || p.produit || "—"}
              </div>
              <div
                style={{
                  fontSize: ".72rem",
                  color: "var(--si-ink-3)",
                  marginTop: 2,
                  fontFamily: "var(--si-mono)",
                }}
              >
                {p.clr || "Tous CLR"} — SKU: {p.sku || "—"}
              </div>
            </div>
            <span
              className={`si-badge ${p.risqueRupture ? "si-badge-critique" : "si-badge-ok"}`}
            >
              {p.risqueRupture ? "Risque rupture" : "Stock suffisant"}
            </span>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <div className="si-prev-grid">
              {[
                {
                  label: "Stock actuel",
                  value: p.stockActuel ?? p.stock,
                  color: "var(--si-ink)",
                },
                {
                  label: "Prevu consomme J+7",
                  value: p.prevuConsomme > 0 ? p.prevuConsomme : "—",
                  color: "var(--si-amber)",
                },
                {
                  label: "Stock final estime",
                  value: p.stockFinal ?? "—",
                  color: p.risqueRupture ? "var(--si-red)" : "var(--si-green)",
                },
              ].map((m) => (
                <div key={m.label}>
                  <div
                    style={{
                      fontSize: ".62rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: ".09em",
                      color: "var(--si-ink-3)",
                      marginBottom: 4,
                    }}
                  >
                    {m.label}
                  </div>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      fontFamily: "var(--si-mono)",
                      color: m.color,
                    }}
                  >
                    {m.value ?? "—"}
                  </div>
                </div>
              ))}
            </div>
            {p.suggestion && (
              <div className="si-suggestion" style={{ marginTop: 12 }}>
                <i
                  className="fas fa-lightbulb"
                  style={{ marginRight: 6, color: "var(--si-ink-3)" }}
                ></i>
                {p.suggestion}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TabCarte({ data }) {
  if (!data.length)
    return <Empty message="Donnees de carte indisponibles" icon="fa-map" />;
  return (
    <div>
      <div className="si-carte-grid">
        {data.map((clr, i) => {
          const score = clr.scoreStock ?? clr.score ?? 50;
          const color = scoreColor(score);
          const bg = scoreBg(score);
          const alertCount = clr.alertes ?? 0;
          return (
            <div
              key={i}
              className="si-carte-card"
              style={{ background: bg, borderColor: color + "30" }}
            >
              <div className="si-carte-bar" style={{ background: color }} />
              <div
                style={{
                  fontWeight: 600,
                  fontSize: ".88rem",
                  color: "var(--si-ink)",
                  marginBottom: 2,
                }}
              >
                {clr.nom}
              </div>
              <div
                style={{
                  fontSize: ".72rem",
                  color: "var(--si-ink-3)",
                  marginBottom: 12,
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
                      fontFamily: "var(--si-mono)",
                      color,
                      lineHeight: 1,
                    }}
                  >
                    {score}
                  </div>
                  <div
                    style={{
                      fontSize: ".62rem",
                      color: "var(--si-ink-3)",
                      textTransform: "uppercase",
                      letterSpacing: ".08em",
                    }}
                  >
                    score sante
                  </div>
                </div>
                {alertCount > 0 && (
                  <span className="si-badge si-badge-critique">
                    {alertCount} alerte{alertCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div style={{ marginTop: 10 }}>
                <div className="si-gauge-track">
                  <div
                    className="si-gauge-fill"
                    style={{ width: `${score}%`, background: color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="si-legende">
        {[
          { color: "#1a7a4a", label: "Score >= 75 — Bon" },
          { color: "#b45309", label: "50–74 — A surveiller" },
          { color: "#c0392b", label: "< 50 — Critique" },
        ].map((l) => (
          <div key={l.label} className="si-legende-item">
            <span
              className="si-legende-dot"
              style={{ background: l.color }}
            ></span>
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function Empty({ message, icon }) {
  return (
    <div className="si-empty">
      <i className={`fas ${icon}`}></i>
      <p>{message}</p>
    </div>
  );
}
