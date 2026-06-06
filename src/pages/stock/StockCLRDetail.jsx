// pages/stock/StockCLRDetail.jsx — Redesign blanc épuré
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import { DS_STYLE } from "../design-system";

const FAMILLE_COLOR = {
  HUILE: "var(--ds-amber)",
  MARGARINE: "var(--ds-red)",
  SUCRE: "var(--ds-purple)",
  SMEN: "var(--ds-amber)",
  CHOCOLAT: "var(--ds-red)",
  SAUCE: "var(--ds-green)",
  EAU: "var(--ds-blue)",
  MIEL: "var(--ds-amber)",
  CONFITURE: "var(--ds-purple)",
  BOISSON: "var(--ds-green)",
  PALETTE: "var(--ds-ink-3)",
};

const FAMILLE_BADGE_CLS = {
  HUILE: "ds-badge-amber",
  MARGARINE: "ds-badge-red",
  SUCRE: "ds-badge-purple",
  SMEN: "ds-badge-amber",
  CHOCOLAT: "ds-badge-red",
  SAUCE: "ds-badge-green",
  EAU: "ds-badge-blue",
  MIEL: "ds-badge-amber",
  CONFITURE: "ds-badge-purple",
  BOISSON: "ds-badge-green",
  PALETTE: "ds-badge-neutral",
};

const TYPE_CONFIG = {
  ENTREE_LIVRAISON: {
    label: "Entrée livraison",
    badgeCls: "ds-badge ds-badge-green",
    sign: "+",
  },
  SORTIE_PLANIF: {
    label: "Sortie planif",
    badgeCls: "ds-badge ds-badge-red",
    sign: "-",
  },
  AJUSTEMENT_MANUEL: {
    label: "Ajustement",
    badgeCls: "ds-badge ds-badge-blue",
    sign: "±",
  },
  RETOUR: { label: "Retour", badgeCls: "ds-badge ds-badge-purple", sign: "+" },
  PERTE: { label: "Perte", badgeCls: "ds-badge ds-badge-neutral", sign: "-" },
};

// ── Barre de niveau ───────────────────────────────────────────
const NiveauBar = ({ disponible, reservee, optimal, minimum }) => {
  const total = optimal || 100;
  const pctDispo = Math.min(100, (disponible / total) * 100);
  const pctRes = Math.min(100 - pctDispo, (reservee / total) * 100);
  const pctMin = minimum ? (minimum / total) * 100 : 0;
  const barColor =
    pctDispo > 50
      ? "var(--ds-green)"
      : pctDispo > 20
        ? "var(--ds-amber)"
        : "var(--ds-red)";

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div className="ds-bar-track">
        <div style={{ display: "flex", height: "100%" }}>
          <div
            className="ds-bar-fill"
            style={{ width: `${pctDispo}%`, background: barColor }}
          />
          <div
            style={{
              width: `${pctRes}%`,
              background: "var(--ds-amber)",
              opacity: 0.5,
              height: "100%",
              borderRadius: 3,
            }}
          />
        </div>
      </div>
      {pctMin > 0 && pctMin < 100 && (
        <div
          style={{
            position: "absolute",
            top: -2,
            left: `${pctMin}%`,
            width: 2,
            height: 10,
            background: "var(--ds-amber)",
            transform: "translateX(-50%)",
          }}
        />
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
export default function StockCLRDetail() {
  const { id: clrId } = useParams();
  const [data, setData] = useState(null);
  const [mouvements, setMouvements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState("stock");
  const [filtreFamille, setFiltreFamille] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [stockRes, mouvsRes] = await Promise.all([
          api.get(`/stock/clr/${clrId}`),
          api.get(`/stock/mouvements?clrId=${clrId}&limit=20`),
        ]);
        setData(stockRes.data);
        setMouvements(mouvsRes.data.mouvements || []);
      } catch {
        toast.error("Erreur chargement détail CLR");
      } finally {
        setLoading(false);
      }
    })();
  }, [clrId]);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 300,
          background: "var(--ds-bg)",
          fontFamily: "var(--ds-font)",
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: DS_STYLE }} />
        <div className="ds-loading">
          <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }}></i>
          Chargement…
        </div>
      </div>
    );
  if (!data) return null;

  const stocks = data.stocks || [];
  const familles = [
    ...new Set(stocks.map((s) => s.produit?.famille).filter(Boolean)),
  ];
  const stocksFiltres = filtreFamille
    ? stocks.filter((s) => s.produit?.famille === filtreFamille)
    : stocks;

  const alertes = stocks.filter(
    (s) => s.qteDisponible < (s.seuilMinimum || 0),
  ).length;
  const ruptures = stocks.filter((s) => s.qteDisponible <= 0).length;
  const totalDispo = stocks
    .reduce((a, s) => a + (s.qteDisponible || 0), 0)
    .toFixed(0);

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
          <div className="ds-eyebrow">
            <Link
              to="/stock"
              style={{
                color: "var(--ds-red)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <i
                className="fas fa-arrow-left"
                style={{ fontSize: ".8rem" }}
              ></i>{" "}
              Stock
            </Link>
          </div>
          <h1 className="ds-page-title">
            <span>{data.clr?.nom || `CLR #${clrId}`}</span>
          </h1>
          <p className="ds-page-sub">
            {data.clr?.plateforme?.nom &&
              `Plateforme ${data.clr.plateforme.nom} — `}
            {data.clr?.wilaya} · {stocks.length} produits
          </p>
        </div>

        {/* KPI Strip */}
        <div className="ds-kpi-strip">
          {[
            {
              lbl: "En stock",
              val: stocks.filter((s) => s.qteDisponible > 0).length,
              cls: "blue",
              icon: "fa-cubes",
            },
            {
              lbl: "Alertes seuil",
              val: alertes,
              cls: "amber",
              icon: "fa-triangle-exclamation",
            },
            {
              lbl: "Ruptures",
              val: ruptures,
              cls: "red",
              icon: "fa-circle-xmark",
            },
            {
              lbl: "Total disponible",
              val: Number(totalDispo).toLocaleString("fr-FR"),
              cls: "green",
              icon: "fa-warehouse",
            },
          ].map((k) => (
            <div key={k.lbl} className="ds-kpi">
              <div className="ds-kpi-lbl">{k.lbl}</div>
              <div className={`ds-kpi-val ${k.cls}`}>{k.val}</div>
              <i className={`fas ${k.icon} ds-kpi-icon`}></i>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="ds-tabs">
          {[
            { key: "stock", icon: "fa-boxes-stacked", label: "Stock produits" },
            {
              key: "mouvements",
              icon: "fa-arrows-rotate",
              label: "Mouvements récents",
            },
          ].map((t) => (
            <button
              key={t.key}
              className={`ds-tab ${onglet === t.key ? "active" : ""}`}
              onClick={() => setOnglet(t.key)}
            >
              <i className={`fas ${t.icon}`}></i>
              {t.label}
            </button>
          ))}
        </div>

        <div className="ds-content">
          {/* ── Onglet Stock ── */}
          {onglet === "stock" && (
            <>
              {/* Filtres famille */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginBottom: 18,
                  flexWrap: "wrap",
                }}
              >
                <button
                  className={`ds-chip ${!filtreFamille ? "active" : ""}`}
                  onClick={() => setFiltreFamille("")}
                >
                  Toutes
                </button>
                {familles.map((f) => (
                  <button
                    key={f}
                    className={`ds-chip ${filtreFamille === f ? `active-${(FAMILLE_BADGE_CLS[f] || "").replace("ds-badge-", "")}` : ""}`}
                    onClick={() => setFiltreFamille(f)}
                  >
                    <span
                      style={{
                        marginRight: 5,
                        display: "inline-block",
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: FAMILLE_COLOR[f] || "var(--ds-ink-3)",
                      }}
                    ></span>
                    {f}
                  </button>
                ))}
              </div>

              {/* Grille produits */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 14,
                }}
              >
                {stocksFiltres.map((s, i) => {
                  const alerte =
                    s.seuilMinimum && s.qteDisponible < s.seuilMinimum;
                  const dot =
                    FAMILLE_COLOR[s.produit?.famille] || "var(--ds-ink-3)";
                  const pct = s.seuilOptimal
                    ? Math.min(100, (s.qteDisponible / s.seuilOptimal) * 100)
                    : null;

                  return (
                    <div
                      key={i}
                      className="ds-card"
                      style={{
                        marginBottom: 0,
                        borderLeft: alerte
                          ? "3px solid var(--ds-amber)"
                          : undefined,
                      }}
                    >
                      <div className="ds-card-body">
                        {/* En-tête produit */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: 14,
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontWeight: 600,
                                color: "var(--ds-ink)",
                                fontSize: ".86rem",
                                lineHeight: 1.4,
                              }}
                            >
                              {s.produit?.nom || "Produit inconnu"}
                            </div>
                            <div
                              className="mono"
                              style={{
                                color: "var(--ds-ink-3)",
                                fontSize: ".68rem",
                                marginTop: 2,
                              }}
                            >
                              {s.produit?.sku}
                            </div>
                          </div>
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: dot,
                              flexShrink: 0,
                              marginTop: 5,
                            }}
                          />
                        </div>

                        {/* Chiffres */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: 8,
                            marginBottom: 12,
                          }}
                        >
                          {[
                            {
                              lbl: "Dispo",
                              val: (s.qteDisponible || 0).toFixed(0),
                              color: "var(--ds-green)",
                            },
                            {
                              lbl: "Réservé",
                              val: (s.qteReservee || 0).toFixed(0),
                              color: "var(--ds-amber)",
                            },
                            {
                              lbl: "Physique",
                              val: (
                                (s.qteDisponible || 0) - (s.qteReservee || 0)
                              ).toFixed(0),
                              color: "var(--ds-ink)",
                            },
                          ].map((m) => (
                            <div
                              key={m.lbl}
                              style={{
                                background: "var(--ds-surface-2)",
                                borderRadius: "var(--ds-radius)",
                                padding: "8px 10px",
                                border: "1px solid var(--ds-border)",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: ".58rem",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  letterSpacing: ".08em",
                                  color: "var(--ds-ink-3)",
                                  marginBottom: 3,
                                }}
                              >
                                {m.lbl}
                              </div>
                              <div
                                style={{
                                  fontSize: "1.1rem",
                                  fontWeight: 700,
                                  color: m.color,
                                  fontFamily: "var(--ds-mono)",
                                }}
                              >
                                {m.val}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Barre de niveau */}
                        {pct !== null && (
                          <div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: ".62rem",
                                color: "var(--ds-ink-3)",
                                marginBottom: 5,
                              }}
                            >
                              <span>
                                vs objectif {s.seuilOptimal?.toFixed(0)}
                              </span>
                              <span style={{ fontWeight: 700 }}>
                                {pct.toFixed(0)}%
                              </span>
                            </div>
                            <NiveauBar
                              disponible={s.qteDisponible}
                              reservee={s.qteReservee}
                              optimal={s.seuilOptimal}
                              minimum={s.seuilMinimum}
                            />
                          </div>
                        )}

                        {/* Alerte seuil */}
                        {alerte && (
                          <div
                            className="ds-alert ds-alert-warn"
                            style={{ marginTop: 10, padding: "6px 10px" }}
                          >
                            <i
                              className="fas fa-triangle-exclamation"
                              style={{ flexShrink: 0 }}
                            ></i>
                            <span style={{ fontSize: ".76rem" }}>
                              Sous le seuil minimum (
                              {s.seuilMinimum?.toFixed(0)})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Onglet Mouvements ── */}
          {onglet === "mouvements" && (
            <div className="ds-card">
              <div className="ds-card-head">
                <div className="ds-card-title">
                  <span className="ds-card-dot"></span>Mouvements récents
                </div>
                <span
                  style={{
                    fontSize: ".72rem",
                    color: "var(--ds-ink-3)",
                    fontWeight: 600,
                  }}
                >
                  {mouvements.length} entrée(s)
                </span>
              </div>

              {mouvements.length === 0 ? (
                <div className="ds-empty">
                  <i className="fas fa-inbox"></i>
                  <p>Aucun mouvement récent</p>
                </div>
              ) : (
                <div className="ds-table-wrap">
                  <table className="ds-table">
                    <thead>
                      <tr>
                        {[
                          "Date",
                          "Produit",
                          "Type",
                          "Quantité",
                          "Référence",
                          "Opérateur",
                        ].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mouvements.map((m, i) => {
                        const cfg = TYPE_CONFIG[m.type] || {
                          label: m.type,
                          badgeCls: "ds-badge ds-badge-neutral",
                          sign: "",
                        };
                        return (
                          <tr key={i}>
                            <td
                              className="mono"
                              style={{
                                color: "var(--ds-ink-3)",
                                fontSize: ".72rem",
                              }}
                            >
                              {new Date(m.createdAt).toLocaleDateString(
                                "fr-DZ",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </td>
                            <td style={{ color: "var(--ds-ink)" }}>
                              {m.produit?.nom || m.produitId}
                            </td>
                            <td>
                              <span className={cfg.badgeCls}>{cfg.label}</span>
                            </td>
                            <td
                              style={{
                                fontWeight: 700,
                                fontFamily: "var(--ds-mono)",
                                color:
                                  m.quantite > 0
                                    ? "var(--ds-green)"
                                    : "var(--ds-red)",
                              }}
                            >
                              {m.quantite > 0 ? "+" : ""}
                              {m.quantite}
                            </td>
                            <td
                              className="mono"
                              style={{ color: "var(--ds-ink-3)" }}
                            >
                              {m.referenceId ? `#${m.referenceId}` : "—"}
                            </td>
                            <td style={{ color: "var(--ds-ink-2)" }}>
                              {m.user?.name || m.userId || "Système"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div
                style={{
                  padding: "12px 22px",
                  borderTop: "1px solid var(--ds-border)",
                }}
              >
                <Link
                  to="/stock/mouvements"
                  className="ds-btn ds-btn-ghost ds-btn-sm"
                  style={{ textDecoration: "none" }}
                >
                  <i className="fas fa-arrow-right"></i> Voir tout le journal
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
