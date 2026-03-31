import { useState, useEffect } from "react";
import api from "../utils/api";
import { DS_STYLE, STATUS_CHIP } from "./ds";

export default function Planification() {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    deliveryDate: "",
    driverId: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/orders"),
      api.get("/drivers"),
      api.get("/deliveries"),
    ])
      .then(([o, d, del]) => {
        setOrders(o.data);
        setDrivers(d.data);
        setDeliveries(del.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const pending = orders.filter((o) => o.status === "pending");
  const planned = orders.filter((o) =>
    ["planned", "in_transit"].includes(o.status),
  );

  const openModal = (order) => {
    setModal(order);
    setForm({ deliveryDate: "", driverId: "", notes: "" });
  };

  const handlePlanify = async () => {
    if (!form.deliveryDate) return alert("Date de livraison requise");
    setSubmitting(true);
    try {
      await api.post("/deliveries", { orderId: modal.id, ...form });
      const [o, del] = await Promise.all([
        api.get("/orders"),
        api.get("/deliveries"),
      ]);
      setOrders(o.data);
      setDeliveries(del.data);
      setModal(null);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

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
          PLANIFI<span>CATION</span>
        </h1>
        <p className="ds-subtitle">Construisez le programme de livraison J+1</p>
      </div>

      {/* KPIs */}
      <div className="ds-kpi-grid">
        {[
          {
            label: "À Planifier",
            val: pending.length,
            cls: "yellow",
            bg: "fa-clock",
          },
          {
            label: "En Programme",
            val: planned.length,
            cls: "",
            bg: "fa-calendar-check",
          },
          {
            label: "Chauffeurs",
            val: drivers.length,
            cls: "green",
            bg: "fa-id-card",
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

      {/* Commandes à planifier */}
      <div className="ds-panel">
        <div className="ds-panel-head">
          <span className="ds-panel-title">Commandes à planifier</span>
          {pending.length > 0 && (
            <span className="ds-badge">{pending.length}</span>
          )}
        </div>
        {pending.length === 0 ? (
          <div className="ds-empty">
            <i
              className="fas fa-check-circle"
              style={{ color: "#10b981", opacity: 1 }}
            ></i>
            <p>Toutes les commandes sont planifiées</p>
          </div>
        ) : (
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr>
                  {["N° Commande", "Date", "Articles", "Action"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.map((order) => (
                  <tr key={order.id}>
                    <td className="mono">{order.orderNumber}</td>
                    <td>{order.date}</td>
                    <td>{order.OrderItems?.length || 0} article(s)</td>
                    <td>
                      <button
                        className="ds-btn ds-btn-dark"
                        style={{ padding: "8px 16px" }}
                        onClick={() => openModal(order)}
                      >
                        <i className="fas fa-calendar-plus"></i> Planifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Programme de livraison */}
      <div className="ds-panel">
        <div className="ds-panel-head">
          <span className="ds-panel-title">Programme de Livraison</span>
          <span
            style={{
              fontSize: ".7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".2em",
              color: "#999",
            }}
          >
            {planned.length} livraison(s)
          </span>
        </div>
        {planned.length === 0 ? (
          <div className="ds-empty">
            <i className="fas fa-route"></i>
            <p>Aucune livraison planifiée</p>
          </div>
        ) : (
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr>
                  {["N° Commande", "Date livraison", "Chauffeur", "Statut"].map(
                    (h) => (
                      <th key={h}>{h}</th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {planned.map((order) => {
                  const del = deliveries.find((d) => d.orderId === order.id);
                  const driver = del?.Driver;
                  const chip = STATUS_CHIP[order.status] || STATUS_CHIP.planned;
                  return (
                    <tr key={order.id}>
                      <td className="mono">{order.orderNumber}</td>
                      <td>{del?.deliveryDate || "—"}</td>
                      <td>
                        {driver?.name || (
                          <span
                            style={{
                              color: "#bbb",
                              fontStyle: "italic",
                              fontSize: ".8rem",
                            }}
                          >
                            Non assigné
                          </span>
                        )}
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

      {/* Modal */}
      {modal && (
        <div className="ds-modal-bg">
          <div className="ds-modal">
            <div className="ds-modal-head">
              <span className="ds-modal-title">
                Planifier {modal.orderNumber}
              </span>
              <button className="ds-modal-close" onClick={() => setModal(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="ds-modal-body">
              <div className="ds-field">
                <label className="ds-field-label">Date de livraison *</label>
                <input
                  type="date"
                  className="ds-input"
                  value={form.deliveryDate}
                  onChange={(e) =>
                    setForm({ ...form, deliveryDate: e.target.value })
                  }
                />
              </div>
              <div className="ds-field">
                <label className="ds-field-label">Chauffeur</label>
                <select
                  className="ds-input"
                  value={form.driverId}
                  onChange={(e) =>
                    setForm({ ...form, driverId: e.target.value })
                  }
                >
                  <option value="">— Sélectionner (optionnel) —</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ds-field">
                <label className="ds-field-label">Notes</label>
                <textarea
                  className="ds-input"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="ds-modal-footer">
              <button
                className="ds-btn ds-btn-outline"
                onClick={() => setModal(null)}
              >
                Annuler
              </button>
              <button
                className="ds-btn ds-btn-dark"
                onClick={handlePlanify}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Enregistrement...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i> Confirmer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
