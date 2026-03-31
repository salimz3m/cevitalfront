import { useState, useEffect } from "react";
import api from "../utils/api";
import { DS_STYLE } from "./ds";

const ALERT_CFG = {
  RUPTURE: { label: "Rupture", cls: "ds-chip ds-chip-red", dot: "#e63946" },
  FAIBLE: { label: "Faible", cls: "ds-chip ds-chip-yellow", dot: "#f59e0b" },
  OK: { label: "OK", cls: "ds-chip ds-chip-green", dot: "#10b981" },
};

export default function Stock() {
  const [comparison, setComparison] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addForm, setAddForm] = useState({
    productName: "",
    availableQty: "",
    unit: "unité",
  });
  const [adding, setAdding] = useState(false);

  const fetchData = async () => {
    const [comp] = await Promise.all([
      api.get("/stock/compare"),
      api.get("/stock"),
    ]);
    setComparison(comp.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    if (!addForm.productName || !addForm.availableQty)
      return alert("Produit et quantité requis");
    setAdding(true);
    try {
      await api.post("/stock", {
        ...addForm,
        availableQty: parseFloat(addForm.availableQty),
      });
      setAddForm({ productName: "", availableQty: "", unit: "unité" });
      fetchData();
    } catch {
      alert("Erreur");
    } finally {
      setAdding(false);
    }
  };

  const ruptures = comparison.filter((c) => c.alert === "RUPTURE").length;
  const faibles = comparison.filter((c) => c.alert === "FAIBLE").length;
  const ok = comparison.filter((c) => c.alert === "OK").length;

  if (loading)
    return (
      <div className="ds-page">
        <style dangerouslySetInnerHTML={{ __html: DS_STYLE }} />
        <div className="ds-loading">Chargement des données</div>
      </div>
    );

  return (
    <div className="ds-page">
      <style dangerouslySetInnerHTML={{ __html: DS_STYLE }} />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      <div className="ds-header">
        <div className="ds-header-eyebrow">
          <span>Module Actif</span>
        </div>
        <h1 className="ds-title">
          COMPARATEUR <span>STOCK</span>
        </h1>
        <p className="ds-subtitle">
          Stock disponible vs quantités commandées — alertes en temps réel
        </p>
      </div>

      {/* KPIs */}
      <div className="ds-kpi-grid">
        <div className="ds-kpi">
          <div className="ds-kpi-label">Ruptures</div>
          <div className="ds-kpi-val red">{ruptures}</div>
          <div className="ds-kpi-bg">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
        </div>
        <div className="ds-kpi">
          <div className="ds-kpi-label">Stocks Faibles</div>
          <div className="ds-kpi-val yellow">{faibles}</div>
          <div className="ds-kpi-bg">
            <i className="fas fa-battery-quarter"></i>
          </div>
        </div>
        <div className="ds-kpi">
          <div className="ds-kpi-label">Niveaux OK</div>
          <div className="ds-kpi-val green">{ok}</div>
          <div className="ds-kpi-bg">
            <i className="fas fa-check-circle"></i>
          </div>
        </div>
      </div>

      {/* Alerte rupture banner */}
      {ruptures > 0 && (
        <div
          style={{
            background: "rgba(230,57,70,.08)",
            border: "1px solid rgba(230,57,70,.3)",
            padding: "14px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <i
            className="fas fa-exclamation-circle"
            style={{ color: "var(--red)", fontSize: "1rem", flexShrink: 0 }}
          ></i>
          <span
            style={{ fontSize: ".82rem", color: "#b30000", fontWeight: 600 }}
          >
            {ruptures} produit(s) en rupture de stock — action requise avant la
            prochaine livraison
          </span>
        </div>
      )}

      {/* Tableau comparaison */}
      <div className="ds-panel">
        <div className="ds-panel-head">
          <span className="ds-panel-title">Stock disponible vs Commandé</span>
          <span
            style={{
              fontSize: ".7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".2em",
              color: "#999",
            }}
          >
            {comparison.length} produit(s)
          </span>
        </div>
        {comparison.length === 0 ? (
          <div className="ds-empty">
            <i className="fas fa-boxes"></i>
            <p>Aucun stock configuré</p>
          </div>
        ) : (
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr>
                  {[
                    "Produit",
                    "Dépôt",
                    "Stock Disponible",
                    "Commandé",
                    "Écart",
                    "Alerte",
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => {
                  const alert = ALERT_CFG[row.alert] || ALERT_CFG.OK;
                  return (
                    <tr
                      key={i}
                      style={{
                        borderLeft:
                          row.alert === "RUPTURE"
                            ? "3px solid var(--red)"
                            : row.alert === "FAIBLE"
                              ? "3px solid #f59e0b"
                              : "3px solid transparent",
                      }}
                    >
                      <td style={{ fontWeight: 700 }}>{row.productName}</td>
                      <td style={{ color: "#888", fontSize: ".8rem" }}>
                        {row.depot}
                      </td>
                      <td style={{ fontWeight: 700, color: "#065f46" }}>
                        {row.availableQty}
                      </td>
                      <td style={{ fontWeight: 700, color: "#1d4ed8" }}>
                        {row.orderedQty}
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: ".9rem",
                            color: row.gap < 0 ? "var(--red)" : "#065f46",
                          }}
                        >
                          {row.gap > 0 ? "+" : ""}
                          {row.gap}
                        </span>
                      </td>
                      <td>
                        <span className={alert.cls}>
                          <span
                            style={{
                              display: "inline-block",
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: alert.dot,
                              marginRight: 5,
                              verticalAlign: "middle",
                            }}
                          ></span>
                          {alert.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mise à jour stock */}
      <div className="ds-panel">
        <div className="ds-panel-head">
          <span className="ds-panel-title">Mettre à jour un stock</span>
        </div>
        <div className="ds-panel-body">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              alignItems: "flex-end",
            }}
          >
            <div>
              <label
                className="ds-field-label"
                style={{
                  display: "block",
                  fontSize: ".62rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".25em",
                  color: "#888",
                  marginBottom: 8,
                }}
              >
                Produit
              </label>
              <input
                className="ds-input"
                style={{ width: 220 }}
                placeholder="Nom du produit"
                value={addForm.productName}
                onChange={(e) =>
                  setAddForm({ ...addForm, productName: e.target.value })
                }
              />
            </div>
            <div>
              <label
                className="ds-field-label"
                style={{
                  display: "block",
                  fontSize: ".62rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".25em",
                  color: "#888",
                  marginBottom: 8,
                }}
              >
                Quantité
              </label>
              <input
                className="ds-input"
                type="number"
                style={{ width: 120 }}
                placeholder="0"
                value={addForm.availableQty}
                onChange={(e) =>
                  setAddForm({ ...addForm, availableQty: e.target.value })
                }
              />
            </div>
            <div>
              <label
                className="ds-field-label"
                style={{
                  display: "block",
                  fontSize: ".62rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".25em",
                  color: "#888",
                  marginBottom: 8,
                }}
              >
                Unité
              </label>
              <input
                className="ds-input"
                style={{ width: 100 }}
                placeholder="unité"
                value={addForm.unit}
                onChange={(e) =>
                  setAddForm({ ...addForm, unit: e.target.value })
                }
              />
            </div>
            <button
              className="ds-btn ds-btn-dark"
              onClick={handleAdd}
              disabled={adding}
            >
              {adding ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Enregistrement...
                </>
              ) : (
                <>
                  <i className="fas fa-plus"></i> Enregistrer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
