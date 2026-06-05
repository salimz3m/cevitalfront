// pages/admin/DataManager.jsx — Sprint 9 (redesign)
// Gestion des données de base : Produits + CLR + Plateformes
// Routes backend :
//   GET/POST/PUT/DELETE /api/stock/produits
//   GET/POST/PUT/DELETE /api/stock/familles
//   GET/POST/PUT/DELETE /api/infrastructure/clrs
//   GET/POST/PUT        /api/infrastructure/plateformes

import { useState, useEffect } from "react";
import api from "../../utils/api";
import { useToast } from "../../context/ToastContext";

// ─── Defaults ─────────────────────────────────────────────────
const DEFAULT_FAMILLES = [
  "HUILE",
  "MARGARINE",
  "SUCRE",
  "SMEN",
  "CHOCOLAT",
  "SAUCE",
  "EAU",
  "MIEL",
  "CONFITURE",
  "BOISSON",
  "PALETTE",
  "AUTRE",
];

const REGIONS = ["EST", "CENTRE", "OUEST"];

const REGION_COLORS = { EST: "#c0392b", CENTRE: "#1a1a2e", OUEST: "#2c3e50" };

const EMPTY_PRODUIT = {
  sku: "",
  nom: "",
  famille: "",
  marque: "",
  uniteBase: "unité", // la plus petite unité logistique (ex: bouteille, sachet)
  coefParBoite: 1, // unités dans une boite
  coefBoiteParCarton: 1, // boites dans un carton
  coefCartonParPalette: 1, // cartons dans une palette
  poidsUnitaireKg: "", // poids d'une unité de base
  prixUnitaireDZD: 0,
  description: "",
  actif: true,
};

const EMPTY_CLR = {
  code: "",
  nom: "",
  wilaya: "",
  region: "EST",
  plateformeId: "",
  adresse: "",
};
const EMPTY_PLF = { nom: "", ville: "", region: "EST", capacite: 1000 };

// ─── Calculs conditionnement ───────────────────────────────────
function calcConditionnement(p) {
  const pU = parseFloat(p.poidsUnitaireKg) || 0;
  const cB = parseFloat(p.coefParBoite) || 1;
  const cC = parseFloat(p.coefBoiteParCarton) || 1;
  const cP = parseFloat(p.coefCartonParPalette) || 1;
  const prix = parseFloat(p.prixUnitaireDZD) || 0;

  const uniteParCarton = cB * cC;
  const uniteParPalette = cB * cC * cP;

  const poidsBoite = pU * cB;
  const poidsCarton = poidsBoite * cC;
  const poidsPalette = poidsCarton * cP;

  const prixBoite = prix * cB;
  const prixCarton = prixBoite * cC;
  const prixPalette = prixCarton * cP;

  const cartonsParCamion =
    poidsCarton > 0 ? Math.floor(24000 / poidsCarton) : 0;

  return {
    uniteParCarton,
    uniteParPalette,
    poidsBoite,
    poidsCarton,
    poidsPalette,
    prixBoite,
    prixCarton,
    prixPalette,
    cartonsParCamion,
  };
}

// ─── Design System ─────────────────────────────────────────────
const T = {
  // Colors
  white: "#ffffff",
  offW: "#f7f7f5",
  gray50: "#f2f2f0",
  gray100: "#e8e8e5",
  gray200: "#d0d0cc",
  gray400: "#9a9a95",
  gray600: "#5a5a55",
  gray800: "#2a2a25",
  black: "#0e0e0c",
  red: "#c0392b",
  redLight: "#f9eeee",
  redMid: "#e8c4c0",
};

const S = {
  page: {
    padding: "40px 48px",
    color: T.gray800,
    minHeight: "100vh",
    background: T.offW,
    fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
  },
  header: {
    marginBottom: "40px",
    borderBottom: `1px solid ${T.gray100}`,
    paddingBottom: "24px",
  },
  title: {
    fontSize: "22px",
    fontWeight: 700,
    color: T.black,
    margin: 0,
    letterSpacing: "-0.02em",
  },
  sub: {
    color: T.gray400,
    marginTop: "4px",
    fontSize: "13px",
    fontWeight: 400,
  },

  tabs: {
    display: "flex",
    gap: "0px",
    marginBottom: "32px",
    borderBottom: `1px solid ${T.gray100}`,
  },
  tab: (a) => ({
    padding: "10px 22px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: "transparent",
    color: a ? T.black : T.gray400,
    borderBottom: a ? `2px solid ${T.black}` : "2px solid transparent",
    marginBottom: "-1px",
    transition: "all 0.12s",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  }),

  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    gap: "12px",
    flexWrap: "wrap",
  },
  search: {
    background: T.white,
    border: `1px solid ${T.gray200}`,
    borderRadius: "4px",
    padding: "9px 12px",
    color: T.black,
    fontSize: "13px",
    outline: "none",
    width: "240px",
    fontFamily: "inherit",
  },

  btnPrimary: {
    background: T.black,
    color: T.white,
    border: "none",
    borderRadius: "4px",
    padding: "9px 18px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    letterSpacing: "0.03em",
    textTransform: "uppercase",
    transition: "background 0.12s",
  },
  btnSecondary: {
    background: "transparent",
    color: T.gray600,
    border: `1px solid ${T.gray200}`,
    borderRadius: "4px",
    padding: "9px 18px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "12px",
    letterSpacing: "0.03em",
    textTransform: "uppercase",
    fontFamily: "inherit",
  },
  btnEdit: {
    background: "transparent",
    color: T.gray600,
    border: `1px solid ${T.gray200}`,
    borderRadius: "3px",
    padding: "5px 10px",
    fontSize: "11px",
    cursor: "pointer",
    transition: "all 0.1s",
  },
  btnDanger: {
    background: "transparent",
    color: T.red,
    border: `1px solid ${T.redMid}`,
    borderRadius: "3px",
    padding: "5px 10px",
    fontSize: "11px",
    cursor: "pointer",
  },
  btnGhost: {
    background: T.redLight,
    color: T.red,
    border: `1px solid ${T.redMid}`,
    borderRadius: "4px",
    padding: "9px 18px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "12px",
    letterSpacing: "0.03em",
    textTransform: "uppercase",
    fontFamily: "inherit",
  },

  card: {
    background: T.white,
    borderRadius: "6px",
    border: `1px solid ${T.gray100}`,
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "11px 16px",
    textAlign: "left",
    fontSize: "10px",
    fontWeight: 700,
    color: T.gray400,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    borderBottom: `1px solid ${T.gray100}`,
    background: T.gray50,
  },
  td: {
    padding: "13px 16px",
    fontSize: "13px",
    borderBottom: `1px solid ${T.gray50}`,
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(14,14,12,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px",
  },
  modal: {
    background: T.white,
    borderRadius: "8px",
    border: `1px solid ${T.gray100}`,
    padding: "32px",
    width: "100%",
    maxWidth: "620px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 24px 80px rgba(0,0,0,0.12)",
  },
  modalTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: T.black,
    marginBottom: "28px",
    letterSpacing: "-0.01em",
    paddingBottom: "16px",
    borderBottom: `1px solid ${T.gray100}`,
  },
  modalSection: {
    fontSize: "10px",
    color: T.gray400,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    margin: "20px 0 12px",
    paddingBottom: "6px",
    borderBottom: `1px solid ${T.gray100}`,
  },
  formGrid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  formGrid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "14px",
  },
  formGrid4: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: "14px",
  },
  formGroup: { marginBottom: "14px" },
  label: {
    display: "block",
    fontSize: "10px",
    color: T.gray600,
    fontWeight: 700,
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  input: {
    width: "100%",
    background: T.white,
    border: `1px solid ${T.gray200}`,
    borderRadius: "4px",
    padding: "9px 11px",
    color: T.black,
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border 0.1s",
  },
  select: {
    width: "100%",
    background: T.white,
    border: `1px solid ${T.gray200}`,
    borderRadius: "4px",
    padding: "9px 11px",
    color: T.black,
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  modalActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "28px",
    paddingTop: "20px",
    borderTop: `1px solid ${T.gray100}`,
  },

  calcGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1px",
    background: T.gray100,
    border: `1px solid ${T.gray100}`,
    borderRadius: "4px",
    overflow: "hidden",
    marginTop: "4px",
  },
  calcCell: { background: T.gray50, padding: "12px 14px" },
  calcVal: { fontSize: "16px", fontWeight: 700, color: T.black, lineHeight: 1 },
  calcSub: {
    fontSize: "10px",
    color: T.gray400,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginTop: "4px",
  },

  badge: (c) => ({
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "2px",
    fontSize: "10px",
    fontWeight: 700,
    background: c + "15",
    color: c,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  }),
  redBadge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "2px",
    fontSize: "10px",
    fontWeight: 700,
    background: T.redLight,
    color: T.red,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  activeBadge: (a) => ({
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "2px",
    fontSize: "10px",
    fontWeight: 700,
    background: a ? "#edf7f0" : T.redLight,
    color: a ? "#1a7a45" : T.red,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  }),
  infoBox: {
    background: T.gray50,
    borderRadius: "4px",
    padding: "10px 14px",
    fontSize: "12px",
    color: T.gray600,
    borderLeft: `3px solid ${T.gray200}`,
  },
  count: {
    marginTop: "12px",
    fontSize: "11px",
    color: T.gray400,
    letterSpacing: "0.03em",
  },
};

// ════════════════════════════════════════════════════════════════
// MODAL — Produit (nouveau système)
// ════════════════════════════════════════════════════════════════
function ProduitModal({ produit, familles, onClose, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(produit || EMPTY_PRODUIT);
  const [loading, setLoading] = useState(false);
  const isEdit = !!produit?.id;
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));
  const calc = calcConditionnement(form);
  const hasWeight = parseFloat(form.poidsUnitaireKg) > 0;
  const hasPrice = parseFloat(form.prixUnitaireDZD) > 0;

  const handleSubmit = async () => {
    if (!form.sku || !form.nom || !form.famille)
      return toast.error("SKU, nom et famille requis");
    setLoading(true);
    try {
      isEdit
        ? await api.put(`/stock/produits/${produit.id}`, form)
        : await api.post("/stock/produits", form);
      toast.success(isEdit ? "Produit mis à jour" : "Produit créé");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalTitle}>
          {isEdit ? "Modifier le produit" : "Nouveau produit"}
        </div>

        {/* Identification */}
        <div style={S.modalSection}>Identification</div>
        <div style={S.formGrid2}>
          <div style={S.formGroup}>
            <label style={S.label}>SKU *</label>
            <input
              style={S.input}
              value={form.sku}
              onChange={set("sku")}
              placeholder="HUI-FLE-1L"
            />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Famille *</label>
            <select
              style={S.select}
              value={form.famille}
              onChange={set("famille")}
            >
              <option value="">— Sélectionner —</option>
              {familles.map((f) => (
                <option key={f.code || f} value={f.code || f}>
                  {f.nom || f}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Désignation complète *</label>
          <input
            style={S.input}
            value={form.nom}
            onChange={set("nom")}
            placeholder="Huile Fleurial Tournesol 1L"
          />
        </div>
        <div style={S.formGrid2}>
          <div style={S.formGroup}>
            <label style={S.label}>Marque</label>
            <input
              style={S.input}
              value={form.marque || ""}
              onChange={set("marque")}
              placeholder="Fleurial"
            />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Description</label>
            <input
              style={S.input}
              value={form.description || ""}
              onChange={set("description")}
              placeholder="Optionnel"
            />
          </div>
        </div>

        {/* Nomenclature conditionnement */}
        <div style={S.modalSection}>Nomenclature & conditionnement</div>
        <div style={S.infoBox} style={{ ...S.infoBox, marginBottom: "14px" }}>
          Définissez la hiérarchie logistique : unité de base, puis les
          coefficients de groupage à chaque niveau. Toutes les valeurs dérivées
          sont calculées automatiquement.
        </div>

        <div style={S.formGrid2}>
          <div style={S.formGroup}>
            <label style={S.label}>Unité de base</label>
            <select
              style={S.select}
              value={form.uniteBase}
              onChange={set("uniteBase")}
            >
              {[
                "bouteille",
                "sachet",
                "boîte",
                "bidon",
                "unité",
                "kg",
                "litre",
              ].map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Poids unitaire (kg)</label>
            <input
              style={S.input}
              type="number"
              value={form.poidsUnitaireKg || ""}
              onChange={set("poidsUnitaireKg")}
              step="0.001"
              placeholder="1.050"
            />
          </div>
        </div>

        <div style={S.formGrid3}>
          <div style={S.formGroup}>
            <label style={S.label}>Coef. boite</label>
            <input
              style={S.input}
              type="number"
              value={form.coefParBoite}
              onChange={set("coefParBoite")}
              min="1"
              placeholder="12"
            />
            <div
              style={{ fontSize: "10px", color: T.gray400, marginTop: "4px" }}
            >
              {form.uniteBase || "unités"} par boite
            </div>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Coef. carton</label>
            <input
              style={S.input}
              type="number"
              value={form.coefBoiteParCarton}
              onChange={set("coefBoiteParCarton")}
              min="1"
              placeholder="4"
            />
            <div
              style={{ fontSize: "10px", color: T.gray400, marginTop: "4px" }}
            >
              boites par carton
            </div>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Coef. palette</label>
            <input
              style={S.input}
              type="number"
              value={form.coefCartonParPalette}
              onChange={set("coefCartonParPalette")}
              min="1"
              placeholder="50"
            />
            <div
              style={{ fontSize: "10px", color: T.gray400, marginTop: "4px" }}
            >
              cartons par palette
            </div>
          </div>
        </div>

        {/* Résumé calculé */}
        <div style={S.modalSection}>Synthèse calculée</div>
        <div style={S.calcGrid}>
          <div style={S.calcCell}>
            <div style={S.calcVal}>{calc.uniteParCarton}</div>
            <div style={S.calcSub}>unités / carton</div>
          </div>
          <div style={S.calcCell}>
            <div style={S.calcVal}>{calc.uniteParPalette}</div>
            <div style={S.calcSub}>unités / palette</div>
          </div>
          <div style={{ ...S.calcCell, opacity: hasWeight ? 1 : 0.4 }}>
            <div style={S.calcVal}>
              {hasWeight ? calc.poidsCarton.toFixed(2) + " kg" : "—"}
            </div>
            <div style={S.calcSub}>poids carton</div>
          </div>
          <div style={{ ...S.calcCell, opacity: hasWeight ? 1 : 0.4 }}>
            <div style={S.calcVal}>
              {hasWeight ? calc.poidsPalette.toFixed(0) + " kg" : "—"}
            </div>
            <div style={S.calcSub}>poids palette</div>
          </div>
          <div style={{ ...S.calcCell, opacity: hasWeight ? 1 : 0.4 }}>
            <div style={S.calcVal}>
              {hasWeight ? calc.cartonsParCamion : "—"}
            </div>
            <div style={S.calcSub}>cartons / 24T</div>
          </div>
          <div style={{ ...S.calcCell, opacity: hasPrice ? 1 : 0.4 }}>
            <div style={S.calcVal}>
              {hasPrice ? calc.prixBoite.toLocaleString() : "—"}
            </div>
            <div style={S.calcSub}>prix boite (DZD)</div>
          </div>
          <div style={{ ...S.calcCell, opacity: hasPrice ? 1 : 0.4 }}>
            <div style={S.calcVal}>
              {hasPrice ? calc.prixCarton.toLocaleString() : "—"}
            </div>
            <div style={S.calcSub}>prix carton (DZD)</div>
          </div>
          <div style={{ ...S.calcCell, opacity: hasPrice ? 1 : 0.4 }}>
            <div style={S.calcVal}>
              {hasPrice ? calc.prixPalette.toLocaleString() : "—"}
            </div>
            <div style={S.calcSub}>prix palette (DZD)</div>
          </div>
        </div>

        {/* Tarification */}
        <div style={S.modalSection}>Tarification</div>
        <div style={{ ...S.formGrid2, maxWidth: "300px" }}>
          <div style={S.formGroup}>
            <label style={S.label}>Prix unitaire (DZD)</label>
            <input
              style={S.input}
              type="number"
              value={form.prixUnitaireDZD}
              onChange={set("prixUnitaireDZD")}
              min="0"
            />
          </div>
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
            {loading ? "..." : isEdit ? "Mettre à jour" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}
function SeuilModal({ seuil, produits, clrs, onClose, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(
    seuil || {
      produitId: "",
      clrId: "",
      seuilMinimum: "",
      seuilOptimal: "",
      seuilWarning: "",
    },
  );
  const [loading, setLoading] = useState(false);
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.produitId || !form.seuilMinimum || !form.seuilOptimal)
      return toast.error("Produit, minimum et optimal requis");
    setLoading(true);
    try {
      await api.put("/stock/seuils", {
        produitId: parseInt(form.produitId),
        clrId: form.clrId ? parseInt(form.clrId) : null,
        seuilMinimum: parseFloat(form.seuilMinimum),
        seuilOptimal: parseFloat(form.seuilOptimal),
        seuilWarning: form.seuilWarning ? parseFloat(form.seuilWarning) : null,
      });
      toast.success("Seuil enregistré");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalTitle}>
          <i
            className="fa-solid fa-bell"
            style={{ color: "#f59e0b", marginRight: "10px" }}
          />
          {seuil?.id ? "Modifier" : "Nouveau seuil"}
        </div>

        <div style={S.formGroup}>
          <label style={S.label}>Produit *</label>
          <select
            style={S.select}
            value={form.produitId}
            onChange={set("produitId")}
          >
            <option value="">— Sélectionner —</option>
            {produits.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} — {p.nom}
              </option>
            ))}
          </select>
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>CLR (vide = global)</label>
          <select
            style={S.select}
            value={form.clrId || ""}
            onChange={set("clrId")}
          >
            <option value="">— Global (tous CLR) —</option>
            {clrs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.nom}
              </option>
            ))}
          </select>
        </div>
        <div style={S.formGrid}>
          <div style={S.formGroup}>
            <label style={S.label}>Minimum *</label>
            <input
              style={S.input}
              type="number"
              value={form.seuilMinimum}
              onChange={set("seuilMinimum")}
              placeholder="50"
            />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Warning (auto si vide)</label>
            <input
              style={S.input}
              type="number"
              value={form.seuilWarning || ""}
              onChange={set("seuilWarning")}
              placeholder="Auto"
            />
          </div>
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Optimal *</label>
          <input
            style={S.input}
            type="number"
            value={form.seuilOptimal}
            onChange={set("seuilOptimal")}
            placeholder="200"
          />
        </div>
        <div style={S.infoBox}>
          <i
            className="fa-solid fa-circle-info"
            style={{ color: "#3b82f6", marginRight: "6px" }}
          />
          Warning auto = (minimum + optimal) / 2
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
              <i className="fa-solid fa-check" />
            )}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MODAL — CLR
// ════════════════════════════════════════════════════════════════
function CLRModal({ clr, plateformes, onClose, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(clr || EMPTY_CLR);
  const [loading, setLoading] = useState(false);
  const isEdit = !!clr?.id;
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.code || !form.nom || !form.wilaya || !form.region)
      return toast.error("Code, nom, wilaya et région requis");
    setLoading(true);
    try {
      isEdit
        ? await api.put(`/infrastructure/clrs/${clr.id}`, form)
        : await api.post("/infrastructure/clrs", form);
      toast.success(isEdit ? "CLR mis à jour" : "CLR créé");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalTitle}>
          {isEdit ? "Modifier le CLR" : "Nouveau CLR"}
        </div>
        <div style={S.formGrid2}>
          <div style={S.formGroup}>
            <label style={S.label}>Code *</label>
            <input
              style={S.input}
              value={form.code}
              onChange={set("code")}
              placeholder="R19"
            />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Région *</label>
            <select
              style={S.select}
              value={form.region}
              onChange={set("region")}
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Nom *</label>
          <input
            style={S.input}
            value={form.nom}
            onChange={set("nom")}
            placeholder="CLR Sétif"
          />
        </div>
        <div style={S.formGrid2}>
          <div style={S.formGroup}>
            <label style={S.label}>Wilaya *</label>
            <input
              style={S.input}
              value={form.wilaya}
              onChange={set("wilaya")}
              placeholder="Sétif"
            />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Plateforme rattachée</label>
            <select
              style={S.select}
              value={form.plateformeId || ""}
              onChange={set("plateformeId")}
            >
              <option value="">— Aucune —</option>
              {plateformes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Adresse</label>
          <input
            style={S.input}
            value={form.adresse || ""}
            onChange={set("adresse")}
            placeholder="Zone industrielle..."
          />
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
            {loading ? "..." : isEdit ? "Mettre à jour" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MODAL — Plateforme
// ════════════════════════════════════════════════════════════════
function PlateformeModal({ plateforme, onClose, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(plateforme || EMPTY_PLF);
  const [loading, setLoading] = useState(false);
  const isEdit = !!plateforme?.id;
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.nom || !form.ville || !form.region)
      return toast.error("Nom, ville et région requis");
    setLoading(true);
    try {
      isEdit
        ? await api.put(`/infrastructure/plateformes/${plateforme.id}`, form)
        : await api.post("/infrastructure/plateformes", form);
      toast.success(isEdit ? "Plateforme mise à jour" : "Plateforme créée");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalTitle}>
          {isEdit ? "Modifier la plateforme" : "Nouvelle plateforme"}
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Nom *</label>
          <input
            style={S.input}
            value={form.nom}
            onChange={set("nom")}
            placeholder="Plateforme Est"
          />
        </div>
        <div style={S.formGrid2}>
          <div style={S.formGroup}>
            <label style={S.label}>Ville *</label>
            <input
              style={S.input}
              value={form.ville}
              onChange={set("ville")}
              placeholder="Constantine"
            />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Région *</label>
            <select
              style={S.select}
              value={form.region}
              onChange={set("region")}
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Capacité (palettes)</label>
          <input
            style={S.input}
            type="number"
            value={form.capacite}
            onChange={set("capacite")}
            min="1"
          />
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
            {loading ? "..." : isEdit ? "Mettre à jour" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ONGLET — Produits
// ════════════════════════════════════════════════════════════════
function OngletProduits() {
  const { toast } = useToast();
  const [produits, setProduits] = useState([]);
  const [familles, setFamilles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtreFamille, setFiltreFamille] = useState("");
  const [modal, setModal] = useState(null);
  const [showFamilleModal, setShowFamilleModal] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/stock/produits");

      setProduits(r.data);

      const famillesUniques = [
        ...new Set(r.data.map((p) => p.famille).filter(Boolean)),
      ];

      setFamilles(
        famillesUniques.map((f) => ({
          code: f,
          nom: f,
        })),
      );
    } catch {
      toast.error("Erreur chargement produits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (p) => {
    if (!window.confirm(`Désactiver "${p.nom}" ?`)) return;
    try {
      await api.delete(`/stock/produits/${p.id}`);
      toast.success("Produit désactivé");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  const filtered = produits.filter((p) => {
    const ms =
      !search ||
      `${p.nom} ${p.sku} ${p.marque || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const mf = !filtreFamille || p.famille === filtreFamille;
    return ms && mf;
  });

  return (
    <>
      {modal && (
        <ProduitModal
          produit={modal === "new" ? null : modal}
          familles={familles}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}

      <div style={S.toolbar}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            style={S.search}
            placeholder="Rechercher SKU, nom, marque..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={{ ...S.search, width: "160px" }}
            value={filtreFamille}
            onChange={(e) => setFiltreFamille(e.target.value)}
          >
            <option value="">Toutes familles</option>
            {familles.map((f) => (
              <option key={f.code || f} value={f.code || f}>
                {f.nom || f}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button style={S.btnPrimary} onClick={() => setModal("new")}>
            + Nouveau produit
          </button>
        </div>
      </div>

      <div style={S.card}>
        {loading ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: T.gray400,
              fontSize: "13px",
            }}
          >
            Chargement...
          </div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                {[
                  "SKU",
                  "Désignation",
                  "Famille",
                  "Marque",
                  "Conditionnement",
                  "Poids carton",
                  "Poids palette",
                  "Prix unitaire",
                  "Statut",
                  "",
                ].map((h) => (
                  <th key={h} style={S.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      ...S.td,
                      textAlign: "center",
                      color: T.gray400,
                      padding: "48px",
                    }}
                  >
                    Aucun produit
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const calc = calcConditionnement(p);
                  return (
                    <tr key={p.id} style={{ background: T.white }}>
                      <td
                        style={{
                          ...S.td,
                          fontFamily: "monospace",
                          fontSize: "12px",
                          color: T.gray600,
                        }}
                      >
                        {p.sku}
                      </td>
                      <td style={{ ...S.td, fontWeight: 600, color: T.black }}>
                        {p.nom}
                      </td>
                      <td style={S.td}>
                        <span style={S.badge(T.red)}>{p.famille}</span>
                      </td>
                      <td style={{ ...S.td, color: T.gray600 }}>
                        {p.marque || "—"}
                      </td>
                      <td
                        style={{ ...S.td, color: T.gray600, fontSize: "12px" }}
                      >
                        {p.coefParBoite}×{p.coefBoiteParCarton}×
                        {p.coefCartonParPalette}
                        <span style={{ color: T.gray400 }}>
                          {" "}
                          = {calc.uniteParPalette} u/plt
                        </span>
                      </td>
                      <td
                        style={{
                          ...S.td,
                          color: p.poidsUnitaireKg ? T.gray800 : T.gray200,
                        }}
                      >
                        {p.poidsUnitaireKg
                          ? `${calc.poidsCarton.toFixed(2)} kg`
                          : "—"}
                      </td>
                      <td
                        style={{
                          ...S.td,
                          color: p.poidsUnitaireKg ? T.gray800 : T.gray200,
                        }}
                      >
                        {p.poidsUnitaireKg
                          ? `${calc.poidsPalette.toFixed(0)} kg`
                          : "—"}
                      </td>
                      <td style={{ ...S.td, color: T.gray600 }}>
                        {p.prixUnitaireDZD
                          ? `${p.prixUnitaireDZD.toLocaleString()} DZD`
                          : "—"}
                      </td>
                      <td style={S.td}>
                        <span style={S.activeBadge(p.actif)}>
                          {p.actif ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td style={S.td}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button style={S.btnEdit} onClick={() => setModal(p)}>
                            Modifier
                          </button>
                          <button
                            style={S.btnDanger}
                            onClick={() => handleDelete(p)}
                          >
                            Désactiver
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
      <div style={S.count}>
        {filtered.length} produit{filtered.length !== 1 ? "s" : ""}{" "}
        &nbsp;·&nbsp;
        {produits.filter((p) => p.actif).length} actifs
      </div>
    </>
  );
}
function OngletSeuils() {
  const { toast } = useToast();
  const [seuils, setSeuils] = useState([]);
  const [produits, setProduits] = useState([]);
  const [clrs, setClrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [s, p, c] = await Promise.all([
        api.get("/stock/seuils"),
        api.get("/stock/produits"),
        api.get("/infrastructure/clrs"),
      ]);
      setSeuils(s.data);
      setProduits(p.data);
      setClrs(c.data);
    } catch {
      toast.error("Erreur chargement");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (s) => {
    if (!window.confirm("Supprimer ce seuil ?")) return;
    try {
      await api.delete(`/stock/seuils/${s.id}`);
      toast.success("Seuil supprimé");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  const filtered = seuils.filter((s) => {
    if (!search) return true;
    return `${s.produit?.nom || ""} ${s.produit?.sku || ""} ${s.clr?.nom || ""}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const wCalc = (s) =>
    s.seuilWarning || ((s.seuilMinimum + s.seuilOptimal) / 2).toFixed(0);

  return (
    <>
      {modal && (
        <SeuilModal
          seuil={modal === "new" ? null : modal}
          produits={produits}
          clrs={clrs}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
      <div style={S.toolbar}>
        <input
          style={S.search}
          placeholder="🔍 Produit, CLR…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button style={S.btnPrimary} onClick={() => setModal("new")}>
          <i className="fa-solid fa-plus" /> Nouveau seuil
        </button>
      </div>
      <div style={S.card}>
        {loading ? (
          <div
            style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}
          >
            <i
              className="fa-solid fa-circle-notch fa-spin"
              style={{
                fontSize: "24px",
                display: "block",
                marginBottom: "12px",
              }}
            />
            Chargement…
          </div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                {[
                  "Produit",
                  "SKU",
                  "CLR",
                  "Minimum",
                  "Warning",
                  "Optimal",
                  "Actions",
                ].map((h) => (
                  <th key={h} style={S.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      ...S.td,
                      textAlign: "center",
                      color: "#6b7280",
                      padding: "40px",
                    }}
                  >
                    Aucun seuil défini
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id}>
                    <td style={{ ...S.td, fontWeight: 600 }}>
                      {s.produit?.nom || "—"}
                    </td>
                    <td
                      style={{
                        ...S.td,
                        fontFamily: "monospace",
                        fontSize: "12px",
                        color: T.gray600,
                      }}
                    >
                      {s.produit?.sku || "—"}
                    </td>
                    <td style={{ ...S.td, color: T.gray600 }}>
                      {" "}
                      {s.clr ? (
                        <>
                          <span style={{ color: T.black, fontWeight: 600 }}>
                            {s.clr.code}
                          </span>{" "}
                          — {s.clr.nom}
                        </>
                      ) : (
                        <span style={{ color: T.gray400, fontStyle: "italic" }}>
                          Global
                        </span>
                      )}
                    </td>
                    <td style={S.td}>
                      <span style={S.badge("#ef4444")}>{s.seuilMinimum} u</span>
                    </td>
                    <td style={S.td}>
                      <span style={S.badge("#f59e0b")}>{wCalc(s)} u</span>
                    </td>
                    <td style={S.td}>
                      <span style={S.badge("#10b981")}>{s.seuilOptimal} u</span>
                    </td>
                    <td style={S.td}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button style={S.btnEdit} onClick={() => setModal(s)}>
                          <i className="fa-solid fa-pen" />
                        </button>
                        <button
                          style={S.btnDanger}
                          onClick={() => handleDelete(s)}
                        >
                          <i className="fa-solid fa-trash" />
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
      <div style={{ marginTop: "12px", fontSize: "12px", color: "#4b5563" }}>
        {filtered.length} seuil{filtered.length !== 1 ? "s" : ""} configuré
        {filtered.length !== 1 ? "s" : ""}
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════
// ONGLET — CLR
// ════════════════════════════════════════════════════════════════
function OngletCLR() {
  const { toast } = useToast();
  const [clrs, setClrs] = useState([]);
  const [plateformes, setPlateformes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [filtreRegion, setFiltreRegion] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([
        api.get("/infrastructure/clrs"),
        api.get("/infrastructure/plateformes"),
      ]);
      setClrs(c.data);
      setPlateformes(p.data);
    } catch {
      toast.error("Erreur chargement CLR");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (c) => {
    if (!window.confirm(`Désactiver le CLR "${c.nom}" ?`)) return;
    try {
      await api.delete(`/infrastructure/clrs/${c.id}`);
      toast.success("CLR désactivé");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  const filtered = clrs.filter((c) => {
    const ms =
      !search ||
      `${c.code} ${c.nom} ${c.wilaya}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const mr = !filtreRegion || c.region === filtreRegion;
    return ms && mr;
  });

  return (
    <>
      {modal && (
        <CLRModal
          clr={modal === "new" ? null : modal}
          plateformes={plateformes}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
      <div style={S.toolbar}>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            style={S.search}
            placeholder="Code, nom, wilaya..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={{ ...S.search, width: "140px" }}
            value={filtreRegion}
            onChange={(e) => setFiltreRegion(e.target.value)}
          >
            <option value="">Toutes régions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <button style={S.btnPrimary} onClick={() => setModal("new")}>
          + Nouveau CLR
        </button>
      </div>

      <div style={S.card}>
        {loading ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: T.gray400,
              fontSize: "13px",
            }}
          >
            Chargement...
          </div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                {[
                  "Code",
                  "Nom",
                  "Wilaya",
                  "Région",
                  "Plateforme",
                  "Adresse",
                  "Statut",
                  "",
                ].map((h) => (
                  <th key={h} style={S.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      ...S.td,
                      textAlign: "center",
                      color: T.gray400,
                      padding: "48px",
                    }}
                  >
                    Aucun CLR
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const rc = REGION_COLORS[c.region] || T.gray600;
                  return (
                    <tr key={c.id}>
                      <td
                        style={{
                          ...S.td,
                          fontFamily: "monospace",
                          fontWeight: 700,
                          color: T.black,
                        }}
                      >
                        {c.code}
                      </td>
                      <td style={{ ...S.td, fontWeight: 600, color: T.black }}>
                        {c.nom}
                      </td>
                      <td style={{ ...S.td, color: T.gray600 }}>{c.wilaya}</td>
                      <td style={S.td}>
                        <span style={S.badge(rc)}>{c.region}</span>
                      </td>
                      <td
                        style={{ ...S.td, color: T.gray600, fontSize: "12px" }}
                      >
                        {c.plateforme?.nom || "—"}
                      </td>
                      <td
                        style={{ ...S.td, color: T.gray400, fontSize: "12px" }}
                      >
                        {c.adresse || "—"}
                      </td>
                      <td style={S.td}>
                        <span style={S.activeBadge(c.actif)}>
                          {c.actif ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td style={S.td}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button style={S.btnEdit} onClick={() => setModal(c)}>
                            Modifier
                          </button>
                          <button
                            style={S.btnDanger}
                            onClick={() => handleDelete(c)}
                          >
                            Désactiver
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
      <div style={S.count}>
        {filtered.length} CLR &nbsp;·&nbsp; {clrs.filter((c) => c.actif).length}{" "}
        actifs
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════
// ONGLET — Plateformes
// ════════════════════════════════════════════════════════════════
function OngletPlateformes() {
  const { toast } = useToast();
  const [plateformes, setPlateformes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/infrastructure/plateformes");
      setPlateformes(r.data);
    } catch {
      toast.error("Erreur chargement plateformes");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  return (
    <>
      {modal && (
        <PlateformeModal
          plateforme={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
      <div style={S.toolbar}>
        <span
          style={{
            fontSize: "12px",
            color: T.gray400,
            letterSpacing: "0.03em",
          }}
        >
          {plateformes.length} plateforme{plateformes.length !== 1 ? "s" : ""}{" "}
          logistique{plateformes.length !== 1 ? "s" : ""}
        </span>
        <button style={S.btnPrimary} onClick={() => setModal("new")}>
          + Nouvelle plateforme
        </button>
      </div>

      <div style={S.card}>
        {loading ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: T.gray400,
              fontSize: "13px",
            }}
          >
            Chargement...
          </div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                {[
                  "Nom",
                  "Ville",
                  "Région",
                  "Capacité (palettes)",
                  "CLR rattachés",
                  "",
                ].map((h) => (
                  <th key={h} style={S.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plateformes.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      ...S.td,
                      textAlign: "center",
                      color: T.gray400,
                      padding: "48px",
                    }}
                  >
                    Aucune plateforme
                  </td>
                </tr>
              ) : (
                plateformes.map((p) => {
                  const rc = REGION_COLORS[p.region] || T.gray600;
                  return (
                    <tr key={p.id}>
                      <td style={{ ...S.td, fontWeight: 700, color: T.black }}>
                        {p.nom}
                      </td>
                      <td style={{ ...S.td, color: T.gray600 }}>{p.ville}</td>
                      <td style={S.td}>
                        <span style={S.badge(rc)}>{p.region}</span>
                      </td>
                      <td style={{ ...S.td, fontWeight: 600, color: T.black }}>
                        {(p.capacite || 0).toLocaleString()}
                      </td>
                      <td style={{ ...S.td, color: T.gray600 }}>
                        {p.clrs?.length || 0} CLR
                      </td>
                      <td style={S.td}>
                        <button style={S.btnEdit} onClick={() => setModal(p)}>
                          Modifier
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════
export default function DataManager() {
  const [onglet, setOnglet] = useState("produits");

  const ONGLETS = [
    { key: "produits", label: "Produits" },
    { key: "seuils", icon: "fa-bell", label: "Seuils d'alerte" },

    { key: "clrs", label: "CLR" },
    { key: "plateformes", label: "Plateformes" },
  ];

  return (
    <div style={S.page}>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div style={S.header}>
        <h1 style={S.title}>Données de base</h1>
        <p style={S.sub}>Catalogue produits, CLR et plateformes logistiques</p>
        <p style={S.sub}>
          Catalogue produits, seuils d'alerte, CLR et plateformes logistiques
        </p>
      </div>

      <div style={S.tabs}>
        {ONGLETS.map((o) => (
          <button
            key={o.key}
            style={S.tab(onglet === o.key)}
            onClick={() => setOnglet(o.key)}
          >
            {o.label}
          </button>
        ))}
      </div>

      {onglet === "produits" && <OngletProduits />}
      {onglet === "seuils" && <OngletSeuils />}

      {onglet === "clrs" && <OngletCLR />}
      {onglet === "plateformes" && <OngletPlateformes />}
    </div>
  );
}
