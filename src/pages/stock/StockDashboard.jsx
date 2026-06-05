import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { useToast } from "../../context/ToastContext";

const FAMILLE_DOT = {
  HUILE: "#f59e0b",
  MARGARINE: "#ec4899",
  SUCRE: "#8b5cf6",
  SMEN: "#f97316",
  CHOCOLAT: "#c0392b",
  SAUCE: "#22c55e",
  EAU: "#3b82f6",
  MIEL: "#eab308",
  CONFITURE: "#d946ef",
  BOISSON: "#10b981",
  PALETTE: "#9a9a96",
};

const SD_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;900&display=swap');
  :root {
    --sd-bg:#f8f8f7; --sd-surface:#ffffff; --sd-surface-2:#f2f2f0;
    --sd-border:#e6e6e3; --sd-border-2:#d0d0cc;
    --sd-ink:#111110; --sd-ink-2:#555553; --sd-ink-3:#9a9a96;
    --sd-red:#c0392b; --sd-red-soft:rgba(192,57,43,.07); --sd-red-mid:rgba(192,57,43,.15);
    --sd-green:#1a7a4a; --sd-green-soft:rgba(26,122,74,.07);
    --sd-amber:#b45309; --sd-amber-soft:rgba(180,83,9,.08);
    --sd-radius:5px; --sd-radius-lg:10px;
    --sd-shadow-sm:0 1px 3px rgba(0,0,0,.05);
    --sd-font:'DM Sans',system-ui,sans-serif; --sd-mono:'DM Mono',monospace;
  }
  .sd-root { min-height:100vh; background:var(--sd-bg); font-family:var(--sd-font); color:var(--sd-ink); -webkit-font-smoothing:antialiased; }

  .sd-page-header { background:var(--sd-surface); border-bottom:1px solid var(--sd-border); padding:28px 36px 24px; }
  .sd-eyebrow { font-size:.62rem; font-weight:700; letter-spacing:.18em; text-transform:uppercase; color:var(--sd-red); margin-bottom:6px; display:flex; align-items:center; gap:7px; }
  .sd-eyebrow::before { content:''; width:18px; height:2px; background:var(--sd-red); }
  .sd-page-title { font-family:'Playfair Display',serif; font-size:1.8rem; font-weight:900; line-height:1; letter-spacing:-.02em; color:var(--sd-ink); margin-bottom:4px; }
  .sd-page-title span { color:var(--sd-red); }
  .sd-page-sub { font-size:.82rem; color:var(--sd-ink-3); }
  .sd-header-row { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap; }
  .sd-header-actions { display:flex; gap:8px; align-items:center; }

  .sd-btn { display:inline-flex; align-items:center; gap:7px; font-family:var(--sd-font); font-size:.8rem; font-weight:600; padding:9px 18px; border-radius:var(--sd-radius); border:1px solid var(--sd-border-2); cursor:pointer; transition:all .15s; background:var(--sd-surface); color:var(--sd-ink); text-decoration:none; white-space:nowrap; }
  .sd-btn:hover { border-color:var(--sd-ink); background:var(--sd-surface-2); }
  .sd-btn-primary { background:var(--sd-ink); color:#fff; border-color:var(--sd-ink); }
  .sd-btn-primary:hover { background:#2a2a28; }

  .sd-kpi-strip { display:grid; grid-template-columns:repeat(4,1fr); background:var(--sd-surface); border-bottom:1px solid var(--sd-border); }
  .sd-kpi { flex:1; padding:16px 28px; border-right:1px solid var(--sd-border); position:relative; overflow:hidden; }
  .sd-kpi:last-child { border-right:none; }
  .sd-kpi-lbl { font-size:.62rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:var(--sd-ink-3); margin-bottom:4px; }
  .sd-kpi-val { font-size:1.7rem; font-weight:700; font-family:var(--sd-mono); line-height:1; color:var(--sd-ink); }
  .sd-kpi-sub { font-size:.68rem; color:var(--sd-ink-3); margin-top:3px; }
  .sd-kpi-icon { position:absolute; right:16px; top:50%; transform:translateY(-50%); font-size:1.4rem; opacity:.05; }

  .sd-content { padding:28px 36px; }

  .sd-alert-strip { display:flex; align-items:flex-start; gap:12px; padding:14px 18px; border-radius:var(--sd-radius); background:var(--sd-amber-soft); border:1px solid #fde68a; margin-bottom:20px; font-size:.82rem; }
  .sd-alert-chips { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
  .sd-alert-chip { display:flex; align-items:center; gap:6px; padding:4px 10px; border-radius:var(--sd-radius); background:var(--sd-surface); border:1px solid var(--sd-border); font-size:.72rem; color:var(--sd-ink-2); }

  .sd-filter-bar { display:flex; gap:10px; margin-bottom:18px; align-items:center; flex-wrap:wrap; }
  .sd-select { padding:8px 12px; border:1px solid var(--sd-border-2); border-radius:var(--sd-radius); font-family:var(--sd-font); font-size:.82rem; color:var(--sd-ink); background:var(--sd-surface); outline:none; cursor:pointer; transition:border-color .15s; }
  .sd-select:focus { border-color:var(--sd-ink); }
  .sd-filter-count { font-size:.75rem; color:var(--sd-ink-3); font-weight:600; }

  .sd-card { background:var(--sd-surface); border:1px solid var(--sd-border); border-radius:var(--sd-radius-lg); box-shadow:var(--sd-shadow-sm); overflow:hidden; }
  .sd-table { width:100%; border-collapse:collapse; }
  .sd-table th { padding:10px 14px; text-align:left; font-size:.62rem; font-weight:700; text-transform:uppercase; letter-spacing:.09em; color:var(--sd-ink-3); border-bottom:2px solid var(--sd-border); background:var(--sd-surface-2); white-space:nowrap; }
  .sd-table td { padding:11px 14px; font-size:.8rem; border-bottom:1px solid var(--sd-border); vertical-align:middle; }
  .sd-table tbody tr:hover td { background:var(--sd-surface-2); }
  .sd-table tbody tr:last-child td { border-bottom:none; }
  .sd-mono { font-family:var(--sd-mono); font-size:.72rem; }

  .sd-badge { display:inline-flex; align-items:center; gap:4px; font-size:.62rem; font-weight:700; text-transform:uppercase; letter-spacing:.07em; padding:2px 8px; border-radius:20px; }
  .sd-badge-rupture { background:var(--sd-red-soft); color:var(--sd-red); border:1px solid var(--sd-red-mid); }
  .sd-badge-critique { background:var(--sd-amber-soft); color:var(--sd-amber); border:1px solid #fde68a; }
  .sd-badge-bas { background:rgba(180,83,9,.05); color:var(--sd-amber); border:1px solid #fde68a; }
  .sd-badge-ok { background:var(--sd-green-soft); color:var(--sd-green); border:1px solid #bbf7d0; }

  .sd-fam-tag { display:inline-flex; align-items:center; gap:5px; font-size:.68rem; font-weight:600; padding:2px 9px; border-radius:20px; background:var(--sd-surface-2); border:1px solid var(--sd-border); color:var(--sd-ink-2); }
  .sd-fam-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }

  .sd-gauge-wrap { display:flex; flex-direction:column; gap:3px; }
  .sd-gauge-track { width:72px; height:4px; background:var(--sd-surface-2); border-radius:4px; border:1px solid var(--sd-border); }
  .sd-gauge-fill { height:100%; border-radius:4px; transition:width .4s; }

  .sd-empty { text-align:center; padding:48px 20px; color:var(--sd-ink-3); }
  .sd-empty i { font-size:2rem; opacity:.15; margin-bottom:12px; display:block; }
  .sd-empty p { font-size:.84rem; }
  .sd-loading { display:flex; align-items:center; justify-content:center; padding:60px; color:var(--sd-ink-3); gap:10px; font-size:.84rem; }
`;

function StockBadge({ niveau }) {
  const map = {
    RUPTURE: "sd-badge-rupture",
    CRITIQUE: "sd-badge-critique",
    BAS: "sd-badge-bas",
    OK: "sd-badge-ok",
  };
  return (
    <span className={`sd-badge ${map[niveau] || "sd-badge-ok"}`}>{niveau}</span>
  );
}

export default function StockDashboard() {
  const [stockData, setStockData] = useState(null);
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtreClr, setFiltreClr] = useState("");
  const [filtreFamille, setFiltreFamille] = useState("");
  const [clrs, setClrs] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [stockRes, alertesRes, infraRes] = await Promise.all([
        api.get("/stock"),
        api.get("/stock/alertes"),
        api.get("/infrastructure"),
      ]);
      const lignes = stockRes.data;
      setStockData({
        lignes,
        stats: {
          totalProduits: lignes.length,
          totalReferences: [...new Set(lignes.map((l) => l.produitId))].length,
          clrCouverts: [...new Set(lignes.map((l) => l.clrId))].length,
          mouvements7j: 0,
        },
      });
      setAlertes(alertesRes.data.alertes || []);
      setClrs(infraRes.data.flatMap((p) => p.clrs || []));
    } catch {
      toast.error("Erreur chargement stock");
    } finally {
      setLoading(false);
    }
  };

  const lignesFiltered = (stockData?.lignes || []).filter((l) => {
    if (filtreClr && l.clrId !== parseInt(filtreClr)) return false;
    if (filtreFamille && l.produit?.famille !== filtreFamille) return false;
    return true;
  });

  const stats = stockData?.stats || {};
  const familles = [
    ...new Set(
      (stockData?.lignes || []).map((l) => l.produit?.famille).filter(Boolean),
    ),
  ];

  const KPI = [
    {
      lbl: "Produits en stock",
      val: stats.totalProduits || 0,
      sub: `sur ${stats.totalReferences || 0} references`,
      icon: "fa-box",
    },
    {
      lbl: "CLR couverts",
      val: stats.clrCouverts || 0,
      sub: "plateformes actives",
      icon: "fa-warehouse",
    },
    {
      lbl: "Alertes actives",
      val: alertes.length,
      sub: `${alertes.filter((a) => a.niveau === "RUPTURE").length} ruptures`,
      icon: "fa-triangle-exclamation",
      color: alertes.length > 0 ? "var(--sd-red)" : undefined,
    },
    {
      lbl: "Mouvements (7j)",
      val: stats.mouvements7j || 0,
      sub: "entrees + sorties",
      icon: "fa-arrow-right-arrow-left",
    },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SD_STYLE }} />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />
      <div className="sd-root">
        {/* Header */}
        <div className="sd-page-header">
          <div className="sd-header-row">
            <div>
              <div className="sd-eyebrow">Module actif</div>
              <h1 className="sd-page-title">
                Tableau de bord <span>Stock</span>
              </h1>
              <p className="sd-page-sub">
                Niveaux de stock par produit et par CLR — mis a jour en temps
                reel
              </p>
            </div>
            <div className="sd-header-actions">
              <Link to="/stock/carte" className="sd-btn">
                <i className="fas fa-map-location-dot"></i>Carte
              </Link>
              <Link to="/stock/mouvements" className="sd-btn">
                <i className="fas fa-list"></i>Journal
              </Link>
              <Link to="/stock/intelligent" className="sd-btn sd-btn-primary">
                <i className="fas fa-brain"></i>Stock IA
              </Link>
            </div>
          </div>
        </div>

        {/* KPI strip */}
        <div className="sd-kpi-strip">
          {KPI.map((k) => (
            <div key={k.lbl} className="sd-kpi">
              <div className="sd-kpi-lbl">{k.lbl}</div>
              <div className="sd-kpi-val" style={{ color: k.color }}>
                {k.val}
              </div>
              <div className="sd-kpi-sub">{k.sub}</div>
              <i className={`fas ${k.icon} sd-kpi-icon`}></i>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="sd-content">
          {loading ? (
            <div className="sd-loading">
              <i className="fas fa-spinner fa-spin"></i>Chargement stock…
            </div>
          ) : (
            <>
              {/* Alertes */}
              {alertes.length > 0 && (
                <div className="sd-alert-strip">
                  <i
                    className="fas fa-triangle-exclamation"
                    style={{
                      color: "var(--sd-amber)",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  ></i>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        color: "var(--sd-amber)",
                        marginBottom: 6,
                        fontSize: ".82rem",
                      }}
                    >
                      {alertes.length} alerte{alertes.length > 1 ? "s" : ""} de
                      stock
                    </div>
                    <div className="sd-alert-chips">
                      {alertes.slice(0, 6).map((a, i) => (
                        <div key={i} className="sd-alert-chip">
                          <span>
                            {a.produitNom} — {a.clrNom}
                          </span>
                          <StockBadge niveau={a.niveau} />
                        </div>
                      ))}
                      {alertes.length > 6 && (
                        <Link
                          to="/stock/intelligent"
                          style={{
                            fontSize: ".72rem",
                            color: "var(--sd-amber)",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          +{alertes.length - 6} autres{" "}
                          <i className="fas fa-arrow-right"></i>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Filtres */}
              <div className="sd-filter-bar">
                <select
                  className="sd-select"
                  value={filtreClr}
                  onChange={(e) => setFiltreClr(e.target.value)}
                >
                  <option value="">Tous les CLR</option>
                  {clrs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </select>
                <select
                  className="sd-select"
                  value={filtreFamille}
                  onChange={(e) => setFiltreFamille(e.target.value)}
                >
                  <option value="">Toutes familles</option>
                  {familles.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <span className="sd-filter-count">
                  {lignesFiltered.length} ligne
                  {lignesFiltered.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Table */}
              <div className="sd-card">
                <table className="sd-table">
                  <thead>
                    <tr>
                      {[
                        "Produit",
                        "SKU",
                        "Famille",
                        "CLR",
                        "Dispo",
                        "Reserve",
                        "Physique",
                        "Etat",
                      ].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lignesFiltered.length === 0 ? (
                      <tr>
                        <td colSpan={8}>
                          <div className="sd-empty">
                            <i className="fas fa-inbox"></i>
                            <p>Aucun stock trouve</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      lignesFiltered.map((l, i) => {
                        const fam = l.produit?.famille;
                        const dot = FAMILLE_DOT[fam] || "#9a9a96";
                        const pctVal = l.seuilOptimal
                          ? Math.min(
                              100,
                              (l.qteDisponible / l.seuilOptimal) * 100,
                            )
                          : null;
                        const niveau =
                          l.qteDisponible <= 0
                            ? "RUPTURE"
                            : l.seuilMinimum && l.qteDisponible < l.seuilMinimum
                              ? "CRITIQUE"
                              : pctVal && pctVal < 30
                                ? "BAS"
                                : "OK";
                        const gaugeColor =
                          pctVal > 60
                            ? "#1a7a4a"
                            : pctVal > 30
                              ? "#b45309"
                              : "#c0392b";
                        return (
                          <tr key={i}>
                            <td style={{ fontWeight: 500 }}>
                              {l.produit?.nom || "—"}
                            </td>
                            <td
                              className="sd-mono"
                              style={{ color: "var(--sd-ink-3)" }}
                            >
                              {l.produit?.sku || "—"}
                            </td>
                            <td>
                              <span className="sd-fam-tag">
                                <span
                                  className="sd-fam-dot"
                                  style={{ background: dot }}
                                ></span>
                                {fam || "—"}
                              </span>
                            </td>
                            <td>
                              <Link
                                to={`/stock/clr/${l.clrId}`}
                                style={{
                                  color: "var(--sd-red)",
                                  textDecoration: "none",
                                  fontWeight: 500,
                                  fontSize: ".82rem",
                                }}
                              >
                                {l.clr?.nom || l.clrId}
                              </Link>
                            </td>
                            <td
                              style={{
                                fontWeight: 700,
                                fontFamily: "var(--sd-mono)",
                                color: "var(--sd-green)",
                              }}
                            >
                              {(l.qteDisponible || 0).toFixed(0)}
                            </td>
                            <td
                              style={{
                                fontFamily: "var(--sd-mono)",
                                color: "var(--sd-amber)",
                              }}
                            >
                              {(l.qteReservee || 0).toFixed(0)}
                            </td>
                            <td>
                              <div className="sd-gauge-wrap">
                                <span
                                  style={{
                                    fontFamily: "var(--sd-mono)",
                                    fontSize: ".78rem",
                                  }}
                                >
                                  {(
                                    (l.qteDisponible || 0) -
                                    (l.qteReservee || 0)
                                  ).toFixed(0)}
                                </span>
                                {pctVal !== null && (
                                  <div className="sd-gauge-track">
                                    <div
                                      className="sd-gauge-fill"
                                      style={{
                                        width: `${pctVal}%`,
                                        background: gaugeColor,
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <StockBadge niveau={niveau} />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
