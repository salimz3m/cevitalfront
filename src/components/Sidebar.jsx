// components/Sidebar.jsx — Sprint 14 — redesign DS
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const sidebarWidth = 248;

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

  // ── KEEP CONTACT ──
  {
    label: "Keep Contact",
    icon: "fa-headset",
    roles: ["admin", "keep_contact"],
    children: [{ to: "/keep-contact", icon: "fa-inbox", label: "Commandes" }],
  },

  // ── PLANIFICATION ──
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

  // ── TRANSPORT ──
  {
    label: "Transport",
    icon: "fa-truck",
    roles: ["admin", "transport"],
    children: [
      { to: "/transport", icon: "fa-route", label: "Workflow" },
      { to: "/transport/intelligent", icon: "fa-brain", label: "Transport IA" },
    ],
  },

  // ── STOCK ──
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

  // ── ADMINISTRATION ──
  {
    label: "Administration",
    icon: "fa-shield-halved",
    roles: ["admin"],
    children: [
      { to: "/admin", icon: "fa-gauge", label: "Dashboard admin" },
      { to: "/admin/users", icon: "fa-users", label: "Utilisateurs" },
      { to: "/admin/data", icon: "fa-database", label: "Données de base" },
      // ── KPI DASHBOARD Sprint 14 ──
      {
        to: "/admin/kpi",
        icon: "fa-brain",
        label: "KPI Dashboard",
      },
      {
        to: "/admin/infrastructure",
        icon: "fa-sitemap",
        label: "Infrastructure",
      },
    ],
  },

  // ── PORTAILS ──
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

// ── Styles DS ─────────────────────────────────────────────────
const SIDEBAR_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;600;700&display=swap');

  .sb-root {
    width: ${sidebarWidth}px;
    min-height: 100vh;
    background: #080808;
    border-right: 1px solid rgba(255,255,255,.06);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
    overflow-y: auto;
    overflow-x: hidden;
    font-family: 'DM Sans', sans-serif;
  }

  /* scrollbar */
  .sb-root::-webkit-scrollbar { width: 3px; }
  .sb-root::-webkit-scrollbar-track { background: transparent; }
  .sb-root::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 2px; }

  /* Logo */
  .sb-logo {
    padding: 22px 20px 18px;
    border-bottom: 1px solid rgba(255,255,255,.06);
    display: flex; align-items: center; gap: 12px;
    flex-shrink: 0;
  }
  .sb-logo-mark {
    width: 34px; height: 34px;
    background: #e63946;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .sb-logo-mark span {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.1rem; color: #fff; letter-spacing: .04em;
  }
  .sb-logo-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1rem; letter-spacing: .1em;
    color: #fff; text-transform: uppercase; line-height: 1;
  }
  .sb-logo-sub {
    font-size: .55rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .2em;
    color: rgba(255,255,255,.2); margin-top: 3px;
  }

  /* Nav */
  .sb-nav { flex: 1; padding: 14px 10px; }

  /* Section label */
  .sb-section {
    font-size: .52rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .25em;
    color: rgba(255,255,255,.18);
    padding: 14px 10px 5px;
  }

  /* Simple link */
  .sb-link {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px;
    font-size: .78rem; font-weight: 500;
    color: rgba(255,255,255,.4);
    text-decoration: none;
    transition: all .2s;
    border-left: 2px solid transparent;
    margin-bottom: 1px;
  }
  .sb-link:hover { color: rgba(255,255,255,.8); background: rgba(255,255,255,.04); }
  .sb-link.active {
    color: #fff;
    background: rgba(230,57,70,.1);
    border-left-color: #e63946;
  }
  .sb-link i { width: 16px; text-align: center; font-size: .78rem; opacity: .6; }
  .sb-link.active i { opacity: 1; color: #e63946; }

  /* Group button */
  .sb-group-btn {
    display: flex; align-items: center; justify-content: space-between;
    padding: 9px 12px;
    border: none; background: transparent; width: 100%;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: .78rem; font-weight: 500;
    color: rgba(255,255,255,.4);
    transition: all .2s;
    border-left: 2px solid transparent;
    margin-bottom: 1px;
  }
  .sb-group-btn:hover { color: rgba(255,255,255,.7); background: rgba(255,255,255,.04); }
  .sb-group-btn.group-active { color: rgba(255,255,255,.85); }
  .sb-group-left { display: flex; align-items: center; gap: 10px; }
  .sb-group-left i { width: 16px; text-align: center; font-size: .78rem; opacity: .6; }
  .sb-group-btn.group-active .sb-group-left i { opacity: 1; color: #e63946; }
  .sb-chevron { font-size: .55rem; opacity: .35; transition: transform .2s; }
  .sb-chevron.open { transform: rotate(90deg); }

  /* Sub links */
  .sb-sub { margin-bottom: 3px; }
  .sb-sub-link {
    display: flex; align-items: center; gap: 9px;
    padding: 7px 12px 7px 38px;
    font-size: .73rem; font-weight: 400;
    color: rgba(255,255,255,.3);
    text-decoration: none;
    transition: all .2s;
    border-left: 2px solid transparent;
    margin-bottom: 1px;
  }
  .sb-sub-link:hover { color: rgba(255,255,255,.65); background: rgba(255,255,255,.03); }
  .sb-sub-link.active {
    color: #fff; font-weight: 600;
    background: rgba(230,57,70,.08);
    border-left-color: rgba(230,57,70,.5);
  }
  .sb-sub-link i { width: 13px; text-align: center; font-size: .68rem; opacity: .5; }
  .sb-sub-link.active i { opacity: 1; color: #e63946; }

  /* Divider */
  .sb-divider {
    height: 1px; background: rgba(255,255,255,.05);
    margin: 8px 10px;
  }

  /* Footer */
  .sb-footer {
    padding: 14px 16px;
    border-top: 1px solid rgba(255,255,255,.06);
    flex-shrink: 0;
  }
  .sb-user {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 12px;
  }
  .sb-avatar {
    width: 30px; height: 30px;
    background: rgba(230,57,70,.15);
    border: 1px solid rgba(230,57,70,.3);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Bebas Neue', sans-serif;
    font-size: .85rem; color: #e63946;
    flex-shrink: 0;
  }
  .sb-user-name {
    font-size: .75rem; font-weight: 600; color: rgba(255,255,255,.8);
    line-height: 1.2;
  }
  .sb-user-role {
    font-size: .58rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .18em;
    color: rgba(255,255,255,.2); margin-top: 2px;
  }
  .sb-logout {
    display: flex; align-items: center; justify-content: center; gap: 7px;
    width: 100%; padding: 8px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.08);
    color: rgba(255,255,255,.3);
    font-family: 'DM Sans', sans-serif;
    font-size: .65rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .15em;
    cursor: pointer; transition: all .2s;
  }
  .sb-logout:hover { background: rgba(230,57,70,.1); border-color: rgba(230,57,70,.3); color: #e63946; }
`;

// ── NavGroup ──────────────────────────────────────────────────
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

// ── Sidebar principal ─────────────────────────────────────────
export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SIDEBAR_CSS }} />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      <aside className="sb-root">
        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-mark">
            <span>LP</span>
          </div>
          <div>
            <div className="sb-logo-text">LogiPlatform</div>
            <div className="sb-logo-sub">Cevital Agro</div>
          </div>
        </div>

        {/* Nav */}
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

        {/* Footer */}
        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">
              {(user.prenom?.[0] || user.email?.[0] || "?").toUpperCase()}
            </div>
            <div>
              <div className="sb-user-name">
                {user.prenom
                  ? `${user.prenom} ${user.nom || ""}`.trim()
                  : user.email}
              </div>
              <div className="sb-user-role">{user.role}</div>
            </div>
          </div>
          <button className="sb-logout" onClick={logout}>
            <i className="fa-solid fa-arrow-right-from-bracket" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
