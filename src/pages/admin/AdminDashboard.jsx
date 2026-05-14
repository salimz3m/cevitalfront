// pages/admin/AdminDashboard.jsx — Sprint 8
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

const S = {
  page: { padding: "32px", color: "#e5e7eb", minHeight: "100vh" },
  header: { marginBottom: "32px" },
  title: { fontSize: "28px", fontWeight: 700, color: "#fff", margin: 0 },
  sub: { color: "#9ca3af", marginTop: "4px", fontSize: "14px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  card: {
    background: "#181c27",
    borderRadius: "12px",
    border: "1px solid #2d3748",
    padding: "20px",
  },
  cardLabel: { fontSize: "13px", color: "#9ca3af", marginBottom: "8px" },
  cardValue: { fontSize: "32px", fontWeight: 700, color: "#fff" },
  cardSub: { fontSize: "12px", color: "#6b7280", marginTop: "4px" },
  section: {
    background: "#181c27",
    borderRadius: "12px",
    border: "1px solid #2d3748",
    padding: "24px",
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#fff",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  navGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
  },
  navCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#0f1117",
    border: "1px solid #2d3748",
    borderRadius: "10px",
    padding: "16px",
    textDecoration: "none",
    color: "#e5e7eb",
    transition: "border-color 0.2s",
  },
  navIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    background: "#1e3a5f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#3b82f6",
    fontSize: "16px",
  },
  auditRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px 0",
    borderBottom: "1px solid #1f2937",
  },
  auditDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#3b82f6",
    marginTop: "6px",
    flexShrink: 0,
  },
  badge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: 600,
  },
};

const COLOR_ACTION = {
  INVITE_USER: "#6366f1",
  CHANGE_ROLE: "#f59e0b",
  DEACTIVATE_USER: "#ef4444",
  REACTIVATE_USER: "#10b981",
  TOGGLE_MODULE: "#8b5cf6",
  UPDATE_COMPANY: "#06b6d4",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/admin/stats"), api.get("/admin/audit?limit=10")])
      .then(([s, a]) => {
        setStats(s.data);
        setAudit(a.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>
          <i
            className="fa-solid fa-shield-halved"
            style={{ color: "#3b82f6", marginRight: "10px" }}
          />
          Administration
        </h1>
        <p style={S.sub}>
          Gérez les utilisateurs, les modules et les paramètres de votre
          organisation.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={S.grid}>
        <div style={S.card}>
          <div style={S.cardLabel}>
            <i className="fa-solid fa-users" style={{ marginRight: "6px" }} />
            Utilisateurs
          </div>
          <div style={S.cardValue}>{stats?.nbUsersActifs}</div>
          <div style={S.cardSub}>actifs / {stats?.nbUsers} total</div>
        </div>
        <div style={S.card}>
          <div style={S.cardLabel}>
            <i
              className="fa-solid fa-puzzle-piece"
              style={{ marginRight: "6px" }}
            />
            Modules actifs
          </div>
          <div style={S.cardValue}>{stats?.modulesActifs}</div>
          <div style={S.cardSub}>sur {stats?.modulesTotal} disponibles</div>
        </div>
        <div style={S.card}>
          <div style={S.cardLabel}>
            <i className="fa-solid fa-clock" style={{ marginRight: "6px" }} />
            Dernière action
          </div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#fff",
              marginTop: "4px",
            }}
          >
            {stats?.derniereAction
              ? new Date(stats.derniereAction).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </div>
          <div style={S.cardSub}>dans l'audit log</div>
        </div>
      </div>

      {/* Navigation rapide */}
      <div style={S.section}>
        <div style={S.sectionTitle}>
          <i className="fa-solid fa-compass" style={{ color: "#3b82f6" }} />
          Navigation rapide
        </div>
        <div style={S.navGrid}>
          <Link to="/admin/users" style={S.navCard}>
            <div style={S.navIcon}>
              <i className="fa-solid fa-users" />
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: "2px" }}>
                Utilisateurs
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                Inviter, rôles, désactiver
              </div>
            </div>
          </Link>
          <Link to="/admin/modules" style={S.navCard}>
            <div
              style={{ ...S.navIcon, background: "#2d1a5f", color: "#8b5cf6" }}
            >
              <i className="fa-solid fa-puzzle-piece" />
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: "2px" }}>
                Modules
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                Activer / désactiver
              </div>
            </div>
          </Link>
          <Link to="/admin/company" style={S.navCard}>
            <div
              style={{ ...S.navIcon, background: "#1a3a2f", color: "#10b981" }}
            >
              <i className="fa-solid fa-building" />
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: "2px" }}>
                Organisation
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                Paramètres company
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Audit log récent */}
      <div style={S.section}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div style={S.sectionTitle}>
            <i
              className="fa-solid fa-list-check"
              style={{ color: "#3b82f6" }}
            />
            Actions récentes
          </div>
          <Link
            to="/admin/audit"
            style={{
              color: "#3b82f6",
              fontSize: "13px",
              textDecoration: "none",
            }}
          >
            Voir tout →
          </Link>
        </div>
        {audit.length === 0 ? (
          <div
            style={{ color: "#6b7280", textAlign: "center", padding: "24px" }}
          >
            Aucune action enregistrée
          </div>
        ) : (
          audit.map((entry) => (
            <div key={entry.id} style={S.auditRow}>
              <div
                style={{
                  ...S.auditDot,
                  background: COLOR_ACTION[entry.action] || "#3b82f6",
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      ...S.badge,
                      background:
                        (COLOR_ACTION[entry.action] || "#3b82f6") + "22",
                      color: COLOR_ACTION[entry.action] || "#3b82f6",
                    }}
                  >
                    {entry.action}
                  </span>
                  <span style={{ fontSize: "13px", color: "#9ca3af" }}>
                    par {entry.user?.prenom}{" "}
                    {entry.user?.nom || entry.user?.email || `#${entry.userId}`}
                  </span>
                </div>
                {entry.details && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginTop: "2px",
                    }}
                  >
                    {typeof entry.details === "string"
                      ? entry.details
                      : JSON.stringify(entry.details).slice(0, 80)}
                  </div>
                )}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#4b5563",
                  whiteSpace: "nowrap",
                }}
              >
                {new Date(entry.createdAt).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
