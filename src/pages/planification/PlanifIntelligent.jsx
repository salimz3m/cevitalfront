// pages/planification/PlanifIntelligent.jsx
import { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";
import { DS_STYLE } from "../ds";

// ── Styles spécifiques ────────────────────────────────────────
const EXTRA = `
  .pi-grid-clrs {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px;
    margin-bottom: 28px;
  }

  .pi-clr-card {
    border-radius: 6px;
    padding: 16px 18px;
    border-left: 4px solid transparent;
    transition: transform .15s;
    cursor: default;
  }
  .pi-clr-card:hover { transform: translateY(-2px); }
  .pi-clr-card.green  { background: rgba(16,185,129,.08);  border-color: #10b981; }
  .pi-clr-card.orange { background: rgba(245,158,11,.08);  border-color: #f59e0b; }
  .pi-clr-card.red    { background: rgba(239,68,68,.08);   border-color: #ef4444; }
  .pi-clr-card.grey   { background: rgba(100,116,139,.06); border-color: #64748b; }

  .pi-clr-code {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.1rem; letter-spacing: .1em;
    margin-bottom: 2px;
  }
  .pi-clr-nom  { font-size: .72rem; color: #888; margin-bottom: 10px; }
  .pi-clr-stat { font-size: .78rem; font-weight: 700; margin-bottom: 2px; }
  .pi-clr-msg  { font-size: .68rem; color: #666; line-height: 1.4; }

  .pi-niveau-dot {
    display: inline-block;
    width: 8px; height: 8px; border-radius: 50%;
    margin-right: 6px;
  }
  .pi-niveau-dot.green  { background: #10b981; }
  .pi-niveau-dot.orange { background: #f59e0b; }
  .pi-niveau-dot.red    { background: #ef4444; }
  .pi-niveau-dot.grey   { background: #64748b; }

  .pi-tabs {
    display: flex; gap: 0; margin-bottom: 24px;
    border-bottom: 2px solid rgba(0,0,0,.08);
  }
  .pi-tab {
    padding: 10px 20px; font-size: .78rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .12em;
    cursor: pointer; border: none; background: none;
    color: #aaa; border-bottom: 3px solid transparent;
    margin-bottom: -2px; transition: all .2s;
    font-family: 'DM Sans', sans-serif;
  }
  .pi-tab.active { color: var(--dark); border-bottom-color: var(--red); }
  .pi-tab:hover:not(.active) { color: #555; }

  .pi-alert-card {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 14px 18px; margin-bottom: 10px;
    border-left: 4px solid transparent;
  }
  .pi-alert-card.CRITIQUE { background: rgba(239,68,68,.07);  border-color: #ef4444; }
  .pi-alert-card.ATTENTION { background: rgba(245,158,11,.07); border-color: #f59e0b; }

  .pi-alert-icon { font-size: 1.2rem; flex-shrink: 0; margin-top: 2px; }
  .pi-alert-title { font-weight: 700; font-size: .85rem; margin-bottom: 3px; }
  .pi-alert-sub   { font-size: .73rem; color: #666; }
  .pi-alert-action { font-size: .7rem; font-weight: 700; margin-top: 6px; text-transform: uppercase; letter-spacing: .08em; }
  .pi-alert-action.CRITIQUE { color: #ef4444; }
  .pi-alert-action.ATTENTION { color: #f59e0b; }

  .pi-simul-form {
    display: grid; grid-template-columns: 1fr 1fr 120px auto;
    gap: 12px; align-items: end; margin-bottom: 20px;
  }
  @media(max-width: 900px) { .pi-simul-form { grid-template-columns: 1fr 1fr; } }

  .pi-simul-result {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 16px; margin-top: 16px;
  }

  .pi-simul-bloc {
    padding: 16px 18px;
    background: rgba(0,0,0,.03);
    border-left: 3px solid rgba(0,0,0,.1);
  }
  .pi-simul-bloc.apres { background: rgba(59,130,246,.05); border-color: #3b82f6; }
  .pi-simul-label { font-size: .65rem; text-transform: uppercase; letter-spacing: .15em; color: #999; margin-bottom: 6px; font-weight: 700; }
  .pi-simul-val   { font-size: 1.3rem; font-weight: 800; color: var(--dark); }
  .pi-simul-sub   { font-size: .72rem; color: #888; margin-top: 2px; }

  .pi-optim-card {
    padding: 14px 18px; margin-bottom: 10px;
    background: rgba(0,0,0,.02);
    border-left: 3px solid var(--dark);
    display: grid; grid-template-columns: 80px 1fr auto;
    align-items: center; gap: 14px;
  }
  .pi-optim-code { font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; letter-spacing: .08em; }
  .pi-optim-reco { font-size: .78rem; font-weight: 700; color: var(--dark); }
  .pi-optim-sub  { font-size: .68rem; color: #888; }
  .pi-optim-badge {
    font-size: .65rem; font-weight: 700; padding: 4px 10px;
    background: var(--dark); color: #fff; text-transform: uppercase;
    letter-spacing: .1em;
  }

  .pi-diap-result {
    padding: 20px; background: rgba(0,0,0,.03); margin-top: 16px;
  }
  .pi-diap-suggestion {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2.5rem; letter-spacing: .15em; color: var(--red);
    margin-bottom: 4px;
  }
  .pi-diap-raison { font-size: .85rem; color: #444; margin-bottom: 12px; }
  .pi-diap-score  { font-size: .72rem; color: #888; font-weight: 700; }

  .pi-stat-row {
    display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;
  }
  .pi-stat {
    flex: 1; min-width: 100px;
    padding: 14px 18px; text-align: center;
    border-top: 3px solid transparent;
  }
  .pi-stat-nb  { font-size: 2rem; font-weight: 800; line-height: 1; margin-bottom: 4px; }
  .pi-stat-lbl { font-size: .65rem; font-weight: 700; text-transform: uppercase; letter-spacing: .15em; color: #999; }
  .pi-stat.green  { border-color: #10b981; } .pi-stat.green  .pi-stat-nb { color: #10b981; }
  .pi-stat.orange { border-color: #f59e0b; } .pi-stat.orange .pi-stat-nb { color: #f59e0b; }
  .pi-stat.red    { border-color: #ef4444; } .pi-stat.red    .pi-stat-nb { color: #ef4444; }
  .pi-stat.grey   { border-color: #64748b; } .pi-stat.grey   .pi-stat-nb { color: #64748b; }

  .pi-region-title {
    font-size: .62rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .2em; color: #aaa; margin: 20px 0 10px;
    padding-bottom: 6px; border-bottom: 1px solid rgba(0,0,0,.07);
  }
`;

// ── Helpers ───────────────────────────────────────────────────
const COULEUR_ICON = { green: "✅", orange: "⚠️", red: "🔴", grey: "⬜" };
const REGION_LABEL = { EST: "Région Est", CENTRE: "Région Centre", OUEST: "Région Ouest" };

// ════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════
export default function PlanifIntelligent() {
  const [tab, setTab] = useState("dashboard");

  // Dashboard
  const [dashboard, setDashboard] = useState(null);
  const [resume, setResume]       = useState(null);
  const [loadingDash, setLoadingDash] = useState(true);

  // Alertes
  const [alertes, setAlertes]         = useState(null);
  const [loadingAlertes, setLoadingAlertes] = useState(false);

  // Simulation
  const [clrs, setClrs]               = useState([]);
  const [simForm, setSimForm]         = useState({ clrId: "", quantite: "", diapason: "D1" });
  const [simResult, setSimResult]     = useState(null);
  const [simLoading, setSimLoading]   = useState(false);

  // Suggestion diapason
  const [suggClrId, setSuggClrId]     = useState("");
  const [suggResult, setSuggResult]   = useState(null);
  const [suggLoading, setSuggLoading] = useState(false);

  // Optimisation
  const [sessions, setSessions]       = useState([]);
  const [optimSessionId, setOptimSessionId] = useState("");
  const [optimResult, setOptimResult] = useState(null);
  const [optimLoading, setOptimLoading] = useState(false);

  // ── Chargement initial ──────────────────────────────────────
  useEffect(() => {
    loadDashboard();
    api.get("/infrastructure/clrs").then(({ data }) => setClrs(data)).catch(() => {});
    api.get("/planification/sessions").then(({ data }) => setSessions(data.filter(s => s.lignes?.length > 0))).catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === "alertes" && !alertes) loadAlertes();
  }, [tab]);

  const loadDashboard = async () => {
    setLoadingDash(true);
    try {
      const { data } = await api.get("/modules/planning-intel/dashboard");
      setDashboard(data.dashboard);
      setResume(data.resume);
    } catch { }
    finally { setLoadingDash(false); }
  };

  const loadAlertes = async () => {
    setLoadingAlertes(true);
    try {
      const { data } = await api.get("/modules/planning-intel/alertes");
      setAlertes(data);
    } catch { }
    finally { setLoadingAlertes(false); }
  };

  const handleSimuler = async () => {
    if (!simForm.clrId || !simForm.quantite) return;
    setSimLoading(true);
    setSimResult(null);
    try {
      const { data } = await api.post("/modules/planning-intel/simuler", {
        clrId:    parseInt(simForm.clrId),
        quantite: parseFloat(simForm.quantite),
        diapason: simForm.diapason,
      });
      setSimResult(data);
    } catch { }
    finally { setSimLoading(false); }
  };

  const handleSuggestion = async () => {
    if (!suggClrId) return;
    setSuggLoading(true);
    setSuggResult(null);
    try {
      const { data } = await api.get(`/modules/planning-intel/suggestion-diapason/${suggClrId}`);
      setSuggResult(data);
    } catch { }
    finally { setSuggLoading(false); }
  };

  const handleOptimisation = async () => {
    if (!optimSessionId) return;
    setOptimLoading(true);
    setOptimResult(null);
    try {
      const { data } = await api.get(`/modules/planning-intel/optimisation/${optimSessionId}`);
      setOptimResult(data);
    } catch { }
    finally { setOptimLoading(false); }
  };

  // ── Grouper CLR par région ──────────────────────────────────
  const dashParRegion = dashboard
    ? ["EST", "CENTRE", "OUEST"].reduce((acc, r) => {
        acc[r] = dashboard.filter((d) => d.clr.region === r);
        return acc;
      }, {})
    : {};

  // ── RENDER ──────────────────────────────────────────────────
  return (
    <div className="ds-page">
      <style dangerouslySetInnerHTML={{ __html: DS_STYLE + EXTRA }} />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />

      {/* Header */}
      <div className="ds-header">
        <div className="ds-header-eyebrow">
          <span>Module Intelligent</span>
          <span style={{ background: "rgba(230,57,70,.12)", color: "var(--red)", padding: "2px 8px", fontSize: ".6rem", fontWeight: 700, letterSpacing: ".15em", marginLeft: 8 }}>
            IA ACTIVÉE
          </span>
        </div>
        <h1 className="ds-title">PLANNING <span>INTELLIGENT</span></h1>
        <p className="ds-subtitle">
          Analyse en temps réel — suggestions diapason — alertes rupture — simulation de flux
        </p>
      </div>

      {/* Tabs */}
      <div className="pi-tabs">
        {[
          { id: "dashboard",   label: "Dashboard CLR",        icon: "fa-chart-bar" },
          { id: "alertes",     label: "Alertes",              icon: "fa-bell" },
          { id: "suggestion",  label: "Suggestion Diapason",  icon: "fa-lightbulb" },
          { id: "simulation",  label: "Simulation Flux",      icon: "fa-flask" },
          { id: "optimisation",label: "Optimisation",         icon: "fa-truck-loading" },
        ].map((t) => (
          <button key={t.id} className={`pi-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            <i className={`fas ${t.icon}`} style={{ marginRight: 6 }}></i>{t.label}
            {t.id === "alertes" && resume && (resume.totalOrange + resume.totalRouge) > 0 && (
              <span style={{ marginLeft: 6, background: "#ef4444", color: "#fff", borderRadius: "50%", padding: "1px 6px", fontSize: ".65rem", fontWeight: 800 }}>
                {resume.totalOrange + resume.totalRouge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB : DASHBOARD ──────────────────────────────────── */}
      {tab === "dashboard" && (
        <div>
          {loadingDash ? (
            <div className="ds-loading">Analyse en cours…</div>
          ) : !dashboard ? (
            <div className="ds-empty"><p>Impossible de charger le dashboard</p></div>
          ) : (
            <>
              {/* Stats globales */}
              {resume && (
                <div className="pi-stat-row">
                  {[
                    { cls: "green",  nb: resume.totalVert,   lbl: "CLR en bonne santé" },
                    { cls: "orange", nb: resume.totalOrange, lbl: "CLR en attention" },
                    { cls: "red",    nb: resume.totalRouge,  lbl: "CLR en rupture" },
                    { cls: "grey",   nb: resume.totalNeutre, lbl: "CLR sans activité" },
                  ].map((s) => (
                    <div key={s.cls} className={`pi-stat ds-panel ${s.cls}`}>
                      <div className="pi-stat-nb">{s.nb}</div>
                      <div className="pi-stat-lbl">{s.lbl}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* CLR par région */}
              {["EST", "CENTRE", "OUEST"].map((region) => {
                const items = dashParRegion[region] || [];
                if (!items.length) return null;
                return (
                  <div key={region}>
                    <div className="pi-region-title">
                      <i className="fas fa-map-marker-alt" style={{ marginRight: 6, color: "var(--red)" }}></i>
                      {REGION_LABEL[region]} — {items.length} CLR
                    </div>
                    <div className="pi-grid-clrs">
                      {items.map((d) => (
                        <div key={d.clr.id} className={`pi-clr-card ${d.couleur}`}>
                          <div className="pi-clr-code">
                            <span className={`pi-niveau-dot ${d.couleur}`}></span>
                            {d.clr.code}
                          </div>
                          <div className="pi-clr-nom">{d.clr.nom} — {d.clr.wilaya}</div>
                          <div className="pi-clr-stat">Stock : {d.stockActuel.toLocaleString()} u</div>
                          <div className="pi-clr-stat">Commandes : {d.commandesDues.toLocaleString()} u</div>
                          <div className="pi-clr-msg">{d.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div style={{ textAlign: "right" }}>
                <button className="ds-btn ds-btn-outline" onClick={loadDashboard} style={{ fontSize: ".72rem" }}>
                  <i className="fas fa-sync-alt" style={{ marginRight: 6 }}></i>Actualiser
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB : ALERTES ────────────────────────────────────── */}
      {tab === "alertes" && (
        <div>
          <div className="ds-panel">
            <div className="ds-panel-head">
              <span className="ds-panel-title">Alertes rupture anticipée</span>
              <button className="ds-btn ds-btn-outline" onClick={loadAlertes} style={{ fontSize: ".72rem" }}>
                <i className="fas fa-sync-alt" style={{ marginRight: 6 }}></i>Actualiser
              </button>
            </div>
            <div style={{ padding: "16px 20px" }}>
              {loadingAlertes ? (
                <div className="ds-loading">Analyse des alertes…</div>
              ) : !alertes ? (
                <div className="ds-empty"><p>Chargement…</p></div>
              ) : alertes.nbAlertes === 0 ? (
                <div className="ds-empty" style={{ padding: 40 }}>
                  <i className="fas fa-check-circle" style={{ fontSize: "2rem", color: "#10b981", marginBottom: 12, display: "block" }}></i>
                  <p style={{ color: "#10b981", fontWeight: 700 }}>Aucune alerte — tous les CLR sont en ordre</p>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: ".75rem", color: "#666", marginBottom: 16 }}>
                    {alertes.nbAlertes} alerte(s) — analyse du {new Date(alertes.dateAnalyse).toLocaleString("fr-DZ")}
                  </div>
                  {alertes.alertes.map((a, i) => (
                    <div key={i} className={`pi-alert-card ${a.urgence}`}>
                      <div className="pi-alert-icon">{a.urgence === "CRITIQUE" ? "🔴" : "⚠️"}</div>
                      <div>
                        <div className="pi-alert-title">{a.clr.code} — {a.clr.nom}</div>
                        <div className="pi-alert-sub">
                          Stock actuel : {a.stockActuel} u · Commandes dues : {a.commandesDues} u · Écart : {a.ecart} u
                        </div>
                        <div className="pi-alert-sub">{a.message}</div>
                        <div className={`pi-alert-action ${a.urgence}`}>→ {a.action}</div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB : SUGGESTION DIAPASON ────────────────────────── */}
      {tab === "suggestion" && (
        <div>
          <div className="ds-panel">
            <div className="ds-panel-head">
              <span className="ds-panel-title">Suggestion de diapason</span>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <p style={{ fontSize: ".82rem", color: "#666", marginBottom: 20 }}>
                Sélectionnez un CLR pour obtenir une recommandation D1 ou D2 basée sur le stock actuel, la capacité de la plateforme et les livraisons en cours.
              </p>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 24 }}>
                <div className="ds-field" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="ds-field-label">CLR de destination</label>
                  <select className="ds-input" value={suggClrId} onChange={(e) => { setSuggClrId(e.target.value); setSuggResult(null); }}>
                    <option value="">— Choisir un CLR —</option>
                    {clrs.map((c) => (
                      <option key={c.id} value={c.id}>{c.code} — {c.nom} ({c.region})</option>
                    ))}
                  </select>
                </div>
                <button className="ds-btn ds-btn-dark" onClick={handleSuggestion} disabled={!suggClrId || suggLoading}>
                  {suggLoading ? "Analyse…" : <><i className="fas fa-lightbulb" style={{ marginRight: 6 }}></i>Analyser</>}
                </button>
              </div>

              {suggResult && (
                <div className="pi-diap-result">
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: ".65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".15em", color: "#999", marginBottom: 4 }}>RECOMMANDATION</div>
                    <div className="pi-diap-suggestion">DIAPASON {suggResult.suggestion}</div>
                    <div className="pi-diap-raison">{suggResult.raison}</div>
                    <div className="pi-diap-score">Score de confiance : {suggResult.score}%</div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
                    {[
                      { lbl: "Stock CLR actuel",      val: suggResult.stockActuelCLR + " u" },
                      { lbl: "Stock plateforme",      val: suggResult.stockPlateforme > 0 ? suggResult.stockPlateforme + " u" : "N/A" },
                      { lbl: "Livraisons actives",    val: suggResult.nbLignesActives },
                    ].map((s) => (
                      <div key={s.lbl} style={{ padding: "12px 14px", background: "rgba(0,0,0,.04)" }}>
                        <div style={{ fontSize: ".62rem", textTransform: "uppercase", letterSpacing: ".12em", color: "#999", marginBottom: 4 }}>{s.lbl}</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>{s.val}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
                    {["D1", "D2"].map((d) => {
                      const alt = suggResult.alternatives[d];
                      const isReco = d === suggResult.suggestion;
                      return (
                        <div key={d} style={{
                          flex: 1, padding: "12px 16px",
                          border: `2px solid ${isReco ? "var(--red)" : "rgba(0,0,0,.1)"}`,
                          background: isReco ? "rgba(230,57,70,.04)" : "transparent",
                        }}>
                          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: ".1em", color: isReco ? "var(--red)" : "#333" }}>
                            {isReco && "★ "}{d === "D1" ? "Via Plateforme" : "Direct CLR"}
                          </div>
                          <div style={{ fontSize: ".72rem", color: "#666", marginTop: 4 }}>{alt.description}</div>
                          {!alt.disponible && <div style={{ fontSize: ".68rem", color: "#ef4444", marginTop: 4 }}>Non disponible</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB : SIMULATION ─────────────────────────────────── */}
      {tab === "simulation" && (
        <div>
          <div className="ds-panel">
            <div className="ds-panel-head">
              <span className="ds-panel-title">Simulation de flux</span>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <p style={{ fontSize: ".82rem", color: "#666", marginBottom: 20 }}>
                Simulez l'impact d'un envoi sur le stock CLR et la plateforme avant de planifier.
              </p>

              <div className="pi-simul-form">
                <div className="ds-field" style={{ marginBottom: 0 }}>
                  <label className="ds-field-label">CLR destination</label>
                  <select className="ds-input" value={simForm.clrId} onChange={(e) => setSimForm({ ...simForm, clrId: e.target.value })}>
                    <option value="">— CLR —</option>
                    {clrs.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.nom}</option>)}
                  </select>
                </div>
                <div className="ds-field" style={{ marginBottom: 0 }}>
                  <label className="ds-field-label">Quantité (unités)</label>
                  <input className="ds-input" type="number" min="1" placeholder="Ex: 150" value={simForm.quantite} onChange={(e) => setSimForm({ ...simForm, quantite: e.target.value })} />
                </div>
                <div className="ds-field" style={{ marginBottom: 0 }}>
                  <label className="ds-field-label">Diapason</label>
                  <select className="ds-input" value={simForm.diapason} onChange={(e) => setSimForm({ ...simForm, diapason: e.target.value })}>
                    <option value="D1">D1</option>
                    <option value="D2">D2</option>
                  </select>
                </div>
                <button className="ds-btn ds-btn-dark" onClick={handleSimuler} disabled={!simForm.clrId || !simForm.quantite || simLoading}>
                  {simLoading ? "…" : <><i className="fas fa-play" style={{ marginRight: 6 }}></i>Simuler</>}
                </button>
              </div>

              {simResult && (
                <div>
                  {simResult.alertes?.length > 0 && (
                    <div style={{ background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.2)", padding: "12px 16px", marginBottom: 16 }}>
                      {simResult.alertes.map((a, i) => (
                        <div key={i} style={{ fontSize: ".78rem", color: "#ef4444", fontWeight: 600 }}>⚠️ {a}</div>
                      ))}
                    </div>
                  )}
                  {!simResult.faisable && (
                    <div style={{ background: "rgba(239,68,68,.1)", padding: "10px 14px", marginBottom: 16, fontSize: ".8rem", fontWeight: 700, color: "#ef4444" }}>
                      ❌ Simulation non faisable — stock plateforme insuffisant
                    </div>
                  )}
                  <div className="pi-simul-result">
                    <div>
                      <div className="pi-simul-label">AVANT</div>
                      <div className="pi-simul-bloc">
                        <div style={{ marginBottom: 10 }}>
                          <div className="pi-simul-label">Stock CLR</div>
                          <div className="pi-simul-val">{simResult.avant.stockCLR} u</div>
                        </div>
                        {simForm.diapason === "D1" && (
                          <div>
                            <div className="pi-simul-label">Stock Plateforme</div>
                            <div className="pi-simul-val">{simResult.avant.stockPlateforme} u</div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="pi-simul-label">APRÈS (+{simForm.quantite} u via {simForm.diapason})</div>
                      <div className="pi-simul-bloc apres">
                        <div style={{ marginBottom: 10 }}>
                          <div className="pi-simul-label">Stock CLR</div>
                          <div className="pi-simul-val" style={{ color: "#10b981" }}>{simResult.apres.stockCLR} u</div>
                          <div className="pi-simul-sub">+{simResult.impact.gainCLR} u</div>
                        </div>
                        {simForm.diapason === "D1" && (
                          <div>
                            <div className="pi-simul-label">Stock Plateforme</div>
                            <div className="pi-simul-val" style={{ color: simResult.apres.stockPlateforme < simResult.avant.stockPlateforme ? "#ef4444" : "#333" }}>
                              {simResult.apres.stockPlateforme} u
                            </div>
                            <div className="pi-simul-sub">-{simResult.impact.pertePlateforme} u</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB : OPTIMISATION ───────────────────────────────── */}
      {tab === "optimisation" && (
        <div>
          <div className="ds-panel">
            <div className="ds-panel-head">
              <span className="ds-panel-title">Optimisation chargement</span>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <p style={{ fontSize: ".82rem", color: "#666", marginBottom: 20 }}>
                Analysez une session de planification pour optimiser le regroupement des livraisons et le remplissage des camions.
              </p>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 24 }}>
                <div className="ds-field" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="ds-field-label">Session de planification</label>
                  <select className="ds-input" value={optimSessionId} onChange={(e) => { setOptimSessionId(e.target.value); setOptimResult(null); }}>
                    <option value="">— Choisir une session —</option>
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>Session #{s.id} — {s.date} ({s.lignes?.length || 0} lignes)</option>
                    ))}
                  </select>
                </div>
                <button className="ds-btn ds-btn-dark" onClick={handleOptimisation} disabled={!optimSessionId || optimLoading}>
                  {optimLoading ? "Analyse…" : <><i className="fas fa-cogs" style={{ marginRight: 6 }}></i>Analyser</>}
                </button>
              </div>

              {optimResult && (
                <div>
                  <div style={{ fontSize: ".75rem", color: "#666", marginBottom: 16 }}>
                    {optimResult.nbGroupes} groupe(s) CLR · Capacité camion : {optimResult.capaciteCamion} u
                  </div>
                  {optimResult.suggestions.length === 0 ? (
                    <div className="ds-empty"><p>Aucune donnée à optimiser</p></div>
                  ) : (
                    optimResult.suggestions.map((s, i) => (
                      <div key={i} className="pi-optim-card">
                        <div className="pi-optim-code">{s.clr?.code}</div>
                        <div>
                          <div className="pi-optim-reco">{s.recommandation}</div>
                          <div className="pi-optim-sub">
                            {s.nbLignes} ligne(s) · {s.quantiteTotale} u · Taux remplissage : {s.tauxRemplissage}%
                          </div>
                        </div>
                        <div className="pi-optim-badge">{s.nbCamionsNeeded} camion{s.nbCamionsNeeded > 1 ? "s" : ""}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
