import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700&display=swap');
  :root {
    --red: #e63946; --dark: #080808; --dark2: #111; --dark3: #1a1a1a;
    --ease: cubic-bezier(0.23,1,0.32,1);
  }
  .ds-sidebar {
    width: 260px; min-height: 100vh;
    background: var(--dark);
    display: flex; flex-direction: column;
    border-right: 1px solid rgba(255,255,255,.05);
    position: sticky; top: 0;
    font-family: 'DM Sans', sans-serif;
  }
  .ds-sidebar-logo {
    padding: 32px 28px 24px;
    border-bottom: 1px solid rgba(255,255,255,.06);
  }
  .ds-sidebar-logo .logo-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.6rem; letter-spacing: .1em; color: #fff;
    display: block; text-decoration: none;
  }
  .ds-sidebar-logo .logo-text span { color: var(--red); }
  .ds-sidebar-logo .logo-sub {
    font-size: .6rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .25em; color: rgba(255,255,255,.25);
    margin-top: 4px;
  }

  .ds-sidebar-role {
    margin: 16px 20px;
    background: var(--dark3);
    border: 1px solid rgba(255,255,255,.06);
    padding: 12px 16px;
    display: flex; align-items: center; gap: 10px;
  }
  .ds-sidebar-role-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--red); flex-shrink: 0;
    box-shadow: 0 0 8px rgba(230,57,70,.5);
  }
  .ds-sidebar-role-info { flex: 1; min-width: 0; }
  .ds-sidebar-role-name {
    font-size: .8rem; font-weight: 700; color: #fff;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .ds-sidebar-role-tag {
    font-size: .6rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .15em;
    color: var(--red); margin-top: 2px;
  }

  .ds-sidebar-section-label {
    font-size: .58rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .3em;
    color: rgba(255,255,255,.2);
    padding: 20px 28px 8px;
  }

  .ds-sidebar-nav { flex: 1; padding: 0 12px; }
  .ds-nav-link {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 16px;
    font-size: .72rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .15em;
    color: rgba(255,255,255,.4);
    text-decoration: none;
    transition: all .25s var(--ease);
    position: relative;
    margin-bottom: 2px;
  }
  .ds-nav-link::before {
    content: ''; position: absolute;
    left: 0; top: 50%; transform: translateY(-50%);
    width: 0; height: 60%;
    background: var(--red);
    transition: width .25s var(--ease);
  }
  .ds-nav-link:hover { color: #fff; background: rgba(255,255,255,.04); }
  .ds-nav-link:hover::before { width: 2px; }
  .ds-nav-link.active {
    color: #fff; background: rgba(230,57,70,.1);
  }
  .ds-nav-link.active::before { width: 3px; }
  .ds-nav-link i {
    width: 16px; text-align: center; font-size: .8rem;
    opacity: .6; flex-shrink: 0;
  }
  .ds-nav-link.active i, .ds-nav-link:hover i { opacity: 1; color: var(--red); }

  .ds-sidebar-footer {
    padding: 16px 12px 24px;
    border-top: 1px solid rgba(255,255,255,.06);
  }
  .ds-logout {
    display: flex; align-items: center; gap: 12px;
    width: 100%; padding: 11px 16px;
    background: none; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: .72rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .15em;
    color: rgba(255,255,255,.3);
    transition: color .25s;
  }
  .ds-logout:hover { color: var(--red); }
  .ds-logout i { font-size: .8rem; }
`;

const ROLE_LABELS = {
  admin: { label: "Administrateur", icon: "fa-shield-halved" },
  keep_contact: { label: "Keep Contact", icon: "fa-inbox" },
  planification: { label: "Planification", icon: "fa-calendar-check" },
  transport: { label: "Transport", icon: "fa-truck" },
};

const NAV_ITEMS = [
  {
    to: "/dashboard",
    icon: "fa-inbox",
    label: "Keep Contact",
    roles: ["admin", "keep_contact"],
  },
  {
    to: "/planification",
    icon: "fa-calendar-check",
    label: "Planification",
    roles: ["admin", "planification"],
  },
  {
    to: "/livreur",
    icon: "fa-truck",
    label: "Mes Livraisons",
    roles: ["admin", "transport"],
  },
  {
    to: "/stock",
    icon: "fa-chart-bar",
    label: "Stock",
    roles: ["admin", "keep_contact", "planification"],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const roleInfo = ROLE_LABELS[user?.role] || {
    label: user?.role,
    icon: "fa-user",
  };
  const visibleNav = NAV_ITEMS.filter((n) => n.roles.includes(user?.role));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="ds-sidebar">
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      {/* Logo */}
      <div className="ds-sidebar-logo">
        <NavLink to="/" className="logo-text">
          LOGI<span>PLATFORM</span>
        </NavLink>
        <div className="logo-sub">Gestion Logistique</div>
      </div>

      {/* User role card */}
      {user && (
        <div className="ds-sidebar-role">
          <div className="ds-sidebar-role-dot"></div>
          <div className="ds-sidebar-role-info">
            <div className="ds-sidebar-role-name">
              {user.email?.split("@")[0]}
            </div>
            <div className="ds-sidebar-role-tag">
              <i
                className={`fas ${roleInfo.icon}`}
                style={{ marginRight: 4, fontSize: ".55rem" }}
              ></i>
              {roleInfo.label}
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <div className="ds-sidebar-section-label">Navigation</div>
      <nav className="ds-sidebar-nav">
        {visibleNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `ds-nav-link${isActive ? " active" : ""}`
            }
          >
            <i className={`fas ${item.icon}`}></i>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer logout */}
      <div className="ds-sidebar-footer">
        <button className="ds-logout" onClick={handleLogout}>
          <i className="fas fa-right-from-bracket"></i>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
