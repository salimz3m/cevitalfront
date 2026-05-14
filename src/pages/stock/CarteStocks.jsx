import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { useToast } from "../../context/ToastContext";

// Coordonnées approximatives des CLR Cevital en Algérie
const CLR_GEO = {
  Béjaïa: { x: 72, y: 22 },
  Alger: { x: 55, y: 25 },
  Oran: { x: 18, y: 27 },
  Constantine: { x: 75, y: 20 },
  Annaba: { x: 82, y: 18 },
  Blida: { x: 53, y: 28 },
  Sétif: { x: 70, y: 24 },
  "Tizi Ouzou": { x: 62, y: 24 },
  Batna: { x: 74, y: 28 },
  Tlemcen: { x: 12, y: 26 },
  Bouira: { x: 62, y: 26 },
  Médéa: { x: 54, y: 30 },
};

const getNiveauColor = (pct) => {
  if (pct === null || pct === undefined)
    return { fill: "#334155", stroke: "#475569", label: "Inconnu" };
  if (pct <= 0) return { fill: "#7f1d1d", stroke: "#ef4444", label: "Rupture" };
  if (pct < 20)
    return { fill: "#431407", stroke: "#f97316", label: "Critique" };
  if (pct < 50) return { fill: "#713f12", stroke: "#eab308", label: "Bas" };
  return { fill: "#14532d", stroke: "#22c55e", label: "OK" };
};

export default function CarteStocks() {
  const [carteData, setCarteData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    api
      .get("/modules/stock-intel/carte")
      .then((r) => {
        const clrs = r.data.clrs || [];
        // Normalise clrId → id pour tout le composant
        setCarteData(clrs.map((c) => ({ ...c, id: c.clrId ?? c.id })));
      })
      .catch(() => toast.error("Erreur chargement carte stocks"))
      .finally(() => setLoading(false));
  }, []);
  // Associe chaque CLR à ses coordonnées SVG
  const clrsPositioned = carteData.map((clr) => {
    const geo = Object.entries(CLR_GEO).find(([k]) =>
      clr.nom?.toLowerCase().includes(k.toLowerCase()),
    );
    return {
      ...clr,
      x: geo ? geo[1].x : Math.random() * 70 + 10,
      y: geo ? geo[1].y : Math.random() * 40 + 15,
    };
  });

  const legendeItems = [
    { label: "OK (≥50%)", color: "#22c55e" },
    { label: "Bas (20–50%)", color: "#eab308" },
    { label: "Critique (<20%)", color: "#f97316" },
    { label: "Rupture", color: "#ef4444" },
  ];

  return (
    <div style={{ padding: "30px 32px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: 0 }}
          >
            🗺️ Carte des Stocks CLR
          </h1>
          <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 14 }}>
            Niveau de stock global par plateforme CLR
          </p>
        </div>
        <Link
          to="/stock"
          style={{
            background: "#181c27",
            border: "1px solid #23283a",
            color: "#94a3b8",
            padding: "9px 18px",
            borderRadius: 10,
            textDecoration: "none",
            fontSize: 13,
          }}
        >
          ← Tableau de bord
        </Link>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}
      >
        {/* Carte SVG Algérie */}
        <div
          style={{
            background: "#181c27",
            border: "1px solid #23283a",
            borderRadius: 16,
            padding: 24,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 400,
                color: "#64748b",
              }}
            >
              Chargement...
            </div>
          ) : (
            <svg viewBox="0 0 100 65" style={{ width: "100%", height: "auto" }}>
              {/* Fond Algérie simplifié */}
              <rect
                x="5"
                y="10"
                width="85"
                height="50"
                rx="3"
                fill="#0f1117"
                stroke="#23283a"
                strokeWidth="0.5"
              />
              {/* Lignes de région */}
              <line
                x1="5"
                y1="38"
                x2="90"
                y2="38"
                stroke="#1a1f2e"
                strokeWidth="0.3"
                strokeDasharray="1,1"
              />
              <line
                x1="45"
                y1="10"
                x2="45"
                y2="60"
                stroke="#1a1f2e"
                strokeWidth="0.3"
                strokeDasharray="1,1"
              />
              {/* Label pays */}
              <text
                x="47"
                y="58"
                fontSize="3"
                fill="#1e293b"
                textAnchor="middle"
                fontFamily="monospace"
              >
                ALGÉRIE
              </text>

              {/* CLR markers */}
              {clrsPositioned.map((clr, i) => {
                const cols = getNiveauColor(clr.niveauPct);
                const isSelected = selected?.id === clr.id;
                return (
                  <g
                    key={i}
                    onClick={() => setSelected(isSelected ? null : clr)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Halo */}
                    <circle
                      cx={clr.x}
                      cy={clr.y}
                      r={isSelected ? 4.5 : 3.5}
                      fill={cols.fill}
                      stroke={cols.stroke}
                      strokeWidth={isSelected ? 1 : 0.6}
                      opacity={0.9}
                    />
                    {/* Pulsation si alerte */}
                    {clr.niveauPct < 20 && (
                      <circle
                        cx={clr.x}
                        cy={clr.y}
                        r={5}
                        fill="none"
                        stroke={cols.stroke}
                        strokeWidth={0.4}
                        opacity={0.4}
                      >
                        <animate
                          attributeName="r"
                          from="3.5"
                          to="6"
                          dur="1.5s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          from="0.5"
                          to="0"
                          dur="1.5s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                    {/* Nom */}
                    <text
                      x={clr.x + 4}
                      y={clr.y + 1}
                      fontSize="2"
                      fill="#94a3b8"
                      fontFamily="sans-serif"
                    >
                      {clr.nom}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Légende */}
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            {legendeItems.map((l) => (
              <div
                key={l.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: "#64748b",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: l.color,
                  }}
                />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Panneau détail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* CLR sélectionné */}
          {selected ? (
            <div
              style={{
                background: "#181c27",
                border: "1px solid #3b82f6",
                borderRadius: 14,
                padding: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 14,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: 16 }}>
                    {selected.nom}
                  </div>
                  <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
                    {selected.region}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    fontSize: 18,
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                {[
                  { label: "Produits", val: selected.nbProduits || 0 },
                  {
                    label: "Statut",
                    val: selected.statut || "—",
                    color: "#f59e0b",
                  },

                  {
                    label: "Niveau global",
                    val: `${(selected.niveauPct || 0).toFixed(0)}%`,
                  },
                  {
                    label: "Stock total",
                    val: selected.stockTotal || 0,
                    color: "#3b82f6",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#0f1117",
                      borderRadius: 8,
                      padding: "10px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "#64748b",
                        marginBottom: 3,
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: s.color || "#fff",
                      }}
                    >
                      {s.val}
                    </div>
                  </div>
                ))}
              </div>

              {/* Barre de niveau */}
              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    color: "#64748b",
                    marginBottom: 5,
                  }}
                >
                  <span>Niveau de stock</span>
                  <span>{(selected.niveauPct || 0).toFixed(0)}%</span>
                </div>
                <div
                  style={{ height: 8, background: "#23283a", borderRadius: 4 }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 4,
                      width: `${Math.min(100, selected.niveauPct || 0)}%`,
                      background:
                        selected.niveauPct > 50
                          ? "#22c55e"
                          : selected.niveauPct > 20
                            ? "#f59e0b"
                            : "#ef4444",
                      transition: "width 0.5s",
                    }}
                  />
                </div>
              </div>

              <Link
                to={`/stock/clr/${selected.clrId ?? selected.id}`}
                style={{
                  display: "block",
                  textAlign: "center",
                  background: "#3b82f6",
                  color: "#fff",
                  padding: "10px",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Voir détail complet →
              </Link>
            </div>
          ) : (
            <div
              style={{
                background: "#181c27",
                border: "1px solid #23283a",
                borderRadius: 14,
                padding: 20,
                color: "#64748b",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 160,
                textAlign: "center",
                fontSize: 13,
              }}
            >
              👆 Cliquez sur un CLR
              <br />
              pour voir son détail
            </div>
          )}

          {/* Liste tous CLR */}
          <div
            style={{
              background: "#181c27",
              border: "1px solid #23283a",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid #23283a",
                fontSize: 12,
                fontWeight: 600,
                color: "#64748b",
                textTransform: "uppercase",
              }}
            >
              Tous les CLR
            </div>
            <div style={{ maxHeight: 350, overflowY: "auto" }}>
              {clrsPositioned.map((clr, i) => {
                const cols = getNiveauColor(clr.niveauPct);
                return (
                  <div
                    key={i}
                    onClick={() =>
                      setSelected(selected?.id === clr.id ? null : clr)
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "11px 18px",
                      borderBottom: "1px solid #1a1f2e",
                      cursor: "pointer",
                      background:
                        selected?.id === clr.id ? "#1e2a3d" : "transparent",
                      transition: "background 0.15s",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: cols.stroke,
                        }}
                      />
                      <span style={{ color: "#e2e8f0", fontSize: 13 }}>
                        {clr.nom}
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div
                        style={{
                          width: 50,
                          height: 4,
                          background: "#23283a",
                          borderRadius: 4,
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(100, clr.niveauPct || 0)}%`,
                            height: "100%",
                            borderRadius: 4,
                            background: cols.stroke,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          color: cols.stroke,
                          fontSize: 12,
                          fontWeight: 600,
                          minWidth: 35,
                          textAlign: "right",
                        }}
                      >
                        {(clr.niveauPct || 0).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
