import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { useToast } from "../../context/ToastContext";

const FAMILLE_COLORS = {
  HUILE: { bg: "#fef3c7", text: "#92400e", border: "#fcd34d", dot: "#f59e0b" },
  MARGARINE: {
    bg: "#fce7f3",
    text: "#9d174d",
    border: "#f9a8d4",
    dot: "#ec4899",
  },
  SUCRE: { bg: "#ede9fe", text: "#4c1d95", border: "#c4b5fd", dot: "#8b5cf6" },
  SMEN: { bg: "#fff7ed", text: "#7c2d12", border: "#fdba74", dot: "#f97316" },
  CHOCOLAT: {
    bg: "#fef2f2",
    text: "#7f1d1d",
    border: "#fca5a5",
    dot: "#ef4444",
  },
  SAUCE: { bg: "#f0fdf4", text: "#14532d", border: "#86efac", dot: "#22c55e" },
  EAU: { bg: "#eff6ff", text: "#1e3a8a", border: "#93c5fd", dot: "#3b82f6" },
  MIEL: { bg: "#fefce8", text: "#713f12", border: "#fde68a", dot: "#eab308" },
  CONFITURE: {
    bg: "#fdf4ff",
    text: "#581c87",
    border: "#e879f9",
    dot: "#d946ef",
  },
  BOISSON: {
    bg: "#ecfdf5",
    text: "#064e3b",
    border: "#6ee7b7",
    dot: "#10b981",
  },
  PALETTE: {
    bg: "#f8fafc",
    text: "#334155",
    border: "#cbd5e1",
    dot: "#64748b",
  },
};

const StatCard = ({ label, value, sub, color, icon }) => (
  <div
    style={{
      background: "#181c27",
      border: "1px solid #23283a",
      borderRadius: 14,
      padding: "22px 26px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 80,
        height: 80,
        background: `${color}18`,
        borderRadius: "0 14px 0 80px",
      }}
    />
    <div style={{ fontSize: 26, lineHeight: 1 }}>{icon}</div>
    <div
      style={{
        fontSize: 28,
        fontWeight: 700,
        color: "#fff",
        letterSpacing: -1,
      }}
    >
      {value}
    </div>
    <div style={{ fontSize: 13, color: "#64748b" }}>{label}</div>
    {sub && (
      <div style={{ fontSize: 12, color: color, marginTop: 2 }}>{sub}</div>
    )}
  </div>
);

const StockBadge = ({ niveau }) => {
  const cfg =
    niveau === "RUPTURE"
      ? { bg: "#7f1d1d", text: "#fca5a5", label: "⛔ Rupture" }
      : niveau === "CRITIQUE"
        ? { bg: "#431407", text: "#fb923c", label: "⚠️ Critique" }
        : niveau === "BAS"
          ? { bg: "#3d2400", text: "#fbbf24", label: "🔶 Bas" }
          : { bg: "#0f2a1a", text: "#4ade80", label: "✅ OK" };
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.text,
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {cfg.label}
    </span>
  );
};

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
      const stats = {
        totalProduits: lignes.length,
        totalReferences: [...new Set(lignes.map((l) => l.produitId))].length,
        clrCouverts: [...new Set(lignes.map((l) => l.clrId))].length,
        mouvements7j: 0,
      };

      setStockData({ lignes, stats });
      setAlertes(alertesRes.data.alertes || []);
      setClrs(infraRes.data.flatMap((p) => p.clrs || []));
    } catch (e) {
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
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 300,
          color: "#64748b",
        }}
      >
        <div
          className="spinner"
          style={{
            width: 32,
            height: 32,
            border: "3px solid #23283a",
            borderTop: "3px solid #3b82f6",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            marginRight: 14,
          }}
        />
        Chargement stock...
      </div>
    );

  return (
    <div style={{ padding: "30px 32px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <div>
          <h1
            style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: 0 }}
          >
            📦 Tableau de bord Stock
          </h1>
          <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 14 }}>
            Niveaux de stock par produit et par CLR — mis à jour en temps réel
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link
            to="/stock/carte"
            style={{
              background: "#181c27",
              border: "1px solid #23283a",
              color: "#94a3b8",
              padding: "9px 18px",
              borderRadius: 10,
              textDecoration: "none",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            🗺️ Carte
          </Link>
          <Link
            to="/stock/mouvements"
            style={{
              background: "#181c27",
              border: "1px solid #23283a",
              color: "#94a3b8",
              padding: "9px 18px",
              borderRadius: 10,
              textDecoration: "none",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            📋 Journal
          </Link>
          <Link
            to="/stock/intelligent"
            style={{
              background: "#3b82f6",
              border: "none",
              color: "#fff",
              padding: "9px 18px",
              borderRadius: 10,
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            🤖 Stock IA
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <StatCard
          label="Produits en stock"
          value={stats.totalProduits || 0}
          icon="📦"
          color="#3b82f6"
          sub={`sur ${stats.totalReferences || 0} références`}
        />
        <StatCard
          label="CLR couverts"
          value={stats.clrCouverts || 0}
          icon="🏬"
          color="#10b981"
          sub="plateformes actives"
        />
        <StatCard
          label="Alertes actives"
          value={alertes.length}
          icon="⚠️"
          color="#f59e0b"
          sub={
            alertes.filter((a) => a.niveau === "RUPTURE").length + " ruptures"
          }
        />
        <StatCard
          label="Mouvements (7j)"
          value={stats.mouvements7j || 0}
          icon="🔄"
          color="#8b5cf6"
          sub="entrées + sorties"
        />
      </div>

      {/* Alertes */}
      {alertes.length > 0 && (
        <div
          style={{
            background: "#1a1207",
            border: "1px solid #92400e",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              color: "#fbbf24",
              fontWeight: 600,
              marginBottom: 10,
              fontSize: 14,
            }}
          >
            ⚠️ {alertes.length} alerte{alertes.length > 1 ? "s" : ""} de stock
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {alertes.slice(0, 6).map((a, i) => (
              <div
                key={i}
                style={{
                  background: "#0f1117",
                  border: "1px solid #3d2400",
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 12,
                  color: "#fbbf24",
                }}
              >
                {a.produitNom} — {a.clrNom} <StockBadge niveau={a.niveau} />
              </div>
            ))}
            {alertes.length > 6 && (
              <Link
                to="/stock/intelligent"
                style={{
                  fontSize: 12,
                  color: "#f59e0b",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                +{alertes.length - 6} autres →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <select
          value={filtreClr}
          onChange={(e) => setFiltreClr(e.target.value)}
          style={{
            background: "#181c27",
            border: "1px solid #23283a",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 8,
            fontSize: 13,
            outline: "none",
          }}
        >
          <option value="">Tous les CLR</option>
          {clrs.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
        <select
          value={filtreFamille}
          onChange={(e) => setFiltreFamille(e.target.value)}
          style={{
            background: "#181c27",
            border: "1px solid #23283a",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 8,
            fontSize: 13,
            outline: "none",
          }}
        >
          <option value="">Toutes familles</option>
          {familles.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <div
          style={{
            color: "#64748b",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
          }}
        >
          {lignesFiltered.length} ligne{lignesFiltered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Tableau */}
      <div
        style={{
          background: "#181c27",
          border: "1px solid #23283a",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #23283a" }}>
              {[
                "Produit",
                "SKU",
                "Famille",
                "CLR",
                "Dispo",
                "Réservé",
                "Physique",
                "État",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignesFiltered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{ padding: 40, textAlign: "center", color: "#64748b" }}
                >
                  Aucun stock trouvé
                </td>
              </tr>
            ) : (
              lignesFiltered.map((l, i) => {
                const fam = l.produit?.famille;
                const cols = FAMILLE_COLORS[fam] || FAMILLE_COLORS.PALETTE;
                const pct = l.seuilOptimal
                  ? Math.min(100, (l.qteDisponible / l.seuilOptimal) * 100)
                  : null;
                const niveau =
                  l.qteDisponible <= 0
                    ? "RUPTURE"
                    : l.seuilMinimum && l.qteDisponible < l.seuilMinimum
                      ? "CRITIQUE"
                      : pct && pct < 30
                        ? "BAS"
                        : "OK";
                return (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid #1a1f2e",
                      background: i % 2 === 0 ? "transparent" : "#0f1117",
                      transition: "background 0.15s",
                    }}
                  >
                    <td
                      style={{
                        padding: "13px 16px",
                        color: "#e2e8f0",
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      {l.produit?.nom || "—"}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        color: "#64748b",
                        fontSize: 12,
                        fontFamily: "monospace",
                      }}
                    >
                      {l.produit?.sku || "—"}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span
                        style={{
                          background: cols.bg + "22",
                          color: cols.dot,
                          border: `1px solid ${cols.border}44`,
                          padding: "2px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {fam}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        color: "#94a3b8",
                        fontSize: 13,
                      }}
                    >
                      <Link
                        to={`/stock/clr/${l.clrId}`}
                        style={{ color: "#60a5fa", textDecoration: "none" }}
                      >
                        {l.clr?.nom || l.clrId}
                      </Link>
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        color: "#4ade80",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {(l.qteDisponible || 0).toFixed(0)}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        color: "#fb923c",
                        fontSize: 13,
                      }}
                    >
                      {(l.qteReservee || 0).toFixed(0)}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        color: "#e2e8f0",
                        fontSize: 13,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <span>
                          {(
                            (l.qteDisponible || 0) - (l.qteReservee || 0)
                          ).toFixed(0)}
                        </span>
                        {pct !== null && (
                          <div
                            style={{
                              width: 80,
                              height: 4,
                              background: "#23283a",
                              borderRadius: 4,
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                height: "100%",
                                borderRadius: 4,
                                background:
                                  pct > 60
                                    ? "#22c55e"
                                    : pct > 30
                                      ? "#f59e0b"
                                      : "#ef4444",
                                transition: "width 0.4s",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <StockBadge niveau={niveau} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
