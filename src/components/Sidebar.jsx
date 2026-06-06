// components/Sidebar.jsx — redesign contrasté / harmonieux DS
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const sidebarWidth = 260;

const NAV = [
  {
    to: "/dashboard",
    icon: "fa-gauge-high",
    label: "Tableau de bord",
    roles: [
      "admin",
      "planification",
      "transport",
      "keep_contact",
      "commercial",
    ],
  },
  {
    label: "Keep Contact",
    icon: "fa-headset",
    roles: ["admin", "keep_contact"],
    children: [{ to: "/keep-contact", icon: "fa-inbox", label: "Commandes" }],
  },
  {
    label: "Planification",
    icon: "fa-calendar-days",
    roles: ["admin", "planification"],
    children: [
      { to: "/planification", icon: "fa-list-check", label: "Workflow" },
      {
        to: "/planification/intelligent",
        icon: "fa-brain",
        label: "Planning IA",
      },
    ],
  },
  {
    label: "Transport",
    icon: "fa-truck",
    roles: ["admin", "transport"],
    children: [
      { to: "/transport", icon: "fa-route", label: "Workflow" },
      { to: "/transport/intelligent", icon: "fa-brain", label: "Transport IA" },
    ],
  },
  {
    label: "Stock",
    icon: "fa-boxes-stacked",
    roles: ["admin", "planification", "transport", "keep_contact"],
    children: [
      { to: "/stock", icon: "fa-gauge", label: "Tableau de bord" },
      {
        to: "/stock/carte",
        icon: "fa-map-location-dot",
        label: "Carte stocks",
      },
      {
        to: "/stock/mouvements",
        icon: "fa-arrow-right-arrow-left",
        label: "Mouvements",
      },
      { to: "/stock/intelligent", icon: "fa-brain", label: "Stock IA" },
    ],
  },
  {
    label: "Administration",
    icon: "fa-shield-halved",
    roles: ["admin"],
    children: [
      { to: "/admin", icon: "fa-gauge", label: "Dashboard admin" },
      { to: "/admin/users", icon: "fa-users", label: "Utilisateurs" },
      { to: "/admin/data", icon: "fa-database", label: "Données de base" },
      { to: "/admin/kpi", icon: "fa-brain", label: "KPI Dashboard" },
      {
        to: "/admin/infrastructure",
        icon: "fa-sitemap",
        label: "Infrastructure",
      },
    ],
  },
  {
    to: "/portail-prestataire",
    icon: "fa-handshake",
    label: "Portail Prestataire",
    roles: ["prestataire"],
  },
  {
    to: "/portail-client",
    icon: "fa-user-tie",
    label: "Mon suivi",
    roles: ["client"],
  },
];

const SIDEBAR_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');

  .sb-root {
    width: ${sidebarWidth}px;
    min-height: 100vh;
    background: #111110;
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
    overflow-y: auto;
    overflow-x: hidden;
    font-family: 'DM Sans', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .sb-root::-webkit-scrollbar { width: 2px; }
  .sb-root::-webkit-scrollbar-track { background: transparent; }
  .sb-root::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 2px; }

  /* ── Logo ── */
  .sb-logo {
    padding: 0 0 0;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }
  .sb-logo-inner {
    padding: 24px 22px 20px;
    position: relative;
    z-index: 1;
    border-bottom: 1px solid rgba(255,255,255,.07);
  }
  /* Fond rouge derrière le logo — lien visuel avec l'accent rouge des pages */
  .sb-logo-bg {
    position: absolute;
    top: -40px; right: -40px;
    width: 130px; height: 130px;
    background: #c0392b;
    border-radius: 50%;
    opacity: .07;
    pointer-events: none;
  }
  .sb-logo-mark {
    display: flex;
    align-items: center;
    gap: 11px;
    margin-bottom: 14px;
  }
  .sb-logo-square {
    width: 32px; height: 32px;
    background: #c0392b;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .sb-logo-square span {
    font-family: 'Playfair Display', serif;
    font-size: .95rem;
    font-weight: 900;
    color: #fff;
    letter-spacing: .03em;
  }
  .sb-logo-wordmark {
    font-family: 'Playfair Display', serif;
    font-size: 1.05rem;
    font-weight: 900;
    color: #fff;
    letter-spacing: -.01em;
    line-height: 1;
  }
  .sb-logo-wordmark em {
    font-style: italic;
    color: #c0392b;
  }
  .sb-logo-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .sb-logo-pill {
    font-size: .52rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .2em;
    color: #c0392b;
    background: rgba(192,57,43,.12);
    border: 1px solid rgba(192,57,43,.2);
    padding: 2px 8px;
  }
  .sb-logo-version {
    font-family: 'DM Mono', monospace;
    font-size: .52rem;
    color: rgba(255,255,255,.2);
    letter-spacing: .1em;
  }

  /* ── Nav ── */
  .sb-nav { flex: 1; padding: 10px 12px 8px; }

  /* Section label */
  .sb-section {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: .52rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .25em;
    color: rgba(255,255,255,.18);
    padding: 18px 8px 6px;
  }
  .sb-section::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,.06);
  }

  /* ── Simple link ── */
  .sb-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    font-size: .78rem;
    font-weight: 500;
    color: rgba(255,255,255,.35);
    text-decoration: none;
    margin-bottom: 1px;
    border-left: 2px solid transparent;
    transition: color .15s, background .15s;
  }
  .sb-link:hover {
    color: rgba(255,255,255,.75);
    background: rgba(255,255,255,.04);
  }
  .sb-link.active {
    color: #fff;
    background: rgba(192,57,43,.12);
    border-left-color: #c0392b;
    font-weight: 600;
  }
  .sb-link i {
    width: 16px;
    text-align: center;
    font-size: .72rem;
    color: rgba(255,255,255,.2);
    flex-shrink: 0;
    transition: color .15s;
  }
  .sb-link:hover i { color: rgba(255,255,255,.5); }
  .sb-link.active i { color: #c0392b; }

  /* ── Group button ── */
  .sb-group-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 10px;
    border: none;
    background: transparent;
    width: 100%;
    cursor: pointer;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: .78rem;
    font-weight: 500;
    color: rgba(255,255,255,.35);
    border-left: 2px solid transparent;
    margin-bottom: 1px;
    transition: color .15s, background .15s;
  }
  .sb-group-btn:hover {
    color: rgba(255,255,255,.75);
    background: rgba(255,255,255,.04);
  }
  .sb-group-btn.group-active { color: rgba(255,255,255,.85); font-weight: 600; }

  .sb-group-left { display: flex; align-items: center; gap: 10px; }
  .sb-group-left i {
    width: 16px;
    text-align: center;
    font-size: .72rem;
    color: rgba(255,255,255,.2);
    flex-shrink: 0;
    transition: color .15s;
  }
  .sb-group-btn:hover .sb-group-left i { color: rgba(255,255,255,.5); }
  .sb-group-btn.group-active .sb-group-left i { color: #c0392b; }

  .sb-chevron {
    font-size: .48rem;
    color: rgba(255,255,255,.2);
    transition: transform .2s;
  }
  .sb-chevron.open { transform: rotate(90deg); color: rgba(255,255,255,.35); }

  /* ── Sub links ── */
  .sb-sub { margin-bottom: 2px; }
  .sb-sub-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px 7px 36px;
    font-size: .72rem;
    font-weight: 400;
    color: rgba(255,255,255,.22);
    text-decoration: none;
    border-left: 2px solid transparent;
    margin-bottom: 1px;
    transition: color .15s, background .15s;
  }
  .sb-sub-link:hover {
    color: rgba(255,255,255,.55);
    background: rgba(255,255,255,.03);
  }
  .sb-sub-link.active {
    color: rgba(255,255,255,.9);
    font-weight: 600;
    border-left-color: rgba(192,57,43,.5);
    background: rgba(192,57,43,.07);
  }
  .sb-sub-link i {
    width: 13px;
    text-align: center;
    font-size: .63rem;
    color: rgba(255,255,255,.12);
    flex-shrink: 0;
    transition: color .15s;
  }
  .sb-sub-link:hover i { color: rgba(255,255,255,.35); }
  .sb-sub-link.active i { color: #c0392b; }

  /* ── Divider ── */
  .sb-divider {
    height: 1px;
    background: rgba(255,255,255,.06);
    margin: 6px 8px;
  }

  /* ── Footer ── */
  .sb-footer {
    flex-shrink: 0;
    border-top: 1px solid rgba(255,255,255,.07);
  }

  /* Bande de statut rouge — rappel chromatique fort */
  .sb-status-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 18px;
    background: rgba(192,57,43,.1);
    border-bottom: 1px solid rgba(192,57,43,.15);
  }
  .sb-status-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #c0392b;
    box-shadow: 0 0 5px rgba(192,57,43,.7);
    flex-shrink: 0;
  }
  .sb-status-txt {
    font-family: 'DM Mono', monospace;
    font-size: .52rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: .18em;
    color: rgba(192,57,43,.8);
  }

  .sb-footer-body { padding: 12px 14px 16px; }

  .sb-user {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 10px;
    background: rgba(255,255,255,.03);
    border: 1px solid rgba(255,255,255,.07);
    margin-bottom: 8px;
  }
  .sb-avatar {
    width: 32px; height: 32px;
    background: rgba(192,57,43,.15);
    border: 1px solid rgba(192,57,43,.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: .85rem;
    font-weight: 900;
    color: #c0392b;
    flex-shrink: 0;
  }
  .sb-user-info { flex: 1; min-width: 0; }
  .sb-user-name {
    font-size: .74rem;
    font-weight: 600;
    color: rgba(255,255,255,.85);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
  }
  .sb-user-role {
    font-size: .52rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .18em;
    color: rgba(255,255,255,.2);
    margin-top: 2px;
  }

  .sb-logout {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    width: 100%;
    padding: 8px;
    background: transparent;
    border: 1px solid rgba(255,255,255,.08);
    color: rgba(255,255,255,.25);
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: .6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .16em;
    cursor: pointer;
    transition: all .15s;
  }
  .sb-logout:hover {
    background: rgba(192,57,43,.09);
    border-color: rgba(192,57,43,.3);
    color: #c0392b;
  }
  .sb-logout i { font-size: .68rem; }
`;

function NavGroup({ item, userRole, location }) {
  const isAnyActive = item.children.some((c) =>
    location.pathname.startsWith(c.to),
  );
  const [open, setOpen] = useState(isAnyActive);

  if (!item.roles.includes(userRole)) return null;

  return (
    <div>
      <button
        className={`sb-group-btn ${isAnyActive ? "group-active" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="sb-group-left">
          <i className={`fa-solid ${item.icon}`} />
          {item.label}
        </span>
        <i
          className={`fa-solid fa-chevron-right sb-chevron ${open ? "open" : ""}`}
        />
      </button>

      {open && (
        <div className="sb-sub">
          {item.children.map((child) => {
            const active =
              location.pathname === child.to ||
              location.pathname.startsWith(child.to + "/");
            return (
              <NavLink
                key={child.to}
                to={child.to}
                className={`sb-sub-link ${active ? "active" : ""}`}
              >
                <i className={`fa-solid ${child.icon}`} />
                {child.label}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const initials = user.prenom
    ? (user.prenom[0] + (user.nom?.[0] || "")).toUpperCase()
    : (user.email?.[0] || "?").toUpperCase();

  const displayName = user.prenom
    ? `${user.prenom} ${user.nom || ""}`.trim()
    : user.email;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SIDEBAR_CSS }} />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      <aside className="sb-root">
        {/* ── Logo ── */}
        <div className="sb-logo">
          <div className="sb-logo-bg" />
          <div className="sb-logo-inner">
            <div className="sb-logo-mark">
              <div className="sb-logo-square">
                <span>LP</span>
              </div>
              <div className="sb-logo-wordmark">
                Logi<em>Platform</em>
              </div>
            </div>
            <div className="sb-logo-meta">
              <span className="sb-logo-pill">Cevital Agro</span>
              <span className="sb-logo-version">v2.14</span>
            </div>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="sb-nav">
          {NAV.map((item, idx) => {
            if (item.to) {
              if (!item.roles.includes(user.role)) return null;
              const active = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`sb-link ${active ? "active" : ""}`}
                >
                  <i className={`fa-solid ${item.icon}`} />
                  {item.label}
                </NavLink>
              );
            }
            return (
              <NavGroup
                key={idx}
                item={item}
                userRole={user.role}
                location={location}
              />
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div className="sb-footer">
          <div className="sb-status-bar">
            <span className="sb-status-dot" />
            <span className="sb-status-txt">Système opérationnel</span>
          </div>
          <div className="sb-footer-body">
            <div className="sb-user">
              <div className="sb-avatar">{initials}</div>
              <div className="sb-user-info">
                <div className="sb-user-name">{displayName}</div>
                <div className="sb-user-role">{user.role}</div>
              </div>
            </div>
            <button className="sb-logout" onClick={logout}>
              <i className="fa-solid fa-arrow-right-from-bracket" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
