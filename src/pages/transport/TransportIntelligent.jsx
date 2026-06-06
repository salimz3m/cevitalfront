// pages/transport/TransportIntelligent.jsx — Sprint 5 — Redesign blanc épuré
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ModuleGate from "../../components/ModuleGate";
import { DS_STYLE } from "../design-system";

// ─── API helper ──────────────────────────────────────────────
const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ─── Helpers config ──────────────────────────────────────────
const PRIORITE_CFG = {
  HIGH: { badgeCls: "ds-badge ds-badge-red", label: "Urgent" },
  MEDIUM: { badgeCls: "ds-badge ds-badge-amber", label: "Moyen" },
  LOW: { badgeCls: "ds-badge ds-badge-neutral", label: "Faible" },
};

const NIVEAU_CFG = {
  EXCELLENT: {
    barColor: "var(--ds-green)",
    badgeCls: "ds-badge ds-badge-green",
  },
  BON: { barColor: "var(--ds-blue)", badgeCls: "ds-badge ds-badge-blue" },
  MOYEN: { barColor: "var(--ds-amber)", badgeCls: "ds-badge ds-badge-amber" },
  RISQUE: { barColor: "var(--ds-red)", badgeCls: "ds-badge ds-badge-red" },
  A_AMELIORER: {
    barColor: "var(--ds-amber)",
    badgeCls: "ds-badge ds-badge-amber",
  },
  INSUFFISANT: {
    barColor: "var(--ds-ink-3)",
    badgeCls: "ds-badge ds-badge-neutral",
  },
};

const TENDANCE_LABEL = {
  EXCELLENT: "Excellent",
  BON: "Bon",
  MOYEN: "Moyen",
  A_AMELIORER: "À améliorer",
  INSUFFISANT: "Insuffisant",
};

const ScoreBar = ({ value, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div className="ds-bar-track" style={{ flex: 1 }}>
      <div
        className="ds-bar-fill"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
    <span
      style={{
        fontSize: ".78rem",
        fontWeight: 700,
        color,
        minWidth: 30,
        fontFamily: "var(--ds-mono)",
      }}
    >
      {value}
    </span>
  </div>
);

const fmt = (n, suffix = "") => (n != null ? `${n}${suffix}` : "N/A");

// ════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════
export default function TransportIntelligent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("alertes");
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get(
        "/modules/transport-intel/suggestions",
      );
      setData(res);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e.response?.data?.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const TABS = [
    {
      id: "alertes",
      icon: "fa-bell",
      label: "Alertes",
      badge: data?.alertes?.nbCritiques || 0,
      badgeType: "red",
    },
    {
      id: "regroupement",
      icon: "fa-boxes-stacked",
      label: "Regroupement",
      badge: data?.regroupement?.totalLignes || 0,
      badgeType: "amber",
    },
    {
      id: "prestataires",
      icon: "fa-ranking-star",
      label: "Prestataires",
      badge: null,
    },
    {
      id: "performance",
      icon: "fa-chart-line",
      label: "Performance",
      badge: null,
    },
  ];

  // ── Résumé KPI ────────────────────────────────────────────────
  const renderResume = () => {
    if (!data) return null;
    const { resume, performance, alertes, regroupement, prestataires } = data;
    const kpis = [
      {
        lbl: "Alertes critiques",
        val: alertes?.nbCritiques || 0,
        cls: alertes?.nbCritiques > 0 ? "red" : "green",
        icon: "fa-bell",
      },
      {
        lbl: "Lignes à expédier",
        val: regroupement?.totalLignes || 0,
        cls: "amber",
        icon: "fa-boxes-stacked",
      },
      {
        lbl: "Taux de service",
        val: performance?.kpi?.tauxService || "—",
        cls: "blue",
        icon: "fa-chart-line",
      },
      {
        lbl: "Meilleur prestataire",
        val: prestataires?.meilleur?.nom || "—",
        cls: "",
        icon: "fa-ranking-star",
      },
    ];
    return (
      <div className="ds-kpi-strip">
        {kpis.map((k) => (
          <div key={k.lbl} className="ds-kpi">
            <div className="ds-kpi-lbl">{k.lbl}</div>
            <div
              className={`ds-kpi-val ${k.cls}`}
              style={{
                fontSize:
                  typeof k.val === "string" && k.val.length > 6
                    ? "1rem"
                    : undefined,
              }}
            >
              {k.val}
            </div>
            <i className={`fas ${k.icon} ds-kpi-icon`}></i>
          </div>
        ))}
      </div>
    );
  };

  // ── Alertes ───────────────────────────────────────────────────
  const renderAlertes = () => {
    const { alertes } = data;
    if (alertes.total === 0)
      return (
        <div className="ds-empty">
          <i className="fas fa-bell-slash"></i>
          <p>Aucune alerte active — tous les ordres sont dans les délais</p>
        </div>
      );

    const TYPE_ICON = {
      RETARD: "fa-clock",
      NON_DEMARRE: "fa-pause-circle",
      INCIDENT: "fa-circle-exclamation",
    };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {alertes.alertes.map((alerte, i) => {
          const isCrit = alerte.niveau === "CRITIQUE";
          return (
            <div
              key={i}
              className="ds-card"
              style={{
                marginBottom: 0,
                borderLeft: `3px solid ${isCrit ? "var(--ds-red)" : "var(--ds-amber)"}`,
              }}
            >
              <div className="ds-card-body" style={{ padding: "16px 22px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", gap: 14, flex: 1 }}>
                    <i
                      className={`fas ${TYPE_ICON[alerte.type] || "fa-triangle-exclamation"}`}
                      style={{
                        fontSize: "1.2rem",
                        color: isCrit ? "var(--ds-red)" : "var(--ds-amber)",
                        marginTop: 2,
                      }}
                    ></i>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: ".86rem",
                            color: "var(--ds-ink)",
                          }}
                        >
                          {alerte.message}
                        </span>
                        <span
                          className={`ds-badge ${isCrit ? "ds-badge-red" : "ds-badge-amber"}`}
                        >
                          {alerte.niveau}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: ".78rem",
                          color: "var(--ds-ink-3)",
                          background: "var(--ds-surface-2)",
                          borderRadius: "var(--ds-radius)",
                          padding: "6px 10px",
                          borderLeft: "2px solid var(--ds-border-2)",
                        }}
                      >
                        {alerte.action}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      className="mono"
                      style={{
                        color: "var(--ds-ink-3)",
                        fontSize: ".64rem",
                        textTransform: "uppercase",
                        letterSpacing: ".08em",
                      }}
                    >
                      Ordre #{alerte.ordreId}
                    </div>
                    <div
                      className="mono"
                      style={{ color: "var(--ds-ink-3)", fontSize: ".64rem" }}
                    >
                      CLR #{alerte.clrId}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ── Regroupement ──────────────────────────────────────────────
  const renderRegroupement = () => {
    const { regroupement } = data;
    if (regroupement.totalLignes === 0)
      return (
        <div className="ds-empty">
          <i className="fas fa-inbox"></i>
          <p>Aucune ligne disponible à regrouper</p>
        </div>
      );
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {regroupement.groupes.map((g, i) => {
          const pCfg = PRIORITE_CFG[g.priorite] || PRIORITE_CFG.LOW;
          const remplissagePct = g.tauxRemplissage;
          const remplissageCls =
            remplissagePct >= 85
              ? "var(--ds-green)"
              : remplissagePct >= 50
                ? "var(--ds-amber)"
                : "var(--ds-red)";
          return (
            <div key={g.clrId} className="ds-card" style={{ marginBottom: 0 }}>
              <div className="ds-card-head">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <i
                    className="fas fa-location-dot"
                    style={{ color: "var(--ds-red)" }}
                  ></i>
                  <div
                    className="ds-card-title"
                    style={{ textTransform: "none", fontSize: ".9rem" }}
                  >
                    {g.clrNom || `CLR #${g.clrId}`}
                  </div>
                  <span
                    className="mono"
                    style={{ fontSize: ".68rem", color: "var(--ds-ink-3)" }}
                  >
                    {g.clrCode}
                  </span>
                  <span
                    className="mono"
                    style={{ fontSize: ".68rem", color: "var(--ds-ink-3)" }}
                  >
                    {g.wilaya}
                  </span>
                </div>
                <span className={pCfg.badgeCls}>{pCfg.label}</span>
              </div>
              <div className="ds-card-body">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  {[
                    {
                      lbl: "Qté totale",
                      val: `${g.qteTotale} pal.`,
                      color: "var(--ds-ink)",
                    },
                    {
                      lbl: "Délai estimé",
                      val: g.delaiEstime,
                      color: "var(--ds-blue)",
                    },
                    {
                      lbl: "Coût estimé",
                      val: `${g.coutEstimeDZD?.toLocaleString("fr-DZ")} DA`,
                      color: "var(--ds-amber)",
                    },
                  ].map((m) => (
                    <div
                      key={m.lbl}
                      style={{
                        background: "var(--ds-surface-2)",
                        borderRadius: "var(--ds-radius)",
                        padding: "10px 14px",
                        border: "1px solid var(--ds-border)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: ".6rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: ".08em",
                          color: "var(--ds-ink-3)",
                          marginBottom: 4,
                        }}
                      >
                        {m.lbl}
                      </div>
                      <div
                        style={{
                          fontSize: ".92rem",
                          fontWeight: 700,
                          color: m.color,
                          fontFamily: "var(--ds-mono)",
                        }}
                      >
                        {m.val}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: ".68rem",
                      color: "var(--ds-ink-3)",
                      marginBottom: 5,
                    }}
                  >
                    <span>Taux de remplissage camion</span>
                    <span style={{ fontWeight: 700, color: remplissageCls }}>
                      {remplissagePct}%
                    </span>
                  </div>
                  <ScoreBar value={remplissagePct} color={remplissageCls} />
                </div>
                <div
                  style={{
                    fontSize: ".78rem",
                    color: "var(--ds-ink-2)",
                    background: "var(--ds-surface-2)",
                    borderRadius: "var(--ds-radius)",
                    padding: "8px 12px",
                    borderLeft: "2px solid var(--ds-border-2)",
                  }}
                >
                  {g.recommandation}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ── Prestataires ──────────────────────────────────────────────
  const renderPrestataires = () => {
    const { prestataires } = data;
    if (!prestataires.prestataires?.length)
      return (
        <div className="ds-empty">
          <i className="fas fa-ranking-star"></i>
          <p>
            Aucun historique prestataire — les scores apparaîtront après les
            premières livraisons confirmées
          </p>
        </div>
      );
    return (
      <div>
        <div
          style={{
            fontSize: ".72rem",
            color: "var(--ds-ink-3)",
            marginBottom: 16,
          }}
        >
          Analyse sur : {prestataires.fenetre}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {prestataires.prestataires.map((p, i) => {
            const nvCfg = NIVEAU_CFG[p.niveau] || NIVEAU_CFG.INSUFFISANT;
            return (
              <div key={p.nom} className="ds-card" style={{ marginBottom: 0 }}>
                <div className="ds-card-body">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "var(--ds-surface-2)",
                        border: "2px solid var(--ds-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: ".78rem",
                        fontWeight: 800,
                        color: "var(--ds-ink-2)",
                        flexShrink: 0,
                      }}
                    >
                      {i === 0 ? "🥇" : `#${i + 1}`}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 10,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: ".9rem",
                            color: "var(--ds-ink)",
                          }}
                        >
                          {p.nom}
                        </span>
                        <span className={nvCfg.badgeCls}>{p.niveau}</span>
                        {p.recommande && (
                          <span className="ds-badge ds-badge-green">
                            ✓ Recommandé
                          </span>
                        )}
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <div
                          style={{
                            fontSize: ".62rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: ".08em",
                            color: "var(--ds-ink-3)",
                            marginBottom: 5,
                          }}
                        >
                          Score global
                        </div>
                        <ScoreBar value={p.score} color={nvCfg.barColor} />
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: 8,
                        }}
                      >
                        {[
                          { lbl: "Missions", val: p.nbMissions },
                          { lbl: "Livraisons", val: `${p.tauxLivraison}%` },
                          { lbl: "Ponctualité", val: `${p.tauxPonctualite}%` },
                          {
                            lbl: "Délai moy.",
                            val:
                              p.delaiMoyenH != null
                                ? `${p.delaiMoyenH}h`
                                : "N/A",
                          },
                        ].map((m) => (
                          <div
                            key={m.lbl}
                            style={{
                              background: "var(--ds-surface-2)",
                              borderRadius: "var(--ds-radius)",
                              padding: "8px 10px",
                              textAlign: "center",
                              border: "1px solid var(--ds-border)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: ".86rem",
                                fontWeight: 700,
                                color: "var(--ds-ink)",
                                fontFamily: "var(--ds-mono)",
                              }}
                            >
                              {m.val}
                            </div>
                            <div
                              style={{
                                fontSize: ".6rem",
                                color: "var(--ds-ink-3)",
                                marginTop: 2,
                              }}
                            >
                              {m.lbl}
                            </div>
                          </div>
                        ))}
                      </div>
                      {p.nbIncidents > 0 && (
                        <div
                          className="ds-alert ds-alert-error"
                          style={{ marginTop: 10 }}
                        >
                          <i
                            className="fas fa-triangle-exclamation"
                            style={{ flexShrink: 0 }}
                          ></i>
                          <span>
                            {p.nbIncidents} incident(s) sur la période
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {prestataires.aRisque?.length > 0 && (
          <div className="ds-alert ds-alert-error" style={{ marginTop: 16 }}>
            <i
              className="fas fa-triangle-exclamation"
              style={{ flexShrink: 0 }}
            ></i>
            <div>
              <strong>Prestataires à éviter :</strong>{" "}
              {prestataires.aRisque.map((p) => p.nom).join(", ")}
              <div style={{ marginTop: 2, fontSize: ".76rem" }}>
                Score inférieur à 40 — considérer des alternatives
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Performance ───────────────────────────────────────────────
  const renderPerformance = () => {
    const { performance } = data;
    const kpi = performance.kpi;
    const nvCfg = NIVEAU_CFG[performance.tendance] || NIVEAU_CFG.INSUFFISANT;
    return (
      <div>
        {/* Tendance globale */}
        <div className="ds-card">
          <div
            className="ds-card-body"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "18px 22px",
            }}
          >
            <i
              className="fas fa-chart-line"
              style={{ fontSize: "1.6rem", color: nvCfg.barColor }}
            ></i>
            <div>
              <div
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: nvCfg.barColor,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {TENDANCE_LABEL[performance.tendance] || performance.tendance}
              </div>
              <div style={{ fontSize: ".76rem", color: "var(--ds-ink-3)" }}>
                Analyse sur {performance.periode}
              </div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {[
            {
              lbl: "Total ordres",
              val: kpi.totalOrdres,
              icon: "fa-clipboard-list",
              cls: "",
            },
            {
              lbl: "Ordres livrés",
              val: kpi.ordresLivres,
              icon: "fa-check-circle",
              cls: "green",
            },
            {
              lbl: "En cours",
              val: kpi.ordresEnCours,
              icon: "fa-truck",
              cls: "blue",
            },
            {
              lbl: "Incidents",
              val: kpi.ordresIncidents,
              icon: "fa-circle-xmark",
              cls: "red",
            },
            {
              lbl: "Taux de service",
              val: kpi.tauxService,
              icon: "fa-chart-line",
              cls: "",
            },
            {
              lbl: "Ponctualité",
              val: kpi.tauxPonctualite,
              icon: "fa-stopwatch",
              cls: "amber",
            },
          ].map((k) => (
            <div key={k.lbl} className="ds-card" style={{ marginBottom: 0 }}>
              <div className="ds-card-body" style={{ padding: "16px 20px" }}>
                <i
                  className={`fas ${k.icon} ds-kpi-icon`}
                  style={{
                    position: "static",
                    opacity: 0.15,
                    fontSize: "1.1rem",
                    display: "block",
                    marginBottom: 6,
                  }}
                ></i>
                <div
                  className={`ds-kpi-val ${k.cls}`}
                  style={{ fontSize: "1.4rem" }}
                >
                  {fmt(k.val)}
                </div>
                <div className="ds-kpi-lbl" style={{ marginTop: 4 }}>
                  {k.lbl}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Secondaires */}
        <div className="ds-card">
          <div className="ds-card-head">
            <div className="ds-card-title">
              <span className="ds-card-dot"></span>Métriques secondaires
            </div>
          </div>
          <div
            className="ds-card-body"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          >
            <div>
              <div
                style={{
                  fontSize: ".68rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                  color: "var(--ds-ink-3)",
                  marginBottom: 4,
                }}
              >
                Délai moyen de livraison
              </div>
              <div
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: "var(--ds-blue)",
                  fontFamily: "var(--ds-mono)",
                }}
              >
                {kpi.delaiMoyenH != null ? `${kpi.delaiMoyenH}h` : "N/A"}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: ".68rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                  color: "var(--ds-ink-3)",
                  marginBottom: 4,
                }}
              >
                Ordres en retard
              </div>
              <div
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  fontFamily: "var(--ds-mono)",
                  color:
                    kpi.ordresEnRetard > 0
                      ? "var(--ds-red)"
                      : "var(--ds-green)",
                }}
              >
                {kpi.ordresEnRetard}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ModuleGate module="TRANSPORT_INTEL">
      <div className="ds-layout">
        <style dangerouslySetInnerHTML={{ __html: DS_STYLE }} />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />

        <div className="ds-main">
          {/* Page header */}
          <div className="ds-page-header">
            <div className="ds-eyebrow">Module transport</div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h1 className="ds-page-title">
                  Transport <span>Intelligent</span>
                </h1>
                <p className="ds-page-sub">
                  Suggestions de regroupement · Scoring prestataires · Alertes
                  proactives
                  {lastRefresh && (
                    <span style={{ marginLeft: 12 }}>
                      — Actualisé {lastRefresh.toLocaleTimeString("fr-DZ")}
                    </span>
                  )}
                </p>
              </div>
              <button
                className="ds-btn ds-btn-outline ds-btn-sm"
                onClick={load}
                disabled={loading}
              >
                <i
                  className={`fas ${loading ? "fa-spinner fa-spin" : "fa-rotate-right"}`}
                ></i>{" "}
                Actualiser
              </button>
            </div>
          </div>

          {/* KPI strip */}
          {data && renderResume()}

          {/* Tabs */}
          <div className="ds-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`ds-tab ${tab === t.id ? "active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                <i className={`fas ${t.icon}`}></i>
                {t.label}
                {t.badge > 0 && (
                  <span
                    className={`ds-tab-badge${t.badgeType === "amber" ? " neutral" : ""}`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="ds-content">
            {loading && (
              <div className="ds-loading">
                <i
                  className="fas fa-spinner fa-spin"
                  style={{ marginRight: 8 }}
                ></i>{" "}
                Analyse en cours…
              </div>
            )}
            {!loading && error && (
              <div className="ds-alert ds-alert-error">
                <i
                  className="fas fa-triangle-exclamation"
                  style={{ flexShrink: 0 }}
                ></i>
                <div>
                  <strong>{error}</strong>
                  <div style={{ marginTop: 8 }}>
                    <button
                      className="ds-btn ds-btn-red ds-btn-sm"
                      onClick={load}
                    >
                      Réessayer
                    </button>
                  </div>
                </div>
              </div>
            )}
            {!loading && !error && data && (
              <>
                {tab === "alertes" && renderAlertes()}
                {tab === "regroupement" && renderRegroupement()}
                {tab === "prestataires" && renderPrestataires()}
                {tab === "performance" && renderPerformance()}
              </>
            )}
          </div>
        </div>
      </div>
    </ModuleGate>
  );
}
