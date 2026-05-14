// pages/transport/TransportIntelligent.jsx — Sprint 5
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ModuleGate from "../../components/ModuleGate";

// ─── Design tokens (identiques à TransportWorkflow) ──────────
const C = {
  bg: "#0f1117",
  surface: "#181c27",
  border: "#252a38",
  accent: "#3b82f6",
  accentLo: "rgba(59,130,246,0.12)",
  green: "#22c55e",
  greenLo: "rgba(34,197,94,0.12)",
  orange: "#f97316",
  orangeLo: "rgba(249,115,22,0.12)",
  red: "#ef4444",
  redLo: "rgba(239,68,68,0.12)",
  yellow: "#eab308",
  yellowLo: "rgba(234,179,8,0.12)",
  purple: "#a855f7",
  purpleLo: "rgba(168,85,247,0.12)",
  text: "#e2e8f0",
  muted: "#64748b",
  card: "#1e2235",
};

// ─── API helper ──────────────────────────────────────────────
const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ─── Composants UI réutilisables ─────────────────────────────
const Card = ({ children, style = {}, accent = null }) => (
  <div
    style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: 20,
      borderLeft: accent ? `3px solid ${accent}` : undefined,
      ...style,
    }}
  >
    {children}
  </div>
);

const SectionTitle = ({ icon, title, subtitle }) => (
  <div style={{ marginBottom: 20 }}>
    <h2
      style={{
        margin: 0,
        fontSize: 17,
        fontWeight: 800,
        color: C.text,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {icon} {title}
    </h2>
    {subtitle && (
      <p style={{ margin: "4px 0 0", fontSize: 12, color: C.muted }}>
        {subtitle}
      </p>
    )}
  </div>
);

const Badge = ({ label, color, bg }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.05em",
      color: color || C.muted,
      background: bg || C.surface,
      border: `1px solid ${(color || C.muted) + "40"}`,
    }}
  >
    {label}
  </span>
);

const ScoreBar = ({ value, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div
      style={{
        flex: 1,
        height: 8,
        background: C.border,
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${value}%`,
          height: "100%",
          background: color || C.accent,
          borderRadius: 4,
          transition: "width 0.6s ease",
        }}
      />
    </div>
    <span
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: color || C.accent,
        minWidth: 36,
      }}
    >
      {value}
    </span>
  </div>
);

const Spinner = () => (
  <div style={{ textAlign: "center", padding: 80, color: C.muted }}>
    <div
      style={{
        fontSize: 32,
        marginBottom: 12,
        animation: "spin 1s linear infinite",
        display: "inline-block",
      }}
    >
      ⚙️
    </div>
    <div style={{ fontSize: 14 }}>Analyse en cours…</div>
  </div>
);

// ─── Helpers ─────────────────────────────────────────────────
const PRIORITE_CFG = {
  HIGH: { color: C.red, bg: C.redLo, label: "Urgent" },
  MEDIUM: { color: C.orange, bg: C.orangeLo, label: "Moyen" },
  LOW: { color: C.muted, bg: C.surface, label: "Faible" },
};

const NIVEAU_CFG = {
  EXCELLENT: { color: C.green, bg: C.greenLo },
  BON: { color: C.accent, bg: C.accentLo },
  MOYEN: { color: C.yellow, bg: C.yellowLo },
  RISQUE: { color: C.red, bg: C.redLo },
  A_AMELIORER: { color: C.orange, bg: C.orangeLo },
  INSUFFISANT: { color: C.muted, bg: C.surface },
};

const fmt = (n, suffix = "") => (n != null ? `${n}${suffix}` : "N/A");

// ════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════
export default function TransportIntelligent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("alertes"); // alertes | regroupement | prestataires | performance
  const [lastRefresh, setLastRefresh] = useState(null);

  // ── Chargement ───────────────────────────────────────────────
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

  // ── Onglets ──────────────────────────────────────────────────
  const TABS = [
    {
      id: "alertes",
      label: "🚨 Alertes",
      badge: data?.alertes?.nbCritiques || 0,
      badgeColor: C.red,
    },
    {
      id: "regroupement",
      label: "📦 Regroupement",
      badge: data?.regroupement?.totalLignes || 0,
      badgeColor: C.orange,
    },
    { id: "prestataires", label: "🏆 Prestataires", badge: null },
    { id: "performance", label: "📊 Performance", badge: null },
  ];

  // ── Rendu résumé exécutif ────────────────────────────────────
  const renderResume = () => {
    if (!data) return null;
    const { resume, performance } = data;
    const tendanceCfg =
      NIVEAU_CFG[performance?.tendance] || NIVEAU_CFG.INSUFFISANT;

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {[
          {
            label: "Alertes critiques",
            value: data.alertes?.nbCritiques || 0,
            icon: "🚨",
            color: data.alertes?.nbCritiques > 0 ? C.red : C.green,
            sub: `+${data.alertes?.nbWarnings || 0} warnings`,
          },
          {
            label: "Lignes à expédier",
            value: data.regroupement?.totalLignes || 0,
            icon: "📦",
            color: C.orange,
            sub: `${data.regroupement?.totalCLR || 0} destination(s)`,
          },
          {
            label: "Taux de service",
            value: performance?.kpi?.tauxService || "N/A",
            icon: "✅",
            color: tendanceCfg.color,
            sub: performance?.periode || "",
          },
          {
            label: "Meilleur prestataire",
            value: data.prestataires?.meilleur?.nom || "—",
            icon: "🏆",
            color: C.yellow,
            sub: data.prestataires?.meilleur
              ? `Score ${data.prestataires.meilleur.score}/100`
              : "Aucune donnée",
          },
        ].map((kpi) => (
          <Card key={kpi.label} accent={kpi.color}>
            <div style={{ fontSize: 22 }}>{kpi.icon}</div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: kpi.color,
                margin: "6px 0 2px",
              }}
            >
              {kpi.value}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
              {kpi.sub}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // ── Onglet Alertes ───────────────────────────────────────────
  const renderAlertes = () => {
    const { alertes } = data;
    if (alertes.total === 0) {
      return (
        <Card style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.green }}>
            Aucune alerte active
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>
            Tous les ordres en cours sont dans les délais
          </div>
        </Card>
      );
    }

    const TYPE_CFG = {
      RETARD: { icon: "⏰", color: C.orange },
      NON_DEMARRE: { icon: "⏸️", color: C.yellow },
      INCIDENT: { icon: "🔴", color: C.red },
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {alertes.alertes.map((alerte, i) => {
          const typeCfg = TYPE_CFG[alerte.type] || {
            icon: "⚠️",
            color: C.muted,
          };
          const niveauColor = alerte.niveau === "CRITIQUE" ? C.red : C.orange;
          return (
            <Card key={i} accent={niveauColor}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", gap: 14, flex: 1 }}>
                  <span style={{ fontSize: 24, lineHeight: 1 }}>
                    {typeCfg.icon}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{ fontWeight: 700, fontSize: 14, color: C.text }}
                      >
                        {alerte.message}
                      </span>
                      <Badge
                        label={alerte.niveau}
                        color={niveauColor}
                        bg={alerte.niveau === "CRITIQUE" ? C.redLo : C.orangeLo}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: C.muted,
                        background: C.surface,
                        borderRadius: 8,
                        padding: "6px 10px",
                        marginTop: 6,
                        borderLeft: `2px solid ${typeCfg.color}`,
                      }}
                    >
                      💡 {alerte.action}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: C.muted }}>Ordre</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
                    #{alerte.ordreId}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                    CLR #{alerte.clrId}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  // ── Onglet Regroupement ──────────────────────────────────────
  const renderRegroupement = () => {
    const { regroupement } = data;
    if (regroupement.totalLignes === 0) {
      return (
        <Card style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.muted }}>
            Aucune ligne disponible à regrouper
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>
            Toutes les lignes planifiées ont déjà un ordre de transport
          </div>
        </Card>
      );
    }

    return (
      <div>
        <div
          style={{
            background: C.surface,
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 20,
            fontSize: 13,
            color: C.muted,
            border: `1px solid ${C.border}`,
          }}
        >
          💡 <strong style={{ color: C.text }}>{regroupement.resume}</strong> —
          Groupés par CLR de destination pour optimiser les chargements
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {regroupement.groupes.map((groupe, i) => {
            const pCfg = PRIORITE_CFG[groupe.priorite] || PRIORITE_CFG.LOW;
            const remplissageCouleur =
              groupe.tauxRemplissage >= 85
                ? C.green
                : groupe.tauxRemplissage >= 50
                  ? C.orange
                  : C.red;

            return (
              <Card key={groupe.clrId} accent={pCfg.color}>
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>📍</span>
                      <span
                        style={{ fontWeight: 800, fontSize: 16, color: C.text }}
                      >
                        {groupe.clrNom || `CLR #${groupe.clrId}`}
                      </span>
                      <Badge
                        label={groupe.clrCode}
                        color={C.accent}
                        bg={C.accentLo}
                      />
                      <Badge
                        label={groupe.wilaya}
                        color={C.muted}
                        bg={C.surface}
                      />
                    </div>
                    <div
                      style={{ fontSize: 12, color: C.muted, marginLeft: 28 }}
                    >
                      {groupe.nbLignes} ligne(s) · {groupe.nbSessions}{" "}
                      session(s) · {groupe.region}
                    </div>
                  </div>
                  <Badge label={pCfg.label} color={pCfg.color} bg={pCfg.bg} />
                </div>

                {/* Métriques */}
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
                      label: "Qté totale",
                      value: `${groupe.qteTotale} pal.`,
                      color: C.text,
                    },
                    {
                      label: "Délai estimé",
                      value: groupe.delaiEstime,
                      color: C.accent,
                    },
                    {
                      label: "Coût estimé",
                      value: `${groupe.coutEstimeDZD.toLocaleString("fr-DZ")} DA`,
                      color: C.yellow,
                    },
                  ].map((m) => (
                    <div
                      key={m.label}
                      style={{
                        background: C.surface,
                        borderRadius: 8,
                        padding: "10px 14px",
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: C.muted,
                          marginBottom: 4,
                        }}
                      >
                        {m.label}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: m.color,
                        }}
                      >
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Taux remplissage */}
                <div style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11,
                      color: C.muted,
                      marginBottom: 6,
                    }}
                  >
                    <span>Taux de remplissage camion</span>
                    <span
                      style={{ color: remplissageCouleur, fontWeight: 700 }}
                    >
                      {groupe.tauxRemplissage}%
                    </span>
                  </div>
                  <ScoreBar
                    value={groupe.tauxRemplissage}
                    color={remplissageCouleur}
                  />
                </div>

                {/* Recommandation */}
                <div
                  style={{
                    fontSize: 12,
                    color: C.text,
                    background: C.bg,
                    borderRadius: 8,
                    padding: "8px 12px",
                    borderLeft: `2px solid ${pCfg.color}`,
                  }}
                >
                  {groupe.recommandation}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Onglet Prestataires ──────────────────────────────────────
  const renderPrestataires = () => {
    const { prestataires } = data;

    if (prestataires.prestataires.length === 0) {
      return (
        <Card style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.muted }}>
            Aucun historique prestataire
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>
            Les scores apparaîtront après les premières livraisons confirmées
          </div>
        </Card>
      );
    }

    return (
      <div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
          Analyse sur : {prestataires.fenetre}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {prestataires.prestataires.map((p, i) => {
            const nvCfg = NIVEAU_CFG[p.niveau] || NIVEAU_CFG.INSUFFISANT;
            return (
              <Card key={p.nom} accent={nvCfg.color}>
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 16 }}
                >
                  {/* Rang */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: i === 0 ? C.yellowLo : C.surface,
                      border: `2px solid ${i === 0 ? C.yellow : C.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 800,
                      color: i === 0 ? C.yellow : C.muted,
                      flexShrink: 0,
                    }}
                  >
                    {i === 0 ? "🥇" : `#${i + 1}`}
                  </div>

                  <div style={{ flex: 1 }}>
                    {/* Nom + badge */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      <span
                        style={{ fontWeight: 700, fontSize: 15, color: C.text }}
                      >
                        {p.nom}
                      </span>
                      <Badge
                        label={p.niveau}
                        color={nvCfg.color}
                        bg={nvCfg.bg}
                      />
                      {p.recommande && (
                        <Badge
                          label="✓ Recommandé"
                          color={C.green}
                          bg={C.greenLo}
                        />
                      )}
                    </div>

                    {/* Score global */}
                    <div style={{ marginBottom: 10 }}>
                      <div
                        style={{
                          fontSize: 11,
                          color: C.muted,
                          marginBottom: 4,
                        }}
                      >
                        Score global
                      </div>
                      <ScoreBar value={p.score} color={nvCfg.color} />
                    </div>

                    {/* Métriques détail */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 8,
                      }}
                    >
                      {[
                        { label: "Missions", value: p.nbMissions },
                        { label: "Livraisons", value: `${p.tauxLivraison}%` },
                        {
                          label: "Ponctualité",
                          value: `${p.tauxPonctualite}%`,
                        },
                        {
                          label: "Délai moyen",
                          value:
                            p.delaiMoyenH != null ? `${p.delaiMoyenH}h` : "N/A",
                        },
                      ].map((m) => (
                        <div
                          key={m.label}
                          style={{
                            background: C.surface,
                            borderRadius: 8,
                            padding: "8px 10px",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: C.text,
                            }}
                          >
                            {m.value}
                          </div>
                          <div style={{ fontSize: 10, color: C.muted }}>
                            {m.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Incidents */}
                    {p.nbIncidents > 0 && (
                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 12,
                          color: C.red,
                          background: C.redLo,
                          borderRadius: 8,
                          padding: "6px 10px",
                        }}
                      >
                        ⚠ {p.nbIncidents} incident(s) sur la période
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Prestataires à risque */}
        {prestataires.aRisque.length > 0 && (
          <div
            style={{
              marginTop: 20,
              background: C.redLo,
              border: `1px solid ${C.red}30`,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: C.red,
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              ⚠ Prestataires à éviter :{" "}
              {prestataires.aRisque.map((p) => p.nom).join(", ")}
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>
              Score inférieur à 40 — considérer des alternatives
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Onglet Performance ───────────────────────────────────────
  const renderPerformance = () => {
    const { performance } = data;
    const kpi = performance.kpi;
    const tendanceCfg =
      NIVEAU_CFG[performance.tendance] || NIVEAU_CFG.INSUFFISANT;

    const TENDANCE_LABEL = {
      EXCELLENT: "🏆 Excellent",
      BON: "✅ Bon",
      MOYEN: "⚠ Moyen",
      A_AMELIORER: "📉 À améliorer",
      INSUFFISANT: "— Insuffisant",
    };

    return (
      <div>
        {/* Tendance globale */}
        <Card
          accent={tendanceCfg.color}
          style={{
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div style={{ fontSize: 40 }}>📊</div>
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: tendanceCfg.color,
              }}
            >
              {TENDANCE_LABEL[performance.tendance] || performance.tendance}
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>
              Analyse sur {performance.periode}
            </div>
          </div>
        </Card>

        {/* KPI grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
            marginBottom: 20,
          }}
        >
          {[
            {
              label: "Total ordres",
              value: kpi.totalOrdres,
              icon: "📋",
              color: C.text,
            },
            {
              label: "Ordres livrés",
              value: kpi.ordresLivres,
              icon: "✅",
              color: C.green,
            },
            {
              label: "En cours",
              value: kpi.ordresEnCours,
              icon: "🚛",
              color: C.accent,
            },
            {
              label: "Incidents",
              value: kpi.ordresIncidents,
              icon: "🔴",
              color: C.red,
            },
            {
              label: "Taux de service",
              value: kpi.tauxService,
              icon: "📈",
              color: tendanceCfg.color,
            },
            {
              label: "Taux ponctualité",
              value: kpi.tauxPonctualite,
              icon: "⏱",
              color: C.yellow,
            },
          ].map((k) => (
            <Card key={k.label} style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{k.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>
                {fmt(k.value)}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                {k.label}
              </div>
            </Card>
          ))}
        </div>

        {/* Métriques secondaires */}
        <Card>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          >
            <div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
                Délai moyen de livraison
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.accent }}>
                {kpi.delaiMoyenH != null ? `${kpi.delaiMoyenH}h` : "N/A"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
                Ordres en retard
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: kpi.ordresEnRetard > 0 ? C.red : C.green,
                }}
              >
                {kpi.ordresEnRetard}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════
  // RENDER PRINCIPAL
  // ════════════════════════════════════════════════════════════════
  return (
    <ModuleGate module="TRANSPORT_INTEL">
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          color: C.text,
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          fontSize: 14,
        }}
      >
        <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #252a38; border-radius: 3px; }
      `}</style>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
          {/* ── Header ─────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 28,
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 26,
                  fontWeight: 800,
                  color: C.text,
                }}
              >
                🧠 Transport Intelligent
              </h1>
              <p style={{ margin: "4px 0 0", color: C.muted, fontSize: 13 }}>
                Suggestions de regroupement · Scoring prestataires · Alertes
                proactives
                {lastRefresh && (
                  <span style={{ marginLeft: 12, color: C.border }}>
                    Actualisé {lastRefresh.toLocaleTimeString("fr-DZ")}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={load}
              disabled={loading}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: "8px 16px",
                color: C.text,
                fontSize: 13,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  animation: loading ? "spin 1s linear infinite" : "none",
                }}
              >
                ⟳
              </span>
              Actualiser
            </button>
          </div>

          {/* ── Chargement ─────────────────────────────────────── */}
          {loading && <Spinner />}

          {/* ── Erreur ─────────────────────────────────────────── */}
          {!loading && error && (
            <div
              style={{
                background: C.redLo,
                border: `1px solid ${C.red}40`,
                borderRadius: 12,
                padding: 24,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>⚠</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.red }}>
                {error}
              </div>
              <button
                onClick={load}
                style={{
                  marginTop: 16,
                  background: C.red,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Réessayer
              </button>
            </div>
          )}

          {/* ── Contenu ─────────────────────────────────────────── */}
          {!loading && !error && data && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              {/* Résumé exécutif */}
              {renderResume()}

              {/* Onglets */}
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  marginBottom: 24,
                  borderBottom: `1px solid ${C.border}`,
                  paddingBottom: 0,
                }}
              >
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "8px 8px 0 0",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: 13,
                      fontWeight: 600,
                      position: "relative",
                      background: tab === t.id ? C.card : "transparent",
                      color: tab === t.id ? C.text : C.muted,
                      borderBottom:
                        tab === t.id
                          ? `2px solid ${C.accent}`
                          : "2px solid transparent",
                      transition: "all .15s",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {t.label}
                    {t.badge > 0 && (
                      <span
                        style={{
                          background: t.badgeColor,
                          color: "#fff",
                          borderRadius: 10,
                          padding: "1px 7px",
                          fontSize: 10,
                          fontWeight: 800,
                        }}
                      >
                        {t.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Contenu onglet */}
              <div>
                {tab === "alertes" && renderAlertes()}
                {tab === "regroupement" && renderRegroupement()}
                {tab === "prestataires" && renderPrestataires()}
                {tab === "performance" && renderPerformance()}
              </div>
            </div>
          )}
        </div>
      </div>
    </ModuleGate>
  );
}
