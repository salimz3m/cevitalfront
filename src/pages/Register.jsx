// pages/Register.jsx — Sprint 8
// Activation de compte via token d'invitation
// Route : /register?token=<invitationToken>

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/api";

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  root: {
    minHeight: "100vh",
    background: "#0f1117",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  bgGlow1: {
    position: "absolute",
    top: "-120px",
    left: "-80px",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, #3b82f620 0%, transparent 70%)",
    pointerEvents: "none",
  },
  bgGlow2: {
    position: "absolute",
    bottom: "-100px",
    right: "-60px",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background: "radial-gradient(circle, #6366f115 0%, transparent 70%)",
    pointerEvents: "none",
  },
  bgGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(#ffffff04 1px, transparent 1px), linear-gradient(90deg, #ffffff04 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    zIndex: 1,
    background: "#181c27",
    border: "1px solid #2d3748",
    borderRadius: "20px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "32px",
  },
  logoIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    flexShrink: 0,
  },
  logoText: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "-0.02em",
  },
  logoSub: {
    fontSize: "10px",
    color: "#4b5563",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  title: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 6px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "28px",
    lineHeight: 1.5,
  },
  roleBadge: (color) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: color + "18",
    border: `1px solid ${color}33`,
    color,
    borderRadius: "20px",
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: 600,
    marginBottom: "24px",
  }),
  formGroup: { marginBottom: "16px" },
  label: {
    display: "block",
    fontSize: "12px",
    color: "#9ca3af",
    fontWeight: 600,
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  input: (focus) => ({
    width: "100%",
    boxSizing: "border-box",
    background: "#0f1117",
    border: `1px solid ${focus ? "#3b82f6" : "#2d3748"}`,
    borderRadius: "10px",
    padding: "11px 14px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  }),
  inputWrap: { position: "relative" },
  inputIcon: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#4b5563",
    cursor: "pointer",
    fontSize: "14px",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  strengthBar: { display: "flex", gap: "4px", marginTop: "8px" },
  strengthSegment: (filled, color) => ({
    flex: 1,
    height: "3px",
    borderRadius: "2px",
    background: filled ? color : "#2d3748",
    transition: "background 0.3s",
  }),
  strengthLabel: { fontSize: "11px", color: "#6b7280", marginTop: "4px" },
  btn: (loading, disabled) => ({
    width: "100%",
    padding: "12px",
    background: disabled
      ? "#1f2937"
      : loading
        ? "#1d4ed8"
        : "linear-gradient(135deg, #3b82f6, #6366f1)",
    border: "none",
    borderRadius: "10px",
    color: disabled ? "#4b5563" : "#fff",
    fontSize: "14px",
    fontWeight: 700,
    cursor: disabled || loading ? "not-allowed" : "pointer",
    marginTop: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "opacity 0.2s",
    letterSpacing: "0.01em",
  }),
  alertBox: (type) => ({
    background: type === "error" ? "#ef444415" : "#10b98115",
    border: `1px solid ${type === "error" ? "#ef444430" : "#10b98130"}`,
    borderRadius: "10px",
    padding: "12px 16px",
    color: type === "error" ? "#f87171" : "#34d399",
    fontSize: "13px",
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
    marginBottom: "16px",
    lineHeight: 1.5,
  }),
  successCard: { textAlign: "center", padding: "16px 0" },
  successIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "#10b98120",
    border: "2px solid #10b98140",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    fontSize: "28px",
    color: "#10b981",
  },
  link: {
    color: "#3b82f6",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "13px",
  },
  divider: {
    borderColor: "#1f2937",
    borderStyle: "solid",
    borderWidth: "1px 0 0",
    margin: "24px 0",
  },
  footer: {
    textAlign: "center",
    fontSize: "12px",
    color: "#4b5563",
    marginTop: "20px",
  },
};

// ─── Force du mot de passe ────────────────────────────────────────────────────
function getStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

const STRENGTH_LABELS = ["", "Faible", "Moyen", "Bon", "Fort"];
const STRENGTH_COLORS = ["", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

function StrengthMeter({ password }) {
  const score = getStrength(password);
  if (!password) return null;
  return (
    <div>
      <div style={S.strengthBar}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={S.strengthSegment(i <= score, STRENGTH_COLORS[score])}
          />
        ))}
      </div>
      <div
        style={{
          ...S.strengthLabel,
          color: STRENGTH_COLORS[score] || "#6b7280",
        }}
      >
        {STRENGTH_LABELS[score]}
      </div>
    </div>
  );
}

// ─── Couleurs par rôle ────────────────────────────────────────────────────────
const ROLE_META = {
  admin: {
    label: "Administrateur",
    color: "#ef4444",
    icon: "fa-shield-halved",
  },
  planification: {
    label: "Planification",
    color: "#3b82f6",
    icon: "fa-calendar-days",
  },
  transport: { label: "Transport", color: "#f59e0b", icon: "fa-truck" },
  keep_contact: { label: "Keep Contact", color: "#10b981", icon: "fa-headset" },
  prestataire: { label: "Prestataire", color: "#8b5cf6", icon: "fa-handshake" },
  client: { label: "Client", color: "#06b6d4", icon: "fa-user-tie" },
};

// ─── Composant principal ──────────────────────────────────────────────────────
export default function Register() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  // États possibles :
  //   "checking" → vérification API en cours (avec token)
  //   "none"     → pas de token dans l'URL (accès direct à /register)  ← NOUVEAU
  //   "valid"    → token OK
  //   "invalid"  → token inconnu ou déjà utilisé
  //   "expired"  → token expiré (> 48h)
  const [tokenStatus, setTokenStatus] = useState("checking");
  const [userInfo, setUserInfo] = useState(null);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    password: "",
    confirm: "",
  });
  const [focused, setFocused] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ── Vérification du token ──
  useEffect(() => {
    if (!token) {
      // Pas de token dans l'URL → page accessible directement, message dédié
      setTokenStatus("none");
      return;
    }

    api
      .get(`/auth/verify-invitation?token=${token}`)
      .then((res) => {
        setUserInfo(res.data);
        setForm((f) => ({
          ...f,
          nom: res.data.nom || "",
          prenom: res.data.prenom || "",
        }));
        setTokenStatus("valid");
      })
      .catch((err) => {
        const msg = err.response?.data?.error || "";
        setTokenStatus(
          msg.toLowerCase().includes("expi") ? "expired" : "invalid",
        );
      });
  }, [token]);

  // ── Validation ──
  const strength = getStrength(form.password);
  const canSubmit =
    form.prenom.trim() &&
    form.nom.trim() &&
    form.password.length >= 8 &&
    strength >= 2 &&
    form.password === form.confirm &&
    !submitting;

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setError("");
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (form.password !== form.confirm)
      return setError("Les mots de passe ne correspondent pas.");

    setSubmitting(true);
    setError("");
    try {
      await api.post("/auth/register", {
        token,
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        password: form.password,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.error || "Une erreur est survenue. Réessayez.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  // ─── Rendu : pas de token dans l'URL ─────────────────────────────────────
  const renderNoToken = () => (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <div style={{ fontSize: "40px", marginBottom: "16px" }}>✉️</div>
      <div
        style={{
          fontSize: "18px",
          fontWeight: 700,
          color: "#fff",
          marginBottom: "8px",
        }}
      >
        Accès par invitation uniquement
      </div>
      <div
        style={{
          fontSize: "13px",
          color: "#6b7280",
          marginBottom: "24px",
          lineHeight: 1.6,
        }}
      >
        Pour créer un compte sur LogiPlatform, vous devez recevoir une
        invitation par email de votre administrateur. Le lien d'activation se
        trouve dans cet email.
      </div>
      <Link to="/login" style={S.link}>
        ← Retour à la connexion
      </Link>
    </div>
  );

  // ─── Rendu : token invalide ou expiré ────────────────────────────────────
  const renderTokenProblem = () => (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <div style={{ fontSize: "40px", marginBottom: "16px" }}>
        {tokenStatus === "expired" ? "⏱️" : "🔒"}
      </div>
      <div
        style={{
          fontSize: "18px",
          fontWeight: 700,
          color: "#fff",
          marginBottom: "8px",
        }}
      >
        {tokenStatus === "expired" ? "Invitation expirée" : "Lien invalide"}
      </div>
      <div
        style={{
          fontSize: "13px",
          color: "#6b7280",
          marginBottom: "24px",
          lineHeight: 1.6,
        }}
      >
        {tokenStatus === "expired"
          ? "Ce lien d'invitation a expiré (48h). Contactez votre administrateur pour recevoir une nouvelle invitation."
          : "Ce lien d'activation est invalide ou a déjà été utilisé."}
      </div>
      <Link to="/login" style={S.link}>
        ← Retour à la connexion
      </Link>
    </div>
  );

  const renderChecking = () => (
    <div style={{ textAlign: "center", padding: "24px 0", color: "#6b7280" }}>
      <i
        className="fa-solid fa-circle-notch fa-spin"
        style={{
          fontSize: "28px",
          color: "#3b82f6",
          marginBottom: "12px",
          display: "block",
        }}
      />
      Vérification du lien…
    </div>
  );

  const renderSuccess = () => {
    const role = ROLE_META[userInfo?.role] || ROLE_META.planification;
    return (
      <div style={S.successCard}>
        <div style={S.successIcon}>
          <i className="fa-solid fa-check" />
        </div>
        <div
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "8px",
          }}
        >
          Compte activé !
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "#6b7280",
            marginBottom: "24px",
            lineHeight: 1.6,
          }}
        >
          Bienvenue, <strong style={{ color: "#fff" }}>{form.prenom}</strong>.
          <br />
          Votre compte est prêt avec le rôle{" "}
          <span style={{ color: role.color, fontWeight: 600 }}>
            {role.label}
          </span>
          .
        </div>
        <button style={S.btn(false, false)} onClick={() => navigate("/login")}>
          <i className="fa-solid fa-arrow-right-to-bracket" />
          Se connecter
        </button>
      </div>
    );
  };

  const renderForm = () => {
    const role = ROLE_META[userInfo?.role] || {};
    return (
      <>
        <div style={S.title}>Activer mon compte</div>
        <div style={S.subtitle}>
          Vous avez été invité à rejoindre{" "}
          <strong style={{ color: "#e5e7eb" }}>LogiPlatform</strong>.<br />
          Complétez votre profil pour commencer.
        </div>

        {userInfo?.role && (
          <div style={S.roleBadge(role.color || "#3b82f6")}>
            <i className={`fa-solid ${role.icon || "fa-user"}`} />
            {role.label || userInfo.role}
          </div>
        )}

        {userInfo?.email && (
          <div style={S.formGroup}>
            <label style={S.label}>Email</label>
            <div
              style={{
                ...S.input(false),
                color: "#6b7280",
                background: "#0a0d14",
                cursor: "default",
              }}
            >
              {userInfo.email}
            </div>
          </div>
        )}

        <div style={{ ...S.formGroup, ...S.grid2 }}>
          <div>
            <label style={S.label}>Prénom *</label>
            <input
              style={S.input(focused.prenom)}
              value={form.prenom}
              onChange={handleChange("prenom")}
              onFocus={() => setFocused((f) => ({ ...f, prenom: true }))}
              onBlur={() => setFocused((f) => ({ ...f, prenom: false }))}
              placeholder="Jean"
              autoFocus
            />
          </div>
          <div>
            <label style={S.label}>Nom *</label>
            <input
              style={S.input(focused.nom)}
              value={form.nom}
              onChange={handleChange("nom")}
              onFocus={() => setFocused((f) => ({ ...f, nom: true }))}
              onBlur={() => setFocused((f) => ({ ...f, nom: false }))}
              placeholder="Dupont"
            />
          </div>
        </div>

        <div style={S.formGroup}>
          <label style={S.label}>Mot de passe *</label>
          <div style={S.inputWrap}>
            <input
              type={showPwd ? "text" : "password"}
              style={{ ...S.input(focused.password), paddingRight: "40px" }}
              value={form.password}
              onChange={handleChange("password")}
              onFocus={() => setFocused((f) => ({ ...f, password: true }))}
              onBlur={() => setFocused((f) => ({ ...f, password: false }))}
              onKeyDown={handleKeyDown}
              placeholder="Minimum 8 caractères"
            />
            <span style={S.inputIcon} onClick={() => setShowPwd((p) => !p)}>
              <i
                className={`fa-solid ${showPwd ? "fa-eye-slash" : "fa-eye"}`}
              />
            </span>
          </div>
          <StrengthMeter password={form.password} />
        </div>

        <div style={S.formGroup}>
          <label style={S.label}>Confirmer *</label>
          <div style={S.inputWrap}>
            <input
              type={showConfirm ? "text" : "password"}
              style={{
                ...S.input(focused.confirm),
                paddingRight: "40px",
                borderColor:
                  form.confirm && form.password !== form.confirm
                    ? "#ef444460"
                    : form.confirm && form.password === form.confirm
                      ? "#10b98160"
                      : focused.confirm
                        ? "#3b82f6"
                        : "#2d3748",
              }}
              value={form.confirm}
              onChange={handleChange("confirm")}
              onFocus={() => setFocused((f) => ({ ...f, confirm: true }))}
              onBlur={() => setFocused((f) => ({ ...f, confirm: false }))}
              onKeyDown={handleKeyDown}
              placeholder="Répéter le mot de passe"
            />
            <span style={S.inputIcon} onClick={() => setShowConfirm((p) => !p)}>
              <i
                className={`fa-solid ${showConfirm ? "fa-eye-slash" : "fa-eye"}`}
              />
            </span>
          </div>
          {form.confirm && form.password !== form.confirm && (
            <div
              style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}
            >
              Les mots de passe ne correspondent pas
            </div>
          )}
          {form.confirm && form.password === form.confirm && (
            <div
              style={{ fontSize: "11px", color: "#10b981", marginTop: "4px" }}
            >
              <i className="fa-solid fa-check" style={{ marginRight: "4px" }} />
              Correspondance confirmée
            </div>
          )}
        </div>

        <div
          style={{
            background: "#0f1117",
            borderRadius: "8px",
            padding: "10px 14px",
            marginBottom: "16px",
            fontSize: "12px",
            color: "#6b7280",
            lineHeight: 1.8,
          }}
        >
          {[
            [form.password.length >= 8, "8 caractères minimum"],
            [/[A-Z]/.test(form.password), "Une majuscule"],
            [/[0-9]/.test(form.password), "Un chiffre"],
          ].map(([ok, label]) => (
            <div
              key={label}
              style={{ color: ok && form.password ? "#10b981" : "#6b7280" }}
            >
              <i
                className={`fa-solid ${ok && form.password ? "fa-circle-check" : "fa-circle"}`}
                style={{ marginRight: "6px", fontSize: "10px" }}
              />
              {label}
            </div>
          ))}
        </div>

        {error && (
          <div style={S.alertBox("error")}>
            <i
              className="fa-solid fa-circle-exclamation"
              style={{ marginTop: "1px", flexShrink: 0 }}
            />
            {error}
          </div>
        )}

        <button
          style={S.btn(submitting, !canSubmit)}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {submitting ? (
            <>
              <i className="fa-solid fa-circle-notch fa-spin" />
              Activation…
            </>
          ) : (
            <>
              <i className="fa-solid fa-unlock" />
              Activer mon compte
            </>
          )}
        </button>
      </>
    );
  };

  // ─── Rendu final ──────────────────────────────────────────────────────────
  return (
    <div style={S.root}>
      <div style={S.bgGrid} />
      <div style={S.bgGlow1} />
      <div style={S.bgGlow2} />

      <div style={S.card}>
        <div style={S.logoRow}>
          <div style={S.logoIcon}>L</div>
          <div>
            <div style={S.logoText}>LogiPlatform</div>
            <div style={S.logoSub}>Cevital Agro-Industrie</div>
          </div>
        </div>

        {/* Routing par état du token */}
        {tokenStatus === "checking" && renderChecking()}
        {tokenStatus === "none" && renderNoToken()}
        {(tokenStatus === "invalid" || tokenStatus === "expired") &&
          renderTokenProblem()}
        {tokenStatus === "valid" && !success && renderForm()}
        {tokenStatus === "valid" && success && renderSuccess()}

        {/* Footer login uniquement sur le formulaire */}
        {tokenStatus === "valid" && !success && (
          <>
            <hr style={S.divider} />
            <div style={S.footer}>
              Déjà un compte ?{" "}
              <Link to="/login" style={S.link}>
                Se connecter
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
