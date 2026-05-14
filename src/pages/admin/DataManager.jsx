// pages/admin/DataManager.jsx — Sprint 9
// Gestion des données de base : Produits + Seuils + CLR + Plateformes
// Routes backend :
//   GET/POST/PUT/DELETE /api/stock/produits
//   GET/PUT/DELETE      /api/stock/seuils
//   GET/POST/PUT/DELETE /api/infrastructure/clrs
//   GET/POST/PUT        /api/infrastructure/plateformes

import { useState, useEffect } from "react";
import api from "../../utils/api";
import { useToast } from "../../context/ToastContext";

// ─── Constantes ───────────────────────────────────────────────────────────────
const FAMILLES = [
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
const FAMILLE_COLORS = {
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
  PALETTE: "#64748b",
  AUTRE: "#6b7280",
};
const REGION_COLORS = { EST: "#ef4444", CENTRE: "#3b82f6", OUEST: "#10b981" };
const EMPTY_PRODUIT = {
  sku: "",
  nom: "",
  famille: "HUILE",
  marque: "",
  unite: "carton",
  qteParCarton: 1,
  poidsKg: "",
  prixUnitaireDZD: 0,
  qteParPalette: 50,
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

// ─── Calculs automatiques conditionnement ─────────────────────────────────────
function calculs(p) {
  const poids = parseFloat(p.poidsKg) || 0;
  const parCarton = parseFloat(p.qteParCarton) || 1;
  const parPalette = parseFloat(p.qteParPalette) || 50;
  const poidsCarton = poids * parCarton;
  const poidsPalette = poidsCarton * parPalette;
  const cartonsParCamion =
    poidsCarton > 0 ? Math.floor(24000 / poidsCarton) : 0;
  return { poidsCarton, poidsPalette, cartonsParCamion };
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page: {
    padding: "32px",
    color: "#e5e7eb",
    minHeight: "100vh",
    background: "#0f1117",
  },
  header: { marginBottom: "32px" },
  title: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#fff",
    margin: 0,
    letterSpacing: "-0.03em",
  },
  sub: { color: "#6b7280", marginTop: "6px", fontSize: "14px" },

  tabs: {
    display: "flex",
    gap: "4px",
    marginBottom: "28px",
    borderBottom: "1px solid #1f2937",
  },
  tab: (a) => ({
    padding: "10px 20px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: "transparent",
    color: a ? "#3b82f6" : "#6b7280",
    borderBottom: a ? "2px solid #3b82f6" : "2px solid transparent",
    marginBottom: "-1px",
    transition: "all 0.15s",
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
    background: "#181c27",
    border: "1px solid #2d3748",
    borderRadius: "8px",
    padding: "9px 14px",
    color: "#fff",
    fontSize: "13px",
    outline: "none",
    width: "260px",
  },

  btnPrimary: {
    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "9px 18px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  btnSecondary: {
    background: "transparent",
    color: "#9ca3af",
    border: "1px solid #2d3748",
    borderRadius: "8px",
    padding: "9px 18px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "13px",
  },
  btnEdit: {
    background: "transparent",
    color: "#3b82f6",
    border: "1px solid #3b82f633",
    borderRadius: "6px",
    padding: "5px 10px",
    fontSize: "12px",
    cursor: "pointer",
  },
  btnDanger: {
    background: "transparent",
    color: "#ef4444",
    border: "1px solid #ef444433",
    borderRadius: "6px",
    padding: "5px 10px",
    fontSize: "12px",
    cursor: "pointer",
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
    fontSize: "11px",
    fontWeight: 700,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderBottom: "1px solid #2d3748",
    background: "#0f1117",
  },
  td: {
    padding: "13px 16px",
    fontSize: "13px",
    borderBottom: "1px solid #1f2937",
  },

  calcBox: {
    background: "#0f1117",
    borderRadius: "8px",
    padding: "12px 16px",
    marginTop: "8px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "12px",
  },
  calcItem: { textAlign: "center" },
  calcVal: { fontSize: "18px", fontWeight: 800, color: "#3b82f6" },
  calcLbl: {
    fontSize: "10px",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginTop: "2px",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
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
    maxWidth: "560px",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#fff",
    marginBottom: "24px",
  },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  formGroup: { marginBottom: "14px" },
  label: {
    display: "block",
    fontSize: "11px",
    color: "#9ca3af",
    fontWeight: 700,
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  input: {
    width: "100%",
    background: "#0f1117",
    border: "1px solid #2d3748",
    borderRadius: "8px",
    padding: "10px 12px",
    color: "#fff",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    background: "#0f1117",
    border: "1px solid #2d3748",
    borderRadius: "8px",
    padding: "10px 12px",
    color: "#fff",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
  },
  modalActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "24px",
  },

  badge: (c) => ({
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 700,
    background: c + "22",
    color: c,
  }),
  actifBadge: (a) => ({
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 700,
    background: a ? "#10b98122" : "#ef444422",
    color: a ? "#10b981" : "#ef4444",
  }),
  infoBox: {
    background: "#0f1117",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "12px",
    color: "#6b7280",
  },
};

// ════════════════════════════════════════════════════════════════
// MODALS
// ════════════════════════════════════════════════════════════════

function ProduitModal({ produit, onClose, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(produit || EMPTY_PRODUIT);
  const [loading, setLoading] = useState(false);
  const isEdit = !!produit?.id;
  const calc = calculs(form);
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

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
          <i
            className="fa-solid fa-box"
            style={{ color: "#3b82f6", marginRight: "10px" }}
          />
          {isEdit ? "Modifier" : "Nouveau produit"}
        </div>

        <div style={S.formGrid}>
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
              {FAMILLES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={S.formGroup}>
          <label style={S.label}>Nom complet *</label>
          <input
            style={S.input}
            value={form.nom}
            onChange={set("nom")}
            placeholder="Huile Fleurial Tournesol 1L"
          />
        </div>

        <div style={S.formGrid}>
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
            <label style={S.label}>Unité de stock</label>
            <select style={S.select} value={form.unite} onChange={set("unite")}>
              {["carton", "sac", "pack", "unité", "palette"].map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            fontSize: "11px",
            color: "#6b7280",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            margin: "4px 0 10px",
          }}
        >
          Conditionnement
        </div>
        <div style={S.formGrid}>
          <div style={S.formGroup}>
            <label style={S.label}>Unités / carton</label>
            <input
              style={S.input}
              type="number"
              value={form.qteParCarton}
              onChange={set("qteParCarton")}
              min="1"
            />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Poids unitaire (kg)</label>
            <input
              style={S.input}
              type="number"
              value={form.poidsKg || ""}
              onChange={set("poidsKg")}
              step="0.01"
              placeholder="1.05"
            />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Cartons / palette</label>
            <input
              style={S.input}
              type="number"
              value={form.qteParPalette}
              onChange={set("qteParPalette")}
              min="1"
            />
          </div>
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

        {parseFloat(form.poidsKg) > 0 && (
          <div style={S.calcBox}>
            <div style={S.calcItem}>
              <div style={S.calcVal}>{calc.poidsCarton.toFixed(2)} kg</div>
              <div style={S.calcLbl}>Poids / carton</div>
            </div>
            <div style={S.calcItem}>
              <div style={S.calcVal}>{calc.poidsPalette.toFixed(0)} kg</div>
              <div style={S.calcLbl}>Poids / palette</div>
            </div>
            <div style={S.calcItem}>
              <div style={S.calcVal}>{calc.cartonsParCamion}</div>
              <div style={S.calcLbl}>Cartons / camion 24T</div>
            </div>
          </div>
        )}

        <div style={{ ...S.formGroup, marginTop: "14px" }}>
          <label style={S.label}>Description</label>
          <input
            style={S.input}
            value={form.description || ""}
            onChange={set("description")}
            placeholder="Optionnel…"
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
            {loading ? (
              <i className="fa-solid fa-circle-notch fa-spin" />
            ) : (
              <i className="fa-solid fa-check" />
            )}
            {isEdit ? "Mettre à jour" : "Créer"}
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
          <i
            className="fa-solid fa-map-pin"
            style={{ color: "#10b981", marginRight: "10px" }}
          />
          {isEdit ? "Modifier le CLR" : "Nouveau CLR"}
        </div>

        <div style={S.formGrid}>
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
        <div style={S.formGrid}>
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
            placeholder="Zone industrielle…"
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
            {loading ? (
              <i className="fa-solid fa-circle-notch fa-spin" />
            ) : (
              <i className="fa-solid fa-check" />
            )}
            {isEdit ? "Mettre à jour" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}

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
          <i
            className="fa-solid fa-warehouse"
            style={{ color: "#8b5cf6", marginRight: "10px" }}
          />
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
        <div style={S.formGrid}>
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
            {loading ? (
              <i className="fa-solid fa-circle-notch fa-spin" />
            ) : (
              <i className="fa-solid fa-check" />
            )}
            {isEdit ? "Mettre à jour" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ONGLETS
// ════════════════════════════════════════════════════════════════

function OngletProduits() {
  const { toast } = useToast();
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtreFamille, setFiltreFamille] = useState("");
  const [modal, setModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/stock/produits");
      setProduits(r.data);
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
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
      <div style={S.toolbar}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            style={S.search}
            placeholder="🔍 SKU, nom, marque…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={{ ...S.search, width: "160px" }}
            value={filtreFamille}
            onChange={(e) => setFiltreFamille(e.target.value)}
          >
            <option value="">Toutes familles</option>
            {FAMILLES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <button style={S.btnPrimary} onClick={() => setModal("new")}>
          <i className="fa-solid fa-plus" /> Nouveau produit
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
                  "SKU",
                  "Nom",
                  "Famille",
                  "Marque",
                  "Conditionnement",
                  "Poids/carton",
                  "Poids/palette",
                  "Prix DZD",
                  "Statut",
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
                    colSpan={10}
                    style={{
                      ...S.td,
                      textAlign: "center",
                      color: "#6b7280",
                      padding: "40px",
                    }}
                  >
                    Aucun produit
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const calc = calculs(p);
                  const color = FAMILLE_COLORS[p.famille] || "#6b7280";
                  return (
                    <tr key={p.id}>
                      <td
                        style={{
                          ...S.td,
                          fontFamily: "monospace",
                          fontSize: "12px",
                          color: "#94a3b8",
                        }}
                      >
                        {p.sku}
                      </td>
                      <td style={{ ...S.td, fontWeight: 600, color: "#fff" }}>
                        {p.nom}
                      </td>
                      <td style={S.td}>
                        <span style={S.badge(color)}>{p.famille}</span>
                      </td>
                      <td style={{ ...S.td, color: "#9ca3af" }}>
                        {p.marque || "—"}
                      </td>
                      <td
                        style={{ ...S.td, color: "#9ca3af", fontSize: "12px" }}
                      >
                        {p.qteParCarton}u/ctn · {p.qteParPalette}ctn/plt
                      </td>
                      <td
                        style={{
                          ...S.td,
                          color: p.poidsKg ? "#e2e8f0" : "#4b5563",
                        }}
                      >
                        {p.poidsKg ? `${calc.poidsCarton.toFixed(2)} kg` : "—"}
                      </td>
                      <td
                        style={{
                          ...S.td,
                          color: p.poidsKg ? "#e2e8f0" : "#4b5563",
                        }}
                      >
                        {p.poidsKg ? `${calc.poidsPalette.toFixed(0)} kg` : "—"}
                      </td>
                      <td style={{ ...S.td, color: "#94a3b8" }}>
                        {p.prixUnitaireDZD
                          ? `${p.prixUnitaireDZD.toLocaleString()} DZD`
                          : "—"}
                      </td>
                      <td style={S.td}>
                        <span style={S.actifBadge(p.actif)}>
                          {p.actif ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td style={S.td}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button style={S.btnEdit} onClick={() => setModal(p)}>
                            <i className="fa-solid fa-pen" />
                          </button>
                          <button
                            style={S.btnDanger}
                            onClick={() => handleDelete(p)}
                          >
                            <i className="fa-solid fa-ban" />
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
      <div style={{ marginTop: "12px", fontSize: "12px", color: "#4b5563" }}>
        {filtered.length} produit{filtered.length !== 1 ? "s" : ""} ·{" "}
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
                    <td style={{ ...S.td, fontWeight: 600, color: "#fff" }}>
                      {s.produit?.nom || "—"}
                    </td>
                    <td
                      style={{
                        ...S.td,
                        fontFamily: "monospace",
                        fontSize: "12px",
                        color: "#94a3b8",
                      }}
                    >
                      {s.produit?.sku || "—"}
                    </td>
                    <td style={{ ...S.td, color: "#9ca3af" }}>
                      {s.clr ? (
                        <>
                          <span style={{ color: "#3b82f6", fontWeight: 600 }}>
                            {s.clr.code}
                          </span>{" "}
                          — {s.clr.nom}
                        </>
                      ) : (
                        <span style={{ color: "#6b7280", fontStyle: "italic" }}>
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
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            style={S.search}
            placeholder="🔍 Code, nom, wilaya…"
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
          <i className="fa-solid fa-plus" /> Nouveau CLR
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
                  "Code",
                  "Nom",
                  "Wilaya",
                  "Région",
                  "Plateforme",
                  "Adresse",
                  "Statut",
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
                    colSpan={8}
                    style={{
                      ...S.td,
                      textAlign: "center",
                      color: "#6b7280",
                      padding: "40px",
                    }}
                  >
                    Aucun CLR
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const rc = REGION_COLORS[c.region] || "#6b7280";
                  return (
                    <tr key={c.id}>
                      <td
                        style={{
                          ...S.td,
                          fontFamily: "monospace",
                          fontWeight: 700,
                          color: "#3b82f6",
                        }}
                      >
                        {c.code}
                      </td>
                      <td style={{ ...S.td, fontWeight: 600, color: "#fff" }}>
                        {c.nom}
                      </td>
                      <td style={{ ...S.td, color: "#9ca3af" }}>{c.wilaya}</td>
                      <td style={S.td}>
                        <span style={S.badge(rc)}>{c.region}</span>
                      </td>
                      <td
                        style={{ ...S.td, color: "#9ca3af", fontSize: "12px" }}
                      >
                        {c.plateforme?.nom || "—"}
                      </td>
                      <td
                        style={{ ...S.td, color: "#6b7280", fontSize: "12px" }}
                      >
                        {c.adresse || "—"}
                      </td>
                      <td style={S.td}>
                        <span style={S.actifBadge(c.actif)}>
                          {c.actif ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td style={S.td}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button style={S.btnEdit} onClick={() => setModal(c)}>
                            <i className="fa-solid fa-pen" />
                          </button>
                          <button
                            style={S.btnDanger}
                            onClick={() => handleDelete(c)}
                          >
                            <i className="fa-solid fa-ban" />
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
      <div style={{ marginTop: "12px", fontSize: "12px", color: "#4b5563" }}>
        {filtered.length} CLR · {clrs.filter((c) => c.actif).length} actifs
      </div>
    </>
  );
}

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
        <div style={{ fontSize: "13px", color: "#6b7280" }}>
          {plateformes.length} plateforme{plateformes.length !== 1 ? "s" : ""}{" "}
          logistique{plateformes.length !== 1 ? "s" : ""}
        </div>
        <button style={S.btnPrimary} onClick={() => setModal("new")}>
          <i className="fa-solid fa-plus" /> Nouvelle plateforme
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
                  "Nom",
                  "Ville",
                  "Région",
                  "Capacité (palettes)",
                  "CLR rattachés",
                  "Actions",
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
                      color: "#6b7280",
                      padding: "40px",
                    }}
                  >
                    Aucune plateforme
                  </td>
                </tr>
              ) : (
                plateformes.map((p) => {
                  const rc = REGION_COLORS[p.region] || "#6b7280";
                  return (
                    <tr key={p.id}>
                      <td style={{ ...S.td, fontWeight: 700, color: "#fff" }}>
                        {p.nom}
                      </td>
                      <td style={{ ...S.td, color: "#9ca3af" }}>{p.ville}</td>
                      <td style={S.td}>
                        <span style={S.badge(rc)}>{p.region}</span>
                      </td>
                      <td
                        style={{ ...S.td, color: "#3b82f6", fontWeight: 600 }}
                      >
                        {(p.capacite || 0).toLocaleString()}
                      </td>
                      <td style={{ ...S.td, color: "#9ca3af" }}>
                        {p.clrs?.length || 0} CLR
                      </td>
                      <td style={S.td}>
                        <button style={S.btnEdit} onClick={() => setModal(p)}>
                          <i className="fa-solid fa-pen" />
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
    { key: "produits", icon: "fa-box", label: "Produits" },
    { key: "seuils", icon: "fa-bell", label: "Seuils d'alerte" },
    { key: "clrs", icon: "fa-map-pin", label: "CLR" },
    { key: "plateformes", icon: "fa-warehouse", label: "Plateformes" },
  ];

  return (
    <div style={S.page}>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      <div style={S.header}>
        <h1 style={S.title}>
          <i
            className="fa-solid fa-database"
            style={{ color: "#3b82f6", marginRight: "12px" }}
          />
          Données de base
        </h1>
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
            <i
              className={`fa-solid ${o.icon}`}
              style={{ marginRight: "8px" }}
            />
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
