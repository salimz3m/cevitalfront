import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/api";
import { useToast } from "../../context/ToastContext";

const FAMILLE_DOT = {
  HUILE: "#f59e0b",
  MARGARINE: "#ec4899",
  SUCRE: "#8b5cf6",
  SMEN: "#f97316",
  CHOCOLAT: "#ef4444",
  SAUCE: "#22c55e",
  EAU: "#3b82f6",
  MIEL: "#eab308",
  CONFITURE: "#d946ef",
  BOISSON: "#10b981",
  PALETTE: "#64748b",
};

const NiveauBar = ({ disponible, reservee, optimal, minimum }) => {
  const total = optimal || 100;
  const pctDispo = Math.min(100, (disponible / total) * 100);
  const pctRes = Math.min(100 - pctDispo, (reservee / total) * 100);
  const pctMin = minimum ? (minimum / total) * 100 : 0;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        style={{
          height: 8,
          background: "#23283a",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            height: "100%",
          }}
        >
          <div
            style={{
              width: `${pctDispo}%`,
              background:
                pctDispo > 50
                  ? "#22c55e"
                  : pctDispo > 20
                    ? "#f59e0b"
                    : "#ef4444",
              transition: "width 0.4s",
            }}
          />
          <div
            style={{ width: `${pctRes}%`, background: "#fb923c", opacity: 0.6 }}
          />
        </div>
      </div>
      {/* Marqueur seuil minimum */}
      {pctMin > 0 && pctMin < 100 && (
        <div
          style={{
            position: "absolute",
            top: -2,
            left: `${pctMin}%`,
            width: 2,
            height: 12,
            background: "#f59e0b",
            transform: "translateX(-50%)",
          }}
        />
      )}
    </div>
  );
};

export default function StockCLRDetail() {
  const { id: clrId } = useParams(); // lit "id" et le renomme clrId
  const [data, setData] = useState(null);
  const [mouvements, setMouvements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState("stock");
  const [filtreFamille, setFiltreFamille] = useState("");
  const { toast } = useToast();
  useEffect(() => {
    const fetchData = async () => {
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
    };
    fetchData();
  }, [clrId]);

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
        Chargement...
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

  const TYPE_CONFIG = {
    ENTREE_LIVRAISON: {
      label: "Entrée livraison",
      color: "#22c55e",
      icon: "📥",
    },
    SORTIE_PLANIF: { label: "Sortie planif", color: "#ef4444", icon: "📤" },
    AJUSTEMENT_MANUEL: { label: "Ajustement", color: "#f59e0b", icon: "✏️" },
    RETOUR: { label: "Retour", color: "#8b5cf6", icon: "↩️" },
    PERTE: { label: "Perte", color: "#94a3b8", icon: "🗑️" },
  };

  return (
    <div style={{ padding: "30px 32px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <Link
          to="/stock"
          style={{ color: "#64748b", textDecoration: "none", fontSize: 20 }}
        >
          ←
        </Link>
        <div>
          <h1
            style={{ fontSize: 24, fontWeight: 700, color: "#fff", margin: 0 }}
          >
            🏬 {data.clr?.nom || `CLR #${clrId}`}
          </h1>
          <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 13 }}>
            {data.clr?.plateforme?.nom &&
              `Plateforme ${data.clr.plateforme.nom} — `}
            {data.clr?.wilaya} · {stocks.length} produits
          </p>
        </div>
      </div>

      {/* Stats rapides */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: "Produits en stock",
            val: stocks.filter((s) => s.qteDisponible > 0).length,
            color: "#3b82f6",
          },
          {
            label: "Alertes",
            val: stocks.filter((s) => s.qteDisponible < (s.seuilMinimum || 0))
              .length,
            color: "#f59e0b",
          },
          {
            label: "Ruptures",
            val: stocks.filter((s) => s.qteDisponible <= 0).length,
            color: "#ef4444",
          },
          {
            label: "Total disponible",
            val: stocks
              .reduce((a, s) => a + (s.qteDisponible || 0), 0)
              .toFixed(0),
            color: "#22c55e",
          },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              background: "#181c27",
              border: "1px solid #23283a",
              borderRadius: 12,
              padding: "16px 20px",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>
              {s.val}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div
        style={{
          display: "flex",
          gap: 2,
          marginBottom: 20,
          background: "#181c27",
          borderRadius: 10,
          padding: 4,
          width: "fit-content",
        }}
      >
        {[
          { key: "stock", label: "📦 Stock produits" },
          { key: "mouvements", label: "🔄 Mouvements récents" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setOnglet(t.key)}
            style={{
              background: onglet === t.key ? "#23283a" : "transparent",
              border: "none",
              color: onglet === t.key ? "#fff" : "#64748b",
              padding: "8px 18px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: onglet === t.key ? 600 : 400,
              transition: "all 0.2s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {onglet === "stock" && (
        <>
          {/* Filtre famille */}
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setFiltreFamille("")}
              style={{
                background: !filtreFamille ? "#3b82f6" : "#181c27",
                border: `1px solid ${!filtreFamille ? "#3b82f6" : "#23283a"}`,
                color: !filtreFamille ? "#fff" : "#64748b",
                padding: "5px 14px",
                borderRadius: 20,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Toutes
            </button>
            {familles.map((f) => (
              <button
                key={f}
                onClick={() => setFiltreFamille(f)}
                style={{
                  background: filtreFamille === f ? "#23283a" : "#181c27",
                  border: `1px solid ${filtreFamille === f ? FAMILLE_DOT[f] : "#23283a"}`,
                  color:
                    filtreFamille === f ? FAMILLE_DOT[f] || "#fff" : "#64748b",
                  padding: "5px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    marginRight: 5,
                    display: "inline-block",
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: FAMILLE_DOT[f],
                  }}
                />
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
              const pct = s.seuilOptimal
                ? Math.min(100, (s.qteDisponible / s.seuilOptimal) * 100)
                : null;
              const alerte = s.seuilMinimum && s.qteDisponible < s.seuilMinimum;
              const dot = FAMILLE_DOT[s.produit?.famille] || "#64748b";
              return (
                <div
                  key={i}
                  style={{
                    background: "#181c27",
                    border: `1px solid ${alerte ? "#92400e" : "#23283a"}`,
                    borderRadius: 12,
                    padding: 18,
                    transition: "border-color 0.2s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#e2e8f0",
                          fontSize: 13,
                          lineHeight: 1.4,
                        }}
                      >
                        {s.produit?.nom || "Produit inconnu"}
                      </div>
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: 11,
                          marginTop: 2,
                          fontFamily: "monospace",
                        }}
                      >
                        {s.produit?.sku}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: dot,
                        flexShrink: 0,
                        marginTop: 3,
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        background: "#0f1117",
                        borderRadius: 8,
                        padding: "8px 10px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "#64748b",
                          marginBottom: 2,
                        }}
                      >
                        Dispo
                      </div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#4ade80",
                        }}
                      >
                        {(s.qteDisponible || 0).toFixed(0)}
                      </div>
                    </div>
                    <div
                      style={{
                        background: "#0f1117",
                        borderRadius: 8,
                        padding: "8px 10px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "#64748b",
                          marginBottom: 2,
                        }}
                      >
                        Réservé
                      </div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#fb923c",
                        }}
                      >
                        {(s.qteReservee || 0).toFixed(0)}
                      </div>
                    </div>
                    <div
                      style={{
                        background: "#0f1117",
                        borderRadius: 8,
                        padding: "8px 10px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "#64748b",
                          marginBottom: 2,
                        }}
                      >
                        Physique
                      </div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#e2e8f0",
                        }}
                      >
                        {(
                          (s.qteDisponible || 0) - (s.qteReservee || 0)
                        ).toFixed(0)}
                      </div>
                    </div>
                  </div>

                  {pct !== null && (
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 10,
                          color: "#64748b",
                          marginBottom: 4,
                        }}
                      >
                        <span>vs objectif {s.seuilOptimal?.toFixed(0)}</span>
                        <span>{pct.toFixed(0)}%</span>
                      </div>
                      <NiveauBar
                        disponible={s.qtéDisponible}
                        reservee={s.qtéReservee}
                        optimal={s.seuilOptimal}
                        minimum={s.seuilMinimum}
                      />
                    </div>
                  )}

                  {alerte && (
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 11,
                        color: "#fbbf24",
                        background: "#1a1207",
                        borderRadius: 6,
                        padding: "5px 10px",
                      }}
                    >
                      ⚠️ Sous le seuil minimum ({s.seuilMinimum?.toFixed(0)})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {onglet === "mouvements" && (
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
                  "Date",
                  "Produit",
                  "Type",
                  "Quantité",
                  "Référence",
                  "Opérateur",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "13px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      color: "#64748b",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mouvements.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: 30,
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    Aucun mouvement récent
                  </td>
                </tr>
              ) : (
                mouvements.map((m, i) => {
                  const cfg = TYPE_CONFIG[m.type] || {
                    label: m.type,
                    color: "#64748b",
                    icon: "•",
                  };
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #1a1f2e" }}>
                      <td
                        style={{
                          padding: "12px 16px",
                          color: "#64748b",
                          fontSize: 12,
                        }}
                      >
                        {new Date(m.createdAt).toLocaleDateString("fr-DZ", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          color: "#e2e8f0",
                          fontSize: 13,
                        }}
                      >
                        {m.produit?.nom || m.produitId}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ color: cfg.color, fontSize: 12 }}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontWeight: 700,
                          color: m.quantite > 0 ? "#4ade80" : "#ef4444",
                          fontSize: 14,
                        }}
                      >
                        {m.quantite > 0 ? "+" : ""}
                        {m.quantite}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          color: "#64748b",
                          fontSize: 12,
                          fontFamily: "monospace",
                        }}
                      >
                        {m.referenceId ? `#${m.referenceId}` : "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          color: "#94a3b8",
                          fontSize: 12,
                        }}
                      >
                        {m.user?.name || m.userId || "Système"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div style={{ padding: "12px 16px", borderTop: "1px solid #23283a" }}>
            <Link
              to="/stock/mouvements"
              style={{ color: "#60a5fa", fontSize: 12, textDecoration: "none" }}
            >
              Voir tout le journal →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
