// pages/admin/CompanySettings.jsx — Sprint 8
import { useState, useEffect } from "react";
import api from "../../utils/api";
import { useToast } from "../../context/ToastContext";

const S = {
  page: {
    padding: "32px",
    color: "#e5e7eb",
    minHeight: "100vh",
    maxWidth: "720px",
  },
  header: { marginBottom: "28px" },
  title: { fontSize: "24px", fontWeight: 700, color: "#fff", margin: 0 },
  sub: { color: "#9ca3af", marginTop: "4px", fontSize: "14px" },
  card: {
    background: "#181c27",
    borderRadius: "12px",
    border: "1px solid #2d3748",
    padding: "28px",
    marginBottom: "20px",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#fff",
    marginBottom: "20px",
    paddingBottom: "12px",
    borderBottom: "1px solid #2d3748",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  formGroup: { marginBottom: "18px" },
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
    transition: "border-color 0.2s",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  btnPrimary: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 22px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  btnDisabled: { opacity: 0.6, cursor: "not-allowed" },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #1f2937",
    fontSize: "14px",
  },
  infoLabel: { color: "#9ca3af" },
  infoValue: { color: "#fff", fontWeight: 500 },
};

export default function CompanySettings() {
  const { toast } = useToast();
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState({
    nom: "",
    email: "",
    adresse: "",
    telephone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    api
      .get("/admin/company")
      .then((res) => {
        setCompany(res.data);
        setForm({
          nom: res.data.nom || "",
          email: res.data.email || "",
          adresse: res.data.adresse || "",
          telephone: res.data.telephone || "",
        });
      })
      .catch(() => toast.error("Erreur chargement", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!form.nom) return toast.error("Le nom est requis", "error");
    setSaving(true);
    try {
      await api.put("/admin/company", form);
      toast.success("Paramètres sauvegardés", "success");
      setDirty(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div
        style={{
          ...S.page,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          maxWidth: "100%",
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
            className="fa-solid fa-building"
            style={{ color: "#10b981", marginRight: "10px" }}
          />
          Organisation
        </h1>
        <p style={S.sub}>Paramètres de votre entreprise sur LogiPlatform</p>
      </div>

      {/* Infos système */}
      <div style={S.card}>
        <div style={S.cardTitle}>
          <i className="fa-solid fa-circle-info" style={{ color: "#6b7280" }} />
          Informations système
        </div>
        <div style={S.infoRow}>
          <span style={S.infoLabel}>Identifiant company</span>
          <span
            style={{
              ...S.infoValue,
              fontFamily: "monospace",
              background: "#0f1117",
              padding: "2px 10px",
              borderRadius: "4px",
              fontSize: "13px",
            }}
          >
            #{company?.id}
          </span>
        </div>
        <div style={S.infoRow}>
          <span style={S.infoLabel}>Date de création</span>
          <span style={S.infoValue}>
            {company?.createdAt
              ? new Date(company.createdAt).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : "—"}
          </span>
        </div>
        <div style={{ ...S.infoRow, borderBottom: "none" }}>
          <span style={S.infoLabel}>Plan actif</span>
          <span
            style={{
              ...S.infoValue,
              background: "#8b5cf622",
              color: "#8b5cf6",
              padding: "3px 10px",
              borderRadius: "20px",
              fontSize: "13px",
            }}
          >
            Pro
          </span>
        </div>
      </div>

      {/* Formulaire */}
      <div style={S.card}>
        <div style={S.cardTitle}>
          <i className="fa-solid fa-pen" style={{ color: "#3b82f6" }} />
          Modifier les informations
        </div>

        <div style={S.formGroup}>
          <label style={S.label}>Nom de l'organisation *</label>
          <input
            style={S.input}
            value={form.nom}
            onChange={(e) => handleChange("nom", e.target.value)}
            placeholder="Cevital Agro-Industrie"
          />
        </div>

        <div style={S.grid2}>
          <div style={S.formGroup}>
            <label style={S.label}>Email de contact</label>
            <input
              style={S.input}
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="contact@example.com"
            />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Téléphone</label>
            <input
              style={S.input}
              value={form.telephone}
              onChange={(e) => handleChange("telephone", e.target.value)}
              placeholder="+213 34 00 00 00"
            />
          </div>
        </div>

        <div style={S.formGroup}>
          <label style={S.label}>Adresse</label>
          <input
            style={S.input}
            value={form.adresse}
            onChange={(e) => handleChange("adresse", e.target.value)}
            placeholder="Zone industrielle, Béjaïa, Algérie"
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "8px",
          }}
        >
          <button
            style={{
              ...S.btnPrimary,
              ...(!dirty || saving ? S.btnDisabled : {}),
            }}
            onClick={handleSave}
            disabled={!dirty || saving}
          >
            {saving ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin" />
                Enregistrement…
              </>
            ) : (
              <>
                <i className="fa-solid fa-floppy-disk" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ ...S.card, borderColor: "#ef444433" }}>
        <div style={{ ...S.cardTitle, color: "#ef4444" }}>
          <i className="fa-solid fa-triangle-exclamation" />
          Zone de danger
        </div>
        <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "16px" }}>
          Ces actions sont irréversibles. Contactez le support avant de
          procéder.
        </p>
        <button
          style={{
            background: "transparent",
            border: "1px solid #ef4444",
            color: "#ef4444",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "13px",
            cursor: "not-allowed",
            opacity: 0.5,
          }}
          disabled
          title="Fonctionnalité disponible en Sprint 12"
        >
          <i className="fa-solid fa-trash" style={{ marginRight: "8px" }} />
          Supprimer l'organisation (Sprint 12)
        </button>
      </div>
    </div>
  );
}
