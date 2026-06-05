import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

const COLOR_ACTION = {
  INVITE_USER: "#1d4ed8",
  CHANGE_ROLE: "#b45309",
  DEACTIVATE_USER: "#c0392b",
  REACTIVATE_USER: "#1a7a4a",
  TOGGLE_MODULE: "#7c3aed",
  UPDATE_COMPANY: "#0891b2",
};

const AD_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;900&display=swap');
  :root {
    --ad-bg:#f8f8f7; --ad-surface:#ffffff; --ad-surface-2:#f2f2f0;
    --ad-border:#e6e6e3; --ad-border-2:#d0d0cc;
    --ad-ink:#111110; --ad-ink-2:#555553; --ad-ink-3:#9a9a96;
    --ad-red:#c0392b; --ad-red-soft:rgba(192,57,43,.07); --ad-red-mid:rgba(192,57,43,.15);
    --ad-green:#1a7a4a; --ad-green-soft:rgba(26,122,74,.07);
    --ad-radius:5px; --ad-radius-lg:10px;
    --ad-shadow-sm:0 1px 3px rgba(0,0,0,.05);
    --ad-font:'DM Sans',system-ui,sans-serif; --ad-mono:'DM Mono',monospace;
  }
  .ad-root { min-height:100vh; background:var(--ad-bg); font-family:var(--ad-font); color:var(--ad-ink); -webkit-font-smoothing:antialiased; }

  .ad-page-header { background:var(--ad-surface); border-bottom:1px solid var(--ad-border); padding:28px 36px 24px; }
  .ad-eyebrow { font-size:.62rem; font-weight:700; letter-spacing:.18em; text-transform:uppercase; color:var(--ad-red); margin-bottom:6px; display:flex; align-items:center; gap:7px; }
  .ad-eyebrow::before { content:''; width:18px; height:2px; background:var(--ad-red); }
  .ad-page-title { font-family:'Playfair Display',serif; font-size:1.8rem; font-weight:900; line-height:1; letter-spacing:-.02em; color:var(--ad-ink); margin-bottom:4px; }
  .ad-page-title span { color:var(--ad-red); }
  .ad-page-sub { font-size:.82rem; color:var(--ad-ink-3); }

  .ad-kpi-strip { display:grid; grid-template-columns:repeat(3,1fr); background:var(--ad-surface); border-bottom:1px solid var(--ad-border); }
  .ad-kpi { padding:16px 28px; border-right:1px solid var(--ad-border); position:relative; overflow:hidden; }
  .ad-kpi:last-child { border-right:none; }
  .ad-kpi-lbl { font-size:.62rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:var(--ad-ink-3); margin-bottom:4px; }
  .ad-kpi-val { font-size:1.7rem; font-weight:700; font-family:var(--ad-mono); line-height:1; color:var(--ad-ink); }
  .ad-kpi-sub { font-size:.68rem; color:var(--ad-ink-3); margin-top:3px; }
  .ad-kpi-icon { position:absolute; right:16px; top:50%; transform:translateY(-50%); font-size:1.4rem; opacity:.05; }

  .ad-content { padding:28px 36px; }

  .ad-card { background:var(--ad-surface); border:1px solid var(--ad-border); border-radius:var(--ad-radius-lg); box-shadow:var(--ad-shadow-sm); overflow:hidden; margin-bottom:16px; }
  .ad-card-head { padding:16px 22px; border-bottom:1px solid var(--ad-border); display:flex; align-items:center; justify-content:space-between; gap:12px; }
  .ad-card-title { font-size:.75rem; font-weight:700; text-transform:uppercase; letter-spacing:.09em; color:var(--ad-ink); display:flex; align-items:center; gap:8px; }
  .ad-card-dot { width:6px; height:6px; border-radius:50%; background:var(--ad-red); flex-shrink:0; }
  .ad-card-body { padding:22px; }

  .ad-nav-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:12px; }
  .ad-nav-link { display:flex; align-items:center; gap:14px; padding:16px 18px; border:1px solid var(--ad-border); border-radius:var(--ad-radius-lg); text-decoration:none; color:var(--ad-ink); background:var(--ad-surface); transition:all .15s; }
  .ad-nav-link:hover { border-color:var(--ad-ink); background:var(--ad-surface-2); }
  .ad-nav-icon { width:38px; height:38px; border-radius:var(--ad-radius); background:var(--ad-surface-2); border:1px solid var(--ad-border); display:flex; align-items:center; justify-content:center; font-size:.9rem; color:var(--ad-red); flex-shrink:0; }
  .ad-nav-label { font-size:.84rem; font-weight:600; color:var(--ad-ink); line-height:1.2; }
  .ad-nav-sub { font-size:.72rem; color:var(--ad-ink-3); margin-top:2px; }

  .ad-audit-row { display:flex; align-items:flex-start; gap:12px; padding:12px 0; border-bottom:1px solid var(--ad-border); }
  .ad-audit-row:last-child { border-bottom:none; }
  .ad-audit-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; margin-top:5px; }
  .ad-audit-action { display:inline-flex; align-items:center; font-size:.62rem; font-weight:700; text-transform:uppercase; letter-spacing:.07em; padding:2px 8px; border-radius:20px; }
  .ad-audit-by { font-size:.78rem; color:var(--ad-ink-3); }
  .ad-audit-detail { font-size:.72rem; color:var(--ad-ink-3); margin-top:3px; font-family:var(--ad-mono); }
  .ad-audit-date { font-size:.7rem; color:var(--ad-ink-3); white-space:nowrap; font-family:var(--ad-mono); }

  .ad-link-more { font-size:.76rem; color:var(--ad-red); text-decoration:none; display:flex; align-items:center; gap:5px; font-weight:600; }
  .ad-link-more:hover { text-decoration:underline; }

  .ad-loading { display:flex; align-items:center; justify-content:center; min-height:100vh; color:var(--ad-ink-3); gap:10px; font-size:.84rem; background:var(--ad-bg); }
  .ad-empty { text-align:center; padding:32px; color:var(--ad-ink-3); font-size:.82rem; }
`;

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
      <>
        <style dangerouslySetInnerHTML={{ __html: AD_STYLE }} />
        <div className="ad-loading">
          <i className="fas fa-spinner fa-spin"></i>Chargement…
        </div>
      </>
    );

  const KPI = [
    {
      lbl: "Utilisateurs actifs",
      val: stats?.nbUsersActifs ?? "—",
      sub: `sur ${stats?.nbUsers ?? "—"} total`,
      icon: "fa-users",
    },
    {
      lbl: "Modules actifs",
      val: stats?.modulesActifs ?? "—",
      sub: `sur ${stats?.modulesTotal ?? "—"} disponibles`,
      icon: "fa-puzzle-piece",
    },
    {
      lbl: "Derniere action",
      val: stats?.derniereAction
        ? new Date(stats.derniereAction).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
          })
        : "—",
      sub: stats?.derniereAction
        ? new Date(stats.derniereAction).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "dans l'audit log",
      icon: "fa-clock",
      small: true,
    },
  ];

  const NAV = [
    {
      to: "/admin/users",
      icon: "fa-users",
      label: "Utilisateurs",
      sub: "Inviter, roles, desactiver",
    },
    {
      to: "/admin/modules",
      icon: "fa-puzzle-piece",
      label: "Modules",
      sub: "Activer / desactiver",
    },
    {
      to: "/admin/data",
      icon: "fa-database",
      label: "Donnees de base",
      sub: "Produits, CLR, clients",
    },
    {
      to: "/admin/infrastructure",
      icon: "fa-sitemap",
      label: "Infrastructure",
      sub: "Plateformes, CLR",
    },
    {
      to: "/admin/kpi",
      icon: "fa-brain",
      label: "KPI Dashboard",
      sub: "Analytique global",
    },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: AD_STYLE }} />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />
      <div className="ad-root">
        {/* Header */}
        <div className="ad-page-header">
          <div className="ad-eyebrow">Panneau admin</div>
          <h1 className="ad-page-title">
            Admin<span>istration</span>
          </h1>
          <p className="ad-page-sub">
            Gerez les utilisateurs, les modules et les parametres de votre
            organisation.
          </p>
        </div>

        {/* KPI */}
        <div className="ad-kpi-strip">
          {KPI.map((k) => (
            <div key={k.lbl} className="ad-kpi">
              <div className="ad-kpi-lbl">{k.lbl}</div>
              <div
                className="ad-kpi-val"
                style={k.small ? { fontSize: "1.1rem" } : {}}
              >
                {k.val}
              </div>
              <div className="ad-kpi-sub">{k.sub}</div>
              <i className={`fas ${k.icon} ad-kpi-icon`}></i>
            </div>
          ))}
        </div>

        <div className="ad-content">
          {/* Navigation rapide */}
          <div className="ad-card">
            <div className="ad-card-head">
              <div className="ad-card-title">
                <span className="ad-card-dot"></span>Navigation rapide
              </div>
            </div>
            <div className="ad-card-body">
              <div className="ad-nav-grid">
                {NAV.map((n) => (
                  <Link key={n.to} to={n.to} className="ad-nav-link">
                    <div className="ad-nav-icon">
                      <i className={`fas ${n.icon}`}></i>
                    </div>
                    <div>
                      <div className="ad-nav-label">{n.label}</div>
                      <div className="ad-nav-sub">{n.sub}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Audit log */}
          <div className="ad-card">
            <div className="ad-card-head">
              <div className="ad-card-title">
                <span className="ad-card-dot"></span>Actions recentes
              </div>
              <Link to="/admin/audit" className="ad-link-more">
                Voir tout{" "}
                <i
                  className="fas fa-arrow-right"
                  style={{ fontSize: ".65rem" }}
                ></i>
              </Link>
            </div>
            <div className="ad-card-body" style={{ padding: "0 22px" }}>
              {audit.length === 0 ? (
                <div className="ad-empty">Aucune action enregistree</div>
              ) : (
                audit.map((entry) => {
                  const color = COLOR_ACTION[entry.action] || "var(--ad-ink-2)";
                  return (
                    <div key={entry.id} className="ad-audit-row">
                      <div
                        className="ad-audit-dot"
                        style={{ background: color }}
                      ></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            className="ad-audit-action"
                            style={{ background: color + "12", color }}
                          >
                            {entry.action}
                          </span>
                          <span className="ad-audit-by">
                            par {entry.user?.prenom}{" "}
                            {entry.user?.nom ||
                              entry.user?.email ||
                              `#${entry.userId}`}
                          </span>
                        </div>
                        {entry.details && (
                          <div className="ad-audit-detail">
                            {typeof entry.details === "string"
                              ? entry.details
                              : JSON.stringify(entry.details).slice(0, 80)}
                          </div>
                        )}
                      </div>
                      <div className="ad-audit-date">
                        {new Date(entry.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
