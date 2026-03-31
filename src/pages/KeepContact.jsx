import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import { DS_STYLE, STATUS_CHIP } from "./ds";

export default function KeepContact() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, planned: 0 });
  const fileRef = useRef();

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders");
      setOrders(data);
      setStats({
        total: data.length,
        pending: data.filter((o) => o.status === "pending").length,
        planned: data.filter((o) => o.status === "planned").length,
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

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await api.post("/import/excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImportResult({ success: true, ...data });
      fetchOrders();
    } catch (err) {
      setImportResult({
        success: false,
        message: err.response?.data?.message || "Erreur import",
      });
    } finally {
      setImporting(false);
      fileRef.current.value = "";
    }
  };

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
          {
            label: "Total Commandes",
            val: stats.total,
            cls: "",
            icon: "TOTAL",
            bg: "fa-box",
          },
          {
            label: "En Attente",
            val: stats.pending,
            cls: "yellow",
            icon: "WAIT",
            bg: "fa-clock",
          },
          {
            label: "Planifiées",
            val: stats.planned,
            cls: "green",
            icon: "PLAN",
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

      {/* Import */}
      <div className="ds-panel">
        <div className="ds-panel-head">
          <span className="ds-panel-title">Importer un fichier Excel</span>
        </div>
        <div className="ds-panel-body">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
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
                {importing ? "Import en cours..." : "Choisir un fichier Excel"}
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
            <button
              className="ds-btn ds-btn-outline"
              onClick={() => window.open("/api/import/template", "_blank")}
            >
              <i className="fas fa-download"></i> Télécharger le template
            </button>
          </div>

          {importResult && (
            <div
              className={`ds-alert ${importResult.success ? "ds-alert-success" : "ds-alert-error"}`}
            >
              <i
                className={`fas ${importResult.success ? "fa-check-circle" : "fa-exclamation-circle"}`}
                style={{ marginTop: 2, flexShrink: 0 }}
              ></i>
              <div>
                {importResult.success ? (
                  <>
                    <strong>Import terminé —</strong>{" "}
                    {importResult.stats?.created} créée(s) ·{" "}
                    {importResult.stats?.updated} mise(s) à jour ·{" "}
                    {importResult.stats?.errors} erreur(s)
                    {importResult.errors?.length > 0 && (
                      <ul style={{ marginTop: 8, paddingLeft: 16 }}>
                        {importResult.errors.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  importResult.message
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table commandes */}
      <div className="ds-panel">
        <div className="ds-panel-head">
          <span className="ds-panel-title">Commandes Récentes</span>
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
            <p>Aucune commande — importez un fichier Excel pour commencer</p>
          </div>
        ) : (
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr>
                  {["N° Commande", "Date", "Articles", "Statut", "Actions"].map(
                    (h) => (
                      <th key={h}>{h}</th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const chip = STATUS_CHIP[order.status] || STATUS_CHIP.pending;
                  return (
                    <tr key={order.id}>
                      <td className="mono">{order.orderNumber}</td>
                      <td>{order.date}</td>
                      <td>
                        <span style={{ fontWeight: 600 }}>
                          {order.OrderItems?.length || 0} article(s)
                        </span>
                        <div
                          style={{
                            fontSize: ".75rem",
                            color: "#999",
                            marginTop: 3,
                          }}
                        >
                          {order.OrderItems?.slice(0, 2)
                            .map((i) => i.productName)
                            .join(", ")}
                          {order.OrderItems?.length > 2 && " …"}
                        </div>
                      </td>
                      <td>
                        <span className={chip.cls}>{chip.label}</span>
                      </td>
                      <td>
                        <button className="ds-link-btn">Voir détails →</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
