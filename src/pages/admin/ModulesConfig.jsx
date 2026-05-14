// pages/admin/ModulesConfig.jsx — Sprint 8
import { useState, useEffect } from "react";
import api from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import { clearModulesCache } from "../../components/ModuleGate";

const MODULES_META = {
  PLANIF_INTEL: {
    icon: "fa-brain",
    color: "#3b82f6",
    sprint: 4,
    plan: "Starter",
  },
  TRANSPORT_INTEL: {
    icon: "fa-route",
    color: "#f59e0b",
    sprint: 5,
    plan: "Starter",
  },
  STOCK_INTEL: {
    icon: "fa-boxes-stacked",
    color: "#10b981",
    sprint: 7,
    plan: "Pro",
  },
  KPI_DASHBOARD: {
    icon: "fa-chart-line",
    color: "#8b5cf6",
    sprint: 9,
    plan: "Pro",
  },
  PORTAIL_PRESTATAIRE: {
    icon: "fa-truck",
    color: "#06b6d4",
    sprint: 10,
    plan: "Pro",
  },
  PORTAIL_CLIENT: {
    icon: "fa-user-tie",
    color: "#ec4899",
    sprint: 11,
    plan: "Enterprise",
  },
  API_PUBLIQUE: {
    icon: "fa-code",
    color: "#f97316",
    sprint: 12,
    plan: "Enterprise",
  },
};

const PLAN_COLORS = {
  Starter: "#3b82f6",
  Pro: "#8b5cf6",
  Enterprise: "#f59e0b",
};

const S = {
  page: { padding: "32px", color: "#e5e7eb", minHeight: "100vh" },
  header: { marginBottom: "28px" },
  title: { fontSize: "24px", fontWeight: 700, color: "#fff", margin: 0 },
  sub: { color: "#9ca3af", marginTop: "4px", fontSize: "14px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "16px",
  },
  card: (actif) => ({
    background: actif ? "#181c27" : "#131720",
    borderRadius: "14px",
    border: `1px solid ${actif ? "#2d3748" : "#1f2937"}`,
    padding: "20px",
    transition: "all 0.2s",
    opacity: actif ? 1 : 0.75,
  }),
  cardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "14px",
  },
  iconWrap: (color) => ({
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    background: color + "22",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color,
    fontSize: "18px",
    flexShrink: 0,
  }),
  modName: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#fff",
    marginBottom: "2px",
  },
  modDesc: { fontSize: "13px", color: "#9ca3af", lineHeight: 1.5 },
  footer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "14px",
  },
  sprintBadge: {
    background: "#1f2937",
    color: "#6b7280",
    borderRadius: "4px",
    padding: "2px 8px",
    fontSize: "11px",
  },
  planBadge: (plan) => ({
    background: (PLAN_COLORS[plan] || "#6b7280") + "22",
    color: PLAN_COLORS[plan] || "#6b7280",
    borderRadius: "4px",
    padding: "2px 8px",
    fontSize: "11px",
    fontWeight: 600,
  }),
  // Toggle switch
  toggleTrack: (actif) => ({
    width: "44px",
    height: "24px",
    borderRadius: "12px",
    cursor: "pointer",
    background: actif ? "#3b82f6" : "#374151",
    border: "none",
    padding: 0,
    position: "relative",
    transition: "background 0.2s",
    flexShrink: 0,
  }),
  toggleThumb: (actif) => ({
    position: "absolute",
    width: "18px",
    height: "18px",
    borderRadius: "9px",
    background: "#fff",
    top: "3px",
    left: actif ? "23px" : "3px",
    transition: "left 0.2s",
  }),
};

function ToggleSwitch({ actif, loading, onChange }) {
  return (
    <button
      style={S.toggleTrack(actif)}
      onClick={onChange}
      disabled={loading}
      title={actif ? "Désactiver ce module" : "Activer ce module"}
    >
      {loading ? (
        <span
          style={{
            position: "absolute",
            top: "4px",
            left: "4px",
            color: "#fff",
            fontSize: "14px",
          }}
        >
          <i className="fa-solid fa-circle-notch fa-spin" />
        </span>
      ) : (
        <span style={S.toggleThumb(actif)} />
      )}
    </button>
  );
}

export default function ModulesConfig() {
  const { toast } = useToast();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState({}); // { key: bool }

  const loadModules = async () => {
    try {
      const res = await api.get("/admin/modules");
      setModules(res.data);
    } catch {
      toast.error("Erreur chargement modules", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  const handleToggle = async (moduleKey, currentActif) => {
    setToggling((p) => ({ ...p, [moduleKey]: true }));
    try {
      await api.put(`/admin/modules/${moduleKey}`, { actif: !currentActif });
      clearModulesCache(); // vider le cache ModuleGate
      toast.success(
        `Module ${moduleKey} ${!currentActif ? "activé" : "désactivé"}`,
        !currentActif ? "success" : "info",
      );
      await loadModules();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur", "error");
    } finally {
      setToggling((p) => ({ ...p, [moduleKey]: false }));
    }
  };

  const nbActifs = modules.filter((m) => m.actif).length;

  if (loading)
    return (
      <div
        style={{
          ...S.page,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <i
          className="fa-solid fa-circle-notch fa-spin"
          style={{ fontSize: "32px", color: "#3b82f6" }}
        />
      </div>
    );

  // Grouper par plan
  const grouped = { Starter: [], Pro: [], Enterprise: [] };
  modules.forEach((m) => {
    const meta = MODULES_META[m.key];
    const plan = meta?.plan || "Starter";
    if (grouped[plan]) grouped[plan].push(m);
  });

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>
          <i
            className="fa-solid fa-puzzle-piece"
            style={{ color: "#8b5cf6", marginRight: "10px" }}
          />
          Modules
        </h1>
        <p style={S.sub}>
          {nbActifs} module{nbActifs !== 1 ? "s" : ""} actif
          {nbActifs !== 1 ? "s" : ""} sur {modules.length} disponibles
        </p>
      </div>

      {/* Résumé */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "28px",
          flexWrap: "wrap",
        }}
      >
        {Object.entries(grouped).map(([plan, mods]) => (
          <div
            key={plan}
            style={{
              background: "#181c27",
              border: "1px solid #2d3748",
              borderRadius: "10px",
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                ...S.planBadge(plan),
                fontSize: "13px",
                padding: "3px 10px",
              }}
            >
              {plan}
            </span>
            <span style={{ color: "#9ca3af", fontSize: "13px" }}>
              {mods.filter((m) => m.actif).length}/{mods.length} actifs
            </span>
          </div>
        ))}
      </div>

      {/* Modules par plan */}
      {Object.entries(grouped).map(([plan, mods]) =>
        mods.length === 0 ? null : (
          <div key={plan} style={{ marginBottom: "32px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "14px",
              }}
            >
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#fff",
                  margin: 0,
                }}
              >
                Plan {plan}
              </h2>
              <span
                style={{
                  ...S.planBadge(plan),
                  padding: "3px 10px",
                  fontSize: "12px",
                }}
              >
                {plan}
              </span>
            </div>

            <div style={S.grid}>
              {mods.map((mod) => {
                const meta = MODULES_META[mod.key] || {};
                return (
                  <div key={mod.key} style={S.card(mod.actif)}>
                    <div style={S.cardTop}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div style={S.iconWrap(meta.color || "#3b82f6")}>
                          <i
                            className={`fa-solid ${meta.icon || "fa-circle"}`}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={S.modName}>{mod.label}</div>
                          <div style={S.modDesc}>{mod.description}</div>
                        </div>
                      </div>
                      <div style={{ marginLeft: "12px" }}>
                        <ToggleSwitch
                          actif={mod.actif}
                          loading={!!toggling[mod.key]}
                          onChange={() => handleToggle(mod.key, mod.actif)}
                        />
                      </div>
                    </div>

                    <div style={S.footer}>
                      <span style={S.sprintBadge}>
                        Sprint {meta.sprint || "?"}
                      </span>
                      <span style={S.planBadge(plan)}>{plan}</span>
                      {mod.actif && (
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: "12px",
                            color: "#10b981",
                          }}
                        >
                          <i
                            className="fa-solid fa-circle-check"
                            style={{ marginRight: "4px" }}
                          />
                          Actif
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ),
      )}

      {/* Note */}
      <div
        style={{
          background: "#181c27",
          border: "1px solid #2d3748",
          borderRadius: "10px",
          padding: "16px",
          display: "flex",
          gap: "10px",
          alignItems: "flex-start",
          color: "#9ca3af",
          fontSize: "13px",
        }}
      >
        <i
          className="fa-solid fa-circle-info"
          style={{ color: "#3b82f6", marginTop: "2px" }}
        />
        <div>
          La désactivation d'un module masque immédiatement ses fonctionnalités
          pour tous les utilisateurs de votre organisation. Les données
          associées ne sont pas supprimées.
        </div>
      </div>
    </div>
  );
}
