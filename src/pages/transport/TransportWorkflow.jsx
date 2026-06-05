// pages/transport/TransportWorkflow.jsx — Refonte Sprint 11 v2
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";

// ─── Design Tokens ─────────────────────────────────────────────
const T = {
  white: "#ffffff",
  bg: "#f7f7f5",
  surface: "#ffffff",
  card: "#ffffff",
  border: "#e4e4e0",
  borderMid: "#d0d0cc",
  borderStrong: "#b0b0aa",
  black: "#111110",
  gray: "#6b6b67",
  grayLight: "#9b9b97",
  grayFaint: "#f0f0ee",
  red: "#c0392b",
  redLight: "#fdf2f1",
  redBorder: "#f0c4c0",
  green: "#1a6b3c",
  greenLight: "#f0f8f3",
  greenBorder: "#b8dfc8",
  orange: "#b85c00",
  orangeLight: "#fdf6ef",
  orangeBorder: "#f0d4b0",
  blue: "#1a4a8a",
  blueLight: "#f0f4fc",
  blueBorder: "#c0d4f0",
};

// ─── Statuts ──────────────────────────────────────────────────
const STATUT = {
  CREE: {
    label: "Cree",
    color: T.blue,
    bg: T.blueLight,
    border: T.blueBorder,
    step: 1,
  },
  EN_ROUTE: {
    label: "En route",
    color: T.orange,
    bg: T.orangeLight,
    border: T.orangeBorder,
    step: 2,
  },
  LIVRE: {
    label: "Livre",
    color: T.green,
    bg: T.greenLight,
    border: T.greenBorder,
    step: 3,
  },
  INCIDENT: {
    label: "Incident",
    color: T.red,
    bg: T.redLight,
    border: T.redBorder,
    step: 2,
  },
};

const FAMILLE_COLOR = {
  HUILE: "#b85c00",
  MARGARINE: "#8b3a62",
  SUCRE: "#5a3a9b",
  SMEN: "#b84c00",
  CHOCOLAT: "#8b2020",
  SAUCE: "#1a6b3c",
  EAU: "#1a4a8a",
  MIEL: "#9b7a00",
  CONFITURE: "#8b2060",
  BOISSON: "#1a6b5a",
  AUTRE: "#6b6b67",
};

const POIDS_CAMION = 24000;

// PAR
function getItems(ligne) {
  if (ligne.itemsJson?.length > 0) {
    return ligne.itemsJson.map((ij) => {
      if (ij.libre) {
        return {
          quantity: ij.quantitePlanifiee,
          productName: ij.nom,
          sku: ij.sku,
          unit: "u",
          libre: true,
          produitId: ij.produitId, // ← AJOUT
          produit: {
            famille: ij.famille,
            poidsKg: ij.poidsKg ?? null,
            qteParCarton: ij.qteParCarton ?? null,
            qteParPalette: ij.qteParPalette ?? null,
          },
        };
      }
      const orig = (ligne.order?.OrderItems || []).find(
        (i) => i.id === ij.orderItemId,
      );
      return {
        ...orig,
        quantity: ij.quantitePlanifiee,
        produitId: ij.produitId ?? orig?.produitId, // ← AJOUT
      };
    });
  }
  return ligne.order?.OrderItems || [];
}
function calcLignePoids(ligne) {
  return getItems(ligne).reduce((sum, item) => {
    const p = item?.produit;
    if (!p?.poidsKg) return sum;
    return sum + parseFloat(p.poidsKg) * parseFloat(item.quantity || 0);
  }, 0);
}

function calcLignePalettes(ligne) {
  return getItems(ligne).reduce((sum, item) => {
    const p = item?.produit;
    if (!p?.qteParCarton || !p?.qteParPalette) return sum;
    const cartons = Math.ceil(
      parseFloat(item.quantity || 0) / parseFloat(p.qteParCarton),
    );
    return sum + Math.ceil(cartons / parseFloat(p.qteParPalette));
  }, 0);
}

function getClrIdFromLigne(ligne) {
  return ligne.clr?.id ?? ligne.clrId ?? null;
}

// ─── API instance avec intercepteurs ─────────────────────────
const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// ─── Hook Toast ───────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);
  return { toasts, push };
}

// ─── Badge statut ────────────────────────────────────────────
const Badge = ({ statut }) => {
  const cfg = STATUT[statut] || {
    label: statut,
    color: T.gray,
    bg: T.grayFaint,
    border: T.border,
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {cfg.label}
    </span>
  );
};

// ─── Bouton ───────────────────────────────────────────────────
const Btn = ({
  onClick,
  children,
  variant = "primary",
  disabled = false,
  size = "md",
  type = "button",
}) => {
  const variants = {
    primary: { bg: T.black, color: T.white, border: T.black },
    danger: { bg: T.red, color: T.white, border: T.red },
    success: { bg: T.green, color: T.white, border: T.green },
    warning: { bg: T.orange, color: T.white, border: T.orange },
    ghost: { bg: "transparent", color: T.gray, border: T.borderMid },
    outline: { bg: "transparent", color: T.black, border: T.black },
  };
  const sizes = { sm: "5px 12px", md: "8px 16px", lg: "10px 22px" };
  const fSizes = { sm: 11, md: 12, lg: 13 };
  const s = variants[variant] || variants.primary;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 6,
        padding: sizes[size],
        fontSize: fSizes[size],
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "opacity .15s",
        fontFamily: "inherit",
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "0.75";
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
};

// ─── Champ formulaire ────────────────────────────────────────
const Field = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  children,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label
      style={{
        fontSize: 10,
        color: T.gray,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {label}
      {required && <span style={{ color: T.red }}> *</span>}
    </label>
    {children || (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: T.white,
          border: `1px solid ${T.border}`,
          borderRadius: 6,
          padding: "8px 11px",
          color: T.black,
          fontSize: 13,
          outline: "none",
          fontFamily: "inherit",
          width: "100%",
        }}
        onFocus={(e) => (e.target.style.borderColor = T.black)}
        onBlur={(e) => (e.target.style.borderColor = T.border)}
      />
    )}
  </div>
);

// ─── Modal ────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, wide = false }) => {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.30)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.white,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: 28,
          width: "100%",
          maxWidth: wide ? 800 : 520,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
        }}
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
            style={{
              margin: 0,
              color: T.black,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: T.gray,
              cursor: "pointer",
              fontSize: 20,
              lineHeight: 1,
              padding: 4,
            }}
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── Toasts ───────────────────────────────────────────────────
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
          background: t.type === "error" ? T.red : T.black,
          color: T.white,
          padding: "10px 16px",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.01em",
          boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
          animation: "fadeIn .2s ease",
        }}
      >
        {t.message}
      </div>
    ))}
  </div>
);

// ─── Articles d'une ligne (accordeon) ────────────────────────
function LigneArticles({ ligne }) {
  const [open, setOpen] = useState(false);
  const allItems = ligne.order?.OrderItems || [];
  // Dans itemsAffich (useMemo), remplacer le .map existant :
  const itemsAffich = useMemo(() => {
    if (ligne.itemsJson?.length > 0) {
      return ligne.itemsJson.map((ij) => {
        if (ij.libre) {
          return {
            sku: ij.sku || "—",
            nom: ij.nom || `Produit #${ij.produitId}`,
            quantite: ij.quantitePlanifiee,
            unit: "u",
            famille: ij.famille,
            libre: true,
            partiel: false,
            poids: ij.produit?.poidsKg
              ? Math.round(ij.produit.poidsKg * ij.quantitePlanifiee * 10) / 10
              : null,
          };
        }
        const orig = allItems.find((i) => i.id === ij.orderItemId);
        return {
          sku: orig?.sku || "—",
          nom: orig?.productName || `Article #${ij.orderItemId}`,
          quantite: ij.quantitePlanifiee,
          quantiteOriginale: orig?.quantity,
          unit: orig?.unit || "u",
          famille: orig?.produit?.famille,
          partiel: orig && ij.quantitePlanifiee < orig.quantity,
          libre: false,
          poids: orig?.produit?.poidsKg
            ? Math.round(orig.produit.poidsKg * ij.quantitePlanifiee * 10) / 10
            : null,
        };
      });
    }
    return allItems.map((i) => ({
      sku: i.sku || "—",
      nom: i.productName,
      quantite: i.quantity,
      unit: i.unit || "u",
      famille: i.produit?.famille,
      partiel: false,
      libre: false,
      poids: i.produit?.poidsKg
        ? Math.round(i.produit.poidsKg * i.quantity * 10) / 10
        : null,
    }));
  }, [ligne, allItems]);

  const totalQte = itemsAffich.reduce((s, i) => s + (i.quantite || 0), 0);
  const totalPoids = useMemo(() => calcLignePoids(ligne), [ligne]);
  const totalPlt = useMemo(() => calcLignePalettes(ligne), [ligne]);

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: T.black,
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
            fontSize: 9,
            color: T.gray,
            display: "inline-block",
            transform: open ? "rotate(90deg)" : "none",
            transition: ".2s",
          }}
        >
          &#9654;
        </span>
        <span>
          {itemsAffich.length} article{itemsAffich.length > 1 ? "s" : ""}
        </span>
        <span style={{ color: T.gray, fontWeight: 400 }}>
          &mdash; {totalQte.toLocaleString("fr-DZ")} u
        </span>
        {totalPoids > 0 && (
          <span style={{ color: T.grayLight }}>{totalPoids.toFixed(0)} kg</span>
        )}
        {totalPlt > 0 && (
          <span style={{ color: T.grayLight }}>{totalPlt} plt</span>
        )}
        {ligne.itemsJson?.length > 0 && (
          <span
            style={{
              fontSize: 9,
              padding: "1px 6px",
              borderRadius: 3,
              background: T.orangeLight,
              color: T.orange,
              fontWeight: 700,
              border: `1px solid ${T.orangeBorder}`,
            }}
          >
            SELECTION PLANIF
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {itemsAffich.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                background: T.bg,
                borderRadius: 4,
                borderLeft: `2px solid ${FAMILLE_COLOR[item.famille] || T.gray}`,
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: T.grayLight,
                  minWidth: 80,
                }}
              >
                {item.sku}
              </span>
              <span style={{ flex: 1, fontSize: 12, color: T.black }}>
                {item.nom}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.black }}>
                {item.quantite} {item.unit}
              </span>
              {item.poids && (
                <span style={{ fontSize: 11, color: T.grayLight }}>
                  {item.poids} kg
                </span>
              )}
              {item.partiel && (
                <span
                  style={{
                    fontSize: 10,
                    padding: "1px 6px",
                    borderRadius: 3,
                    background: T.orangeLight,
                    color: T.orange,
                    fontWeight: 700,
                  }}
                >
                  /{item.quantiteOriginale}
                </span>
              )}
              {item.libre && (
                <span
                  style={{
                    fontSize: 10,
                    padding: "1px 6px",
                    borderRadius: 3,
                    background: T.blueLight,
                    color: T.blue,
                    fontWeight: 700,
                    border: `1px solid ${T.blueBorder}`,
                  }}
                >
                  LIBRE
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Indicateur chargement camion ────────────────────────────
function CamionIndicator({ lignes }) {
  const poidsTotal = useMemo(
    () => lignes.reduce((s, l) => s + calcLignePoids(l), 0),
    [lignes],
  );
  const palettesTotal = useMemo(
    () => lignes.reduce((s, l) => s + calcLignePalettes(l), 0),
    [lignes],
  );
  const taux = Math.min(100, Math.round((poidsTotal / POIDS_CAMION) * 100));
  const nbCamions = Math.ceil(poidsTotal / POIDS_CAMION) || 1;
  const couleur = taux >= 85 ? T.green : taux >= 50 ? T.orange : T.red;
  const couleurBg =
    taux >= 85 ? T.greenLight : taux >= 50 ? T.orangeLight : T.redLight;

  return (
    <div
      style={{
        background: T.bg,
        borderRadius: 8,
        padding: "14px 16px",
        border: `1px solid ${T.border}`,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: T.gray,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 12,
        }}
      >
        Chargement estime
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {[
          { lbl: "Poids", val: `${poidsTotal.toFixed(0)} kg`, accent: false },
          { lbl: "Palettes", val: `${palettesTotal} plt`, accent: false },
          { lbl: "Camions 24T", val: nbCamions, accent: true },
          { lbl: "Remplissage", val: `${taux}%`, accent: true },
        ].map((s) => (
          <div
            key={s.lbl}
            style={{
              textAlign: "center",
              padding: 10,
              background: s.accent ? couleurBg : T.surface,
              borderRadius: 6,
              border: `1px solid ${s.accent ? couleur + "40" : T.border}`,
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: s.accent ? couleur : T.black,
                lineHeight: 1.2,
              }}
            >
              {s.val}
            </div>
            <div
              style={{
                fontSize: 10,
                color: T.grayLight,
                marginTop: 3,
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
          height: 5,
          background: T.border,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 3,
            width: `${taux}%`,
            background: couleur,
            transition: "width .5s ease",
          }}
        />
      </div>
      {taux < 50 && poidsTotal > 0 && (
        <div style={{ marginTop: 8, fontSize: 11, color: T.orange }}>
          Chargement partiel — envisager de regrouper avec d'autres lignes
        </div>
      )}
      {taux >= 85 && (
        <div style={{ marginTop: 8, fontSize: 11, color: T.green }}>
          Chargement optimal
        </div>
      )}
    </div>
  );
}

// ─── Stepper statut — logique corrigee ───────────────────────
function StatutStepper({ statut }) {
  const steps = [
    { key: "CREE", label: "Cree" },
    { key: "EN_ROUTE", label: "En route" },
    { key: "LIVRE", label: "Livre" },
  ];
  const isIncident = statut === "INCIDENT";
  // CREE=1, EN_ROUTE ou INCIDENT=2, LIVRE=3
  const currentStep = STATUT[statut]?.step ?? 1;

  return (
    <div style={{ display: "flex", alignItems: "center", marginTop: 18 }}>
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const done = currentStep >= stepNum;
        const isActiveStep =
          step.key === statut || (isIncident && step.key === "EN_ROUTE");
        const dotColor =
          isIncident && isActiveStep ? T.red : done ? T.green : T.borderMid;

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
                gap: 5,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: done ? dotColor : T.white,
                  border: `2px solid ${dotColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: done ? T.white : T.grayLight,
                  transition: "all .3s",
                }}
              >
                {isIncident && isActiveStep ? "!" : stepNum}
              </div>
              <div
                style={{
                  fontSize: 10,
                  whiteSpace: "nowrap",
                  letterSpacing: "0.03em",
                  color: done
                    ? isIncident && isActiveStep
                      ? T.red
                      : T.black
                    : T.grayLight,
                  fontWeight: done ? 600 : 400,
                }}
              >
                {isIncident && isActiveStep ? "Incident" : step.label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 1,
                  margin: "0 8px",
                  marginBottom: 18,
                  background: currentStep > stepNum ? T.green : T.border,
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
  const ordresCache = useRef({});

  // ── State ─────────────────────────────────────────────────
  const [ordres, setOrdres] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedOrdre, setSelected] = useState(null);
  const [view, setView] = useState("liste");
  const [loading, setLoading] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState("ALL");
  const [sessionsLoaded, setSessionsLoaded] = useState(false);

  // modaux
  const [modalCreer, setModalCreer] = useState(false);
  const [modalAffecter, setModalAffecter] = useState(false);
  const [modalSuivi, setModalSuivi] = useState(false);
  const [modalConfirmer, setModalConfirmer] = useState(false);
  const [modalDemarrer, setModalDemarrer] = useState(false);

  // formulaires
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
  const [clrConflict, setClrConflict] = useState(false);

  // ── Chargement ordres — tout cote client, pas de double filtre API ──
  const loadOrdres = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/transport/ordres");
      setOrdres(data);
    } catch {
      push("Erreur lors du chargement des ordres", "error");
    } finally {
      setLoading(false);
    }
  }, [push]);

  // ── Chargement sessions avec cache ────────────────────────
  const loadSessions = useCallback(async () => {
    if (sessionsLoaded) return;
    try {
      const { data } = await api.get("/transport/sessions-disponibles");
      setSessions(data);
      setSessionsLoaded(true);
    } catch {
      push("Erreur lors du chargement des sessions", "error");
    }
  }, [sessionsLoaded, push]);

  useEffect(() => {
    loadOrdres();
  }, [loadOrdres]);

  // Mise a jour des lignes quand la session change
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
    setClrConflict(false);
  }, [formCreer.sessionId, sessions]);

  // ── Detail avec cache ordres ───────────────────────────────
  const openDetail = useCallback(
    async (ordre, forceRefresh = false) => {
      if (!forceRefresh && ordresCache.current[ordre.id]) {
        setSelected(ordresCache.current[ordre.id]);
        setView("detail");
        return;
      }
      try {
        const { data } = await api.get(`/transport/ordres/${ordre.id}`);
        ordresCache.current[ordre.id] = data;
        setSelected(data);
        setView("detail");
      } catch {
        push("Erreur lors du chargement du detail", "error");
      }
    },
    [push],
  );

  const refreshDetail = useCallback(async () => {
    if (!selectedOrdre) return;
    await openDetail(selectedOrdre, true);
  }, [selectedOrdre, openDetail]);

  const invalidateCache = useCallback((id) => {
    delete ordresCache.current[id];
  }, []);

  // ── Toggle ligne + validation CLR ─────────────────────────
  const toggleLigne = useCallback(
    (id) => {
      setFormCreer((prev) => {
        const newIds = prev.lignesPlanifIds.includes(id)
          ? prev.lignesPlanifIds.filter((x) => x !== id)
          : [...prev.lignesPlanifIds, id];

        const selected = sessionLignes.filter((l) => newIds.includes(l.id));
        const clrIds = [
          ...new Set(selected.map(getClrIdFromLigne).filter(Boolean)),
        ];
        setClrConflict(clrIds.length > 1);

        return { ...prev, lignesPlanifIds: newIds };
      });
    },
    [sessionLignes],
  );

  // ── Actions API ───────────────────────────────────────────
  const handleCreer = async () => {
    if (!formCreer.sessionId || formCreer.lignesPlanifIds.length === 0) {
      push("Selectionnez une session et au moins une ligne", "error");
      return;
    }
    if (clrConflict) {
      push("Toutes les lignes doivent avoir le meme CLR destination", "error");
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
      push("Ordre de transport cree", "success");
      setModalCreer(false);
      setFormCreer({
        sessionId: "",
        lignesPlanifIds: [],
        prestataire: "",
        vehicule: "",
        dateArriveePrevue: "",
        notes: "",
      });
      setSessionsLoaded(false);
      loadOrdres();
    } catch (e) {
      push(e.response?.data?.message || "Erreur lors de la creation", "error");
    }
  };

  const handleAffecter = async () => {
    if (!formAffecter.prestataire || !formAffecter.vehicule) {
      push("Prestataire et vehicule sont requis", "error");
      return;
    }
    try {
      await api.patch(
        `/transport/ordres/${selectedOrdre.id}/affecter`,
        formAffecter,
      );
      push("Prestataire affecte", "success");
      setModalAffecter(false);
      invalidateCache(selectedOrdre.id);
      await refreshDetail();
      loadOrdres();
    } catch (e) {
      push(e.response?.data?.message || "Erreur", "error");
    }
  };

  // Demarrer — passe par modale de confirmation (point 7 corrige)
  const handleDemarrer = async () => {
    try {
      await api.patch(`/transport/ordres/${selectedOrdre.id}/demarrer`, {
        commentaire: "Depart confirme",
      });
      push("Livraison demarree", "success");
      setModalDemarrer(false);
      invalidateCache(selectedOrdre.id);
      await refreshDetail();
      loadOrdres();
    } catch (e) {
      push(e.response?.data?.message || "Erreur", "error");
    }
  };

  const handleSuivi = async () => {
    try {
      await api.post(`/transport/ordres/${selectedOrdre.id}/suivi`, formSuivi);
      push("Evenement de suivi ajoute", "success");
      setModalSuivi(false);
      setFormSuivi({ statut: "", position: "", commentaire: "" });
      invalidateCache(selectedOrdre.id);
      await refreshDetail();
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
        `Livraison confirmee — ${data.updated} produit(s) mis a jour`,
        "success",
      );
      setModalConfirmer(false);
      invalidateCache(selectedOrdre.id);
      await refreshDetail();
      loadOrdres();
    } catch (e) {
      push(e.response?.data?.message || "Erreur", "error");
    }
  };

  // ── Helpers date ──────────────────────────────────────────
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

  // ── Filtre cote client uniquement ─────────────────────────
  const ordresFiltres = useMemo(
    () =>
      ordres.filter((o) => filtreStatut === "ALL" || o.statut === filtreStatut),
    [ordres, filtreStatut],
  );

  // ════════════════════════════════════════════════════════════
  // RENDER — VUE LISTE
  // ════════════════════════════════════════════════════════════
  const renderListe = () => (
    <div>
      {/* En-tete page */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 32,
          paddingBottom: 22,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              color: T.grayLight,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 5,
            }}
          >
            Transport
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              color: T.black,
              letterSpacing: "-0.025em",
            }}
          >
            Gestion des ordres de transport
          </h1>
          <p style={{ margin: "4px 0 0", color: T.grayLight, fontSize: 13 }}>
            Planification, suivi des livraisons et confirmation de stock
          </p>
        </div>
        <Btn
          size="lg"
          onClick={() => {
            loadSessions();
            setModalCreer(true);
          }}
        >
          Nouvel ordre
        </Btn>
      </div>

      {/* KPI cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 10,
          marginBottom: 24,
        }}
      >
        {Object.entries(STATUT).map(([s, cfg]) => {
          const count = ordres.filter((o) => o.statut === s).length;
          const active = filtreStatut === s;
          return (
            <div
              key={s}
              onClick={() => setFiltreStatut(active ? "ALL" : s)}
              style={{
                background: active ? cfg.bg : T.white,
                border: `1px solid ${active ? cfg.border : T.border}`,
                borderTop: `3px solid ${cfg.color}`,
                borderRadius: 8,
                padding: "15px 18px",
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: T.gray,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                {cfg.label}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: active ? cfg.color : T.black,
                  lineHeight: 1,
                }}
              >
                {count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtres rapides */}
      <div
        style={{
          display: "flex",
          gap: 5,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {[
          ["ALL", "Tous"],
          ...Object.entries(STATUT).map(([s, c]) => [s, c.label]),
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFiltreStatut(val)}
            style={{
              padding: "5px 13px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .12s",
              background: filtreStatut === val ? T.black : "transparent",
              color: filtreStatut === val ? T.white : T.gray,
              border: `1px solid ${filtreStatut === val ? T.black : T.border}`,
            }}
          >
            {label}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: T.grayLight }}>
          {ordresFiltres.length} ordre{ordresFiltres.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tableau */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: 80,
            color: T.grayLight,
            fontSize: 13,
          }}
        >
          Chargement en cours...
        </div>
      ) : ordresFiltres.length === 0 ? (
        <div
          style={{
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            textAlign: "center",
            padding: 60,
            color: T.grayLight,
          }}
        >
          <div style={{ fontSize: 30, marginBottom: 12, color: T.borderMid }}>
            —
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: T.black,
              marginBottom: 12,
            }}
          >
            Aucun ordre
            {filtreStatut !== "ALL"
              ? ` avec le statut ${STATUT[filtreStatut]?.label}`
              : ""}
          </div>
          <Btn
            onClick={() => {
              loadSessions();
              setModalCreer(true);
            }}
          >
            Creer un premier ordre
          </Btn>
        </div>
      ) : (
        <div
          style={{
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {/* Header tableau */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 140px 150px 130px 24px",
              gap: 16,
              padding: "9px 20px",
              background: T.bg,
              fontSize: 10,
              color: T.grayLight,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            <span>Ordre</span>
            <span>Session / Prestataire</span>
            <span>Depart</span>
            <span>Arrivee prevue</span>
            <span>Statut</span>
            <span />
          </div>

          {ordresFiltres.map((ordre, idx) => {
            const cfg = STATUT[ordre.statut] || {};
            return (
              <div
                key={ordre.id}
                onClick={() => openDetail(ordre)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 140px 150px 130px 24px",
                  gap: 16,
                  padding: "13px 20px",
                  background: T.white,
                  cursor: "pointer",
                  borderBottom:
                    idx < ordresFiltres.length - 1
                      ? `1px solid ${T.border}`
                      : "none",
                  borderLeft: `3px solid ${cfg.color || T.border}`,
                  transition: "background .1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = T.bg)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = T.white)
                }
              >
                <div style={{ fontWeight: 800, fontSize: 13, color: T.black }}>
                  #{ordre.id}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: T.black,
                      marginBottom: 2,
                    }}
                  >
                    Session #{ordre.sessionId}
                    {ordre.clrId && (
                      <span style={{ color: T.grayLight, fontWeight: 400 }}>
                        &nbsp;&mdash; CLR #{ordre.clrId}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: T.grayLight,
                      display: "flex",
                      gap: 10,
                    }}
                  >
                    {ordre.prestataire && <span>{ordre.prestataire}</span>}
                    {ordre.vehicule && <span>{ordre.vehicule}</span>}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: ordre.dateDepart ? T.black : T.grayLight,
                  }}
                >
                  {fmt(ordre.dateDepart)}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: ordre.dateArriveePrevue ? T.black : T.grayLight,
                  }}
                >
                  {fmt(ordre.dateArriveePrevue)}
                </div>
                <Badge statut={ordre.statut} />
                <div
                  style={{
                    color: T.grayLight,
                    fontSize: 14,
                    textAlign: "right",
                  }}
                >
                  ›
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // RENDER — VUE DETAIL
  // ════════════════════════════════════════════════════════════
  const renderDetail = () => {
    if (!selectedOrdre) return null;
    const cfg = STATUT[selectedOrdre.statut] || {};
    const lignes = selectedOrdre.lignesPlanif || [];

    const canAffecter = selectedOrdre.statut === "CREE";
    const canDemarrer =
      selectedOrdre.statut === "CREE" &&
      !!selectedOrdre.prestataire &&
      !!selectedOrdre.vehicule;
    const canSuivi = !["LIVRE"].includes(selectedOrdre.statut);
    const canConfirmer = selectedOrdre.statut === "EN_ROUTE";

    return (
      <div>
        {/* Fil d'ariane / retour */}
        <button
          onClick={() => setView("liste")}
          style={{
            background: "none",
            border: "none",
            color: T.gray,
            cursor: "pointer",
            fontSize: 12,
            marginBottom: 22,
            padding: 0,
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 600,
          }}
        >
          &larr; Retour aux ordres
        </button>

        {/* Header carte detail */}
        <div
          style={{
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: 24,
            marginBottom: 20,
            borderTop: `3px solid ${cfg.color || T.border}`,
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
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 19,
                    fontWeight: 900,
                    color: T.black,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Ordre #{selectedOrdre.id}
                </h2>
                <Badge statut={selectedOrdre.statut} />
              </div>
              <div
                style={{
                  color: T.grayLight,
                  fontSize: 12,
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                }}
              >
                <span>Session #{selectedOrdre.sessionId}</span>
                {selectedOrdre.prestataire && (
                  <span>{selectedOrdre.prestataire}</span>
                )}
                {selectedOrdre.vehicule && (
                  <span>{selectedOrdre.vehicule}</span>
                )}
                {selectedOrdre.capaciteChargee && (
                  <span>{selectedOrdre.capaciteChargee} palettes</span>
                )}
              </div>
              <StatutStepper statut={selectedOrdre.statut} />
            </div>

            {/* Actions contextuelles */}
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
                  Affecter
                </Btn>
              )}
              {canDemarrer && (
                <Btn variant="outline" onClick={() => setModalDemarrer(true)}>
                  Demarrer la livraison
                </Btn>
              )}
              {canSuivi && (
                <Btn variant="ghost" onClick={() => setModalSuivi(true)}>
                  Ajouter suivi
                </Btn>
              )}
              {canConfirmer && (
                <Btn variant="success" onClick={() => setModalConfirmer(true)}>
                  Confirmer livraison
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
              paddingTop: 18,
              borderTop: `1px solid ${T.border}`,
            }}
          >
            {[
              ["Depart", fmt(selectedOrdre.dateDepart)],
              ["Arrivee prevue", fmt(selectedOrdre.dateArriveePrevue)],
              ["Livraison reelle", fmt(selectedOrdre.dateLivraisonReelle)],
            ].map(([label, val]) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: 10,
                    color: T.grayLight,
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
                    fontSize: 14,
                    fontWeight: 700,
                    color: val === "—" ? T.grayLight : T.black,
                  }}
                >
                  {val}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Corps 2 colonnes */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 310px", gap: 20 }}
        >
          {/* Colonne principale — lignes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {lignes.length > 0 && <CamionIndicator lignes={lignes} />}

            <div
              style={{
                background: T.white,
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                padding: 20,
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px",
                  fontSize: 13,
                  fontWeight: 800,
                  color: T.black,
                  letterSpacing: "-0.01em",
                }}
              >
                Lignes de planification
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 12,
                    color: T.grayLight,
                    fontWeight: 400,
                  }}
                >
                  ({lignes.length} ligne{lignes.length !== 1 ? "s" : ""})
                </span>
              </h3>

              {lignes.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 30,
                    color: T.grayLight,
                    fontSize: 13,
                  }}
                >
                  Aucune ligne associee
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {lignes.map((ligne) => {
                    const poids = calcLignePoids(ligne);
                    const palettes = calcLignePalettes(ligne);
                    const tauxL = Math.min(
                      100,
                      Math.round((poids / POIDS_CAMION) * 100),
                    );
                    const tColor =
                      tauxL >= 85 ? T.green : tauxL >= 50 ? T.orange : T.red;

                    return (
                      <div
                        key={ligne.id}
                        style={{
                          background: T.bg,
                          borderRadius: 8,
                          padding: "13px 15px",
                          border: `1px solid ${T.border}`,
                        }}
                      >
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
                              gap: 7,
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 800,
                                fontSize: 13,
                                color: T.black,
                              }}
                            >
                              {ligne.order?.orderNumber || `Ligne #${ligne.id}`}
                            </span>
                            {ligne.diapason && (
                              <span
                                style={{
                                  fontSize: 10,
                                  padding: "1px 7px",
                                  borderRadius: 3,
                                  fontWeight: 700,
                                  background: T.blueLight,
                                  color: T.blue,
                                  border: `1px solid ${T.blueBorder}`,
                                }}
                              >
                                {ligne.diapason}
                              </span>
                            )}
                            {ligne.clr && (
                              <span
                                style={{
                                  fontSize: 10,
                                  padding: "1px 7px",
                                  borderRadius: 3,
                                  fontWeight: 600,
                                  background: T.bg,
                                  color: T.gray,
                                  border: `1px solid ${T.border}`,
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
                              color: T.grayLight,
                            }}
                          >
                            {poids > 0 && <span>{poids.toFixed(0)} kg</span>}
                            {palettes > 0 && <span>{palettes} plt</span>}
                          </div>
                        </div>

                        {poids > 0 && (
                          <div style={{ marginBottom: 10 }}>
                            <div
                              style={{
                                height: 3,
                                background: T.border,
                                borderRadius: 2,
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  width: `${tauxL}%`,
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
                              {tauxL}% capacite camion
                            </div>
                          </div>
                        )}
                        <LigneArticles ligne={ligne} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite — CLR + suivi */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {lignes[0]?.clr && (
              <div
                style={{
                  background: T.white,
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  padding: 18,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: T.grayLight,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 10,
                  }}
                >
                  CLR Destination
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: T.black,
                    marginBottom: 2,
                  }}
                >
                  {lignes[0].clr.code}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.black }}>
                  {lignes[0].clr.nom}
                </div>
                <div style={{ fontSize: 12, color: T.grayLight, marginTop: 4 }}>
                  {lignes[0].clr.wilaya} &middot; {lignes[0].clr.region}
                </div>
              </div>
            )}

            {/* Timeline suivi */}
            <div
              style={{
                background: T.white,
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                padding: 18,
                flex: 1,
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px",
                  fontSize: 13,
                  fontWeight: 800,
                  color: T.black,
                }}
              >
                Historique de suivi
              </h3>
              {(selectedOrdre.suivis || []).length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 24,
                    color: T.grayLight,
                    fontSize: 13,
                  }}
                >
                  Aucun evenement enregistre
                </div>
              ) : (
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 10,
                      top: 0,
                      bottom: 0,
                      width: 1,
                      background: T.border,
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                      paddingLeft: 26,
                    }}
                  >
                    {[...selectedOrdre.suivis].reverse().map((s) => {
                      const sc = STATUT[s.statut] || {};
                      return (
                        <div key={s.id} style={{ position: "relative" }}>
                          <div
                            style={{
                              position: "absolute",
                              left: -19,
                              top: 3,
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: sc.color || T.grayLight,
                              border: `2px solid ${T.white}`,
                              outline: `1px solid ${sc.color || T.grayLight}`,
                            }}
                          />
                          <div
                            style={{
                              fontSize: 10,
                              color: T.grayLight,
                              marginBottom: 2,
                            }}
                          >
                            {fmtDT(s.createdAt)}
                          </div>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 12,
                              color: sc.color || T.black,
                            }}
                          >
                            {sc.label || s.statut}
                          </div>
                          {s.position && (
                            <div style={{ fontSize: 11, color: T.grayLight }}>
                              {s.position}
                            </div>
                          )}
                          {s.commentaire && (
                            <div
                              style={{
                                fontSize: 12,
                                color: T.gray,
                                marginTop: 2,
                              }}
                            >
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
  // RENDU PRINCIPAL
  // ════════════════════════════════════════════════════════════
  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        color: T.black,
        fontFamily: "'DM Sans','Geist','Segoe UI',sans-serif",
        fontSize: 14,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
        * { box-sizing: border-box; margin: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: ${T.borderMid}; border-radius: 2px; }
        select, textarea {
          background: ${T.white}; border: 1px solid ${T.border}; border-radius: 6px;
          padding: 8px 11px; color: ${T.black}; font-size: 13px;
          width: 100%; font-family: inherit; outline: none; transition: border-color .15s;
        }
        select:focus, textarea:focus { border-color: ${T.black}; }
        textarea { resize: vertical; min-height: 80px; }
        input[type="checkbox"] { accent-color: ${T.black}; }
      `}</style>

      <Toast toasts={toasts} />

      {/* Nav top */}
      <div
        style={{
          background: T.white,
          borderBottom: `1px solid ${T.border}`,
          padding: "0 32px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            height: 50,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: T.black,
              letterSpacing: "-0.01em",
            }}
          >
            ERP Logistique
          </span>
          <span style={{ margin: "0 12px", color: T.border, fontSize: 16 }}>
            |
          </span>
          <span style={{ fontSize: 12, color: T.gray, fontWeight: 500 }}>
            Transport
          </span>
          {view === "detail" && selectedOrdre && (
            <>
              <span style={{ margin: "0 8px", color: T.grayLight }}>/</span>
              <span style={{ fontSize: 12, color: T.black, fontWeight: 600 }}>
                Ordre #{selectedOrdre.id}
              </span>
            </>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "32px 24px" }}>
        {view === "liste" && renderListe()}
        {view === "detail" && renderDetail()}
      </div>

      {/* ── Modal Creer ── */}
      <Modal
        open={modalCreer}
        onClose={() => setModalCreer(false)}
        title="Nouvel ordre de transport"
        wide
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Field label="Session de planification" required>
            <select
              value={formCreer.sessionId}
              onChange={(e) =>
                setFormCreer((p) => ({ ...p, sessionId: e.target.value }))
              }
            >
              <option value="">Choisir une session</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  Session #{s.id} — {s.date} ({s.lignes?.length || 0} ligne
                  {s.lignes?.length !== 1 ? "s" : ""})
                </option>
              ))}
            </select>
          </Field>

          {sessionLignes.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 10,
                  color: T.gray,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Lignes a inclure <span style={{ color: T.red }}>*</span>
                <span
                  style={{
                    color: T.grayLight,
                    fontWeight: 400,
                    textTransform: "none",
                    fontSize: 11,
                  }}
                >
                  — meme CLR obligatoire
                </span>
              </div>

              {clrConflict && (
                <div
                  style={{
                    marginBottom: 10,
                    padding: "9px 12px",
                    background: T.redLight,
                    border: `1px solid ${T.redBorder}`,
                    borderRadius: 6,
                    fontSize: 12,
                    color: T.red,
                    fontWeight: 600,
                  }}
                >
                  Les lignes selectionnees ont des CLR differents — regroupement
                  impossible.
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {sessionLignes.map((ligne) => {
                  const checked = formCreer.lignesPlanifIds.includes(ligne.id);
                  const poids = calcLignePoids(ligne);
                  const palettes = calcLignePalettes(ligne);
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
                  const itemCount =
                    ligne.itemsJson?.length > 0
                      ? ligne.itemsJson.length
                      : (ligne.order?.OrderItems || []).length;

                  return (
                    <label
                      key={ligne.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        cursor: "pointer",
                        background: checked ? T.bg : T.white,
                        padding: "11px 13px",
                        borderRadius: 7,
                        border: `1px solid ${checked ? T.black : T.border}`,
                        transition: "all .12s",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleLigne(ligne.id)}
                        style={{ marginTop: 2, flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                            marginBottom: 3,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: 13,
                              color: T.black,
                            }}
                          >
                            {ligne.order?.orderNumber || `Ligne #${ligne.id}`}
                          </span>
                          {ligne.diapason && (
                            <span
                              style={{
                                fontSize: 10,
                                padding: "1px 6px",
                                borderRadius: 3,
                                background: T.blueLight,
                                color: T.blue,
                                fontWeight: 700,
                                border: `1px solid ${T.blueBorder}`,
                              }}
                            >
                              {ligne.diapason}
                            </span>
                          )}
                          {ligne.clr && (
                            <span
                              style={{
                                fontSize: 10,
                                padding: "1px 6px",
                                borderRadius: 3,
                                background: T.bg,
                                color: T.gray,
                                fontWeight: 600,
                                border: `1px solid ${T.border}`,
                              }}
                            >
                              {ligne.clr.code} — {ligne.clr.nom}
                            </span>
                          )}
                          {ligne.itemsJson?.length > 0 && (
                            <span
                              style={{
                                fontSize: 9,
                                padding: "1px 6px",
                                borderRadius: 3,
                                background: T.orangeLight,
                                color: T.orange,
                                fontWeight: 700,
                                border: `1px solid ${T.orangeBorder}`,
                              }}
                            >
                              SELECTION PLANIF
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: T.grayLight,
                            display: "flex",
                            gap: 10,
                          }}
                        >
                          <span>
                            {itemCount} article{itemCount !== 1 ? "s" : ""}{" "}
                            &middot; {totalQte.toLocaleString("fr-DZ")} u
                          </span>
                          {poids > 0 && <span>{poids.toFixed(0)} kg</span>}
                          {palettes > 0 && <span>{palettes} plt</span>}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {formCreer.lignesPlanifIds.length > 0 && !clrConflict && (
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
            <Field
              label="Prestataire"
              value={formCreer.prestataire}
              onChange={(v) => setFormCreer((p) => ({ ...p, prestataire: v }))}
              placeholder="Nom du transporteur"
            />
            <Field
              label="Vehicule"
              value={formCreer.vehicule}
              onChange={(v) => setFormCreer((p) => ({ ...p, vehicule: v }))}
              placeholder="Immatriculation"
            />
          </div>
          <Field
            label="Date d'arrivee prevue"
            type="datetime-local"
            value={formCreer.dateArriveePrevue}
            onChange={(v) =>
              setFormCreer((p) => ({ ...p, dateArriveePrevue: v }))
            }
          />
          <Field label="Notes">
            <textarea
              value={formCreer.notes}
              onChange={(e) =>
                setFormCreer((p) => ({ ...p, notes: e.target.value }))
              }
              placeholder="Notes optionnelles..."
            />
          </Field>

          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              paddingTop: 8,
              borderTop: `1px solid ${T.border}`,
            }}
          >
            <Btn variant="ghost" onClick={() => setModalCreer(false)}>
              Annuler
            </Btn>
            <Btn
              onClick={handleCreer}
              disabled={
                !formCreer.sessionId ||
                formCreer.lignesPlanifIds.length === 0 ||
                clrConflict
              }
            >
              Creer l'ordre
            </Btn>
          </div>
        </div>
      </Modal>

      {/* ── Modal Affecter ── */}
      <Modal
        open={modalAffecter}
        onClose={() => setModalAffecter(false)}
        title="Affecter prestataire et vehicule"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field
            label="Prestataire"
            required
            value={formAffecter.prestataire}
            onChange={(v) => setFormAffecter((p) => ({ ...p, prestataire: v }))}
            placeholder="Nom du transporteur"
          />
          <Field
            label="Vehicule"
            required
            value={formAffecter.vehicule}
            onChange={(v) => setFormAffecter((p) => ({ ...p, vehicule: v }))}
            placeholder="Immatriculation"
          />
          <Field
            label="Capacite chargee (palettes)"
            type="number"
            value={formAffecter.capaciteChargee}
            onChange={(v) =>
              setFormAffecter((p) => ({ ...p, capaciteChargee: v }))
            }
          />
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <Field
              label="Date de depart"
              type="datetime-local"
              value={formAffecter.dateDepart}
              onChange={(v) =>
                setFormAffecter((p) => ({ ...p, dateDepart: v }))
              }
            />
            <Field
              label="Arrivee prevue"
              type="datetime-local"
              value={formAffecter.dateArriveePrevue}
              onChange={(v) =>
                setFormAffecter((p) => ({ ...p, dateArriveePrevue: v }))
              }
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              paddingTop: 8,
              borderTop: `1px solid ${T.border}`,
            }}
          >
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

      {/* ── Modal Suivi ── */}
      <Modal
        open={modalSuivi}
        onClose={() => setModalSuivi(false)}
        title="Ajouter un evenement de suivi"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Changement de statut (optionnel)">
            <select
              value={formSuivi.statut}
              onChange={(e) =>
                setFormSuivi((p) => ({ ...p, statut: e.target.value }))
              }
            >
              <option value="">Pas de changement de statut</option>
              <option value="EN_ROUTE">En route</option>
              <option value="INCIDENT">Incident</option>
            </select>
          </Field>
          <Field
            label="Position"
            value={formSuivi.position}
            onChange={(v) => setFormSuivi((p) => ({ ...p, position: v }))}
            placeholder="Ex : Setif, RN5..."
          />
          <Field label="Commentaire">
            <textarea
              value={formSuivi.commentaire}
              onChange={(e) =>
                setFormSuivi((p) => ({ ...p, commentaire: e.target.value }))
              }
              placeholder="Description de l'evenement..."
            />
          </Field>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              paddingTop: 8,
              borderTop: `1px solid ${T.border}`,
            }}
          >
            <Btn variant="ghost" onClick={() => setModalSuivi(false)}>
              Annuler
            </Btn>
            <Btn onClick={handleSuivi}>Ajouter</Btn>
          </div>
        </div>
      </Modal>

      {/* ── Modal Demarrer (confirmation explicite — point 7) ── */}
      <Modal
        open={modalDemarrer}
        onClose={() => setModalDemarrer(false)}
        title="Demarrer la livraison"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              background: T.bg,
              borderRadius: 8,
              padding: "14px 16px",
              fontSize: 13,
              color: T.gray,
              lineHeight: 1.75,
              border: `1px solid ${T.border}`,
            }}
          >
            Cette action va passer l'ordre{" "}
            <strong style={{ color: T.black }}>#{selectedOrdre?.id}</strong> en
            statut <strong style={{ color: T.orange }}>En route</strong>.
            <br />
            Prestataire :{" "}
            <strong style={{ color: T.black }}>
              {selectedOrdre?.prestataire}
            </strong>
            &nbsp;&mdash;&nbsp; Vehicule :{" "}
            <strong style={{ color: T.black }}>
              {selectedOrdre?.vehicule}
            </strong>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              paddingTop: 8,
              borderTop: `1px solid ${T.border}`,
            }}
          >
            <Btn variant="ghost" onClick={() => setModalDemarrer(false)}>
              Annuler
            </Btn>
            <Btn variant="warning" onClick={handleDemarrer}>
              Confirmer le depart
            </Btn>
          </div>
        </div>
      </Modal>

      {/* ── Modal Confirmer livraison ── */}
      <Modal
        open={modalConfirmer}
        onClose={() => setModalConfirmer(false)}
        title="Confirmer la livraison"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              background: T.redLight,
              border: `1px solid ${T.redBorder}`,
              borderRadius: 8,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: T.red,
                marginBottom: 8,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Action irreversible
            </div>
            <div style={{ fontSize: 13, color: T.black, lineHeight: 1.75 }}>
              Cette action va :
              <ul
                style={{
                  margin: "6px 0 0",
                  paddingLeft: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                <li>
                  Passer l'ordre en statut <strong>Livre</strong>
                </li>
                <li>Mettre a jour le stock CLR destination</li>
                <li>
                  Passer les commandes associees en <strong>delivered</strong>
                </li>
              </ul>
            </div>
          </div>
          {selectedOrdre && (
            <div
              style={{
                background: T.bg,
                borderRadius: 7,
                padding: "10px 13px",
                fontSize: 13,
                color: T.gray,
                border: `1px solid ${T.border}`,
              }}
            >
              Ordre #{selectedOrdre.id}
              &nbsp;&middot;&nbsp;
              {(selectedOrdre.lignesPlanif || []).length} ligne(s)
              &nbsp;&middot;&nbsp; CLR #{selectedOrdre.clrId}
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              paddingTop: 8,
              borderTop: `1px solid ${T.border}`,
            }}
          >
            <Btn variant="ghost" onClick={() => setModalConfirmer(false)}>
              Annuler
            </Btn>
            <Btn variant="danger" onClick={handleConfirmer}>
              Confirmer la livraison
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
