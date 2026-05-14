// src/pages/modules/KPIDashboard.jsx — Sprint 14
import { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";
import { DS_STYLE } from "../ds";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const EXTRA = `
  /* ── Layout ── */
  .kpi-page { max-width: 1400px; margin: 0 auto; padding: 0 24px 60px; }

  /* ── Score ring ── */
  .kpi-score-ring {
    position: relative; width: 120px; height: 120px; flex-shrink: 0;
  }
  .kpi-score-ring svg { transform: rotate(-90deg); }
  .kpi-score-center {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
  }
  .kpi-score-nb {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2.2rem; line-height: 1; color: var(--dark);
  }
  .kpi-score-lbl {
    font-size: .52rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .2em; color: #aaa; margin-top: 2px;
  }

  /* ── Hero band ── */
  .kpi-hero {
    display: flex; align-items: center; gap: 28px;
    background: var(--dark); color: #fff;
    padding: 28px 32px; margin-bottom: 28px;
    border-left: 4px solid var(--red);
  }
  .kpi-hero-scores {
    display: flex; gap: 20px; flex: 1; flex-wrap: wrap;
  }
  .kpi-hero-score {
    flex: 1; min-width: 100px; text-align: center;
    padding: 12px 8px;
    border: 1px solid rgba(255,255,255,.08);
  }
  .kpi-hero-score-nb {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2rem; letter-spacing: .05em; line-height: 1;
  }
  .kpi-hero-score-lbl {
    font-size: .55rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .2em; color: rgba(255,255,255,.35); margin-top: 4px;
  }

  /* ── KPI cards top ── */
  .kpi-cards {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 16px; margin-bottom: 28px;
  }
  @media(max-width:900px) { .kpi-cards { grid-template-columns: repeat(2,1fr); } }
  .kpi-card {
    background: #fff; border: 1px solid rgba(0,0,0,.07);
    border-top: 3px solid var(--dark);
    padding: 22px 24px; position: relative; overflow: hidden;
    transition: transform .25s;
  }
  .kpi-card:hover { transform: translateY(-2px); }
  .kpi-card-accent { border-top-color: var(--red); }
  .kpi-card-green  { border-top-color: #10b981; }
  .kpi-card-amber  { border-top-color: #f59e0b; }
  .kpi-card-label {
    font-size: .58rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .25em; color: #aaa; margin-bottom: 10px;
  }
  .kpi-card-val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2.4rem; letter-spacing: .05em; line-height: 1;
    color: var(--dark);
  }
  .kpi-card-sub {
    font-size: .7rem; color: #888; margin-top: 6px;
  }
  .kpi-card-icon {
    position: absolute; right: 18px; top: 50%;
    transform: translateY(-50%);
    font-size: 2.8rem; opacity: .06;
  }

  /* ── Charts grid ── */
  .kpi-charts {
    display: grid; grid-template-columns: 2fr 1fr;
    gap: 20px; margin-bottom: 20px;
  }
  .kpi-charts-3 {
    display: grid; grid-template-columns: 1fr 1fr 1fr;
    gap: 20px; margin-bottom: 20px;
  }
  @media(max-width:1000px) {
    .kpi-charts { grid-template-columns: 1fr; }
    .kpi-charts-3 { grid-template-columns: 1fr; }
  }
  .kpi-chart-panel {
    background: #fff; border: 1px solid rgba(0,0,0,.07);
    border-top: 3px solid var(--dark); overflow: hidden;
  }
  .kpi-chart-head {
    padding: 16px 22px; border-bottom: 1px solid rgba(0,0,0,.06);
    display: flex; align-items: center; justify-content: space-between;
  }
  .kpi-chart-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.05rem; letter-spacing: .08em; color: var(--dark);
  }
  .kpi-chart-body { padding: 16px 22px 20px; }

  /* ── CLR Table ── */
  .kpi-clr-table { width: 100%; border-collapse: collapse; font-size: .8rem; }
  .kpi-clr-table thead tr { background: var(--dark); color: #fff; }
  .kpi-clr-table th {
    padding: 10px 16px; text-align: left;
    font-size: .55rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .2em;
  }
  .kpi-clr-table tbody tr { border-bottom: 1px solid rgba(0,0,0,.05); transition: background .15s; }
  .kpi-clr-table tbody tr:hover { background: rgba(230,57,70,.03); }
  .kpi-clr-table td { padding: 11px 16px; vertical-align: middle; }
  .kpi-clr-dot {
    display: inline-block; width: 9px; height: 9px;
    border-radius: 50%; margin-right: 8px; flex-shrink: 0;
  }

  /* ── Barre progression ── */
  .kpi-bar { height: 5px; background: rgba(0,0,0,.07); border-radius: 3px; margin-top: 5px; }
  .kpi-bar-fill { height: 100%; border-radius: 3px; transition: width .6s; }

  /* ── IA insights ── */
  .kpi-ia-panel {
    background: var(--dark); color: #fff;
    border-left: 4px solid var(--red);
    margin-bottom: 20px;
  }
  .kpi-ia-head {
    padding: 18px 24px; border-bottom: 1px solid rgba(255,255,255,.07);
    display: flex; align-items: center; justify-content: space-between;
  }
  .kpi-ia-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.1rem; letter-spacing: .1em;
    display: flex; align-items: center; gap: 10px;
  }
  .kpi-ia-badge {
    font-size: .55rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .2em; padding: 3px 8px;
    background: var(--red); color: #fff;
  }
  .kpi-ia-body { padding: 22px 24px; }
  .kpi-ia-diagnostic {
    font-size: .9rem; color: rgba(255,255,255,.75);
    line-height: 1.7; margin-bottom: 20px;
    padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,.07);
  }
  .kpi-ia-cols {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;
  }
  @media(max-width:800px) { .kpi-ia-cols { grid-template-columns: 1fr; } }
  .kpi-ia-col-title {
    font-size: .58rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .2em; color: var(--red); margin-bottom: 12px;
  }
  .kpi-ia-item {
    display: flex; gap: 10px; margin-bottom: 10px; align-items: flex-start;
  }
  .kpi-ia-bullet {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--red); flex-shrink: 0; margin-top: 6px;
  }
  .kpi-ia-text { font-size: .78rem; color: rgba(255,255,255,.65); line-height: 1.5; }
  .kpi-ia-loading {
    display: flex; align-items: center; gap: 12px;
    padding: 24px; font-size: .72rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .2em; color: rgba(255,255,255,.3);
  }
  .kpi-ia-spinner {
    width: 20px; height: 20px; border: 2px solid rgba(255,255,255,.1);
    border-top-color: var(--red); border-radius: 50%;
    animation: spin .8s linear infinite; flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Période selector ── */
  .kpi-periode-btns { display: flex; gap: 6px; }
  .kpi-periode-btn {
    font-size: .6rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .15em; padding: 5px 12px;
    border: 1px solid rgba(0,0,0,.12); background: transparent;
    cursor: pointer; transition: all .2s; color: #666;
  }
  .kpi-periode-btn.active { background: var(--dark); color: #fff; border-color: var(--dark); }

  /* ── Diapason bars ── */
  .kpi-diap-bars { display: flex; flex-direction: column; gap: 10px; padding: 4px 0; }
  .kpi-diap-row { display: flex; align-items: center; gap: 10px; }
  .kpi-diap-label {
    font-family: 'Bebas Neue', sans-serif;
    font-size: .9rem; letter-spacing: .06em;
    width: 28px; flex-shrink: 0; color: var(--dark);
  }
  .kpi-diap-bar-wrap { flex: 1; height: 8px; background: rgba(0,0,0,.06); border-radius: 4px; }
  .kpi-diap-bar-fill { height: 100%; border-radius: 4px; background: var(--dark); transition: width .5s; }
  .kpi-diap-count { font-size: .72rem; font-weight: 700; color: #555; width: 24px; text-align: right; }
`;

// ── Couleurs recharts ──
const COLORS = ["#e63946", "#080808", "#10b981", "#f59e0b", "#3b82f6"];
const CLR_COULEURS = { VERT: "#10b981", ORANGE: "#f59e0b", ROUGE: "#ef4444", NEUTRE: "#94a3b8" };

// ── Score ring SVG ──
function ScoreRing({ score, color = "#e63946", size = 120 }) {
  const r = 48; const circ = 2 * Math.PI * r;
  const fill = ((score || 0) / 100) * circ;
  return (
    <div className="kpi-score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(0,0,0,.06)" strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color}
          strokeWidth="8" strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round" style={{ transition: "stroke-dasharray .8s" }} />
      </svg>
      <div className="kpi-score-center">
        <div className="kpi-score-nb" style={{ color }}>{score ?? "—"}</div>
        <div className="kpi-score-lbl">/ 100</div>
      </div>
    </div>
  );
}

// ── Tooltip recharts custom ──
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#080808", color: "#fff", padding: "10px 14px", fontSize: ".72rem" }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: "#e63946" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, display: "inline-block" }}></span>
          {p.name} : <strong>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</strong>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════
export default function KPIDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [iaInsights, setIaInsights] = useState(null);
  const [iaLoading, setIaLoading] = useState(false);
  const [periode, setPeriode] = useState(30);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: d } = await api.get("/kpi/synthese");
      setData(d);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fetchIA = async () => {
    if (iaLoading || iaInsights) return;
    setIaLoading(true);
    try {
      const { data: d } = await api.post("/kpi/ia-insights", {});
      setIaInsights(d.insights);
    } catch { setIaInsights({ diagnostic: "Analyse indisponible.", pointsCritiques: [], opportunites: [], recommandations: [] }); }
    finally { setIaLoading(false); }
  };

  useEffect(() => {
    if (data && !iaInsights && !iaLoading) fetchIA();
  }, [data]);

  // ── Données dérivées ──
  const flux = data?.flux;
  const periodeKey = `j${periode}`;
  const courbe = flux?.courbe30j || [];
  const diapasons = flux?.repartitionDiapasons || {};
  const maxDiap = Math.max(...Object.values(diapasons), 1);

  const familles = (data?.stock?.repartitionFamilles || []).map((f) => ({
    name: f.famille, value: f.qte,
  }));

  const evolutionMensuelle = data?.commandes?.evolutionMensuelle || [];

  const clrsDashboard = (data?.clrs?.dashboard || [])
    .sort((a, b) => {
      const ordre = { ROUGE: 0, ORANGE: 1, VERT: 2, NEUTRE: 3 };
      return (ordre[a.niveau] ?? 4) - (ordre[b.niveau] ?? 4);
    })
    .slice(0, 12);

  const scoreColor = (s) => s >= 75 ? "#10b981" : s >= 50 ? "#f59e0b" : "#ef4444";

  if (loading) return (
    <div className="ds-page">
      <style dangerouslySetInnerHTML={{ __html: DS_STYLE + EXTRA }} />
      <div className="kpi-page">
        <div className="ds-loading">Chargement du tableau de bord…</div>
      </div>
    </div>
  );

  return (
    <div className="ds-page">
      <style dangerouslySetInnerHTML={{ __html: DS_STYLE + EXTRA }} />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />

      <div className="kpi-page">

        {/* ── Header ── */}
        <div className="ds-header">
          <div className="ds-header-eyebrow"><span>Management</span></div>
          <h1 className="ds-title">KPI DASH<span>BOARD</span></h1>
          <p className="ds-subtitle">Synthèse globale · Stock · Transport · Flux · Analyse IA</p>
        </div>

        {/* ── Hero band — scores globaux ── */}
        <div className="kpi-hero">
          <ScoreRing score={data?.scoreGlobal} color={scoreColor(data?.scoreGlobal || 0)} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: ".58rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".25em", color: "rgba(255,255,255,.3)", marginBottom: 10 }}>
              SCORES COMPOSITES
            </div>
            <div className="kpi-hero-scores">
              {[
                { lbl: "Stock", score: data?.scoreStock },
                { lbl: "Taux Service", score: data?.scoreTauxService },
                { lbl: "Transport", score: data?.scoreTransport },
              ].map((s) => (
                <div key={s.lbl} className="kpi-hero-score">
                  <div className="kpi-hero-score-nb" style={{ color: scoreColor(s.score || 0) }}>{s.score ?? "—"}<span style={{ fontSize: ".9rem", opacity: .5 }}>%</span></div>
                  <div className="kpi-hero-score-lbl">{s.lbl}</div>
                </div>
              ))}
              <div className="kpi-hero-score">
                <div className="kpi-hero-score-nb" style={{ color: "#ef4444" }}>{data?.alertes?.nbCritiques ?? 0}</div>
                <div className="kpi-hero-score-lbl">CLR critiques</div>
              </div>
              <div className="kpi-hero-score">
                <div className="kpi-hero-score-nb" style={{ color: "#f59e0b" }}>{data?.alertes?.nbWarnings ?? 0}</div>
                <div className="kpi-hero-score-lbl">En alerte</div>
              </div>
            </div>
          </div>
          <button className="ds-btn ds-btn-red" onClick={fetchData} style={{ flexShrink: 0 }}>
            <i className="fas fa-sync-alt"></i> Actualiser
          </button>
        </div>

        {/* ── 4 KPI cards ── */}
        <div className="kpi-cards">
          {[
            {
              lbl: "Valeur stock total",
              val: data?.stock?.valeurTotaleDZD
                ? (data.stock.valeurTotaleDZD / 1_000_000).toFixed(1) + " M"
                : "—",
              sub: "DZD — stock physique confirmé",
              icon: "fa-boxes-stacked", cls: "kpi-card-accent",
            },
            {
              lbl: "Taux de service",
              val: (data?.commandes?.tauxServiceGlobal ?? "—") + "%",
              sub: `${data?.commandes?.nbLivrees ?? 0} / ${data?.commandes?.nbTotal ?? 0} commandes livrées`,
              icon: "fa-chart-line", cls: "kpi-card-green",
            },
            {
              lbl: "Remplissage camions",
              val: (data?.transport?.tauxRemplissageMoyen ?? "—") + "%",
              sub: `${data?.transport?.nbOrdresTotal ?? 0} ordres transport total`,
              icon: "fa-truck", cls: "kpi-card-amber",
            },
            {
              lbl: "Ruptures actives",
              val: data?.stock?.nbRuptures ?? "—",
              sub: `${data?.stock?.nbAlertes ?? 0} alertes stock au total`,
              icon: "fa-triangle-exclamation", cls: "",
            },
          ].map((k) => (
            <div key={k.lbl} className={`kpi-card ${k.cls}`}>
              <div className="kpi-card-label">{k.lbl}</div>
              <div className="kpi-card-val">{k.val}</div>
              <div className="kpi-card-sub">{k.sub}</div>
              <i className={`fas ${k.icon} kpi-card-icon`}></i>
            </div>
          ))}
        </div>

        {/* ── IA Insights ── */}
        <div className="kpi-ia-panel">
          <div className="kpi-ia-head">
            <div className="kpi-ia-title">
              <i className="fas fa-brain"></i>
              Analyse IA — Recommandations logistiques
              <span className="kpi-ia-badge">Claude AI</span>
            </div>
            <button className="ds-btn ds-btn-red" style={{ padding: "7px 14px", fontSize: ".6rem" }}
              onClick={() => { setIaInsights(null); setTimeout(fetchIA, 100); }}>
              <i className="fas fa-rotate"></i> Régénérer
            </button>
          </div>
          <div className="kpi-ia-body">
            {iaLoading && (
              <div className="kpi-ia-loading">
                <div className="kpi-ia-spinner"></div>
                Analyse des données en cours…
              </div>
            )}
            {iaInsights && !iaLoading && (
              <>
                <div className="kpi-ia-diagnostic">{iaInsights.diagnostic}</div>
                <div className="kpi-ia-cols">
                  {[
                    { title: "Points critiques", items: iaInsights.pointsCritiques || [], color: "#ef4444" },
                    { title: "Opportunités", items: iaInsights.opportunites || [], color: "#10b981" },
                    { title: "Recommandations", items: iaInsights.recommandations || [], color: "#f59e0b" },
                  ].map((col) => (
                    <div key={col.title}>
                      <div className="kpi-ia-col-title" style={{ color: col.color }}>{col.title}</div>
                      {col.items.map((item, i) => (
                        <div key={i} className="kpi-ia-item">
                          <div className="kpi-ia-bullet" style={{ background: col.color }}></div>
                          <div className="kpi-ia-text">{item}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                {iaInsights.scoreCommentaire && (
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.07)", fontSize: ".72rem", color: "rgba(255,255,255,.4)", fontStyle: "italic" }}>
                    {iaInsights.scoreCommentaire}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Charts ligne 1 : courbe flux + diapasons ── */}
        <div className="kpi-charts">
          <div className="kpi-chart-panel">
            <div className="kpi-chart-head">
              <span className="kpi-chart-title">Flux stock — entrées / sorties</span>
              <div className="kpi-periode-btns">
                {[30, 60, 90].map((j) => (
                  <button key={j} className={`kpi-periode-btn ${periode === j ? "active" : ""}`}
                    onClick={() => setPeriode(j)}>J-{j}</button>
                ))}
              </div>
            </div>
            <div className="kpi-chart-body" style={{ height: 240 }}>
              {courbe.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={courbe} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#aaa" }}
                      tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 10, fill: "#aaa" }} width={40} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: ".65rem" }} />
                    <Line type="monotone" dataKey="entrees" name="Entrées" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="sorties" name="Sorties" stroke="#e63946" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#bbb", fontSize: ".75rem" }}>
                  Pas de données de flux disponibles
                </div>
              )}
            </div>
          </div>

          <div className="kpi-chart-panel">
            <div className="kpi-chart-head">
              <span className="kpi-chart-title">Diapasons utilisés</span>
            </div>
            <div className="kpi-chart-body">
              {Object.keys(diapasons).length > 0 ? (
                <div className="kpi-diap-bars">
                  {["D1", "D2", "D3", "D4", "D5"].map((d) => {
                    const n = diapasons[d] || 0;
                    return (
                      <div key={d} className="kpi-diap-row">
                        <span className="kpi-diap-label">{d}</span>
                        <div className="kpi-diap-bar-wrap">
                          <div className="kpi-diap-bar-fill" style={{ width: `${Math.round((n / maxDiap) * 100)}%` }}></div>
                        </div>
                        <span className="kpi-diap-count">{n}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ color: "#bbb", fontSize: ".75rem", padding: "20px 0" }}>Aucun diapason enregistré</div>
              )}
            </div>
          </div>
        </div>

        {/* ── Charts ligne 2 : évolution commandes + familles produits + taux service ── */}
        <div className="kpi-charts-3">
          <div className="kpi-chart-panel">
            <div className="kpi-chart-head">
              <span className="kpi-chart-title">Évolution commandes</span>
            </div>
            <div className="kpi-chart-body" style={{ height: 200 }}>
              {evolutionMensuelle.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={evolutionMensuelle} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
                    <XAxis dataKey="mois" tick={{ fontSize: 9, fill: "#aaa" }}
                      tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 9, fill: "#aaa" }} width={30} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="total" name="Total" fill="#080808" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="livrees" name="Livrées" fill="#e63946" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#bbb", fontSize: ".75rem" }}>
                  Pas de données
                </div>
              )}
            </div>
          </div>

          <div className="kpi-chart-panel">
            <div className="kpi-chart-head">
              <span className="kpi-chart-title">Stock par famille</span>
            </div>
            <div className="kpi-chart-body" style={{ height: 200 }}>
              {familles.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={familles} cx="50%" cy="50%" outerRadius={75}
                      dataKey="value" nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                      style={{ fontSize: ".6rem" }}>
                      {familles.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#bbb", fontSize: ".75rem" }}>
                  Pas de données
                </div>
              )}
            </div>
          </div>

          <div className="kpi-chart-panel">
            <div className="kpi-chart-head">
              <span className="kpi-chart-title">Taux service 30 / 60 / 90j</span>
            </div>
            <div className="kpi-chart-body">
              {[30, 60, 90].map((j) => {
                const v = data?.commandes?.volumes?.[`j${j}`];
                const taux = v?.tauxService || 0;
                return (
                  <div key={j} style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: ".68rem", fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: ".1em" }}>J-{j}</span>
                      <span style={{ fontSize: ".8rem", fontWeight: 800, color: taux >= 80 ? "#10b981" : taux >= 60 ? "#f59e0b" : "#ef4444" }}>{taux}%</span>
                    </div>
                    <div className="kpi-bar">
                      <div className="kpi-bar-fill" style={{
                        width: `${taux}%`,
                        background: taux >= 80 ? "#10b981" : taux >= 60 ? "#f59e0b" : "#ef4444",
                      }}></div>
                    </div>
                    <div style={{ fontSize: ".62rem", color: "#aaa", marginTop: 3 }}>
                      {v?.nbLivrees ?? 0} / {v?.nbCommandes ?? 0} commandes
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Tableau CLR ── */}
        <div className="kpi-chart-panel" style={{ marginBottom: 20 }}>
          <div className="kpi-chart-head">
            <span className="kpi-chart-title">État réseau CLR</span>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { lbl: "OK", nb: data?.clrs?.resume?.totalVert, color: "#10b981" },
                { lbl: "Alerte", nb: data?.clrs?.resume?.totalOrange, color: "#f59e0b" },
                { lbl: "Rupture", nb: data?.clrs?.resume?.totalRouge, color: "#ef4444" },
              ].map((s) => (
                <div key={s.lbl} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: s.color, fontFamily: "'Bebas Neue', sans-serif" }}>{s.nb ?? 0}</div>
                  <div style={{ fontSize: ".55rem", textTransform: "uppercase", letterSpacing: ".15em", color: "#aaa" }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="kpi-clr-table">
              <thead>
                <tr>
                  {["Statut", "CLR", "Wilaya", "Stock actuel", "Commandes dues", "Écart", "Ratio"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clrsDashboard.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", color: "#aaa", padding: 32 }}>Aucune donnée CLR</td></tr>
                ) : (
                  clrsDashboard.map((d) => (
                    <tr key={d.clr.id}>
                      <td>
                        <span className="kpi-clr-dot" style={{ background: CLR_COULEURS[d.niveau] || "#aaa" }}></span>
                        <span style={{ fontSize: ".6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: CLR_COULEURS[d.niveau] || "#aaa" }}>
                          {d.niveau}
                        </span>
                      </td>
                      <td style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: ".9rem", letterSpacing: ".05em" }}>
                        {d.clr.code} <span style={{ fontFamily: "inherit", fontSize: ".7rem", color: "#888", fontFamily: "DM Sans" }}>— {d.clr.nom}</span>
                      </td>
                      <td style={{ color: "#666", fontSize: ".78rem" }}>{d.clr.wilaya}</td>
                      <td style={{ fontWeight: 700 }}>{(d.stockActuel || 0).toLocaleString()} u</td>
                      <td style={{ color: "#666" }}>{(d.commandesDues || 0).toLocaleString()} u</td>
                      <td style={{ fontWeight: 700, color: d.ecart < 0 ? "#ef4444" : "#10b981" }}>
                        {d.ecart > 0 ? "+" : ""}{(d.ecart || 0).toLocaleString()} u
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 60, height: 5, background: "rgba(0,0,0,.08)", borderRadius: 3 }}>
                            <div style={{
                              height: "100%", borderRadius: 3,
                              width: `${Math.min(100, (d.ratio || 0) * 50)}%`,
                              background: CLR_COULEURS[d.niveau] || "#aaa",
                            }}></div>
                          </div>
                          <span style={{ fontSize: ".68rem", fontWeight: 700 }}>{d.ratio}x</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Footer timestamp ── */}
        <div style={{ textAlign: "center", fontSize: ".62rem", color: "#bbb", letterSpacing: ".15em", textTransform: "uppercase" }}>
          Données au {data?.generatedAt ? new Date(data.generatedAt).toLocaleString("fr-DZ") : "—"}
        </div>

      </div>
    </div>
  );
}
