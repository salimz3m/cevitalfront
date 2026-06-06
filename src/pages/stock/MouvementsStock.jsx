// pages/stock/MouvementsStock.jsx — Redesign blanc épuré
import { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";
import { DS_STYLE } from "../design-system";

const TYPE_CONFIG = {
  ENTREE_LIVRAISON: {
    label: "Entrée livraison",
    color: "var(--ds-green)",
    badgeCls: "ds-badge ds-badge-green",
    icon: "fa-arrow-down",
    sign: "+",
  },
  SORTIE_PLANIF: {
    label: "Sortie planification",
    color: "var(--ds-red)",
    badgeCls: "ds-badge ds-badge-red",
    icon: "fa-arrow-up",
    sign: "-",
  },
  AJUSTEMENT_MANUEL: {
    label: "Ajustement manuel",
    color: "var(--ds-blue)",
    badgeCls: "ds-badge ds-badge-blue",
    icon: "fa-sliders",
    sign: "±",
  },
  RETOUR: {
    label: "Retour",
    color: "var(--ds-purple)",
    badgeCls: "ds-badge ds-badge-purple",
    icon: "fa-rotate-left",
    sign: "+",
  },
  PERTE: {
    label: "Perte",
    color: "var(--ds-red)",
    badgeCls: "ds-badge ds-badge-red",
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
  const [clrs, setClrs] = useState([]);
  const [produits, setProduits] = useState([]);

  const [filters, setFilters] = useState({
    type: "",
    clrId: "",
    produitId: "",
    dateDebut: "",
    dateFin: "",
    search: "",
  });

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
    <div className="ds-layout">
      <style dangerouslySetInnerHTML={{ __html: DS_STYLE }} />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      <div className="ds-main">
        {/* Header */}
        <div className="ds-page-header">
          <div className="ds-eyebrow">Stock</div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h1 className="ds-page-title">
                Journal des <span>Mouvements</span>
              </h1>
              <p className="ds-page-sub">
                Traçabilité complète de tous les flux de stock
              </p>
            </div>
            <button
              className="ds-btn ds-btn-outline ds-btn-sm"
              onClick={exportCSV}
              disabled={exporting}
            >
              <i
                className={`fas ${exporting ? "fa-spinner fa-spin" : "fa-file-csv"}`}
              ></i>
              {exporting ? "Export…" : "Exporter CSV"}
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="ds-kpi-strip">
          {[
            {
              lbl: "Entrées",
              val: stats.entrees,
              cls: "green",
              icon: "fa-arrow-down",
            },
            {
              lbl: "Sorties",
              val: stats.sorties,
              cls: "red",
              icon: "fa-arrow-up",
            },
            {
              lbl: "Ajustements",
              val: stats.ajustements,
              cls: "blue",
              icon: "fa-sliders",
            },
            {
              lbl: "Total page",
              val: mouvements.length,
              cls: "",
              icon: "fa-hashtag",
            },
          ].map((k) => (
            <div key={k.lbl} className="ds-kpi">
              <div className="ds-kpi-lbl">{k.lbl}</div>
              <div className={`ds-kpi-val ${k.cls}`}>{k.val}</div>
              <i className={`fas ${k.icon} ds-kpi-icon`}></i>
            </div>
          ))}
        </div>

        <div className="ds-content">
          {/* Filtres */}
          <div className="ds-card">
            <div className="ds-card-head">
              <div className="ds-card-title">
                <span className="ds-card-dot"></span>Filtres
              </div>
              <button
                className="ds-btn ds-btn-ghost ds-btn-sm"
                onClick={resetFilters}
              >
                <i className="fas fa-rotate-right"></i> Réinitialiser
              </button>
            </div>
            <div className="ds-card-body">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: 10,
                }}
              >
                <div className="ds-field">
                  <label className="ds-label">Rechercher</label>
                  <input
                    className="ds-input"
                    placeholder="Produit…"
                    value={filters.search}
                    onChange={(e) => {
                      setFilters((f) => ({ ...f, search: e.target.value }));
                      setPage(1);
                    }}
                  />
                </div>
                <div className="ds-field">
                  <label className="ds-label">Type</label>
                  <select
                    className="ds-select"
                    value={filters.type}
                    onChange={(e) => {
                      setFilters((f) => ({ ...f, type: e.target.value }));
                      setPage(1);
                    }}
                  >
                    <option value="">Tous les types</option>
                    {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="ds-field">
                  <label className="ds-label">CLR</label>
                  <select
                    className="ds-select"
                    value={filters.clrId}
                    onChange={(e) => {
                      setFilters((f) => ({ ...f, clrId: e.target.value }));
                      setPage(1);
                    }}
                  >
                    <option value="">Tous les CLR</option>
                    {clrs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="ds-field">
                  <label className="ds-label">Produit</label>
                  <select
                    className="ds-select"
                    value={filters.produitId}
                    onChange={(e) => {
                      setFilters((f) => ({ ...f, produitId: e.target.value }));
                      setPage(1);
                    }}
                  >
                    <option value="">Tous les produits</option>
                    {produits.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="ds-field">
                  <label className="ds-label">Date début</label>
                  <input
                    type="date"
                    className="ds-input"
                    value={filters.dateDebut}
                    onChange={(e) => {
                      setFilters((f) => ({ ...f, dateDebut: e.target.value }));
                      setPage(1);
                    }}
                  />
                </div>
                <div className="ds-field">
                  <label className="ds-label">Date fin</label>
                  <input
                    type="date"
                    className="ds-input"
                    value={filters.dateFin}
                    onChange={(e) => {
                      setFilters((f) => ({ ...f, dateFin: e.target.value }));
                      setPage(1);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="ds-card">
            <div className="ds-card-head">
              <div className="ds-card-title">
                <span className="ds-card-dot"></span>Mouvements
              </div>
              <span
                style={{
                  fontSize: ".72rem",
                  color: "var(--ds-ink-3)",
                  fontWeight: 600,
                }}
              >
                {total} résultat(s)
              </span>
            </div>

            {loading ? (
              <div className="ds-loading">
                <i
                  className="fas fa-spinner fa-spin"
                  style={{ marginRight: 8 }}
                ></i>
                Chargement…
              </div>
            ) : mouvements.length === 0 ? (
              <div className="ds-empty">
                <i className="fas fa-inbox"></i>
                <p>Aucun mouvement trouvé</p>
              </div>
            ) : (
              <div className="ds-table-wrap">
                <table className="ds-table">
                  <thead>
                    <tr>
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
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mouvements.map((m) => {
                      const cfg = TYPE_CONFIG[m.type] || {
                        label: m.type,
                        badgeCls: "ds-badge ds-badge-neutral",
                        icon: "fa-circle",
                        sign: "",
                      };
                      return (
                        <tr key={m.id}>
                          <td>
                            <div
                              className="mono"
                              style={{ fontSize: ".72rem" }}
                            >
                              {new Date(m.createdAt).toLocaleDateString(
                                "fr-DZ",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                },
                              )}
                            </div>
                            <div
                              style={{
                                fontSize: ".68rem",
                                color: "var(--ds-ink-3)",
                              }}
                            >
                              {new Date(m.createdAt).toLocaleTimeString(
                                "fr-FR",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={cfg.badgeCls}>
                              <i
                                className={`fas ${cfg.icon}`}
                                style={{ fontSize: ".62rem" }}
                              ></i>
                              {cfg.label}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 500 }}>
                              {m.Produit?.nom || m.produitId}
                            </div>
                            <div
                              className="mono"
                              style={{
                                color: "var(--ds-ink-3)",
                                fontSize: ".68rem",
                              }}
                            >
                              {m.Produit?.sku}
                            </div>
                          </td>
                          <td style={{ color: "var(--ds-ink-2)" }}>
                            {m.CLR?.nom || m.clrId}
                          </td>
                          <td
                            style={{
                              fontWeight: 700,
                              fontFamily: "var(--ds-mono)",
                              color:
                                cfg.sign === "+"
                                  ? "var(--ds-green)"
                                  : cfg.sign === "-"
                                    ? "var(--ds-red)"
                                    : "var(--ds-blue)",
                            }}
                          >
                            {cfg.sign}
                            {Math.abs(m.quantite)} {m.Produit?.unite || "u."}
                          </td>
                          <td
                            className="mono"
                            style={{ color: "var(--ds-ink-3)" }}
                          >
                            {m.referenceId || "—"}
                          </td>
                          <td style={{ color: "var(--ds-ink-2)" }}>
                            {m.User?.prenom || m.userId || "—"}
                          </td>
                          <td
                            style={{
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color: "var(--ds-ink-3)",
                            }}
                          >
                            {m.notes || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="ds-pagination">
              <button
                className="ds-page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <i className="fas fa-chevron-left"></i>
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
                    className={`ds-page-btn ${p === page ? "active" : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                className="ds-page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
              <span
                style={{
                  color: "var(--ds-ink-3)",
                  fontSize: ".76rem",
                  marginLeft: 8,
                }}
              >
                {total} résultats · Page {page}/{totalPages}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
