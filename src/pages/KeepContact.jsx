// pages/modules/KeepContact.jsx — Sprint 10
import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import { DS_STYLE, STATUS_CHIP } from "./ds";

const TABS = ["Import Excel", "Vérification", "Commande manuelle", "Commandes"];

const ITEM_VIDE = {
  sku: "",
  productName: "",
  quantity: "",
  conditionnement: "",
  quantitePLT: "",
  netAPayer: "",
  unit: "unité",
};

export default function KeepContact() {
  const [tab, setTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, planned: 0 });
  const fileRef = useRef();

  // Rapport vérification
  const [rapport, setRapport] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState("TOUS");

  // Formulaire commande manuelle
  const [manForm, setManForm] = useState({
    codeCommande: "",
    codeClient: "",
    date: "",
    clrCode: "",
    famille: "",
  });
  const [manItems, setManItems] = useState([{ ...ITEM_VIDE }]);
  const [manLoading, setManLoading] = useState(false);
  const [manResult, setManResult] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders");
      const list = Array.isArray(data) ? data : data.orders || [];
      setOrders(list);
      setStats({
        total: list.length,
        pending: list.filter((o) => o.status === "pending").length,
        planned: list.filter((o) => o.status === "planned").length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ── Import Excel ──────────────────────────────────────────────────────────
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    setRapport([]);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/keep-contact/import", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImportResult(data);
      if (data.rapport?.length > 0) {
        setRapport(data.rapport);
        setTab(1); // basculer automatiquement sur Vérification
      }
      fetchOrders();
    } catch (err) {
      setImportResult({
        ok: false,
        headerErrors: [err.response?.data?.message || "Erreur import"],
      });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // ── Commande manuelle ─────────────────────────────────────────────────────
  const addItem = () => setManItems([...manItems, { ...ITEM_VIDE }]);
  const removeItem = (i) => setManItems(manItems.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => {
    const next = [...manItems];
    next[i] = { ...next[i], [field]: val };
    setManItems(next);
  };

  const submitManuelle = async () => {
    setManLoading(true);
    setManResult(null);
    try {
      await api.post("/keep-contact/commande-manuelle", {
        ...manForm,
        items: manItems.map((it) => ({
          ...it,
          quantity: parseFloat(it.quantity) || 0,
          quantitePLT: parseFloat(it.quantitePLT) || null,
          netAPayer: parseFloat(it.netAPayer) || null,
        })),
      });
      setManResult({ ok: true, message: "Commande créée avec succès" });
      setManForm({
        codeCommande: "",
        codeClient: "",
        date: "",
        clrCode: "",
        famille: "",
      });
      setManItems([{ ...ITEM_VIDE }]);
      fetchOrders();
    } catch (err) {
      setManResult({
        ok: false,
        message: err.response?.data?.message || "Erreur",
      });
    } finally {
      setManLoading(false);
    }
  };

  // ── Rapport filtré ────────────────────────────────────────────────────────
  const rapportFiltré =
    filtreStatut === "TOUS"
      ? rapport
      : rapport.filter((r) => r.statut === filtreStatut);

  const couleurStatut = (s) =>
    s === "OK"
      ? { bg: "#f0fdf4", color: "#10b981", border: "#bbf7d0" }
      : s === "DOUBLON"
        ? { bg: "#fffbeb", color: "#f59e0b", border: "#fde68a" }
        : { bg: "#fef2f2", color: "#ef4444", border: "#fecaca" };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="ds-page">
      <style dangerouslySetInnerHTML={{ __html: DS_STYLE }} />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      {/* Header */}
      <div className="ds-header">
        <div className="ds-header-eyebrow">
          <span>Module Actif</span>
        </div>
        <h1 className="ds-title">
          KEEP <span>CONTACT</span>
        </h1>
        <p className="ds-subtitle">Import et gestion des commandes J+1</p>
      </div>

      {/* KPIs */}
      <div className="ds-kpi-grid">
        {[
          { label: "Total Commandes", val: stats.total, cls: "", bg: "fa-box" },
          {
            label: "En Attente",
            val: stats.pending,
            cls: "yellow",
            bg: "fa-clock",
          },
          {
            label: "Planifiées",
            val: stats.planned,
            cls: "green",
            bg: "fa-calendar-check",
          },
        ].map((k) => (
          <div key={k.label} className="ds-kpi">
            <div className="ds-kpi-label">{k.label}</div>
            <div className={`ds-kpi-val ${k.cls}`}>{k.val}</div>
            <div className="ds-kpi-bg">
              <i className={`fas ${k.bg}`}></i>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="ds-tabs" style={{ marginBottom: 24 }}>
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`ds-tab ${tab === i ? "active" : ""}`}
            onClick={() => setTab(i)}
          >
            {t}
            {i === 1 && rapport.length > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  fontSize: ".65rem",
                  fontWeight: 700,
                  background: "var(--red)",
                  color: "#fff",
                  borderRadius: 20,
                  padding: "1px 7px",
                }}
              >
                {rapport.filter((r) => r.statut !== "OK").length ||
                  rapport.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB 0 : Import Excel ── */}
      {tab === 0 && (
        <div className="ds-panel">
          <div className="ds-panel-head">
            <span className="ds-panel-title">Importer un fichier Excel</span>
          </div>
          <div className="ds-panel-body">
            <p style={{ fontSize: ".82rem", color: "#666", marginBottom: 16 }}>
              Format attendu — 11 colonnes :{" "}
              <strong>
                Code · CodeClient · Code Commande · Date commande · Famille ·
                Code Article · Designation Produit · Conditionnement · Quantité
                · Quantité PLT · Net à payer
              </strong>
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                alignItems: "center",
              }}
            >
              <label
                className={`ds-btn ${importing ? "" : "ds-btn-dark"}`}
                style={{
                  cursor: importing ? "not-allowed" : "pointer",
                  opacity: importing ? 0.4 : 1,
                }}
              >
                <i
                  className={`fas ${importing ? "fa-spinner fa-spin" : "fa-file-excel"}`}
                ></i>
                <span>
                  {importing
                    ? "Import en cours..."
                    : "Choisir un fichier Excel"}
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  style={{ display: "none" }}
                  onChange={handleImport}
                  disabled={importing}
                />
              </label>
            </div>

            {/* Résultat import */}
            {importResult && (
              <div style={{ marginTop: 20 }}>
                {/* Erreurs de header */}
                {importResult.headerErrors?.length > 0 && (
                  <div className="ds-alert ds-alert-error">
                    <i
                      className="fas fa-exclamation-circle"
                      style={{ flexShrink: 0 }}
                    ></i>
                    <div>
                      <strong>Fichier invalide</strong>
                      <ul style={{ marginTop: 8, paddingLeft: 16 }}>
                        {importResult.headerErrors.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Stats import */}
                {importResult.ok && importResult.stats && (
                  <div className="ds-alert ds-alert-success">
                    <i
                      className="fas fa-check-circle"
                      style={{ flexShrink: 0 }}
                    ></i>
                    <div>
                      <strong>Import terminé</strong>
                      <div
                        style={{
                          display: "flex",
                          gap: 20,
                          marginTop: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        {[
                          {
                            lbl: "Lignes traitées",
                            val: importResult.stats.total,
                          },
                          {
                            lbl: "Créées",
                            val: importResult.stats.created,
                            color: "#10b981",
                          },
                          {
                            lbl: "Mises à jour",
                            val: importResult.stats.updated,
                            color: "#3b82f6",
                          },
                          {
                            lbl: "Doublons",
                            val: importResult.stats.doublons,
                            color: "#f59e0b",
                          },
                          {
                            lbl: "Erreurs",
                            val: importResult.stats.errors,
                            color: "#ef4444",
                          },
                        ].map((s) => (
                          <div key={s.lbl} style={{ textAlign: "center" }}>
                            <div
                              style={{
                                fontSize: "1.3rem",
                                fontWeight: 800,
                                color: s.color || "#333",
                              }}
                            >
                              {s.val}
                            </div>
                            <div
                              style={{
                                fontSize: ".62rem",
                                textTransform: "uppercase",
                                letterSpacing: ".1em",
                                color: "#999",
                              }}
                            >
                              {s.lbl}
                            </div>
                          </div>
                        ))}
                      </div>
                      {rapport.length > 0 && (
                        <button
                          className="ds-btn ds-btn-outline"
                          style={{ marginTop: 12 }}
                          onClick={() => setTab(1)}
                        >
                          <i
                            className="fas fa-table"
                            style={{ marginRight: 6 }}
                          ></i>
                          Voir le rapport ligne par ligne →
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 1 : Vérification ── */}
      {tab === 1 && (
        <div className="ds-panel">
          <div className="ds-panel-head">
            <span className="ds-panel-title">Rapport de vérification</span>
            <span
              style={{
                fontSize: ".7rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".2em",
                color: "#999",
              }}
            >
              {rapport.length} ligne(s)
            </span>
          </div>

          {rapport.length === 0 ? (
            <div className="ds-empty">
              <i className="fas fa-file-alt"></i>
              <p>Aucun rapport — importez un fichier Excel d'abord</p>
            </div>
          ) : (
            <>
              {/* Filtres */}
              <div
                style={{
                  padding: "12px 20px",
                  borderBottom: "1px solid rgba(0,0,0,.07)",
                  display: "flex",
                  gap: 8,
                }}
              >
                {["TOUS", "OK", "DOUBLON", "ERREUR"].map((s) => {
                  const nb =
                    s === "TOUS"
                      ? rapport.length
                      : rapport.filter((r) => r.statut === s).length;
                  const c = couleurStatut(s);
                  return (
                    <button
                      key={s}
                      onClick={() => setFiltreStatut(s)}
                      style={{
                        padding: "5px 14px",
                        fontSize: ".72rem",
                        fontWeight: 700,
                        border: `2px solid ${filtreStatut === s ? (s === "TOUS" ? "#333" : c.border) : "rgba(0,0,0,.1)"}`,
                        background:
                          filtreStatut === s
                            ? s === "TOUS"
                              ? "#333"
                              : c.bg
                            : "transparent",
                        color:
                          filtreStatut === s
                            ? s === "TOUS"
                              ? "#fff"
                              : c.color
                            : "#666",
                        cursor: "pointer",
                      }}
                    >
                      {s} ({nb})
                    </button>
                  );
                })}
              </div>

              <div className="ds-table-wrap">
                <table className="ds-table">
                  <thead>
                    <tr>
                      {[
                        "Ligne",
                        "Code Commande",
                        "Client",
                        "SKU",
                        "Produit",
                        "Qté",
                        "Statut",
                        "Erreurs",
                      ].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rapportFiltré.map((r, i) => {
                      const c = couleurStatut(r.statut);
                      return (
                        <tr
                          key={i}
                          style={{
                            background: r.statut !== "OK" ? c.bg : undefined,
                          }}
                        >
                          <td className="mono" style={{ color: "#999" }}>
                            {r.rowNum}
                          </td>
                          <td className="mono">{r.codeCommande || "—"}</td>
                          <td>{r.codeClient || "—"}</td>
                          <td
                            className="mono"
                            style={{ fontSize: ".72rem", color: "#666" }}
                          >
                            {r.sku || "—"}
                          </td>
                          <td
                            style={{
                              maxWidth: 160,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {r.productName || "—"}
                          </td>
                          <td>{r.quantity ?? "—"}</td>
                          <td>
                            <span
                              style={{
                                fontSize: ".65rem",
                                fontWeight: 700,
                                padding: "3px 10px",
                                borderRadius: 20,
                                background: c.bg,
                                color: c.color,
                                border: `1px solid ${c.border}`,
                              }}
                            >
                              {r.statut}
                            </span>
                          </td>
                          <td style={{ fontSize: ".72rem", color: "#ef4444" }}>
                            {r.errors?.join(" · ") || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB 2 : Commande manuelle ── */}
      {tab === 2 && (
        <div className="ds-panel">
          <div className="ds-panel-head">
            <span className="ds-panel-title">
              Saisie manuelle d'une commande
            </span>
          </div>
          <div style={{ padding: "20px 24px" }}>
            {/* En-tête commande */}
            <div
              style={{
                fontSize: ".65rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".15em",
                color: "#999",
                marginBottom: 12,
              }}
            >
              INFORMATIONS COMMANDE
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
                marginBottom: 24,
              }}
            >
              {[
                {
                  key: "codeCommande",
                  label: "Code Commande *",
                  placeholder: "ex: CMD-2025-001",
                },
                {
                  key: "codeClient",
                  label: "Code Client *",
                  placeholder: "ex: CLI-001",
                },
                {
                  key: "date",
                  label: "Date commande *",
                  placeholder: "",
                  type: "date",
                },
                {
                  key: "clrCode",
                  label: "Code CLR",
                  placeholder: "ex: CLR-ALG-01",
                },
                { key: "famille", label: "Famille", placeholder: "ex: HUILE" },
              ].map((f) => (
                <div
                  key={f.key}
                  className="ds-field"
                  style={{ marginBottom: 0 }}
                >
                  <label className="ds-field-label">{f.label}</label>
                  <input
                    className="ds-input"
                    type={f.type || "text"}
                    placeholder={f.placeholder}
                    value={manForm[f.key]}
                    onChange={(e) =>
                      setManForm({ ...manForm, [f.key]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>

            {/* Articles */}
            <div
              style={{
                fontSize: ".65rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".15em",
                color: "#999",
                marginBottom: 12,
              }}
            >
              ARTICLES ({manItems.length})
            </div>

            {manItems.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr 80px 120px 80px 80px 36px",
                  gap: 8,
                  marginBottom: 8,
                  alignItems: "center",
                }}
              >
                <input
                  className="ds-input"
                  placeholder="Code Article (SKU)"
                  value={item.sku}
                  onChange={(e) => updateItem(i, "sku", e.target.value)}
                />
                <input
                  className="ds-input"
                  placeholder="Désignation produit"
                  value={item.productName}
                  onChange={(e) => updateItem(i, "productName", e.target.value)}
                />
                <input
                  className="ds-input"
                  placeholder="Qté"
                  type="number"
                  min="0"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, "quantity", e.target.value)}
                />
                <input
                  className="ds-input"
                  placeholder="Conditionnement"
                  value={item.conditionnement}
                  onChange={(e) =>
                    updateItem(i, "conditionnement", e.target.value)
                  }
                />
                <input
                  className="ds-input"
                  placeholder="PLT"
                  type="number"
                  min="0"
                  value={item.quantitePLT}
                  onChange={(e) => updateItem(i, "quantitePLT", e.target.value)}
                />
                <input
                  className="ds-input"
                  placeholder="Net DZD"
                  type="number"
                  min="0"
                  value={item.netAPayer}
                  onChange={(e) => updateItem(i, "netAPayer", e.target.value)}
                />
                <button
                  onClick={() => removeItem(i)}
                  disabled={manItems.length === 1}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: manItems.length === 1 ? "not-allowed" : "pointer",
                    fontSize: "1rem",
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}

            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button className="ds-btn ds-btn-outline" onClick={addItem}>
                <i className="fas fa-plus"></i> Ajouter un article
              </button>
              <button
                className="ds-btn ds-btn-dark"
                onClick={submitManuelle}
                disabled={manLoading || !manForm.codeCommande || !manForm.date}
              >
                {manLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Enregistrement…
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Enregistrer la commande
                  </>
                )}
              </button>
            </div>

            {manResult && (
              <div
                className={`ds-alert ${manResult.ok ? "ds-alert-success" : "ds-alert-error"}`}
                style={{ marginTop: 16 }}
              >
                <i
                  className={`fas ${manResult.ok ? "fa-check-circle" : "fa-exclamation-circle"}`}
                  style={{ flexShrink: 0 }}
                ></i>
                <span>{manResult.message}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3 : Commandes ── */}
      {tab === 3 && (
        <div className="ds-panel">
          <div className="ds-panel-head">
            <span className="ds-panel-title">Commandes récentes</span>
            <span
              style={{
                fontSize: ".7rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".2em",
                color: "#999",
              }}
            >
              {orders.length} entrée(s)
            </span>
          </div>

          {loading ? (
            <div className="ds-loading">Chargement des données</div>
          ) : orders.length === 0 ? (
            <div className="ds-empty">
              <i className="fas fa-inbox"></i>
              <p>
                Aucune commande — importez un fichier Excel ou saisissez
                manuellement
              </p>
            </div>
          ) : (
            <div className="ds-table-wrap">
              <table className="ds-table">
                <thead>
                  <tr>
                    {[
                      "N° Commande",
                      "Code CMD",
                      "Source",
                      "Date",
                      "Client",
                      "Articles",
                      "Statut",
                    ].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const chip =
                      STATUS_CHIP[order.status] || STATUS_CHIP.pending;
                    const srcColor =
                      order.source === "MANUELLE"
                        ? "#3b82f6"
                        : order.source === "API"
                          ? "#8b5cf6"
                          : "#10b981";
                    return (
                      <tr key={order.id}>
                        <td className="mono">{order.orderNumber}</td>
                        <td
                          className="mono"
                          style={{ fontSize: ".72rem", color: "#666" }}
                        >
                          {order.codeCommande || "—"}
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: ".63rem",
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 20,
                              background: `${srcColor}18`,
                              color: srcColor,
                            }}
                          >
                            {order.source || "EXCEL"}
                          </span>
                        </td>
                        <td>{order.date}</td>
                        <td style={{ fontSize: ".78rem", color: "#666" }}>
                          {order.codeClient || "—"}
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>
                            {order.OrderItems?.length || 0} article(s)
                          </span>
                          <div
                            style={{
                              fontSize: ".72rem",
                              color: "#999",
                              marginTop: 2,
                            }}
                          >
                            {order.OrderItems?.slice(0, 2)
                              .map((i) => i.sku || i.productName)
                              .join(", ")}
                            {order.OrderItems?.length > 2 && " …"}
                          </div>
                        </td>
                        <td>
                          <span className={chip.cls}>{chip.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
