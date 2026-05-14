import { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";

const TYPE_CONFIG = {
  ENTREE_LIVRAISON: {
    label: "Entrée livraison",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    icon: "fa-arrow-down",
    sign: "+",
  },
  SORTIE_PLANIF: {
    label: "Sortie planification",
    color: "#f97316",
    bg: "rgba(249,115,22,0.12)",
    icon: "fa-arrow-up",
    sign: "-",
  },
  AJUSTEMENT_MANUEL: {
    label: "Ajustement manuel",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    icon: "fa-sliders",
    sign: "±",
  },
  RETOUR: {
    label: "Retour",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.12)",
    icon: "fa-rotate-left",
    sign: "+",
  },
  PERTE: {
    label: "Perte",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    icon: "fa-triangle-exclamation",
    sign: "-",
  },
};

const ITEMS_PER_PAGE = 20;

export default function MouvementsStock() {
  const [mouvements, setMouvements] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [filters, setFilters] = useState({
    type: "",
    clrId: "",
    produitId: "",
    dateDebut: "",
    dateFin: "",
    search: "",
  });

  const [clrs, setClrs] = useState([]);
  const [produits, setProduits] = useState([]);

  /* ── Chargement refs ── */
  useEffect(() => {
    api
      .get("/infrastructure")
      .then((r) => setClrs(r.data.clrs || []))
      .catch(() => {});
    api
      .get("/stock/produits")
      .then((r) => setProduits(r.data || []))
      .catch(() => {});
  }, []);

  /* ── Chargement mouvements ── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: ITEMS_PER_PAGE, ...filters };
      Object.keys(params).forEach((k) => {
        if (!params[k]) delete params[k];
      });
      const r = await api.get("/stock/mouvements", { params });
      setMouvements(r.data.mouvements || r.data || []);
      setTotal(r.data.total || 0);
    } catch {
      setMouvements([]);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    load();
  }, [load]);

  /* ── Export CSV ── */
  const exportCSV = async () => {
    setExporting(true);
    try {
      const params = { ...filters, export: "csv" };
      Object.keys(params).forEach((k) => {
        if (!params[k]) delete params[k];
      });
      const r = await api.get("/stock/mouvements", {
        params,
        responseType: "blob",
      });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mouvements_stock_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* silent */
    }
    setExporting(false);
  };

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const resetFilters = () => {
    setFilters({
      type: "",
      clrId: "",
      produitId: "",
      dateDebut: "",
      dateFin: "",
      search: "",
    });
    setPage(1);
  };

  /* ── Stat cards ── */
  const stats = {
    entrees: mouvements.filter((m) =>
      ["ENTREE_LIVRAISON", "RETOUR"].includes(m.type),
    ).length,
    sorties: mouvements.filter((m) =>
      ["SORTIE_PLANIF", "PERTE"].includes(m.type),
    ).length,
    ajustements: mouvements.filter((m) => m.type === "AJUSTEMENT_MANUEL")
      .length,
  };

  return (
    <div
      style={{
        padding: "2rem",
        background: "#0f1117",
        minHeight: "100vh",
        color: "#e2e8f0",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#f8fafc",
              margin: 0,
            }}
          >
            <i
              className="fa fa-list-timeline"
              style={{ color: "#3b82f6", marginRight: "0.6rem" }}
            />
            Journal des Mouvements
          </h1>
          <p
            style={{
              color: "#64748b",
              margin: "0.3rem 0 0",
              fontSize: "0.9rem",
            }}
          >
            Traçabilité complète de tous les flux de stock
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={exporting}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: exporting ? "#374151" : "#1e293b",
            color: "#94a3b8",
            border: "1px solid #334155",
            borderRadius: "0.5rem",
            padding: "0.6rem 1.2rem",
            cursor: exporting ? "not-allowed" : "pointer",
            fontSize: "0.875rem",
          }}
        >
          <i
            className={`fa ${exporting ? "fa-spinner fa-spin" : "fa-file-csv"}`}
          />
          {exporting ? "Export..." : "Exporter CSV"}
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {[
          {
            label: "Entrées",
            value: stats.entrees,
            color: "#22c55e",
            icon: "fa-arrow-down",
          },
          {
            label: "Sorties",
            value: stats.sorties,
            color: "#f97316",
            icon: "fa-arrow-up",
          },
          {
            label: "Ajust.",
            value: stats.ajustements,
            color: "#3b82f6",
            icon: "fa-sliders",
          },
          {
            label: "Total",
            value: mouvements.length,
            color: "#94a3b8",
            icon: "fa-hashtag",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#181c27",
              borderRadius: "0.75rem",
              padding: "1.2rem",
              border: "1px solid #1e293b",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#64748b", fontSize: "0.8rem" }}>
                {s.label}
              </span>
              <i
                className={`fa ${s.icon}`}
                style={{ color: s.color, fontSize: "1rem" }}
              />
            </div>
            <div
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                color: s.color,
                marginTop: "0.3rem",
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Filtres ── */}
      <div
        style={{
          background: "#181c27",
          borderRadius: "0.75rem",
          border: "1px solid #1e293b",
          padding: "1.25rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "0.75rem",
          }}
        >
          <input
            placeholder="🔍 Rechercher produit..."
            value={filters.search}
            onChange={(e) => {
              setFilters((f) => ({ ...f, search: e.target.value }));
              setPage(1);
            }}
            style={inputStyle}
          />

          <select
            value={filters.type}
            onChange={(e) => {
              setFilters((f) => ({ ...f, type: e.target.value }));
              setPage(1);
            }}
            style={inputStyle}
          >
            <option value="">Tous les types</option>
            {Object.entries(TYPE_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>

          <select
            value={filters.clrId}
            onChange={(e) => {
              setFilters((f) => ({ ...f, clrId: e.target.value }));
              setPage(1);
            }}
            style={inputStyle}
          >
            <option value="">Tous les CLR</option>
            {clrs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>

          <select
            value={filters.produitId}
            onChange={(e) => {
              setFilters((f) => ({ ...f, produitId: e.target.value }));
              setPage(1);
            }}
            style={inputStyle}
          >
            <option value="">Tous les produits</option>
            {produits.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.dateDebut}
            onChange={(e) => {
              setFilters((f) => ({ ...f, dateDebut: e.target.value }));
              setPage(1);
            }}
            style={inputStyle}
          />
          <input
            type="date"
            value={filters.dateFin}
            onChange={(e) => {
              setFilters((f) => ({ ...f, dateFin: e.target.value }));
              setPage(1);
            }}
            style={inputStyle}
          />

          <button
            onClick={resetFilters}
            style={{
              ...inputStyle,
              background: "transparent",
              color: "#64748b",
              cursor: "pointer",
              textAlign: "center",
              border: "1px dashed #334155",
            }}
          >
            <i className="fa fa-rotate-right" /> Reset
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div
        style={{
          background: "#181c27",
          borderRadius: "0.75rem",
          border: "1px solid #1e293b",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div
            style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}
          >
            <i
              className="fa fa-spinner fa-spin"
              style={{
                fontSize: "1.5rem",
                marginBottom: "0.75rem",
                display: "block",
              }}
            />
            Chargement...
          </div>
        ) : mouvements.length === 0 ? (
          <div
            style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}
          >
            <i
              className="fa fa-inbox"
              style={{
                fontSize: "2rem",
                marginBottom: "0.75rem",
                display: "block",
              }}
            />
            Aucun mouvement trouvé
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.875rem",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #1e293b" }}>
                {[
                  "Date",
                  "Type",
                  "Produit",
                  "CLR",
                  "Quantité",
                  "Référence",
                  "Utilisateur",
                  "Notes",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.9rem 1rem",
                      textAlign: "left",
                      color: "#64748b",
                      fontWeight: 600,
                      fontSize: "0.78rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mouvements.map((m, i) => {
                const cfg = TYPE_CONFIG[m.type] || {
                  label: m.type,
                  color: "#94a3b8",
                  bg: "rgba(148,163,184,0.1)",
                  icon: "fa-circle",
                  sign: "",
                };
                return (
                  <tr
                    key={m.id}
                    style={{
                      borderBottom: "1px solid #0f1117",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#1e293b")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td
                      style={{
                        padding: "0.9rem 1rem",
                        color: "#94a3b8",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {new Date(m.createdAt).toLocaleDateString("fr-DZ", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      })}
                      <span
                        style={{
                          display: "block",
                          fontSize: "0.75rem",
                          color: "#475569",
                        }}
                      >
                        {new Date(m.createdAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          background: cfg.bg,
                          color: cfg.color,
                          borderRadius: "0.375rem",
                          padding: "0.25rem 0.6rem",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <i
                          className={`fa ${cfg.icon}`}
                          style={{ fontSize: "0.7rem" }}
                        />
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: "0.9rem 1rem", color: "#e2e8f0" }}>
                      {m.Produit?.nom || m.produitId}
                      <span
                        style={{
                          display: "block",
                          fontSize: "0.75rem",
                          color: "#475569",
                        }}
                      >
                        {m.Produit?.sku}
                      </span>
                    </td>
                    <td style={{ padding: "0.9rem 1rem", color: "#94a3b8" }}>
                      {m.CLR?.nom || m.clrId}
                    </td>
                    <td
                      style={{
                        padding: "0.9rem 1rem",
                        fontWeight: 700,
                        color: cfg.color,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cfg.sign}
                      {Math.abs(m.quantite)} {m.Produit?.unite || "u."}
                    </td>
                    <td
                      style={{
                        padding: "0.9rem 1rem",
                        color: "#64748b",
                        fontSize: "0.8rem",
                      }}
                    >
                      {m.referenceId || "—"}
                    </td>
                    <td
                      style={{
                        padding: "0.9rem 1rem",
                        color: "#94a3b8",
                        fontSize: "0.8rem",
                      }}
                    >
                      {m.User?.prenom || m.userId || "—"}
                    </td>
                    <td
                      style={{
                        padding: "0.9rem 1rem",
                        color: "#64748b",
                        fontSize: "0.8rem",
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {m.notes || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "1.5rem",
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={pageBtnStyle(page === 1)}
          >
            <i className="fa fa-chevron-left" />
          </button>
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            const p =
              totalPages <= 7
                ? i + 1
                : page <= 4
                  ? i + 1
                  : page >= totalPages - 3
                    ? totalPages - 6 + i
                    : page - 3 + i;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={pageBtnStyle(false, p === page)}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={pageBtnStyle(page === totalPages)}
          >
            <i className="fa fa-chevron-right" />
          </button>
          <span
            style={{ color: "#64748b", fontSize: "0.8rem", marginLeft: "1rem" }}
          >
            {total} résultats · Page {page}/{totalPages}
          </span>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  background: "#0f1117",
  border: "1px solid #334155",
  borderRadius: "0.5rem",
  color: "#e2e8f0",
  padding: "0.55rem 0.75rem",
  fontSize: "0.875rem",
  width: "100%",
  outline: "none",
};

const pageBtnStyle = (disabled, active = false) => ({
  background: active ? "#3b82f6" : "#1e293b",
  border: `1px solid ${active ? "#3b82f6" : "#334155"}`,
  color: active ? "#fff" : disabled ? "#334155" : "#94a3b8",
  borderRadius: "0.375rem",
  padding: "0.4rem 0.75rem",
  cursor: disabled ? "not-allowed" : "pointer",
  fontSize: "0.85rem",
});
