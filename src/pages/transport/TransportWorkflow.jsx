// pages/transport/TransportWorkflow.jsx — Refonte Sprint 11
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// ─── Palette ─────────────────────────────────────────────────
const C = {
  bg: "#0a0d14",
  surface: "#111520",
  card: "#161b2a",
  border: "#1e2538",
  accent: "#3b82f6",
  accentLo: "rgba(59,130,246,0.1)",
  green: "#10b981",
  greenLo: "rgba(16,185,129,0.1)",
  orange: "#f59e0b",
  orangeLo: "rgba(245,158,11,0.1)",
  red: "#ef4444",
  redLo: "rgba(239,68,68,0.1)",
  purple: "#8b5cf6",
  purpleLo: "rgba(139,92,246,0.1)",
  text: "#e2e8f0",
  muted: "#64748b",
  soft: "#94a3b8",
};

const STATUT = {
  CREE: { label: "Créé", color: C.accent, bg: C.accentLo, icon: "📋", step: 1 },
  EN_ROUTE: {
    label: "En route",
    color: C.orange,
    bg: C.orangeLo,
    icon: "🚛",
    step: 2,
  },
  LIVRE: { label: "Livré", color: C.green, bg: C.greenLo, icon: "✅", step: 3 },
  INCIDENT: {
    label: "Incident",
    color: C.red,
    bg: C.redLo,
    icon: "⚠️",
    step: 2,
  },
};

const FAMILLE_COLOR = {
  HUILE: "#f59e0b",
  MARGARINE: "#ec4899",
  SUCRE: "#8b5cf6",
  SMEN: "#f97316",
  CHOCOLAT: "#ef4444",
  SAUCE: "#22c55e",
  EAU: "#3b82f6",
  MIEL: "#eab308",
  CONFITURE: "#d946ef",
  BOISSON: "#10b981",
  AUTRE: "#64748b",
};

// ─── Calculs ─────────────────────────────────────────────────
const POIDS_CAMION = 24000;

function calcLignePoids(ligne) {
  const items =
    ligne.itemsJson?.length > 0
      ? ligne.itemsJson.map((ij) => {
          const orig = (ligne.order?.OrderItems || []).find(
            (i) => i.id === ij.orderItemId,
          );
          return { ...orig, quantity: ij.quantitePlanifiee };
        })
      : ligne.order?.OrderItems || [];

  return items.reduce((sum, item) => {
    const p = item?.produit;
    if (!p?.poidsKg) return sum;
    return sum + parseFloat(p.poidsKg) * parseFloat(item.quantity || 0);
  }, 0);
}

function calcLignePalettes(ligne) {
  const items =
    ligne.itemsJson?.length > 0
      ? ligne.itemsJson.map((ij) => {
          const orig = (ligne.order?.OrderItems || []).find(
            (i) => i.id === ij.orderItemId,
          );
          return { ...orig, quantity: ij.quantitePlanifiee };
        })
      : ligne.order?.OrderItems || [];

  return items.reduce((sum, item) => {
    const p = item?.produit;
    if (!p?.qteParCarton || !p?.qteParPalette) return sum;
    const cartons = Math.ceil(
      parseFloat(item.quantity || 0) / parseFloat(p.qteParCarton),
    );
    return sum + Math.ceil(cartons / parseFloat(p.qteParPalette));
  }, 0);
}

// ─── API ─────────────────────────────────────────────────────
const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// ─── Hooks ───────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = (message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };
  return { toasts, push };
}

// ─── UI Atoms ────────────────────────────────────────────────
const Badge = ({ statut }) => {
  const cfg = STATUT[statut] || {
    label: statut,
    color: C.muted,
    bg: C.surface,
    icon: "•",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 12px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}30`,
      }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
};

const Btn = ({
  onClick,
  children,
  variant = "primary",
  disabled = false,
  size = "md",
}) => {
  const V = {
    primary: { bg: C.accent, color: "#fff" },
    success: { bg: C.green, color: "#fff" },
    danger: { bg: C.red, color: "#fff" },
    ghost: {
      bg: "transparent",
      color: C.soft,
      border: `1px solid ${C.border}`,
    },
    warning: { bg: C.orange, color: "#fff" },
    purple: { bg: C.purple, color: "#fff" },
  };
  const SZ = { sm: "5px 12px", md: "8px 18px", lg: "11px 26px" };
  const FSZ = { sm: 11, md: 13, lg: 14 };
  const s = V[variant] || V.primary;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: s.bg,
        color: s.color,
        border: s.border || "none",
        borderRadius: 8,
        padding: SZ[size],
        fontSize: FSZ[size],
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "opacity .15s, transform .1s",
        fontFamily: "inherit",
        letterSpacing: "0.03em",
      }}
      onMouseEnter={(e) =>
        !disabled && (e.currentTarget.style.opacity = "0.85")
      }
      onMouseLeave={(e) => !disabled && (e.currentTarget.style.opacity = "1")}
    >
      {children}
    </button>
  );
};

const Input = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label
      style={{
        fontSize: 11,
        color: C.muted,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {label}
      {required && <span style={{ color: C.red }}> *</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "9px 12px",
        color: C.text,
        fontSize: 13,
        outline: "none",
        fontFamily: "inherit",
      }}
      onFocus={(e) => (e.target.style.borderColor = C.accent)}
      onBlur={(e) => (e.target.style.borderColor = C.border)}
    />
  </div>
);

const Modal = ({ open, onClose, title, children, wide = false }) => {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 28,
          width: "100%",
          maxWidth: wide ? 780 : 540,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h3
            style={{ margin: 0, color: C.text, fontSize: 17, fontWeight: 800 }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: C.muted,
              cursor: "pointer",
              fontSize: 22,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Toast = ({ toasts }) => (
  <div
    style={{
      position: "fixed",
      top: 20,
      right: 20,
      zIndex: 2000,
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}
  >
    {toasts.map((t) => (
      <div
        key={t.id}
        style={{
          background:
            t.type === "success"
              ? C.green
              : t.type === "error"
                ? C.red
                : C.accent,
          color: "#fff",
          padding: "10px 18px",
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 600,
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        }}
      >
        {t.message}
      </div>
    ))}
  </div>
);

// ─── Composant : Carte articles d'une ligne ──────────────────
function LigneArticles({ ligne }) {
  const [open, setOpen] = useState(false);
  const itemsJson = ligne.itemsJson;
  const allItems = ligne.order?.OrderItems || [];

  const itemsAffich =
    itemsJson?.length > 0
      ? itemsJson.map((ij) => {
          const orig = allItems.find((i) => i.id === ij.orderItemId);
          return {
            sku: orig?.sku || "—",
            nom: orig?.productName || `Article #${ij.orderItemId}`,
            quantite: ij.quantitePlanifiee,
            quantiteOriginale: orig?.quantity,
            unit: orig?.unit || "u",
            famille: orig?.produit?.famille,
            partiel: orig && ij.quantitePlanifiee < orig.quantity,
            poids: orig?.produit?.poidsKg
              ? Math.round(orig.produit.poidsKg * ij.quantitePlanifiee * 10) /
                10
              : null,
          };
        })
      : allItems.map((i) => ({
          sku: i.sku || "—",
          nom: i.productName,
          quantite: i.quantity,
          unit: i.unit || "u",
          famille: i.produit?.famille,
          partiel: false,
          poids: i.produit?.poidsKg
            ? Math.round(i.produit.poidsKg * i.quantity * 10) / 10
            : null,
        }));

  const totalQte = itemsAffich.reduce((s, i) => s + (i.quantite || 0), 0);
  const totalPoids = calcLignePoids(ligne);
  const totalPalettes = calcLignePalettes(ligne);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: C.accent,
          fontSize: 12,
          fontWeight: 600,
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            transform: open ? "rotate(90deg)" : "none",
            display: "inline-block",
            transition: ".2s",
          }}
        >
          ▶
        </span>
        {itemsAffich.length} article{itemsAffich.length > 1 ? "s" : ""} ·{" "}
        {totalQte.toLocaleString()} u
        {totalPoids > 0 && (
          <span style={{ color: C.muted }}>· {totalPoids.toFixed(0)} kg</span>
        )}
        {totalPalettes > 0 && (
          <span style={{ color: C.muted }}>· {totalPalettes} plt</span>
        )}
        {itemsJson?.length > 0 && (
          <span
            style={{
              fontSize: 10,
              padding: "1px 6px",
              borderRadius: 10,
              background: C.purpleLo,
              color: C.purple,
              fontWeight: 700,
            }}
          >
            SÉLECTION PLANIF
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {itemsAffich.map((item, i) => {
            const famColor = FAMILLE_COLOR[item.famille] || C.muted;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  background: C.bg,
                  borderRadius: 6,
                  borderLeft: `2px solid ${famColor}`,
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: C.muted,
                    minWidth: 80,
                  }}
                >
                  {item.sku}
                </span>
                <span style={{ flex: 1, fontSize: 12, color: C.text }}>
                  {item.nom}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                  {item.quantite} {item.unit}
                </span>
                {item.poids && (
                  <span style={{ fontSize: 11, color: C.muted }}>
                    {item.poids} kg
                  </span>
                )}
                {item.partiel && (
                  <span
                    style={{
                      fontSize: 10,
                      padding: "1px 6px",
                      borderRadius: 8,
                      background: C.orangeLo,
                      color: C.orange,
                      fontWeight: 700,
                    }}
                  >
                    /{item.quantiteOriginale}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Composant : Indicateur remplissage camion ───────────────
function CamionIndicator({ lignes }) {
  const poidsTotal = lignes.reduce((s, l) => s + calcLignePoids(l), 0);
  const palettesTotal = lignes.reduce((s, l) => s + calcLignePalettes(l), 0);
  const taux = Math.min(100, Math.round((poidsTotal / POIDS_CAMION) * 100));
  const nbCamions = Math.ceil(poidsTotal / POIDS_CAMION) || 1;
  const couleur = taux >= 85 ? C.green : taux >= 50 ? C.orange : C.red;

  return (
    <div
      style={{
        background: C.bg,
        borderRadius: 10,
        padding: "14px 16px",
        border: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: C.muted,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 12,
        }}
      >
        CHARGEMENT ESTIMÉ
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 10,
          marginBottom: 12,
        }}
      >
        {[
          { lbl: "Poids", val: `${poidsTotal.toFixed(0)} kg`, color: C.text },
          { lbl: "Palettes", val: `${palettesTotal} plt`, color: C.text },
          { lbl: "Camions 24T", val: nbCamions, color: couleur },
          { lbl: "Taux remplissage", val: `${taux}%`, color: couleur },
        ].map((s) => (
          <div
            key={s.lbl}
            style={{
              textAlign: "center",
              padding: "8px",
              background: C.surface,
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>
              {s.val}
            </div>
            <div
              style={{
                fontSize: 10,
                color: C.muted,
                marginTop: 2,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {s.lbl}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginBottom: 4,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: C.muted,
        }}
      >
        <span>Capacité camion 24T</span>
        <span style={{ color: couleur, fontWeight: 700 }}>{taux}%</span>
      </div>
      <div
        style={{
          height: 8,
          background: C.border,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 4,
            width: `${taux}%`,
            background: couleur,
            transition: "width .5s ease",
          }}
        />
      </div>
      {taux < 50 && poidsTotal > 0 && (
        <div style={{ marginTop: 8, fontSize: 11, color: C.orange }}>
          ⚠ Chargement partiel — envisager de regrouper avec d'autres lignes
        </div>
      )}
      {taux >= 85 && (
        <div style={{ marginTop: 8, fontSize: 11, color: C.green }}>
          ✓ Chargement optimal
        </div>
      )}
    </div>
  );
}

// ─── Composant : Stepper statut ──────────────────────────────
function StatutStepper({ statut }) {
  const steps = [
    { key: "CREE", label: "Créé", icon: "📋" },
    { key: "EN_ROUTE", label: "En route", icon: "🚛" },
    { key: "LIVRE", label: "Livré", icon: "✅" },
  ];
  const currentStep = STATUT[statut]?.step || 1;
  const isIncident = statut === "INCIDENT";

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 16 }}
    >
      {steps.map((step, i) => {
        const done = currentStep > step.step || step.key === statut;
        const active =
          step.key === statut || (isIncident && step.key === "EN_ROUTE");
        return (
          <div
            key={step.key}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < steps.length - 1 ? 1 : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background:
                    isIncident && active ? C.red : done ? C.green : C.border,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  border: active
                    ? `2px solid ${isIncident ? C.red : C.green}`
                    : "none",
                  transition: "all .3s",
                }}
              >
                {isIncident && active ? "⚠️" : done ? step.icon : "○"}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: done ? C.text : C.muted,
                  fontWeight: done ? 700 : 400,
                  whiteSpace: "nowrap",
                }}
              >
                {step.label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  margin: "0 8px",
                  background: currentStep > i + 1 ? C.green : C.border,
                  marginBottom: 20,
                  transition: "background .3s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════
export default function TransportWorkflow() {
  const { toasts, push } = useToast();

  const [ordres, setOrdres] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedOrdre, setSelected] = useState(null);
  const [view, setView] = useState("liste");
  const [loading, setLoading] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState("ALL");

  const [modalCreer, setModalCreer] = useState(false);
  const [modalAffecter, setModalAffecter] = useState(false);
  const [modalSuivi, setModalSuivi] = useState(false);
  const [modalConfirmer, setModalConfirmer] = useState(false);

  const [formCreer, setFormCreer] = useState({
    sessionId: "",
    lignesPlanifIds: [],
    prestataire: "",
    vehicule: "",
    dateArriveePrevue: "",
    notes: "",
  });
  const [formAffecter, setFormAffecter] = useState({
    prestataire: "",
    vehicule: "",
    capaciteChargee: "",
    dateDepart: "",
    dateArriveePrevue: "",
  });
  const [formSuivi, setFormSuivi] = useState({
    statut: "",
    position: "",
    commentaire: "",
  });
  const [sessionLignes, setSessionLignes] = useState([]);

  // ── Load ──────────────────────────────────────────────────
  const loadOrdres = useCallback(async () => {
    try {
      const params = filtreStatut !== "ALL" ? { statut: filtreStatut } : {};
      const { data } = await api.get("/transport/ordres", { params });
      setOrdres(data);
    } catch {
      push("Erreur chargement", "error");
    } finally {
      setLoading(false);
    }
  }, [filtreStatut]);

  const loadSessions = useCallback(async () => {
    try {
      const { data } = await api.get("/transport/sessions-disponibles");
      setSessions(data);
    } catch {}
  }, []);

  useEffect(() => {
    loadOrdres();
  }, [loadOrdres]);
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (!formCreer.sessionId) {
      setSessionLignes([]);
      return;
    }
    const sess = sessions.find(
      (s) => String(s.id) === String(formCreer.sessionId),
    );
    setSessionLignes(sess?.lignes || []);
    setFormCreer((p) => ({ ...p, lignesPlanifIds: [] }));
  }, [formCreer.sessionId]);

  // ── Actions ──────────────────────────────────────────────
  const openDetail = async (ordre) => {
    try {
      const { data } = await api.get(`/transport/ordres/${ordre.id}`);
      setSelected(data);
      setView("detail");
    } catch {
      push("Erreur chargement détail", "error");
    }
  };

  const handleCreer = async () => {
    if (!formCreer.sessionId || formCreer.lignesPlanifIds.length === 0) {
      push("Sélectionnez une session et au moins une ligne", "error");
      return;
    }
    try {
      await api.post("/transport/ordres", {
        sessionId: parseInt(formCreer.sessionId),
        lignesPlanifIds: formCreer.lignesPlanifIds.map(Number),
        prestataire: formCreer.prestataire || undefined,
        vehicule: formCreer.vehicule || undefined,
        dateArriveePrevue: formCreer.dateArriveePrevue || undefined,
        notes: formCreer.notes || undefined,
      });
      push("Ordre créé ✓", "success");
      setModalCreer(false);
      setFormCreer({
        sessionId: "",
        lignesPlanifIds: [],
        prestataire: "",
        vehicule: "",
        dateArriveePrevue: "",
        notes: "",
      });
      loadOrdres();
      loadSessions();
    } catch (e) {
      push(e.response?.data?.message || "Erreur", "error");
    }
  };

  const handleAffecter = async () => {
    try {
      await api.patch(
        `/transport/ordres/${selectedOrdre.id}/affecter`,
        formAffecter,
      );
      push("Prestataire affecté ✓", "success");
      setModalAffecter(false);
      openDetail(selectedOrdre);
      loadOrdres();
    } catch (e) {
      push(e.response?.data?.message || "Erreur", "error");
    }
  };

  const handleDemarrer = async () => {
    try {
      await api.patch(`/transport/ordres/${selectedOrdre.id}/demarrer`, {
        commentaire: "Départ confirmé",
      });
      push("Livraison démarrée 🚛", "success");
      openDetail(selectedOrdre);
      loadOrdres();
    } catch (e) {
      push(e.response?.data?.message || "Erreur", "error");
    }
  };

  const handleSuivi = async () => {
    try {
      await api.post(`/transport/ordres/${selectedOrdre.id}/suivi`, formSuivi);
      push("Suivi ajouté ✓", "success");
      setModalSuivi(false);
      setFormSuivi({ statut: "", position: "", commentaire: "" });
      openDetail(selectedOrdre);
    } catch (e) {
      push(e.response?.data?.message || "Erreur", "error");
    }
  };

  const handleConfirmer = async () => {
    try {
      const { data } = await api.patch(
        `/transport/ordres/${selectedOrdre.id}/confirmer`,
      );
      push(
        `✅ Livraison confirmée — ${data.updated} produit(s) mis à jour`,
        "success",
      );
      setModalConfirmer(false);
      openDetail(selectedOrdre);
      loadOrdres();
    } catch (e) {
      push(e.response?.data?.message || "Erreur", "error");
    }
  };

  const toggleLigne = (id) =>
    setFormCreer((p) => ({
      ...p,
      lignesPlanifIds: p.lignesPlanifIds.includes(id)
        ? p.lignesPlanifIds.filter((x) => x !== id)
        : [...p.lignesPlanifIds, id],
    }));

  // ── Helpers ───────────────────────────────────────────────
  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString("fr-DZ", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";
  const fmtDT = (d) =>
    d
      ? new Date(d).toLocaleString("fr-DZ", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";
  const ordresFiltres = ordres.filter(
    (o) => filtreStatut === "ALL" || o.statut === filtreStatut,
  );

  // ════════════════════════════════════════════════════════════
  // RENDER LISTE
  // ════════════════════════════════════════════════════════════
  const renderListe = () => (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 32,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              color: C.accent,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            MODULE ACTIF
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 900,
              color: C.text,
              letterSpacing: "-0.02em",
            }}
          >
            TRANSPORT <span style={{ color: C.accent }}>WORKFLOW</span>
          </h1>
          <p style={{ margin: "6px 0 0", color: C.muted, fontSize: 13 }}>
            Ordres de transport · Suivi livraisons · Confirmation stock
          </p>
        </div>
        <Btn
          onClick={() => {
            loadSessions();
            setModalCreer(true);
          }}
          size="lg"
        >
          + Nouvel ordre
        </Btn>
      </div>

      {/* KPI cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {Object.entries(STATUT).map(([s, cfg]) => {
          const count = ordres.filter((o) => o.statut === s).length;
          return (
            <div
              key={s}
              onClick={() => setFiltreStatut(filtreStatut === s ? "ALL" : s)}
              style={{
                background: filtreStatut === s ? cfg.bg : C.card,
                border: `1px solid ${filtreStatut === s ? cfg.color + "50" : C.border}`,
                borderRadius: 12,
                padding: "18px 20px",
                cursor: "pointer",
                borderLeft: `4px solid ${cfg.color}`,
                transition: "all .2s",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: C.muted,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                {cfg.icon} {cfg.label}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: cfg.color,
                  lineHeight: 1,
                }}
              >
                {count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtres pills */}
      <div
        style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}
      >
        {[
          ["ALL", "Tous les ordres"],
          ...Object.entries(STATUT).map(([s, c]) => [s, c.label]),
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFiltreStatut(val)}
            style={{
              padding: "6px 16px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .15s",
              background: filtreStatut === val ? C.accent : C.surface,
              color: filtreStatut === val ? "#fff" : C.muted,
              border: `1px solid ${filtreStatut === val ? C.accent : C.border}`,
            }}
          >
            {label}
          </button>
        ))}
        <span
          style={{
            marginLeft: "auto",
            fontSize: 12,
            color: C.muted,
            alignSelf: "center",
          }}
        >
          {ordresFiltres.length} ordre{ordresFiltres.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Liste ordres */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: 80,
            color: C.muted,
            fontSize: 14,
          }}
        >
          Chargement…
        </div>
      ) : ordresFiltres.length === 0 ? (
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            textAlign: "center",
            padding: 60,
            color: C.muted,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
            Aucun ordre
          </div>
          {sessions.length > 0 && (
            <Btn onClick={() => setModalCreer(true)}>
              Créer un premier ordre
            </Btn>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ordresFiltres.map((ordre) => {
            const cfg = STATUT[ordre.statut] || {};
            return (
              <div
                key={ordre.id}
                onClick={() => openDetail(ordre)}
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: "16px 22px",
                  cursor: "pointer",
                  display: "grid",
                  gridTemplateColumns: "44px 1fr auto auto auto auto",
                  alignItems: "center",
                  gap: 18,
                  borderLeft: `4px solid ${cfg.color || C.border}`,
                  transition: "background .15s, border-color .15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#1a2035")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = C.card)
                }
              >
                <div style={{ fontSize: 26, textAlign: "center" }}>
                  {cfg.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 15,
                      color: C.text,
                      marginBottom: 3,
                    }}
                  >
                    Ordre #{ordre.id}
                  </div>
                  <div
                    style={{
                      color: C.muted,
                      fontSize: 12,
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <span>Session #{ordre.sessionId}</span>
                    {ordre.clrId && <span>CLR #{ordre.clrId}</span>}
                    {ordre.prestataire && <span>🚚 {ordre.prestataire}</span>}
                    {ordre.vehicule && <span>🚗 {ordre.vehicule}</span>}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 10,
                      color: C.muted,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      marginBottom: 3,
                    }}
                  >
                    Départ
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                    {fmt(ordre.dateDepart)}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 10,
                      color: C.muted,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      marginBottom: 3,
                    }}
                  >
                    Prévu
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                    {fmt(ordre.dateArriveePrevue)}
                  </div>
                </div>
                <Badge statut={ordre.statut} />
                <div style={{ color: C.muted, fontSize: 18 }}>›</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // RENDER DETAIL
  // ════════════════════════════════════════════════════════════
  const renderDetail = () => {
    if (!selectedOrdre) return null;
    const cfg = STATUT[selectedOrdre.statut] || {};
    const lignes = selectedOrdre.lignesPlanif || [];
    const canAffecter = selectedOrdre.statut === "CREE";
    const canDemarrer =
      selectedOrdre.statut === "CREE" &&
      selectedOrdre.prestataire &&
      selectedOrdre.vehicule;
    const canSuivi = !["LIVRE"].includes(selectedOrdre.statut);
    const canConfirmer = selectedOrdre.statut === "EN_ROUTE";

    const poidsTotal = lignes.reduce((s, l) => s + calcLignePoids(l), 0);
    const palettesTotal = lignes.reduce((s, l) => s + calcLignePalettes(l), 0);
    const taux = Math.min(100, Math.round((poidsTotal / POIDS_CAMION) * 100));
    const tauxColor = taux >= 85 ? C.green : taux >= 50 ? C.orange : C.red;

    return (
      <div>
        {/* Back */}
        <button
          onClick={() => setView("liste")}
          style={{
            background: "none",
            border: "none",
            color: C.accent,
            cursor: "pointer",
            fontSize: 13,
            marginBottom: 24,
            padding: 0,
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 600,
          }}
        >
          ← Retour aux ordres
        </button>

        {/* Header carte */}
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 24,
            marginBottom: 20,
            borderLeft: `5px solid ${cfg.color}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 6,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 24,
                    fontWeight: 900,
                    color: C.text,
                  }}
                >
                  Ordre #{selectedOrdre.id}
                </h2>
                <Badge statut={selectedOrdre.statut} />
              </div>
              <div
                style={{
                  color: C.muted,
                  fontSize: 13,
                  display: "flex",
                  gap: 20,
                  flexWrap: "wrap",
                }}
              >
                <span>📅 Session #{selectedOrdre.sessionId}</span>
                {selectedOrdre.prestataire && (
                  <span>🚚 {selectedOrdre.prestataire}</span>
                )}
                {selectedOrdre.vehicule && (
                  <span>🚗 {selectedOrdre.vehicule}</span>
                )}
                {selectedOrdre.capaciteChargee && (
                  <span>📦 {selectedOrdre.capaciteChargee} palettes</span>
                )}
              </div>

              {/* Stepper */}
              <StatutStepper statut={selectedOrdre.statut} />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {canAffecter && (
                <Btn
                  variant="ghost"
                  onClick={() => {
                    setFormAffecter({
                      prestataire: selectedOrdre.prestataire || "",
                      vehicule: selectedOrdre.vehicule || "",
                      capaciteChargee: selectedOrdre.capaciteChargee || "",
                      dateDepart: "",
                      dateArriveePrevue: "",
                    });
                    setModalAffecter(true);
                  }}
                >
                  ✏️ Affecter
                </Btn>
              )}
              {canDemarrer && (
                <Btn variant="warning" onClick={handleDemarrer}>
                  🚛 Démarrer
                </Btn>
              )}
              {canSuivi && (
                <Btn variant="ghost" onClick={() => setModalSuivi(true)}>
                  📍 Suivi
                </Btn>
              )}
              {canConfirmer && (
                <Btn variant="success" onClick={() => setModalConfirmer(true)}>
                  ✅ Confirmer livraison
                </Btn>
              )}
            </div>
          </div>

          {/* Dates */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 16,
              marginTop: 20,
              paddingTop: 20,
              borderTop: `1px solid ${C.border}`,
            }}
          >
            {[
              ["Départ", fmt(selectedOrdre.dateDepart)],
              ["Arrivée prévue", fmt(selectedOrdre.dateArriveePrevue)],
              ["Livraison réelle", fmt(selectedOrdre.dateLivraisonReelle)],
            ].map(([label, val]) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: 10,
                    color: C.muted,
                    fontWeight: 700,
                    marginBottom: 4,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: val === "—" ? C.muted : C.text,
                  }}
                >
                  {val}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grille contenu */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}
        >
          {/* Lignes planification */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Indicateur camion global */}
            {lignes.length > 0 && <CamionIndicator lignes={lignes} />}

            <div
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: 20,
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px",
                  fontSize: 15,
                  fontWeight: 800,
                  color: C.text,
                }}
              >
                📋 Lignes de planification
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 12,
                    color: C.muted,
                    fontWeight: 400,
                  }}
                >
                  ({lignes.length} ligne{lignes.length !== 1 ? "s" : ""})
                </span>
              </h3>

              {lignes.length === 0 ? (
                <div
                  style={{ textAlign: "center", padding: 30, color: C.muted }}
                >
                  Aucune ligne
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {lignes.map((ligne) => {
                    const poids = calcLignePoids(ligne);
                    const palettes = calcLignePalettes(ligne);
                    const tauxLigne = Math.min(
                      100,
                      Math.round((poids / POIDS_CAMION) * 100),
                    );
                    const tColor =
                      tauxLigne >= 85
                        ? C.green
                        : tauxLigne >= 50
                          ? C.orange
                          : C.red;

                    return (
                      <div
                        key={ligne.id}
                        style={{
                          background: C.bg,
                          borderRadius: 10,
                          padding: "14px 16px",
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        {/* Header ligne */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 10,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 800,
                                fontSize: 14,
                                color: C.text,
                              }}
                            >
                              {ligne.order?.orderNumber || `Ligne #${ligne.id}`}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                padding: "2px 8px",
                                borderRadius: 8,
                                fontWeight: 700,
                                background: C.accentLo,
                                color: C.accent,
                              }}
                            >
                              {ligne.diapason}
                            </span>
                            {ligne.clr && (
                              <span
                                style={{
                                  fontSize: 11,
                                  padding: "2px 8px",
                                  borderRadius: 8,
                                  fontWeight: 700,
                                  background: C.purpleLo,
                                  color: C.purple,
                                }}
                              >
                                {ligne.clr.code} — {ligne.clr.nom}
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 10,
                              fontSize: 12,
                              color: C.muted,
                            }}
                          >
                            {poids > 0 && <span>⚖ {poids.toFixed(0)} kg</span>}
                            {palettes > 0 && <span>📦 {palettes} plt</span>}
                          </div>
                        </div>

                        {/* Barre remplissage ligne */}
                        {poids > 0 && (
                          <div style={{ marginBottom: 10 }}>
                            <div
                              style={{
                                height: 4,
                                background: C.border,
                                borderRadius: 2,
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  width: `${tauxLigne}%`,
                                  background: tColor,
                                  borderRadius: 2,
                                }}
                              />
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: tColor,
                                fontWeight: 700,
                                marginTop: 3,
                              }}
                            >
                              {tauxLigne}% capacité camion
                            </div>
                          </div>
                        )}

                        {/* Articles */}
                        <LigneArticles ligne={ligne} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite : suivi + infos */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Infos CLR destination */}
            {lignes[0]?.clr && (
              <div
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  padding: 18,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: C.muted,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 10,
                  }}
                >
                  CLR DESTINATION
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: C.accent,
                    marginBottom: 4,
                  }}
                >
                  {lignes[0].clr.code}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                  {lignes[0].clr.nom}
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                  {lignes[0].clr.wilaya} · {lignes[0].clr.region}
                </div>
              </div>
            )}

            {/* Historique suivi */}
            <div
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: 18,
                flex: 1,
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px",
                  fontSize: 14,
                  fontWeight: 800,
                  color: C.text,
                }}
              >
                📍 Historique suivi
              </h3>
              {(selectedOrdre.suivis || []).length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 24,
                    color: C.muted,
                    fontSize: 13,
                  }}
                >
                  Aucun événement
                </div>
              ) : (
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 11,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      background: C.border,
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                      paddingLeft: 30,
                    }}
                  >
                    {[...selectedOrdre.suivis].reverse().map((s) => {
                      const sc = STATUT[s.statut] || {};
                      return (
                        <div key={s.id} style={{ position: "relative" }}>
                          <div
                            style={{
                              position: "absolute",
                              left: -23,
                              top: 3,
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              background: sc.color || C.muted,
                              border: `2px solid ${C.bg}`,
                            }}
                          />
                          <div
                            style={{
                              fontSize: 10,
                              color: C.muted,
                              marginBottom: 2,
                            }}
                          >
                            {fmtDT(s.createdAt)}
                          </div>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 12,
                              color: sc.color || C.text,
                            }}
                          >
                            {sc.icon} {sc.label || s.statut}
                          </div>
                          {s.position && (
                            <div style={{ fontSize: 11, color: C.muted }}>
                              📍 {s.position}
                            </div>
                          )}
                          {s.commentaire && (
                            <div style={{ fontSize: 12, color: C.soft }}>
                              {s.commentaire}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════
  // RENDER PRINCIPAL
  // ════════════════════════════════════════════════════════════
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "'Inter','Segoe UI',sans-serif",
        fontSize: 14,
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #1e2538; border-radius: 3px; }
        select { background: #0a0d14; border: 1px solid #1e2538; border-radius: 8px; padding: 9px 12px; color: #e2e8f0; font-size: 13px; width: 100%; font-family: inherit; cursor: pointer; }
        select:focus { outline: none; border-color: #3b82f6; }
        textarea { background: #0a0d14; border: 1px solid #1e2538; border-radius: 8px; padding: 9px 12px; color: #e2e8f0; font-size: 13px; width: 100%; font-family: inherit; resize: vertical; min-height: 80px; }
        textarea:focus { outline: none; border-color: #3b82f6; }
      `}</style>

      <Toast toasts={toasts} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {view === "liste" && renderListe()}
        {view === "detail" && renderDetail()}
      </div>

      {/* ── Modal Créer ──────────────────────────────────────── */}
      <Modal
        open={modalCreer}
        onClose={() => setModalCreer(false)}
        title="Nouvel ordre de transport"
        wide
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Session */}
          <div>
            <label
              style={{
                fontSize: 11,
                color: C.muted,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              SESSION DE PLANIFICATION <span style={{ color: C.red }}>*</span>
            </label>
            <select
              value={formCreer.sessionId}
              onChange={(e) =>
                setFormCreer((p) => ({ ...p, sessionId: e.target.value }))
              }
            >
              <option value="">— Choisir une session —</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  Session #{s.id} — {s.date} ({s.lignes?.length || 0} ligne
                  {s.lignes?.length !== 1 ? "s" : ""})
                </option>
              ))}
            </select>
          </div>

          {/* Lignes */}
          {sessionLignes.length > 0 && (
            <div>
              <label
                style={{
                  fontSize: 11,
                  color: C.muted,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                LIGNES À INCLURE <span style={{ color: C.red }}>*</span>
                <span
                  style={{
                    color: C.muted,
                    fontWeight: 400,
                    textTransform: "none",
                  }}
                >
                  {" "}
                  — même CLR obligatoire
                </span>
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sessionLignes.map((ligne) => {
                  const checked = formCreer.lignesPlanifIds.includes(ligne.id);
                  const poids = calcLignePoids(ligne);
                  const palettes = calcLignePalettes(ligne);
                  const items =
                    ligne.itemsJson?.length > 0
                      ? ligne.itemsJson
                      : ligne.order?.OrderItems || [];
                  const totalQte =
                    ligne.itemsJson?.length > 0
                      ? ligne.itemsJson.reduce(
                          (s, i) => s + (i.quantitePlanifiee || 0),
                          0,
                        )
                      : (ligne.order?.OrderItems || []).reduce(
                          (s, i) => s + (i.quantity || 0),
                          0,
                        );

                  return (
                    <label
                      key={ligne.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        cursor: "pointer",
                        background: checked ? C.accentLo : C.bg,
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: `1px solid ${checked ? C.accent : C.border}`,
                        transition: "all .15s",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleLigne(ligne.id)}
                        style={{
                          accentColor: C.accent,
                          marginTop: 2,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: 13,
                              color: C.text,
                            }}
                          >
                            {ligne.order?.orderNumber || `Ligne #${ligne.id}`}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              padding: "1px 7px",
                              borderRadius: 8,
                              background: C.accentLo,
                              color: C.accent,
                              fontWeight: 700,
                            }}
                          >
                            {ligne.diapason}
                          </span>
                          {ligne.clr && (
                            <span
                              style={{
                                fontSize: 11,
                                padding: "1px 7px",
                                borderRadius: 8,
                                background: C.purpleLo,
                                color: C.purple,
                                fontWeight: 700,
                              }}
                            >
                              {ligne.clr.code} — {ligne.clr.nom}
                            </span>
                          )}
                          {ligne.itemsJson?.length > 0 && (
                            <span
                              style={{
                                fontSize: 10,
                                padding: "1px 6px",
                                borderRadius: 8,
                                background: C.orangeLo,
                                color: C.orange,
                                fontWeight: 700,
                              }}
                            >
                              SÉLECTION PLANIF
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: C.muted,
                            display: "flex",
                            gap: 12,
                          }}
                        >
                          <span>
                            {items.length} article
                            {items.length !== 1 ? "s" : ""} · {totalQte} u
                          </span>
                          {poids > 0 && <span>⚖ {poids.toFixed(0)} kg</span>}
                          {palettes > 0 && <span>📦 {palettes} plt</span>}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Indicateur camion dans le modal */}
              {formCreer.lignesPlanifIds.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <CamionIndicator
                    lignes={sessionLignes.filter((l) =>
                      formCreer.lignesPlanifIds.includes(l.id),
                    )}
                  />
                </div>
              )}
            </div>
          )}

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <Input
              label="Prestataire"
              value={formCreer.prestataire}
              onChange={(v) => setFormCreer((p) => ({ ...p, prestataire: v }))}
              placeholder="Nom transporteur"
            />
            <Input
              label="Véhicule"
              value={formCreer.vehicule}
              onChange={(v) => setFormCreer((p) => ({ ...p, vehicule: v }))}
              placeholder="Immatriculation"
            />
          </div>
          <Input
            label="Date d'arrivée prévue"
            type="datetime-local"
            value={formCreer.dateArriveePrevue}
            onChange={(v) =>
              setFormCreer((p) => ({ ...p, dateArriveePrevue: v }))
            }
          />
          <div>
            <label
              style={{
                fontSize: 11,
                color: C.muted,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                display: "block",
                marginBottom: 6,
              }}
            >
              NOTES
            </label>
            <textarea
              value={formCreer.notes}
              onChange={(e) =>
                setFormCreer((p) => ({ ...p, notes: e.target.value }))
              }
              placeholder="Notes optionnelles…"
            />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setModalCreer(false)}>
              Annuler
            </Btn>
            <Btn
              onClick={handleCreer}
              disabled={
                !formCreer.sessionId || formCreer.lignesPlanifIds.length === 0
              }
            >
              Créer l'ordre
            </Btn>
          </div>
        </div>
      </Modal>

      {/* ── Modal Affecter ───────────────────────────────────── */}
      <Modal
        open={modalAffecter}
        onClose={() => setModalAffecter(false)}
        title="Affecter prestataire & véhicule"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Prestataire"
            required
            value={formAffecter.prestataire}
            onChange={(v) => setFormAffecter((p) => ({ ...p, prestataire: v }))}
            placeholder="Nom du transporteur"
          />
          <Input
            label="Véhicule"
            required
            value={formAffecter.vehicule}
            onChange={(v) => setFormAffecter((p) => ({ ...p, vehicule: v }))}
            placeholder="Immatriculation"
          />
          <Input
            label="Capacité chargée (palettes)"
            type="number"
            value={formAffecter.capaciteChargee}
            onChange={(v) =>
              setFormAffecter((p) => ({ ...p, capaciteChargee: v }))
            }
          />
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <Input
              label="Date départ"
              type="datetime-local"
              value={formAffecter.dateDepart}
              onChange={(v) =>
                setFormAffecter((p) => ({ ...p, dateDepart: v }))
              }
            />
            <Input
              label="Arrivée prévue"
              type="datetime-local"
              value={formAffecter.dateArriveePrevue}
              onChange={(v) =>
                setFormAffecter((p) => ({ ...p, dateArriveePrevue: v }))
              }
            />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setModalAffecter(false)}>
              Annuler
            </Btn>
            <Btn
              onClick={handleAffecter}
              disabled={!formAffecter.prestataire || !formAffecter.vehicule}
            >
              Confirmer
            </Btn>
          </div>
        </div>
      </Modal>

      {/* ── Modal Suivi ──────────────────────────────────────── */}
      <Modal
        open={modalSuivi}
        onClose={() => setModalSuivi(false)}
        title="Ajouter un événement de suivi"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label
              style={{
                fontSize: 11,
                color: C.muted,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                display: "block",
                marginBottom: 6,
              }}
            >
              STATUT (optionnel)
            </label>
            <select
              value={formSuivi.statut}
              onChange={(e) =>
                setFormSuivi((p) => ({ ...p, statut: e.target.value }))
              }
            >
              <option value="">Pas de changement de statut</option>
              <option value="EN_ROUTE">🚛 En route</option>
              <option value="INCIDENT">⚠️ Incident</option>
            </select>
          </div>
          <Input
            label="Position"
            value={formSuivi.position}
            onChange={(v) => setFormSuivi((p) => ({ ...p, position: v }))}
            placeholder="Ex: Sétif, RN5…"
          />
          <div>
            <label
              style={{
                fontSize: 11,
                color: C.muted,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                display: "block",
                marginBottom: 6,
              }}
            >
              COMMENTAIRE
            </label>
            <textarea
              value={formSuivi.commentaire}
              onChange={(e) =>
                setFormSuivi((p) => ({ ...p, commentaire: e.target.value }))
              }
              placeholder="Description de l'événement…"
            />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setModalSuivi(false)}>
              Annuler
            </Btn>
            <Btn onClick={handleSuivi}>Ajouter</Btn>
          </div>
        </div>
      </Modal>

      {/* ── Modal Confirmer ──────────────────────────────────── */}
      <Modal
        open={modalConfirmer}
        onClose={() => setModalConfirmer(false)}
        title="Confirmer la livraison"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              background: C.greenLo,
              border: `1px solid ${C.green}30`,
              borderRadius: 10,
              padding: 16,
            }}
          >
            <div
              style={{
                fontWeight: 800,
                color: C.green,
                marginBottom: 8,
                fontSize: 14,
              }}
            >
              ⚠️ Action irréversible
            </div>
            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>
              Cette action va :
              <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                <li>
                  Passer l'ordre en statut <strong>LIVRÉ</strong>
                </li>
                <li>
                  Mettre à jour le <strong>stock CLR</strong> destination
                </li>
                <li>
                  Passer les commandes associées en <strong>delivered</strong>
                </li>
              </ul>
            </div>
          </div>
          {selectedOrdre && (
            <div
              style={{
                background: C.bg,
                borderRadius: 8,
                padding: "12px 14px",
                fontSize: 13,
                color: C.muted,
              }}
            >
              Ordre #{selectedOrdre.id} ·{" "}
              {(selectedOrdre.lignesPlanif || []).length} ligne(s) · CLR #
              {selectedOrdre.clrId}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setModalConfirmer(false)}>
              Annuler
            </Btn>
            <Btn variant="success" onClick={handleConfirmer}>
              ✅ Confirmer la livraison
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
