// frontend/src/pages/planification/PlanifWorkflow.jsx
import { useState, useEffect } from "react";
import api from "../../utils/api";
import { DS_STYLE, STATUS_CHIP } from "../ds";

const EXTRA = `
  .pw-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  @media(max-width:1100px) { .pw-layout { grid-template-columns: 1fr; } }

  .pw-session-card {
    background: var(--dark); color: #fff;
    border-left: 4px solid transparent;
    padding: 20px 24px; margin-bottom: 12px;
    cursor: pointer; transition: border-color .2s, background .2s;
  }
  .pw-session-card:hover    { border-color: rgba(230,57,70,.5); background: #161616; }
  .pw-session-card.selected { border-color: var(--red); background: #161616; }

  .pw-session-meta {
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    margin-bottom: 8px;
  }
  .pw-session-date {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.1rem; letter-spacing: .08em;
  }
  .pw-session-nb {
    font-size: .62rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .2em; color: rgba(255,255,255,.35);
  }

  .pw-statut {
    font-size: .58rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .18em; padding: 3px 10px;
  }
  .pw-statut-BROUILLON { background: rgba(245,158,11,.15); color: #f59e0b; }
  .pw-statut-VALIDEE   { background: rgba(59,130,246,.15);  color: #3b82f6; }
  .pw-statut-ENVOYEE   { background: rgba(16,185,129,.15);  color: #10b981; }

  /* Diapason selector */
  .diap-btns { display: flex; gap: 12px; margin-bottom: 20px; }
  .diap-btn {
    flex: 1; padding: 14px;
    border: 2px solid rgba(0,0,0,.12);
    background: #fff; cursor: pointer;
    transition: all .25s; text-align: center;
    font-family: 'DM Sans', sans-serif;
  }
  .diap-btn:hover { border-color: var(--dark); }
  .diap-btn.active { border-color: var(--red); background: rgba(230,57,70,.05); }
  .diap-btn-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.1rem; letter-spacing: .08em; color: var(--dark);
    display: block; margin-bottom: 4px;
  }
  .diap-btn-sub { font-size: .72rem; color: #888; }

  /* Flux diapason */
  .diap-flux-vis {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px; margin-bottom: 16px;
    background: var(--dark); color: #fff;
    font-size: .7rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .12em;
    flex-wrap: wrap;
  }
  .diap-flux-vis .node {
    background: rgba(255,255,255,.1); padding: 4px 10px;
  }
  .diap-flux-vis .node.active { background: var(--red); }
  .diap-flux-vis .arr { color: rgba(255,255,255,.4); }

  /* Ligne planif */
  .lp-ligne {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; background: var(--dark);
    color: #fff; margin-bottom: 8px;
    border-left: 3px solid transparent;
    transition: border-color .2s;
  }
  .lp-ligne:hover { border-color: var(--red); }
  .lp-ligne-order {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1rem; letter-spacing: .08em;
    min-width: 80px;
  }
  .lp-ligne-info { flex: 1; font-size: .78rem; color: rgba(255,255,255,.6); }
  .lp-ligne-badges { display: flex; gap: 6px; flex-shrink: 0; }
  .lp-badge-d {
    font-size: .6rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .15em;
    padding: 3px 8px; background: var(--red); color: #fff;
  }
  .lp-badge-clr {
    font-size: .6rem; font-weight: 700;
    padding: 3px 8px; background: rgba(255,255,255,.1); color: #fff;
  }
  .lp-del-btn {
    background: none; border: none; cursor: pointer;
    color: rgba(255,255,255,.3); font-size: .85rem;
    transition: color .2s; padding: 4px;
  }
  .lp-del-btn:hover { color: var(--red); }

  /* Actions session */
  .session-actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
`;

const STATUT_STEPS = ["BROUILLON", "VALIDEE", "ENVOYEE"];

export default function PlanifWorkflow() {
  // Sessions
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelected] = useState(null);
  const [loadingSessions, setLoadingS] = useState(true);

  // Commandes disponibles
  const [commandesDispo, setCommandesDispo] = useState([]);

  // Infrastructure
  const [plateformes, setPlateformes] = useState([]);
  const [clrs, setClrs] = useState([]);

  // Nouvelle session
  const [showNew, setShowNew] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [creatingSess, setCreatingSess] = useState(false);

  // Formulaire ajout ligne
  const [showAddLigne, setShowAddLigne] = useState(false);
  const [ligneForm, setLigneForm] = useState({
    orderId: "",
    diapason: "D1",
    plateformeId: "",
    clrId: "",
    notes: "",
  });
  const [addingLigne, setAddingLigne] = useState(false);

  // Actions session
  const [actioning, setActioning] = useState(false);

  // ── Chargement initial ──────────────────────────────────────
  useEffect(() => {
    fetchSessions();
    api
      .get("/infrastructure/plateformes")
      .then(({ data }) => setPlateformes(data));
    api.get("/infrastructure/clrs").then(({ data }) => setClrs(data));
  }, []);

  useEffect(() => {
    if (selectedSession?.statut === "BROUILLON") fetchCommandesDispo();
  }, [selectedSession]);

  const fetchSessions = async () => {
    setLoadingS(true);
    try {
      const { data } = await api.get("/planification/sessions");
      setSessions(data);
      // Garder la session sélectionnée à jour
      if (selectedSession) {
        const updated = data.find((s) => s.id === selectedSession.id);
        if (updated) setSelected(updated);
      }
    } finally {
      setLoadingS(false);
    }
  };

  const fetchCommandesDispo = async () => {
    const { data } = await api.get("/planification/commandes-disponibles");
    setCommandesDispo(data);
  };

  // ── Créer session ───────────────────────────────────────────
  const createSession = async () => {
    if (!newDate) return alert("Date requise");
    setCreatingSess(true);
    try {
      const { data } = await api.post("/planification/sessions", {
        date: newDate,
        notes: newNotes,
      });
      await fetchSessions();
      setSelected(data);
      setShowNew(false);
      setNewDate("");
      setNewNotes("");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally {
      setCreatingSess(false);
    }
  };

  // ── Ajouter ligne ───────────────────────────────────────────
  const addLigne = async () => {
    if (!ligneForm.orderId || !ligneForm.clrId)
      return alert("Commande et CLR requis");
    if (ligneForm.diapason === "D1" && !ligneForm.plateformeId)
      return alert("Plateforme requise pour D1");
    setAddingLigne(true);
    try {
      await api.post(`/planification/sessions/${selectedSession.id}/lignes`, {
        orderId: parseInt(ligneForm.orderId),
        diapason: ligneForm.diapason,
        plateformeId:
          ligneForm.diapason === "D1" ? parseInt(ligneForm.plateformeId) : null,
        clrId: parseInt(ligneForm.clrId),
        notes: ligneForm.notes,
      });
      await fetchSessions();
      await fetchCommandesDispo();
      setLigneForm({
        orderId: "",
        diapason: "D1",
        plateformeId: "",
        clrId: "",
        notes: "",
      });
      setShowAddLigne(false);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally {
      setAddingLigne(false);
    }
  };

  // ── Supprimer ligne ─────────────────────────────────────────
  const deleteLigne = async (ligneId) => {
    if (!window.confirm("Supprimer cette ligne ?")) return;
    await api.delete(
      `/planification/sessions/${selectedSession.id}/lignes/${ligneId}`,
    );
    await fetchSessions();
    await fetchCommandesDispo();
  };

  // ── Valider / Envoyer session ───────────────────────────────
  const actionSession = async (action) => {
    setActioning(true);
    try {
      await api.patch(
        `/planification/sessions/${selectedSession.id}/${action}`,
      );
      await fetchSessions();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally {
      setActioning(false);
    }
  };

  // CLR filtrés selon plateforme sélectionnée (D1) ou tous (D2)
  const clrsFiltres =
    ligneForm.diapason === "D1" && ligneForm.plateformeId
      ? clrs.filter((c) => c.plateformeId === parseInt(ligneForm.plateformeId))
      : ligneForm.diapason === "D2"
        ? clrs
        : [];

  return (
    <div className="ds-page">
      <style dangerouslySetInnerHTML={{ __html: DS_STYLE + EXTRA }} />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      {/* Header */}
      <div className="ds-header">
        <div className="ds-header-eyebrow">
          <span>Workflow Réel</span>
        </div>
        <h1 className="ds-title">
          PLANIFI<span>CATION</span>
        </h1>
        <p className="ds-subtitle">
          Sessions de planification avec choix du mode de distribution (D1 / D2)
        </p>
      </div>

      <div className="pw-layout">
        {/* ── COLONNE GAUCHE : liste sessions ── */}
        <div>
          <div className="ds-panel">
            <div className="ds-panel-head">
              <span className="ds-panel-title">Sessions</span>
              <button
                className="ds-btn ds-btn-dark"
                style={{ padding: "8px 16px" }}
                onClick={() => setShowNew(true)}
              >
                <i className="fas fa-plus"></i> Nouvelle
              </button>
            </div>

            {/* Formulaire nouvelle session */}
            {showNew && (
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid rgba(0,0,0,.07)",
                  background: "#fafafa",
                }}
              >
                <div className="ds-field">
                  <label className="ds-field-label">Date de livraison *</label>
                  <input
                    type="date"
                    className="ds-input"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <div className="ds-field">
                  <label className="ds-field-label">Notes</label>
                  <input
                    className="ds-input"
                    placeholder="Optionnel..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="ds-btn ds-btn-dark"
                    onClick={createSession}
                    disabled={creatingSess}
                  >
                    {creatingSess ? "Création..." : "Créer la session"}
                  </button>
                  <button
                    className="ds-btn ds-btn-outline"
                    onClick={() => setShowNew(false)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            <div style={{ padding: "16px" }}>
              {loadingSessions ? (
                <div className="ds-loading">Chargement</div>
              ) : sessions.length === 0 ? (
                <div className="ds-empty">
                  <i className="fas fa-calendar-plus"></i>
                  <p>Aucune session — créez-en une</p>
                </div>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s.id}
                    className={`pw-session-card ${selectedSession?.id === s.id ? "selected" : ""}`}
                    onClick={() => setSelected(s)}
                  >
                    <div className="pw-session-meta">
                      <span className="pw-session-date">
                        <i
                          className="fas fa-calendar-alt"
                          style={{
                            color: "var(--red)",
                            marginRight: 8,
                            fontSize: ".75rem",
                          }}
                        ></i>
                        {s.date}
                      </span>
                      <span className={`pw-statut pw-statut-${s.statut}`}>
                        {s.statut}
                      </span>
                    </div>
                    <div className="pw-session-nb">
                      {s.lignes?.length || 0} ligne(s) ·{" "}
                      {s.createur?.email?.split("@")[0]}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── COLONNE DROITE : détail session ── */}
        <div>
          {!selectedSession ? (
            <div className="ds-panel">
              <div className="ds-empty">
                <i className="fas fa-hand-pointer"></i>
                <p>Sélectionnez une session pour la consulter ou la modifier</p>
              </div>
            </div>
          ) : (
            <div className="ds-panel">
              <div className="ds-panel-head">
                <div>
                  <span className="ds-panel-title">
                    Session du {selectedSession.date}
                  </span>
                  <div style={{ marginTop: 4 }}>
                    <span
                      className={`pw-statut pw-statut-${selectedSession.statut}`}
                    >
                      {selectedSession.statut}
                    </span>
                  </div>
                </div>
                {selectedSession.statut === "BROUILLON" && (
                  <button
                    className="ds-btn ds-btn-dark"
                    style={{ padding: "8px 14px" }}
                    onClick={() => setShowAddLigne(true)}
                  >
                    <i className="fas fa-plus"></i> Ajouter ligne
                  </button>
                )}
              </div>

              {/* Formulaire ajout ligne */}
              {showAddLigne && selectedSession.statut === "BROUILLON" && (
                <div
                  style={{
                    padding: "20px 24px",
                    borderBottom: "1px solid rgba(0,0,0,.07)",
                    background: "#fafafa",
                  }}
                >
                  <div className="ds-field">
                    <label className="ds-field-label">Commande *</label>
                    <select
                      className="ds-input"
                      value={ligneForm.orderId}
                      onChange={(e) =>
                        setLigneForm({ ...ligneForm, orderId: e.target.value })
                      }
                    >
                      <option value="">— Sélectionner une commande —</option>
                      {commandesDispo.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.orderNumber} — {o.date} (
                          {o.OrderItems?.length || 0} articles)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Choix diapason */}
                  <div className="ds-field">
                    <label className="ds-field-label">
                      Mode de distribution *
                    </label>
                    <div className="diap-btns">
                      {["D1", "D2"].map((d) => (
                        <div
                          key={d}
                          className={`diap-btn ${ligneForm.diapason === d ? "active" : ""}`}
                          onClick={() =>
                            setLigneForm({
                              ...ligneForm,
                              diapason: d,
                              plateformeId: "",
                              clrId: "",
                            })
                          }
                        >
                          <span className="diap-btn-title">Diapason {d}</span>
                          <span className="diap-btn-sub">
                            {d === "D1"
                              ? "Via Plateforme → CLR"
                              : "Direct → CLR"}
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* Visualisation flux */}
                    <div className="diap-flux-vis">
                      <span className="node active">Unité</span>
                      <span className="arr">→</span>
                      {ligneForm.diapason === "D1" ? (
                        <>
                          <span className="node active">Plateforme</span>
                          <span className="arr">→</span>
                        </>
                      ) : (
                        <>
                          <span className="node" style={{ opacity: 0.3 }}>
                            Plateforme
                          </span>
                          <span className="arr" style={{ opacity: 0.3 }}>
                            →
                          </span>
                        </>
                      )}
                      <span className="node active">CLR</span>
                    </div>
                  </div>

                  {/* Plateforme (D1 uniquement) */}
                  {ligneForm.diapason === "D1" && (
                    <div className="ds-field">
                      <label className="ds-field-label">Plateforme *</label>
                      <select
                        className="ds-input"
                        value={ligneForm.plateformeId}
                        onChange={(e) =>
                          setLigneForm({
                            ...ligneForm,
                            plateformeId: e.target.value,
                            clrId: "",
                          })
                        }
                      >
                        <option value="">
                          — Sélectionner une plateforme —
                        </option>
                        {plateformes.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nom} ({p.ville}) — {p.capacite.toLocaleString()}{" "}
                            palettes
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* CLR */}
                  <div className="ds-field">
                    <label className="ds-field-label">
                      CLR de destination *
                    </label>
                    <select
                      className="ds-input"
                      value={ligneForm.clrId}
                      onChange={(e) =>
                        setLigneForm({ ...ligneForm, clrId: e.target.value })
                      }
                      disabled={
                        ligneForm.diapason === "D1" && !ligneForm.plateformeId
                      }
                    >
                      <option value="">
                        {ligneForm.diapason === "D1" && !ligneForm.plateformeId
                          ? "— Choisissez d'abord une plateforme —"
                          : "— Sélectionner un CLR —"}
                      </option>
                      {clrsFiltres.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} — {c.nom} ({c.wilaya})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ds-field">
                    <label className="ds-field-label">Notes</label>
                    <input
                      className="ds-input"
                      placeholder="Optionnel..."
                      value={ligneForm.notes}
                      onChange={(e) =>
                        setLigneForm({ ...ligneForm, notes: e.target.value })
                      }
                    />
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="ds-btn ds-btn-dark"
                      onClick={addLigne}
                      disabled={addingLigne}
                    >
                      {addingLigne ? (
                        "Ajout..."
                      ) : (
                        <>
                          <i className="fas fa-plus"></i> Ajouter
                        </>
                      )}
                    </button>
                    <button
                      className="ds-btn ds-btn-outline"
                      onClick={() => setShowAddLigne(false)}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Lignes de la session */}
              <div style={{ padding: "16px 20px" }}>
                {!selectedSession.lignes ||
                selectedSession.lignes.length === 0 ? (
                  <div className="ds-empty" style={{ padding: "32px" }}>
                    <i className="fas fa-list"></i>
                    <p>Aucune ligne — ajoutez des commandes à planifier</p>
                  </div>
                ) : (
                  selectedSession.lignes.map((ligne) => (
                    <div key={ligne.id} className="lp-ligne">
                      <span className="lp-ligne-order">
                        {ligne.order?.orderNumber}
                      </span>
                      <div className="lp-ligne-info">
                        {ligne.plateforme && (
                          <span>
                            <i
                              className="fas fa-warehouse"
                              style={{ marginRight: 4 }}
                            ></i>
                            {ligne.plateforme.nom} →{" "}
                          </span>
                        )}
                        <i
                          className="fas fa-map-pin"
                          style={{ marginRight: 4 }}
                        ></i>
                        {ligne.clr?.code} — {ligne.clr?.nom}
                      </div>
                      <div className="lp-ligne-badges">
                        <span className="lp-badge-d">{ligne.diapason}</span>
                        <span className="lp-badge-clr">
                          {ligne.clr?.wilaya}
                        </span>
                      </div>
                      {selectedSession.statut === "BROUILLON" && (
                        <button
                          className="lp-del-btn"
                          onClick={() => deleteLigne(ligne.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Actions session */}
              <div style={{ padding: "0 20px 20px" }}>
                <div className="session-actions">
                  {selectedSession.statut === "BROUILLON" && (
                    <button
                      className="ds-btn ds-btn-dark"
                      onClick={() => actionSession("valider")}
                      disabled={actioning}
                    >
                      <i className="fas fa-check"></i> Valider la session
                    </button>
                  )}
                  {selectedSession.statut === "VALIDEE" && (
                    <button
                      className="ds-btn ds-btn-red"
                      onClick={() => actionSession("envoyer")}
                      disabled={actioning}
                    >
                      <i className="fas fa-paper-plane"></i> Envoyer au
                      Transport
                    </button>
                  )}
                  {selectedSession.statut === "ENVOYEE" && (
                    <div
                      style={{
                        fontSize: ".8rem",
                        color: "#10b981",
                        fontWeight: 700,
                        padding: "10px 0",
                      }}
                    >
                      <i
                        className="fas fa-check-circle"
                        style={{ marginRight: 8 }}
                      ></i>
                      Session transmise au transport
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
