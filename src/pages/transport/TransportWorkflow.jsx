// pages/transport/TransportWorkflow.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// ─── Palette & tokens ────────────────────────────────────────
const C = {
  bg:       "#0f1117",
  surface:  "#181c27",
  border:   "#252a38",
  accent:   "#3b82f6",
  accentLo: "rgba(59,130,246,0.12)",
  green:    "#22c55e",
  greenLo:  "rgba(34,197,94,0.12)",
  orange:   "#f97316",
  orangeLo: "rgba(249,115,22,0.12)",
  red:      "#ef4444",
  redLo:    "rgba(239,68,68,0.12)",
  yellow:   "#eab308",
  yellowLo: "rgba(234,179,8,0.12)",
  text:     "#e2e8f0",
  muted:    "#64748b",
  card:     "#1e2235",
};

// ─── Statut config ───────────────────────────────────────────
const STATUT_CONFIG = {
  CREE:      { label: "Créé",      color: C.accent,  bg: C.accentLo,  icon: "📋" },
  EN_ROUTE:  { label: "En route",  color: C.orange,  bg: C.orangeLo,  icon: "🚛" },
  LIVRE:     { label: "Livré",     color: C.green,   bg: C.greenLo,   icon: "✅" },
  INCIDENT:  { label: "Incident",  color: C.red,     bg: C.redLo,     icon: "⚠️" },
};

// ─── Composants UI ───────────────────────────────────────────
const Badge = ({ statut }) => {
  const cfg = STATUT_CONFIG[statut] || { label: statut, color: C.muted, bg: "#1e2235", icon: "•" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
      color: cfg.color, background: cfg.bg,
      border: `1px solid ${cfg.color}40`,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

const Btn = ({ onClick, children, variant = "primary", disabled = false, size = "md" }) => {
  const styles = {
    primary:  { background: C.accent,   color: "#fff",   border: "none" },
    success:  { background: C.green,    color: "#fff",   border: "none" },
    danger:   { background: C.red,      color: "#fff",   border: "none" },
    ghost:    { background: "transparent", color: C.text, border: `1px solid ${C.border}` },
    warning:  { background: C.orange,   color: "#fff",   border: "none" },
  };
  const sizes = {
    sm: { padding: "5px 12px", fontSize: 12 },
    md: { padding: "8px 18px", fontSize: 13 },
    lg: { padding: "11px 24px", fontSize: 14 },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant], ...sizes[size],
        borderRadius: 8, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1, transition: "opacity .15s",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder = "", required = false }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: "0.04em" }}>
      {label}{required && <span style={{ color: C.red }}> *</span>}
    </label>
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
        padding: "9px 12px", color: C.text, fontSize: 13,
        outline: "none", fontFamily: "inherit",
        transition: "border-color .15s",
      }}
      onFocus={e => e.target.style.borderColor = C.accent}
      onBlur={e => e.target.style.borderColor = C.border}
    />
  </div>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 16, padding: 28, maxWidth: 520, width: "100%",
        maxHeight: "85vh", overflowY: "auto",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: C.text, fontSize: 17, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: C.muted, cursor: "pointer",
            fontSize: 20, lineHeight: 1,
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Toast = ({ toasts }) => (
  <div style={{ position: "fixed", top: 20, right: 20, zIndex: 2000, display: "flex", flexDirection: "column", gap: 8 }}>
    {toasts.map(t => (
      <div key={t.id} style={{
        background: t.type === "success" ? C.green : t.type === "error" ? C.red : C.accent,
        color: "#fff", padding: "10px 18px", borderRadius: 10,
        fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        animation: "slideIn .2s ease",
      }}>
        {t.message}
      </div>
    ))}
  </div>
);

// ─── Hook toast ──────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = (message, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };
  return { toasts, push };
}

// ─── API helper ──────────────────────────────────────────────
const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════
export default function TransportWorkflow() {
  const { toasts, push } = useToast();

  // États principaux
  const [ordres, setOrdres]               = useState([]);
  const [sessions, setSessions]           = useState([]);
  const [selectedOrdre, setSelectedOrdre] = useState(null);
  const [view, setView]                   = useState("liste"); // liste | detail | creer
  const [loading, setLoading]             = useState(true);

  // Filtres
  const [filtreStatut, setFiltreStatut]   = useState("ALL");

  // Modals
  const [modalAffecter, setModalAffecter]   = useState(false);
  const [modalSuivi, setModalSuivi]         = useState(false);
  const [modalCreer, setModalCreer]         = useState(false);
  const [modalConfirmer, setModalConfirmer] = useState(false);

  // Form états
  const [formAffecter, setFormAffecter] = useState({ prestataire: "", vehicule: "", capaciteChargee: "", dateDepart: "", dateArriveePrevue: "" });
  const [formSuivi, setFormSuivi]       = useState({ statut: "", position: "", commentaire: "" });
  const [formCreer, setFormCreer]       = useState({ sessionId: "", lignesPlanifIds: [], prestataire: "", vehicule: "", dateArriveePrevue: "", notes: "" });
  const [sessionLignes, setSessionLignes] = useState([]);

  // ── Chargement ───────────────────────────────────────────────
  const loadOrdres = useCallback(async () => {
    try {
      const params = filtreStatut !== "ALL" ? { statut: filtreStatut } : {};
      const { data } = await api.get("/transport/ordres", { params });
      setOrdres(data);
    } catch { push("Erreur chargement ordres", "error"); }
    finally { setLoading(false); }
  }, [filtreStatut]);

  const loadSessions = useCallback(async () => {
    try {
      const { data } = await api.get("/transport/sessions-disponibles");
      setSessions(data);
    } catch { }
  }, []);

  useEffect(() => { loadOrdres(); }, [loadOrdres]);
  useEffect(() => { loadSessions(); }, [loadSessions]);

  // Quand on sélectionne une session dans le form créer
  useEffect(() => {
    if (!formCreer.sessionId) { setSessionLignes([]); return; }
    const sess = sessions.find(s => String(s.id) === String(formCreer.sessionId));
    setSessionLignes(sess?.lignes || []);
    setFormCreer(p => ({ ...p, lignesPlanifIds: [] }));
  }, [formCreer.sessionId]);

  // ── Détail ordre ────────────────────────────────────────────
  const openDetail = async (ordre) => {
    try {
      const { data } = await api.get(`/transport/ordres/${ordre.id}`);
      setSelectedOrdre(data);
      setView("detail");
    } catch { push("Erreur chargement détail", "error"); }
  };

  // ── Actions ──────────────────────────────────────────────────
  const handleCreer = async () => {
    if (!formCreer.sessionId || formCreer.lignesPlanifIds.length === 0) {
      push("Sélectionnez une session et au moins une ligne", "error"); return;
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
      push("Ordre de transport créé ✓", "success");
      setModalCreer(false);
      setFormCreer({ sessionId: "", lignesPlanifIds: [], prestataire: "", vehicule: "", dateArriveePrevue: "", notes: "" });
      loadOrdres(); loadSessions();
    } catch (e) { push(e.response?.data?.message || "Erreur création", "error"); }
  };

  const handleAffecter = async () => {
    try {
      await api.patch(`/transport/ordres/${selectedOrdre.id}/affecter`, formAffecter);
      push("Prestataire affecté ✓", "success");
      setModalAffecter(false);
      openDetail(selectedOrdre);
      loadOrdres();
    } catch (e) { push(e.response?.data?.message || "Erreur affectation", "error"); }
  };

  const handleDemarrer = async () => {
    try {
      await api.patch(`/transport/ordres/${selectedOrdre.id}/demarrer`, { commentaire: "Départ confirmé" });
      push("Livraison démarrée 🚛", "success");
      openDetail(selectedOrdre);
      loadOrdres();
    } catch (e) { push(e.response?.data?.message || "Erreur démarrage", "error"); }
  };

  const handleSuivi = async () => {
    try {
      await api.post(`/transport/ordres/${selectedOrdre.id}/suivi`, formSuivi);
      push("Suivi ajouté ✓", "success");
      setModalSuivi(false);
      setFormSuivi({ statut: "", position: "", commentaire: "" });
      openDetail(selectedOrdre);
    } catch (e) { push(e.response?.data?.message || "Erreur suivi", "error"); }
  };

  const handleConfirmer = async () => {
    try {
      const { data } = await api.patch(`/transport/ordres/${selectedOrdre.id}/confirmer`);
      push(`✅ Livraison confirmée — ${data.updated} produit(s) mis à jour`, "success");
      setModalConfirmer(false);
      openDetail(selectedOrdre);
      loadOrdres();
    } catch (e) { push(e.response?.data?.message || "Erreur confirmation", "error"); }
  };

  const toggleLigne = (ligneId) => {
    setFormCreer(p => ({
      ...p,
      lignesPlanifIds: p.lignesPlanifIds.includes(ligneId)
        ? p.lignesPlanifIds.filter(id => id !== ligneId)
        : [...p.lignesPlanifIds, ligneId],
    }));
  };

  // ── Render helpers ───────────────────────────────────────────
  const ordresFiltres = ordres.filter(o => filtreStatut === "ALL" || o.statut === filtreStatut);

  const fmt = (d) => d ? new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const fmtDatetime = (d) => d ? new Date(d).toLocaleString("fr-DZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

  // ── STYLES GLOBAUX ───────────────────────────────────────────
  const pageStyle = {
    minHeight: "100vh", background: C.bg, color: C.text,
    fontFamily: "'Inter', 'Segoe UI', sans-serif", fontSize: 14,
  };
  const cardStyle = {
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 14, padding: 20,
  };

  // ════════════════════════════════════════════════════════════════
  // RENDER — LISTE
  // ════════════════════════════════════════════════════════════════
  const renderListe = () => (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: C.text }}>
            🚛 Transport
          </h1>
          <p style={{ margin: "4px 0 0", color: C.muted, fontSize: 13 }}>
            Gestion des ordres de transport et suivi des livraisons
          </p>
        </div>
        <Btn onClick={() => { loadSessions(); setModalCreer(true); }} size="lg">
          + Nouvel ordre
        </Btn>
      </div>

      {/* Stats rapides */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {Object.entries(STATUT_CONFIG).map(([s, cfg]) => {
          const count = ordres.filter(o => o.statut === s).length;
          return (
            <div key={s} style={{ ...cardStyle, padding: "16px 20px", borderLeft: `3px solid ${cfg.color}` }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: cfg.color }}>{count}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{cfg.label}</div>
            </div>
          );
        })}
      </div>

      {/* Filtres */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["ALL", "Tous"], ...Object.entries(STATUT_CONFIG).map(([s, c]) => [s, c.label])].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFiltreStatut(val)}
            style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              background: filtreStatut === val ? C.accent : C.surface,
              color: filtreStatut === val ? "#fff" : C.muted,
              border: `1px solid ${filtreStatut === val ? C.accent : C.border}`,
              transition: "all .15s",
            }}
          >{label}</button>
        ))}
      </div>

      {/* Table ordres */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: C.muted }}>Chargement…</div>
      ) : ordresFiltres.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: "center", padding: 60, color: C.muted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
          <div>Aucun ordre de transport</div>
          {sessions.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Btn onClick={() => setModalCreer(true)}>Créer un premier ordre</Btn>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ordresFiltres.map(ordre => (
            <div
              key={ordre.id}
              onClick={() => openDetail(ordre)}
              style={{
                ...cardStyle, cursor: "pointer",
                display: "grid", gridTemplateColumns: "auto 1fr auto auto auto",
                alignItems: "center", gap: 20, padding: "16px 24px",
                transition: "border-color .15s, background .15s",
                borderLeft: `3px solid ${STATUT_CONFIG[ordre.statut]?.color || C.border}`,
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#242840"}
              onMouseLeave={e => e.currentTarget.style.background = C.card}
            >
              <span style={{ fontSize: 22 }}>{STATUT_CONFIG[ordre.statut]?.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Ordre #{ordre.id}</div>
                <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
                  Session #{ordre.sessionId} · CLR #{ordre.clrId}
                  {ordre.prestataire && ` · ${ordre.prestataire}`}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: C.muted }}>Départ</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{fmt(ordre.dateDepart)}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: C.muted }}>Prévu</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{fmt(ordre.dateArriveePrevue)}</div>
              </div>
              <Badge statut={ordre.statut} />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ════════════════════════════════════════════════════════════════
  // RENDER — DETAIL
  // ════════════════════════════════════════════════════════════════
  const renderDetail = () => {
    if (!selectedOrdre) return null;
    const cfg = STATUT_CONFIG[selectedOrdre.statut] || {};
    const canAffecter  = selectedOrdre.statut === "CREE";
    const canDemarrer  = selectedOrdre.statut === "CREE" && selectedOrdre.prestataire && selectedOrdre.vehicule;
    const canSuivi     = !["LIVRE"].includes(selectedOrdre.statut);
    const canConfirmer = selectedOrdre.statut === "EN_ROUTE";

    return (
      <div>
        {/* Back */}
        <button
          onClick={() => setView("liste")}
          style={{ background: "none", border: "none", color: C.accent, cursor: "pointer", fontSize: 14, marginBottom: 20, padding: 0, fontFamily: "inherit" }}
        >
          ← Retour aux ordres
        </button>

        {/* Header ordre */}
        <div style={{ ...cardStyle, marginBottom: 20, borderLeft: `4px solid ${cfg.color}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Ordre #{selectedOrdre.id}</h2>
                <Badge statut={selectedOrdre.statut} />
              </div>
              <div style={{ color: C.muted, fontSize: 13, display: "flex", gap: 20 }}>
                <span>Session #{selectedOrdre.sessionId}</span>
                <span>CLR #{selectedOrdre.clrId}</span>
                {selectedOrdre.prestataire && <span>🚚 {selectedOrdre.prestataire}</span>}
                {selectedOrdre.vehicule && <span>🚗 {selectedOrdre.vehicule}</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {canAffecter && <Btn onClick={() => { setFormAffecter({ prestataire: selectedOrdre.prestataire || "", vehicule: selectedOrdre.vehicule || "", capaciteChargee: selectedOrdre.capaciteChargee || "", dateDepart: "", dateArriveePrevue: "" }); setModalAffecter(true); }} variant="ghost">✏️ Affecter</Btn>}
              {canDemarrer && <Btn onClick={handleDemarrer} variant="warning">🚛 Démarrer</Btn>}
              {canSuivi    && <Btn onClick={() => setModalSuivi(true)} variant="ghost">📍 Ajouter suivi</Btn>}
              {canConfirmer && <Btn onClick={() => setModalConfirmer(true)} variant="success">✅ Confirmer livraison</Btn>}
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 20, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
            {[
              ["Départ", fmt(selectedOrdre.dateDepart)],
              ["Arrivée prévue", fmt(selectedOrdre.dateArriveePrevue)],
              ["Livraison réelle", fmt(selectedOrdre.dateLivraisonReelle)],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 4, letterSpacing: "0.05em" }}>{label.toUpperCase()}</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Lignes de planification */}
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: C.text }}>
              📋 Lignes planification ({selectedOrdre.lignesPlanif?.length || 0})
            </h3>
            {(selectedOrdre.lignesPlanif || []).length === 0 ? (
              <div style={{ color: C.muted, textAlign: "center", padding: 20 }}>Aucune ligne</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {selectedOrdre.lignesPlanif.map(ligne => (
                  <div key={ligne.id} style={{
                    background: C.bg, borderRadius: 10, padding: "12px 14px",
                    border: `1px solid ${C.border}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600 }}>#{ligne.id} — {ligne.order?.orderNumber || "Commande"}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                        background: ligne.diapason === "D1" ? C.accentLo : C.yellowLo,
                        color: ligne.diapason === "D1" ? C.accent : C.yellow,
                      }}>{ligne.diapason}</span>
                    </div>
                    {(ligne.order?.items || []).map((item, i) => (
                      <div key={i} style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                        {item.productName} — {item.quantity} {item.unit}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historique suivi */}
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: C.text }}>
              📍 Historique suivi
            </h3>
            {(selectedOrdre.suivis || []).length === 0 ? (
              <div style={{ color: C.muted, textAlign: "center", padding: 20 }}>Aucun suivi</div>
            ) : (
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 14, top: 0, bottom: 0, width: 2, background: C.border }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingLeft: 36 }}>
                  {[...selectedOrdre.suivis].reverse().map((s, i) => {
                    const cfg2 = STATUT_CONFIG[s.statut] || {};
                    return (
                      <div key={s.id} style={{ position: "relative" }}>
                        <div style={{
                          position: "absolute", left: -29, top: 3,
                          width: 12, height: 12, borderRadius: "50%",
                          background: cfg2.color || C.muted, border: `2px solid ${C.bg}`,
                        }} />
                        <div style={{ fontSize: 11, color: C.muted }}>{fmtDatetime(s.createdAt)}</div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: cfg2.color }}>{cfg2.label || s.statut}</div>
                        {s.position && <div style={{ fontSize: 12, color: C.muted }}>📍 {s.position}</div>}
                        {s.commentaire && <div style={{ fontSize: 12, color: C.text }}>{s.commentaire}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════
  // RENDER PRINCIPAL
  // ════════════════════════════════════════════════════════════════
  return (
    <div style={pageStyle}>
      <style>{`
        @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #252a38; border-radius: 3px; }
        input:focus { outline: none; }
        select { background: #0f1117; border: 1px solid #252a38; border-radius: 8px; padding: 9px 12px; color: #e2e8f0; font-size: 13px; width: 100%; font-family: inherit; cursor: pointer; }
        select:focus { outline: none; border-color: #3b82f6; }
        textarea { background: #0f1117; border: 1px solid #252a38; border-radius: 8px; padding: 9px 12px; color: #e2e8f0; font-size: 13px; width: 100%; font-family: inherit; resize: vertical; min-height: 80px; }
        textarea:focus { outline: none; border-color: #3b82f6; }
      `}</style>

      <Toast toasts={toasts} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {view === "liste" && renderListe()}
        {view === "detail" && renderDetail()}
      </div>

      {/* ── Modal Créer ordre ──────────────────────────────── */}
      <Modal open={modalCreer} onClose={() => setModalCreer(false)} title="Nouvel ordre de transport">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: "0.04em", display: "block", marginBottom: 5 }}>
              SESSION DE PLANIFICATION <span style={{ color: C.red }}>*</span>
            </label>
            <select value={formCreer.sessionId} onChange={e => setFormCreer(p => ({ ...p, sessionId: e.target.value }))}>
              <option value="">-- Choisir une session --</option>
              {sessions.map(s => (
                <option key={s.id} value={s.id}>Session #{s.id} — {s.date} ({s.lignes?.length || 0} lignes)</option>
              ))}
            </select>
          </div>

          {sessionLignes.length > 0 && (
            <div>
              <label style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: "0.04em", display: "block", marginBottom: 8 }}>
                LIGNES À INCLURE <span style={{ color: C.red }}>*</span>
                <span style={{ color: C.muted, fontWeight: 400 }}> (même CLR obligatoire)</span>
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sessionLignes.map(ligne => {
                  const checked = formCreer.lignesPlanifIds.includes(ligne.id);
                  return (
                    <label key={ligne.id} style={{
                      display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                      background: checked ? C.accentLo : C.bg, padding: "10px 14px",
                      borderRadius: 8, border: `1px solid ${checked ? C.accent : C.border}`,
                      transition: "all .15s",
                    }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleLigne(ligne.id)} style={{ accentColor: C.accent }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          Ligne #{ligne.id} — {ligne.order?.orderNumber}
                          <span style={{ marginLeft: 8, fontSize: 11, padding: "1px 6px", borderRadius: 8, background: C.accentLo, color: C.accent }}>{ligne.diapason}</span>
                        </div>
                        <div style={{ fontSize: 11, color: C.muted }}>CLR #{ligne.clrId}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="PRESTATAIRE" value={formCreer.prestataire} onChange={v => setFormCreer(p => ({ ...p, prestataire: v }))} placeholder="Nom transporteur" />
            <Input label="VÉHICULE" value={formCreer.vehicule} onChange={v => setFormCreer(p => ({ ...p, vehicule: v }))} placeholder="Immatriculation" />
          </div>

          <Input label="DATE D'ARRIVÉE PRÉVUE" type="datetime-local" value={formCreer.dateArriveePrevue} onChange={v => setFormCreer(p => ({ ...p, dateArriveePrevue: v }))} />

          <div>
            <label style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: "0.04em", display: "block", marginBottom: 5 }}>NOTES</label>
            <textarea value={formCreer.notes} onChange={e => setFormCreer(p => ({ ...p, notes: e.target.value }))} placeholder="Notes optionnelles…" />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn onClick={() => setModalCreer(false)} variant="ghost">Annuler</Btn>
            <Btn onClick={handleCreer} disabled={!formCreer.sessionId || formCreer.lignesPlanifIds.length === 0}>Créer l'ordre</Btn>
          </div>
        </div>
      </Modal>

      {/* ── Modal Affecter ─────────────────────────────────── */}
      <Modal open={modalAffecter} onClose={() => setModalAffecter(false)} title="Affecter prestataire & véhicule">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="PRESTATAIRE" required value={formAffecter.prestataire} onChange={v => setFormAffecter(p => ({ ...p, prestataire: v }))} placeholder="Nom du transporteur" />
          <Input label="VÉHICULE" required value={formAffecter.vehicule} onChange={v => setFormAffecter(p => ({ ...p, vehicule: v }))} placeholder="Immatriculation" />
          <Input label="CAPACITÉ CHARGÉE" type="number" value={formAffecter.capaciteChargee} onChange={v => setFormAffecter(p => ({ ...p, capaciteChargee: v }))} placeholder="Nombre de palettes" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="DATE DÉPART" type="datetime-local" value={formAffecter.dateDepart} onChange={v => setFormAffecter(p => ({ ...p, dateDepart: v }))} />
            <Input label="ARRIVÉE PRÉVUE" type="datetime-local" value={formAffecter.dateArriveePrevue} onChange={v => setFormAffecter(p => ({ ...p, dateArriveePrevue: v }))} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn onClick={() => setModalAffecter(false)} variant="ghost">Annuler</Btn>
            <Btn onClick={handleAffecter} disabled={!formAffecter.prestataire || !formAffecter.vehicule}>Confirmer</Btn>
          </div>
        </div>
      </Modal>

      {/* ── Modal Suivi ────────────────────────────────────── */}
      <Modal open={modalSuivi} onClose={() => setModalSuivi(false)} title="Ajouter un événement de suivi">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: "0.04em", display: "block", marginBottom: 5 }}>STATUT (optionnel)</label>
            <select value={formSuivi.statut} onChange={e => setFormSuivi(p => ({ ...p, statut: e.target.value }))}>
              <option value="">Pas de changement de statut</option>
              <option value="EN_ROUTE">En route</option>
              <option value="INCIDENT">Incident</option>
            </select>
          </div>
          <Input label="POSITION" value={formSuivi.position} onChange={v => setFormSuivi(p => ({ ...p, position: v }))} placeholder="Ex: Sétif, RN5..." />
          <div>
            <label style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: "0.04em", display: "block", marginBottom: 5 }}>COMMENTAIRE</label>
            <textarea value={formSuivi.commentaire} onChange={e => setFormSuivi(p => ({ ...p, commentaire: e.target.value }))} placeholder="Description de l'événement…" />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn onClick={() => setModalSuivi(false)} variant="ghost">Annuler</Btn>
            <Btn onClick={handleSuivi}>Ajouter</Btn>
          </div>
        </div>
      </Modal>

      {/* ── Modal Confirmer livraison ──────────────────────── */}
      <Modal open={modalConfirmer} onClose={() => setModalConfirmer(false)} title="Confirmer la livraison">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{
            background: C.greenLo, border: `1px solid ${C.green}40`,
            borderRadius: 10, padding: 16,
          }}>
            <div style={{ fontWeight: 700, color: C.green, marginBottom: 6 }}>⚠️ Action irréversible</div>
            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>
              Cette action va :
              <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                <li>Passer l'ordre en statut <strong>LIVRÉ</strong></li>
                <li>Mettre à jour le <strong>stock du CLR</strong> destination</li>
                <li>Passer les commandes associées en <strong>delivered</strong></li>
              </ul>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn onClick={() => setModalConfirmer(false)} variant="ghost">Annuler</Btn>
            <Btn onClick={handleConfirmer} variant="success">✅ Confirmer la livraison</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
