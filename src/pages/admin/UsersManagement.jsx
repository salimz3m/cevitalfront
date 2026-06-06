// pages/admin/UsersManagement.jsx — Sprint 8 — Redesign blanc épuré
import { useState, useEffect } from "react";
import api from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import { DS_STYLE } from "../design-system";

const ROLES = [
  {
    value: "admin",
    label: "Administrateur",
    badgeCls: "ds-badge ds-badge-red",
  },
  {
    value: "planification",
    label: "Planification",
    badgeCls: "ds-badge ds-badge-blue",
  },
  {
    value: "transport",
    label: "Transport",
    badgeCls: "ds-badge ds-badge-amber",
  },
  {
    value: "keep_contact",
    label: "Keep Contact",
    badgeCls: "ds-badge ds-badge-green",
  },
  {
    value: "prestataire",
    label: "Prestataire",
    badgeCls: "ds-badge ds-badge-purple",
  },
  { value: "client", label: "Client", badgeCls: "ds-badge ds-badge-neutral" },
];

const getRoleBadgeCls = (role) =>
  ROLES.find((r) => r.value === role)?.badgeCls || "ds-badge ds-badge-neutral";
const getRoleLabel = (role) =>
  ROLES.find((r) => r.value === role)?.label || role;

// ── Modal Invitation ─────────────────────────────────────────
function InviteModal({ onClose, onSuccess }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    email: "",
    nom: "",
    prenom: "",
    role: "planification",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.role) return toast.error("Email et rôle requis");
    setLoading(true);
    try {
      await api.post("/admin/users/invite", form);
      toast.success("Invitation envoyée avec succès");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors de l'invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ds-overlay" onClick={onClose}>
      <div className="ds-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ds-modal-title">
          <i
            className="fas fa-user-plus"
            style={{ color: "var(--ds-blue)", fontSize: "1.1rem" }}
          ></i>
          Inviter un utilisateur
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div className="ds-field">
            <label className="ds-label">Prénom</label>
            <input
              className="ds-input"
              value={form.prenom}
              onChange={(e) =>
                setForm((p) => ({ ...p, prenom: e.target.value }))
              }
              placeholder="Jean"
            />
          </div>
          <div className="ds-field">
            <label className="ds-label">Nom</label>
            <input
              className="ds-input"
              value={form.nom}
              onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
              placeholder="Dupont"
            />
          </div>
        </div>

        <div className="ds-field" style={{ marginBottom: 12 }}>
          <label className="ds-label">
            Email <span style={{ color: "var(--ds-red)" }}>*</span>
          </label>
          <input
            className="ds-input"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="jean.dupont@example.com"
          />
        </div>

        <div className="ds-field" style={{ marginBottom: 16 }}>
          <label className="ds-label">
            Rôle <span style={{ color: "var(--ds-red)" }}>*</span>
          </label>
          <select
            className="ds-select"
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="ds-alert ds-alert-info" style={{ marginTop: 0 }}>
          <i className="fas fa-circle-info" style={{ flexShrink: 0 }}></i>
          <span>
            Un email d'activation sera envoyé à l'adresse indiquée (si SMTP
            configuré).
          </span>
        </div>

        <div className="ds-modal-actions">
          <button className="ds-btn ds-btn-outline" onClick={onClose}>
            Annuler
          </button>
          <button
            className="ds-btn ds-btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
            Envoyer l'invitation
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Changement de rôle ──────────────────────────────────
function ChangeRoleModal({ user, onClose, onSuccess }) {
  const { toast } = useToast();
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put(`/admin/users/${user.id}/role`, { role });
      toast.success("Rôle mis à jour");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ds-overlay" onClick={onClose}>
      <div className="ds-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ds-modal-title">
          <i
            className="fas fa-user-gear"
            style={{ color: "var(--ds-amber)", fontSize: "1.1rem" }}
          ></i>
          Changer le rôle
        </div>
        <p
          style={{
            fontSize: ".84rem",
            color: "var(--ds-ink-2)",
            marginBottom: 20,
          }}
        >
          Utilisateur :{" "}
          <strong style={{ color: "var(--ds-ink)" }}>
            {user.prenom} {user.nom}
          </strong>
          <span
            style={{
              display: "block",
              fontSize: ".78rem",
              color: "var(--ds-ink-3)",
            }}
          >
            {user.email}
          </span>
        </p>
        <div className="ds-field" style={{ marginBottom: 16 }}>
          <label className="ds-label">Nouveau rôle</label>
          <select
            className="ds-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div className="ds-modal-actions">
          <button className="ds-btn ds-btn-outline" onClick={onClose}>
            Annuler
          </button>
          <button
            className="ds-btn ds-btn-red"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && <i className="fas fa-spinner fa-spin"></i>} Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════
export default function UsersManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [roleModal, setRoleModal] = useState(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch {
      toast.error("Erreur chargement utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleActif = async (user) => {
    const action = user.actif ? "désactiver" : "réactiver";
    if (!confirm(`Confirmer : ${action} ${user.email} ?`)) return;
    try {
      if (user.actif) {
        await api.delete(`/admin/users/${user.id}`);
        toast.success("Utilisateur désactivé");
      } else {
        await api.put(`/admin/users/${user.id}/reactivate`);
        toast.success("Utilisateur réactivé");
      }
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur");
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      `${u.nom} ${u.prenom} ${u.email}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const actifs = users.filter((u) => u.actif).length;

  return (
    <div className="ds-layout">
      <style dangerouslySetInnerHTML={{ __html: DS_STYLE }} />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSuccess={loadUsers}
        />
      )}
      {roleModal && (
        <ChangeRoleModal
          user={roleModal}
          onClose={() => setRoleModal(null)}
          onSuccess={loadUsers}
        />
      )}

      <div className="ds-main">
        {/* Header */}
        <div className="ds-page-header">
          <div className="ds-eyebrow">Administration</div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h1 className="ds-page-title">
                Gestion des <span>Utilisateurs</span>
              </h1>
              <p className="ds-page-sub">
                {actifs} actifs / {users.length} total
              </p>
            </div>
            <button
              className="ds-btn ds-btn-red"
              onClick={() => setShowInvite(true)}
            >
              <i className="fas fa-user-plus"></i> Inviter un utilisateur
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="ds-kpi-strip">
          {[
            { lbl: "Total", val: users.length, cls: "", icon: "fa-users" },
            {
              lbl: "Actifs",
              val: actifs,
              cls: "green",
              icon: "fa-circle-check",
            },
            {
              lbl: "Désactivés",
              val: users.filter((u) => !u.actif).length,
              cls: "red",
              icon: "fa-ban",
            },
            {
              lbl: "Admins",
              val: users.filter((u) => u.role === "admin").length,
              cls: "amber",
              icon: "fa-shield-halved",
            },
          ].map((k) => (
            <div key={k.lbl} className="ds-kpi">
              <div className="ds-kpi-lbl">{k.lbl}</div>
              <div className={`ds-kpi-val ${k.cls}`}>{k.val}</div>
              <i className={`fas ${k.icon} ds-kpi-icon`}></i>
            </div>
          ))}
        </div>

        <div className="ds-content">
          {/* Filtres */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <i
                className="fas fa-magnifying-glass"
                style={{
                  position: "absolute",
                  left: 11,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--ds-ink-3)",
                  fontSize: ".8rem",
                }}
              ></i>
              <input
                className="ds-input"
                style={{ paddingLeft: 32 }}
                placeholder="Rechercher par nom, email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="ds-select"
              style={{ width: "auto", minWidth: 160 }}
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">Tous les rôles</option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="ds-card">
            <div className="ds-card-head">
              <div className="ds-card-title">
                <span className="ds-card-dot"></span>Liste des utilisateurs
              </div>
              <span
                style={{
                  fontSize: ".72rem",
                  color: "var(--ds-ink-3)",
                  fontWeight: 600,
                }}
              >
                {filtered.length} entrée(s)
              </span>
            </div>

            {loading ? (
              <div className="ds-loading">
                <i
                  className="fas fa-spinner fa-spin"
                  style={{ marginRight: 8 }}
                ></i>
                Chargement…
              </div>
            ) : (
              <div className="ds-table-wrap">
                <table className="ds-table">
                  <thead>
                    <tr>
                      {[
                        "Utilisateur",
                        "Rôle",
                        "Statut",
                        "Inscrit le",
                        "Actions",
                      ].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            textAlign: "center",
                            padding: 32,
                            color: "var(--ds-ink-3)",
                          }}
                        >
                          Aucun utilisateur trouvé
                        </td>
                      </tr>
                    ) : (
                      filtered.map((user) => (
                        <tr
                          key={user.id}
                          style={{ opacity: user.actif ? 1 : 0.5 }}
                        >
                          <td>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  background: "var(--ds-surface-2)",
                                  border: "1px solid var(--ds-border)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  fontSize: ".78rem",
                                  color: "var(--ds-ink-2)",
                                  flexShrink: 0,
                                }}
                              >
                                {(user.prenom?.[0] || "").toUpperCase()}
                                {(user.nom?.[0] || "").toUpperCase()}
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontWeight: 600,
                                    color: "var(--ds-ink)",
                                  }}
                                >
                                  {user.prenom} {user.nom}
                                </div>
                                <div
                                  style={{
                                    fontSize: ".72rem",
                                    color: "var(--ds-ink-3)",
                                  }}
                                >
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={getRoleBadgeCls(user.role)}>
                              {getRoleLabel(user.role)}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`ds-badge ${user.actif ? "ds-badge-green" : "ds-badge-red"}`}
                            >
                              <span
                                className="ds-badge-dot"
                                style={{
                                  background: user.actif
                                    ? "var(--ds-green)"
                                    : "var(--ds-red)",
                                }}
                              ></span>
                              {user.actif ? "Actif" : "Désactivé"}
                            </span>
                          </td>
                          <td
                            className="mono"
                            style={{ color: "var(--ds-ink-3)" }}
                          >
                            {new Date(user.createdAt).toLocaleDateString(
                              "fr-FR",
                            )}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                className="ds-btn ds-btn-outline ds-btn-sm"
                                onClick={() => setRoleModal(user)}
                                title="Changer le rôle"
                              >
                                <i className="fas fa-user-gear"></i> Rôle
                              </button>
                              <button
                                className="ds-btn ds-btn-sm"
                                style={{
                                  background: "transparent",
                                  border: `1px solid ${user.actif ? "var(--ds-red-mid)" : "#bbf7d0"}`,
                                  color: user.actif
                                    ? "var(--ds-red)"
                                    : "var(--ds-green)",
                                }}
                                onClick={() => toggleActif(user)}
                              >
                                <i
                                  className={`fas ${user.actif ? "fa-ban" : "fa-rotate-right"}`}
                                ></i>
                                {user.actif ? "Désactiver" : "Réactiver"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
