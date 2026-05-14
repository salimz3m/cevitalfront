// pages/admin/UsersManagement.jsx — Sprint 8
import { useState, useEffect } from "react";
import api from "../../utils/api";
import { useToast } from "../../context/ToastContext";

const ROLES = [
  { value: "admin", label: "Administrateur", color: "#ef4444" },
  { value: "planification", label: "Planification", color: "#3b82f6" },
  { value: "transport", label: "Transport", color: "#f59e0b" },
  { value: "keep_contact", label: "Keep Contact", color: "#10b981" },
  { value: "prestataire", label: "Prestataire", color: "#8b5cf6" },
  { value: "client", label: "Client", color: "#06b6d4" },
];

const getRoleStyle = (role) => {
  const r = ROLES.find((r) => r.value === role);
  return r
    ? { background: r.color + "22", color: r.color }
    : { background: "#374151", color: "#9ca3af" };
};

const S = {
  page: { padding: "32px", color: "#e5e7eb", minHeight: "100vh" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: { fontSize: "24px", fontWeight: 700, color: "#fff", margin: 0 },
  sub: { color: "#9ca3af", marginTop: "4px", fontSize: "14px" },
  btnPrimary: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 18px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  card: {
    background: "#181c27",
    borderRadius: "12px",
    border: "1px solid #2d3748",
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #2d3748",
  },
  td: {
    padding: "14px 16px",
    fontSize: "14px",
    borderBottom: "1px solid #1f2937",
  },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
  },
  actionBtn: {
    background: "transparent",
    border: "1px solid #2d3748",
    borderRadius: "6px",
    padding: "5px 10px",
    fontSize: "12px",
    cursor: "pointer",
    color: "#9ca3af",
  },
  // Modal
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px",
  },
  modal: {
    background: "#181c27",
    borderRadius: "16px",
    border: "1px solid #2d3748",
    padding: "28px",
    width: "100%",
    maxWidth: "480px",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#fff",
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    color: "#9ca3af",
    marginBottom: "6px",
    fontWeight: 500,
  },
  input: {
    width: "100%",
    background: "#0f1117",
    border: "1px solid #374151",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    background: "#0f1117",
    border: "1px solid #374151",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  formGroup: { marginBottom: "16px" },
  modalActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "24px",
  },
  btnSecondary: {
    background: "transparent",
    color: "#9ca3af",
    border: "1px solid #374151",
    borderRadius: "8px",
    padding: "10px 18px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "14px",
  },
};

// Modal d'invitation
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
    if (!form.email || !form.role)
      return toast.error("Email et rôle requis", "error");
    setLoading(true);
    try {
      await api.post("/admin/users/invite", form);
      toast.success("Invitation envoyée avec succès", "success");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Erreur lors de l'invitation",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalTitle}>
          <i
            className="fa-solid fa-user-plus"
            style={{ color: "#3b82f6", marginRight: "8px" }}
          />
          Inviter un utilisateur
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <div style={S.formGroup}>
            <label style={S.label}>Prénom</label>
            <input
              style={S.input}
              value={form.prenom}
              onChange={(e) =>
                setForm((p) => ({ ...p, prenom: e.target.value }))
              }
              placeholder="Jean"
            />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Nom</label>
            <input
              style={S.input}
              value={form.nom}
              onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
              placeholder="Dupont"
            />
          </div>
        </div>

        <div style={S.formGroup}>
          <label style={S.label}>Email *</label>
          <input
            style={S.input}
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="jean.dupont@example.com"
          />
        </div>

        <div style={S.formGroup}>
          <label style={S.label}>Rôle *</label>
          <select
            style={S.select}
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

        <div
          style={{
            background: "#0f1117",
            borderRadius: "8px",
            padding: "12px",
            fontSize: "13px",
            color: "#6b7280",
          }}
        >
          <i
            className="fa-solid fa-circle-info"
            style={{ color: "#3b82f6", marginRight: "6px" }}
          />
          Un email d'activation sera envoyé à l'adresse indiquée (si SMTP
          configuré).
        </div>

        <div style={S.modalActions}>
          <button style={S.btnSecondary} onClick={onClose}>
            Annuler
          </button>
          <button
            style={S.btnPrimary}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <i className="fa-solid fa-circle-notch fa-spin" />
            ) : (
              <i className="fa-solid fa-paper-plane" />
            )}
            Envoyer l'invitation
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal changement de rôle
function ChangeRoleModal({ user, onClose, onSuccess }) {
  const { toast } = useToast();
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put(`/admin/users/${user.id}/role`, { role });
      toast.success("Rôle mis à jour", "success");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalTitle}>
          <i
            className="fa-solid fa-user-gear"
            style={{ color: "#f59e0b", marginRight: "8px" }}
          />
          Changer le rôle
        </div>
        <p style={{ color: "#9ca3af", marginBottom: "20px", fontSize: "14px" }}>
          Utilisateur :{" "}
          <strong style={{ color: "#fff" }}>
            {user.prenom} {user.nom} ({user.email})
          </strong>
        </p>
        <div style={S.formGroup}>
          <label style={S.label}>Nouveau rôle</label>
          <select
            style={S.select}
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
        <div style={S.modalActions}>
          <button style={S.btnSecondary} onClick={onClose}>
            Annuler
          </button>
          <button
            style={{ ...S.btnPrimary, background: "#f59e0b" }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <i className="fa-solid fa-circle-notch fa-spin" />
            ) : null}
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [roleModal, setRoleModal] = useState(null); // user object
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch {
      toast.error("Erreur chargement utilisateurs", "error");
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
        toast.success("Utilisateur désactivé", "success");
      } else {
        await api.put(`/admin/users/${user.id}/reactivate`);
        toast.success("Utilisateur réactivé", "success");
      }
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur", "error");
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div style={S.page}>
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

      <div style={S.header}>
        <div>
          <h1 style={S.title}>
            <i
              className="fa-solid fa-users"
              style={{ color: "#3b82f6", marginRight: "10px" }}
            />
            Utilisateurs
          </h1>
          <p style={S.sub}>
            {users.filter((u) => u.actif).length} actifs / {users.length} total
          </p>
        </div>
        <button style={S.btnPrimary} onClick={() => setShowInvite(true)}>
          <i className="fa-solid fa-user-plus" />
          Inviter un utilisateur
        </button>
      </div>

      {/* Filtres */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
          <i
            className="fa-solid fa-magnifying-glass"
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#6b7280",
            }}
          />
          <input
            style={{
              ...S.input,
              paddingLeft: "36px",
              background: "#181c27",
              border: "1px solid #2d3748",
            }}
            placeholder="Rechercher par nom, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          style={{
            ...S.select,
            width: "auto",
            minWidth: "160px",
            background: "#181c27",
            border: "1px solid #2d3748",
          }}
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

      <div style={S.card}>
        {loading ? (
          <div
            style={{ padding: "48px", textAlign: "center", color: "#9ca3af" }}
          >
            <i
              className="fa-solid fa-circle-notch fa-spin"
              style={{
                fontSize: "24px",
                marginBottom: "12px",
                display: "block",
              }}
            />
            Chargement…
          </div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr style={{ background: "#0f1117" }}>
                <th style={S.th}>Utilisateur</th>
                <th style={S.th}>Rôle</th>
                <th style={S.th}>Statut</th>
                <th style={S.th}>Inscrit le</th>
                <th style={S.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      ...S.td,
                      textAlign: "center",
                      color: "#6b7280",
                      padding: "32px",
                    }}
                  >
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} style={{ opacity: user.actif ? 1 : 0.5 }}>
                    <td style={S.td}>
                      <div style={{ fontWeight: 600, color: "#fff" }}>
                        {user.prenom} {user.nom}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        {user.email}
                      </div>
                    </td>
                    <td style={S.td}>
                      <span style={{ ...S.badge, ...getRoleStyle(user.role) }}>
                        {ROLES.find((r) => r.value === user.role)?.label ||
                          user.role}
                      </span>
                    </td>
                    <td style={S.td}>
                      <span
                        style={{
                          ...S.badge,
                          ...(user.actif
                            ? { background: "#10b98122", color: "#10b981" }
                            : { background: "#ef444422", color: "#ef4444" }),
                        }}
                      >
                        {user.actif ? "Actif" : "Désactivé"}
                      </span>
                    </td>
                    <td style={{ ...S.td, color: "#9ca3af", fontSize: "13px" }}>
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td style={S.td}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          style={{
                            ...S.actionBtn,
                            borderColor: "#f59e0b44",
                            color: "#f59e0b",
                          }}
                          onClick={() => setRoleModal(user)}
                          title="Changer le rôle"
                        >
                          <i className="fa-solid fa-user-gear" /> Rôle
                        </button>
                        <button
                          style={{
                            ...S.actionBtn,
                            borderColor: user.actif ? "#ef444444" : "#10b98144",
                            color: user.actif ? "#ef4444" : "#10b981",
                          }}
                          onClick={() => toggleActif(user)}
                          title={user.actif ? "Désactiver" : "Réactiver"}
                        >
                          <i
                            className={`fa-solid ${user.actif ? "fa-ban" : "fa-rotate-right"}`}
                          />
                          {user.actif ? "Désactiver" : "Réactiver"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
