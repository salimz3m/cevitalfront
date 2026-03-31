import { useState, useEffect } from "react";
import api from "../utils/api";
import { DS_STYLE, STATUS_CHIP } from "./ds";

export default function Livreur() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    api
      .get("/deliveries")
      .then(({ data }) => setDeliveries(data))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.put(`/deliveries/${id}`, { status });
      setDeliveries((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status } : d)),
      );
    } catch {
      alert("Erreur lors de la mise à jour");
    } finally {
      setUpdating(null);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const todayDels = deliveries.filter((d) => d.deliveryDate === today);
  const upcoming = deliveries.filter((d) => d.deliveryDate > today);
  const delivered = deliveries.filter((d) => d.status === "delivered");

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
          MES <span>LIVRAISONS</span>
        </h1>
        <p className="ds-subtitle">Programme du jour et suivi des livraisons</p>
      </div>

      {/* KPIs */}
      <div className="ds-kpi-grid">
        {[
          {
            label: "Aujourd'hui",
            val: todayDels.length,
            cls: "",
            bg: "fa-truck",
          },
          {
            label: "À venir",
            val: upcoming.length,
            cls: "yellow",
            bg: "fa-calendar",
          },
          {
            label: "Livrées",
            val: delivered.length,
            cls: "green",
            bg: "fa-check-circle",
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

      {/* Liste */}
      {deliveries.length === 0 ? (
        <div className="ds-panel">
          <div className="ds-empty">
            <i className="fas fa-truck"></i>
            <p>Aucune livraison assignée pour le moment</p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {deliveries.map((delivery) => {
            const chip = STATUS_CHIP[delivery.status] || STATUS_CHIP.scheduled;
            const items = delivery.Order?.OrderItems || [];
            const isToday = delivery.deliveryDate === today;
            return (
              <div
                key={delivery.id}
                className="ds-panel"
                style={{
                  marginBottom: 0,
                  borderLeft: isToday
                    ? "4px solid var(--red)"
                    : "4px solid transparent",
                }}
              >
                <div className="ds-panel-body">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "10px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: "1.3rem",
                            letterSpacing: ".08em",
                            color: "var(--dark)",
                          }}
                        >
                          {delivery.Order?.orderNumber}
                        </span>
                        <span className={chip.cls}>{chip.label}</span>
                        {isToday && (
                          <span
                            className="ds-chip ds-chip-red"
                            style={{ fontSize: ".55rem" }}
                          >
                            Aujourd'hui
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "20px",
                          fontSize: ".82rem",
                          color: "#666",
                        }}
                      >
                        <span>
                          <i
                            className="fas fa-calendar-alt"
                            style={{
                              color: "var(--red)",
                              marginRight: 6,
                              fontSize: ".75rem",
                            }}
                          ></i>
                          {delivery.deliveryDate}
                        </span>
                        {delivery.Depot && (
                          <span>
                            <i
                              className="fas fa-map-pin"
                              style={{
                                color: "var(--red)",
                                marginRight: 6,
                                fontSize: ".75rem",
                              }}
                            ></i>
                            {delivery.Depot.name} — {delivery.Depot.type}
                          </span>
                        )}
                      </div>

                      {items.length > 0 && (
                        <div
                          style={{
                            marginTop: "10px",
                            fontSize: ".82rem",
                            color: "#444",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: ".65rem",
                              textTransform: "uppercase",
                              letterSpacing: ".15em",
                              color: "#999",
                              marginRight: 8,
                            }}
                          >
                            Articles :
                          </span>
                          {items
                            .map(
                              (i) =>
                                `${i.productName} (${i.quantity} ${i.unit})`,
                            )
                            .join(" · ")}
                        </div>
                      )}

                      {delivery.notes && (
                        <div
                          style={{
                            marginTop: "8px",
                            fontSize: ".8rem",
                            color: "#aaa",
                            fontStyle: "italic",
                          }}
                        >
                          <i
                            className="fas fa-sticky-note"
                            style={{ marginRight: 6, fontSize: ".7rem" }}
                          ></i>
                          {delivery.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {delivery.status !== "delivered" &&
                    delivery.status !== "failed" && (
                      <div className="ds-action-row">
                        {delivery.status === "scheduled" && (
                          <button
                            className="ds-btn ds-btn-dark"
                            disabled={updating === delivery.id}
                            onClick={() =>
                              updateStatus(delivery.id, "in_transit")
                            }
                          >
                            <i
                              className={`fas ${updating === delivery.id ? "fa-spinner fa-spin" : "fa-truck"}`}
                            ></i>
                            Démarrer la livraison
                          </button>
                        )}
                        {delivery.status === "in_transit" && (
                          <>
                            <button
                              className="ds-btn"
                              style={{ background: "#10b981", color: "#fff" }}
                              disabled={updating === delivery.id}
                              onClick={() =>
                                updateStatus(delivery.id, "delivered")
                              }
                            >
                              <i
                                className={`fas ${updating === delivery.id ? "fa-spinner fa-spin" : "fa-check"}`}
                              ></i>
                              Marquer livrée
                            </button>
                            <button
                              className="ds-btn ds-btn-outline"
                              disabled={updating === delivery.id}
                              onClick={() =>
                                updateStatus(delivery.id, "failed")
                              }
                            >
                              <i className="fas fa-times"></i> Échec livraison
                            </button>
                          </>
                        )}
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
