// src/pages/modules/Commercial.jsx — Sprint 13
import { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";
import { DS_STYLE, STATUS_CHIP } from "../ds";

const EXTRA = `
  /* ── Layout ── */
  .com-layout { display: grid; grid-template-columns: 320px 1fr; gap: 24px; }
  @media(max-width:1000px) { .com-layout { grid-template-columns: 1fr; } }

  /* ── Tabs ── */
  .com-tabs { display: flex; gap: 0; border-bottom: 2px solid rgba(0,0,0,.08); margin-bottom: 24px; }
  .com-tab {
    padding: 12px 22px; font-size: .62rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .2em;
    cursor: pointer; border: none; background: transparent;
    color: #aaa; border-bottom: 2px solid transparent;
    margin-bottom: -2px; transition: all .2s;
  }
  .com-tab.active { color: var(--dark); border-bottom-color: var(--red); }
  .com-tab:hover { color: var(--dark); }

  /* ── Client card ── */
  .com-client-card {
    padding: 14px 18px; margin-bottom: 8px;
    border: 1px solid rgba(0,0,0,.07);
    border-left: 3px solid transparent;
    cursor: pointer; transition: all .2s; background: #fff;
  }
  .com-client-card:hover { border-left-color: rgba(230,57,70,.4); background: #fafafa; }
  .com-client-card.selected { border-left-color: var(--red); background: #fafafa; }
  .com-client-code {
    font-family: 'Bebas Neue', sans-serif;
    font-size: .95rem; letter-spacing: .08em; color: var(--dark);
  }
  .com-client-meta { font-size: .68rem; color: #888; margin-top: 3px; }
  .com-client-badges { display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap; }

  /* ── KPI CLR cards ── */
  .com-kpi-grid {
    display: grid; grid-template-columns: repeat(3,1fr);
    gap: 14px; margin-bottom: 20px;
  }
  @media(max-width:700px) { .com-kpi-grid { grid-template-columns: 1fr; } }
  .com-kpi-card {
    background: var(--dark); color: #fff;
    padding: 18px 20px; border-left: 3px solid var(--red);
  }
  .com-kpi-lbl {
    font-size: .55rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .2em; color: rgba(255,255,255,.35); margin-bottom: 8px;
  }
  .com-kpi-val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.8rem; letter-spacing: .05em; line-height: 1;
  }
  .com-kpi-sub { font-size: .62rem; color: rgba(255,255,255,.3); margin-top: 4px; }

  /* ── Taux service badge ── */
  .com-taux-badge {
    display: inline-block; padding: 3px 10px;
    font-size: .6rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .12em;
  }

  /* ── Historique timeline ── */
  .com-timeline { padding: 4px 0; }
  .com-order-row {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 14px 0; border-bottom: 1px solid rgba(0,0,0,.05);
  }
  .com-order-row:last-child { border-bottom: none; }
  .com-order-dot {
    width: 10px; height: 10px; border-radius: 50%;
    flex-shrink: 0; margin-top: 5px;
  }
  .com-order-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: .9rem; letter-spacing: .06em; color: var(--dark);
  }
  .com-order-meta { font-size: .7rem; color: #888; margin-top: 2px; }
  .com-order-ca {
    margin-left: auto; flex-shrink: 0;
    font-weight: 800; font-size: .82rem; color: var(--dark);
  }

  /* ── KPI par CLR tableau ── */
  .com-clr-row {
    display: grid;
    grid-template-columns: 1fr 80px 80px 80px 120px 100px;
    gap: 0; align-items: center;
    padding: 12px 18px; border-bottom: 1px solid rgba(0,0,0,.05);
    font-size: .8rem;
  }
  .com-clr-row:hover { background: rgba(230,57,70,.02); }
  .com-clr-head {
    background: var(--dark); color: #fff;
    font-size: .55rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .18em;
  }

  /* ── Livraison form ── */
  .com-livraison-form {
    background: #fafafa; border: 1px solid rgba(0,0,0,.07);
    border-top: 3px solid var(--red); padding: 22px 24px;
    margin-bottom: 20px;
  }
  .com-livraison-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.1rem; letter-spacing: .1em;
    color: var(--dark); margin-bottom: 16px;
    display: flex; align-items: center; gap: 10px;
  }

  /* ── Barre taux ── */
  .com-taux-bar { height: 6px; background: rgba(0,0,0,.07); border-radius: 3px; margin-top: 4px; }
  .com-taux-fill { height: 100%; border-radius: 3px; transition: width .5s; }

  /* ── Search ── */
  .com-search {
    position: relative; margin-bottom: 12px;
  }
  .com-search input {
    width: 100%; padding: 10px 14px 10px 36px;
    border: 1px solid rgba(0,0,0,.1); background: #fff;
    font-size: .82rem; outline: none;
    font-family: 'DM Sans', sans-serif;
  }
  .com-search i {
    position: absolute; left: 12px; top: 50%;
    transform: translateY(-50%); color: #bbb; font-size: .8rem;
  }

  /* ── Résumé client ── */
  .com-resume-grid {
    display: grid; grid-template-columns: repeat(4,1fr);
    gap: 12px; margin-bottom: 20px;
  }
  @media(max-width:700px) { .com-resume-grid { grid-template-columns: repeat(2,1fr); } }
  .com-resume-kpi {
    padding: 14px 16px; background: #f8f8f8;
    border-top: 2px solid var(--dark);
  }
  .com-resume-nb {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.6rem; letter-spacing: .05em; color: var(--dark);
  }
  .com-resume-lbl {
    font-size: .58rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .18em; color: #aaa; margin-top: 3px;
  }
`;

// ── Helpers ──────────────────────────────────────────────────
const tauxColor = (t) => t >= 80 ? "#10b981" : t >= 60 ? "#f59e0b" : "#ef4444";
const fmt = (n) => (n || 0).toLocaleString("fr-DZ");
const fmtCA = (n) => n >= 1_000_000
  ? (n / 1_000_000).toFixed(2) + " M DZD"
  : fmt(n) + " DZD";

// ════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════
export default function Commercial() {
  const [tab, setTab] = useState("clients");
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [historique, setHistorique] = useState(null);
  const [kpi, setKpi] = useState(null);
  const [clrs, setClrs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filterClr, setFilterClr] = useState("");
  const [loading, setLoading] = useState(true);
  const [histLoading, setHistLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [livForm, setLivForm] = useState({ orderId: "", clrId: "", notes: "" });
  const [livLoading, setLivLoading] = useState(false);
  const [livResult, setLivResult] = useState(null);
  const [showLivForm, setShowLivForm] = useState(false);

  // ── Chargement initial ──
  useEffect(() => {
    fetchClients();
    fetchKPI();
    api.get("/infrastructure/clrs").then(({ data }) => setClrs(data)).catch(() => {});
    api.get("/orders?status=pending").then(({ data }) => {
      setOrders(Array.isArray(data) ? data : data.orders || []);
    }).catch(() => {});
  }, []);

  const fetchClients = async (clrId) => {
    setLoading(true);
    try {
      const url = clrId ? `/commercial/clients?clrId=${clrId}` : "/commercial/clients";
      const { data } = await api.get(url);
      setClients(Array.isArray(data) ? data : []);
    } catch { setClients([]); }
    finally { setLoading(false); }
  };

  const fetchKPI = async () => {
    try {
      const { data } = await api.get("/commercial/kpi");
      setKpi(data);
    } catch { }
  };

  const fetchHistorique = async (codeClient) => {
    setHistLoading(true);
    setHistorique(null);
    try {
      const { data } = await api.get(`/commercial/clients/${codeClient}`);
      setHistorique(data);
    } catch { }
    finally { setHistLoading(false); }
  };

  const syncClients = async () => {
    setSyncing(true);
    try {
      const { data } = await api.post("/commercial/sync-clients");
      alert(data.message);
      fetchClients();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally { setSyncing(false); }
  };

  const confirmerLivraison = async () => {
    if (!livForm.orderId || !livForm.clrId) return alert("Commande et CLR requis");
    setLivLoading(true);
    setLivResult(null);
    try {
      const { data } = await api.post("/commercial/livraison", livForm);
      setLivResult({ ok: true, msg: data.message, nb: data.nbMouvements });
      setLivForm({ orderId: "", clrId: "", notes: "" });
      fetchClients();
    } catch (err) {
      setLivResult({ ok: false, msg: err.response?.data?.message || "Erreur" });
    } finally { setLivLoading(false); }
  };

  // ── Clients filtrés ──
  const clientsFiltres = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.codeClient?.toLowerCase().includes(q) ||
      c.nom?.toLowerCase().includes(q) ||
      c.clr?.nom?.toLowerCase().includes(q)
    );
  });

  const statusDot = (status) => ({
    delivered: "#10b981", planned: "#3b82f6",
    in_transit: "#8b5cf6", pending: "#f59e0b", cancelled: "#ef4444",
  }[status] || "#aaa");

  // ════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════
  return (
    <div className="ds-page">
      <style dangerouslySetInnerHTML={{ __html: DS_STYLE + EXTRA }} />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />

      {/* Header */}
      <div className="ds-header">
        <div className="ds-header-eyebrow"><span>Flux Commercial</span></div>
        <h1 className="ds-title">MODULE <span>COMMERCIAL</span></h1>
        <p className="ds-subtitle">Clients · Livraisons CLR → Client · KPI taux de service</p>
      </div>

      {/* Tabs */}
      <div className="com-tabs">
        {[
          { key: "clients", lbl: "Clients", icon: "fa-users" },
          { key: "livraison", lbl: "Confirmer livraison", icon: "fa-truck-ramp-box" },
          { key: "kpi", lbl: "KPI par CLR", icon: "fa-chart-bar" },
        ].map((t) => (
          <button key={t.key} className={`com-tab ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}>
            <i className={`fas ${t.icon}`} style={{ marginRight: 7 }}></i>{t.lbl}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════ */}
      {/* TAB : CLIENTS                                     */}
      {/* ══════════════════════════════════════════════════ */}
      {tab === "clients" && (
        <div className="com-layout">
          {/* Colonne gauche — liste clients */}
          <div>
            <div className="ds-panel">
              <div className="ds-panel-head">
                <span className="ds-panel-title">Clients</span>
                <button className="ds-btn ds-btn-dark" style={{ padding: "7px 12px", fontSize: ".6rem" }}
                  onClick={syncClients} disabled={syncing}>
                  <i className="fas fa-rotate"></i> {syncing ? "Sync…" : "Sync"}
                </button>
              </div>
              <div style={{ padding: "14px" }}>
                {/* Filtre CLR */}
                <div className="ds-field" style={{ marginBottom: 10 }}>
                  <select className="ds-input" value={filterClr}
                    onChange={(e) => { setFilterClr(e.target.value); fetchClients(e.target.value || undefined); }}>
                    <option value="">— Tous les CLR —</option>
                    {clrs.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.nom}</option>)}
                  </select>
                </div>
                {/* Recherche */}
                <div className="com-search">
                  <i className="fas fa-search"></i>
                  <input placeholder="Rechercher un client…" value={search}
                    onChange={(e) => setSearch(e.target.value)} />
                </div>

                {loading ? (
                  <div className="ds-loading">Chargement</div>
                ) : clientsFiltres.length === 0 ? (
                  <div className="ds-empty">
                    <i className="fas fa-users"></i>
                    <p>Aucun client — lancez une synchronisation</p>
                  </div>
                ) : (
                  clientsFiltres.map((c) => (
                    <div key={c.id}
                      className={`com-client-card ${selectedClient?.id === c.id ? "selected" : ""}`}
                      onClick={() => { setSelectedClient(c); fetchHistorique(c.codeClient); }}>
                      <div className="com-client-code">{c.codeClient}</div>
                      {c.nom && <div style={{ fontSize: ".78rem", fontWeight: 600, color: "#333", marginTop: 2 }}>{c.nom}</div>}
                      <div className="com-client-meta">
                        {c.clr ? `${c.clr.code} — ${c.clr.nom}` : "CLR non rattaché"}
                        {c.nbCommandes > 0 && ` · ${c.nbCommandes} commande(s)`}
                      </div>
                      {c.derniereCommande && (
                        <div className="com-client-badges">
                          <span className={STATUS_CHIP[c.derniereCommande.status]?.cls || "ds-chip"}>
                            {STATUS_CHIP[c.derniereCommande.status]?.label || c.derniereCommande.status}
                          </span>
                          <span style={{ fontSize: ".62rem", color: "#aaa" }}>{c.derniereCommande.date}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Colonne droite — historique client */}
          <div>
            {!selectedClient ? (
              <div className="ds-panel">
                <div className="ds-empty">
                  <i className="fas fa-hand-pointer"></i>
                  <p>Sélectionnez un client pour voir son historique</p>
                </div>
              </div>
            ) : (
              <div className="ds-panel">
                <div className="ds-panel-head">
                  <div>
                    <span className="ds-panel-title">{selectedClient.codeClient}</span>
                    {selectedClient.nom && (
                      <div style={{ fontSize: ".8rem", color: "#666", marginTop: 4 }}>{selectedClient.nom}</div>
                    )}
                  </div>
                  {selectedClient.clr && (
                    <span style={{ fontSize: ".65rem", fontWeight: 700, padding: "4px 10px", background: "rgba(0,0,0,.07)", textTransform: "uppercase", letterSpacing: ".1em" }}>
                      {selectedClient.clr.code} — {selectedClient.clr.nom}
                    </span>
                  )}
                </div>

                {histLoading ? (
                  <div className="ds-loading">Chargement historique</div>
                ) : historique ? (
                  <div style={{ padding: "20px 24px" }}>
                    {/* Résumé */}
                    <div className="com-resume-grid">
                      {[
                        { nb: historique.resume.nbCommandes, lbl: "Commandes" },
                        { nb: historique.resume.nbLivrees, lbl: "Livrées" },
                        { nb: historique.resume.tauxService + "%", lbl: "Taux service" },
                        { nb: fmtCA(historique.resume.caTotal), lbl: "CA estimé" },
                      ].map((k) => (
                        <div key={k.lbl} className="com-resume-kpi">
                          <div className="com-resume-nb">{k.nb}</div>
                          <div className="com-resume-lbl">{k.lbl}</div>
                        </div>
                      ))}
                    </div>

                    {/* Timeline commandes */}
                    <div style={{ fontSize: ".62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".18em", color: "#999", marginBottom: 12 }}>
                      HISTORIQUE COMMANDES
                    </div>
                    {historique.orders.length === 0 ? (
                      <div className="ds-empty" style={{ padding: 24 }}>
                        <i className="fas fa-inbox"></i><p>Aucune commande</p>
                      </div>
                    ) : (
                      <div className="com-timeline">
                        {historique.orders.map((o) => (
                          <div key={o.id} className="com-order-row">
                            <div className="com-order-dot" style={{ background: statusDot(o.status) }}></div>
                            <div style={{ flex: 1 }}>
                              <div className="com-order-num">{o.orderNumber}</div>
                              <div className="com-order-meta">
                                {o.date} · {o.nbUnites?.toLocaleString()} u
                                {o.famille && ` · ${o.famille}`}
                              </div>
                              <div style={{ marginTop: 4 }}>
                                <span className={STATUS_CHIP[o.status]?.cls || "ds-chip"}>
                                  {STATUS_CHIP[o.status]?.label || o.status}
                                </span>
                              </div>
                            </div>
                            <div className="com-order-ca">{fmtCA(o.caEstime)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/* TAB : CONFIRMER LIVRAISON                         */}
      {/* ══════════════════════════════════════════════════ */}
      {tab === "livraison" && (
        <div>
          <div className="com-livraison-form">
            <div className="com-livraison-title">
              <i className="fas fa-truck-ramp-box" style={{ color: "var(--red)" }}></i>
              Confirmer une livraison client
            </div>
            <p style={{ fontSize: ".78rem", color: "#666", marginBottom: 20, lineHeight: 1.6 }}>
              La confirmation déduit le stock du CLR concerné et enregistre un mouvement <strong>SORTIE_VENTE</strong>.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="ds-field" style={{ marginBottom: 0 }}>
                <label className="ds-field-label">Commande *</label>
                <select className="ds-input" value={livForm.orderId}
                  onChange={(e) => setLivForm({ ...livForm, orderId: e.target.value })}>
                  <option value="">— Sélectionner —</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>{o.orderNumber} — {o.date} — {o.codeClient || "N/A"}</option>
                  ))}
                </select>
              </div>
              <div className="ds-field" style={{ marginBottom: 0 }}>
                <label className="ds-field-label">CLR de livraison *</label>
                <select className="ds-input" value={livForm.clrId}
                  onChange={(e) => setLivForm({ ...livForm, clrId: e.target.value })}>
                  <option value="">— Sélectionner —</option>
                  {clrs.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} — {c.nom} ({c.wilaya})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="ds-field">
              <label className="ds-field-label">Notes</label>
              <input className="ds-input" placeholder="Optionnel…"
                value={livForm.notes} onChange={(e) => setLivForm({ ...livForm, notes: e.target.value })} />
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button className="ds-btn ds-btn-red" onClick={confirmerLivraison}
                disabled={livLoading || !livForm.orderId || !livForm.clrId}>
                {livLoading
                  ? "Traitement…"
                  : <><i className="fas fa-check"></i> Confirmer la livraison</>}
              </button>
              {livResult && (
                <div className={`ds-alert ${livResult.ok ? "ds-alert-success" : "ds-alert-error"}`}
                  style={{ margin: 0, flex: 1 }}>
                  <i className={`fas ${livResult.ok ? "fa-check-circle" : "fa-circle-xmark"}`}></i>
                  {livResult.msg}
                  {livResult.ok && livResult.nb > 0 && ` — ${livResult.nb} mouvement(s) stock enregistré(s)`}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div style={{ padding: "16px 20px", background: "rgba(0,0,0,.03)", border: "1px solid rgba(0,0,0,.07)", fontSize: ".78rem", color: "#666", lineHeight: 1.7 }}>
            <i className="fas fa-circle-info" style={{ marginRight: 8, color: "#3b82f6" }}></i>
            Les commandes avec statut <strong>pending</strong> sont affichées. Après confirmation, la commande passe en <strong>delivered</strong> et le stock CLR est déduit automatiquement produit par produit.
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/* TAB : KPI PAR CLR                                 */}
      {/* ══════════════════════════════════════════════════ */}
      {tab === "kpi" && (
        <div>
          {/* Totaux */}
          {kpi && (
            <div className="com-kpi-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
              {[
                { lbl: "CA total estimé", val: fmtCA(kpi.totaux.caTotal) },
                { lbl: "Commandes total", val: kpi.totaux.nbCommandesTotal },
                { lbl: "Livrées", val: kpi.totaux.nbLivreesTotal },
                { lbl: "Taux service global", val: kpi.totaux.tauxServiceGlobal + "%" },
              ].map((k) => (
                <div key={k.lbl} className="com-kpi-card">
                  <div className="com-kpi-lbl">{k.lbl}</div>
                  <div className="com-kpi-val">{k.val}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tableau par CLR */}
          <div className="ds-panel">
            <div className="ds-panel-head">
              <span className="ds-panel-title">KPI par CLR</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              {/* Entête */}
              <div className="com-clr-row com-clr-head">
                {["CLR", "Commandes", "Livrées", "Clients", "CA estimé", "Taux service"].map((h) => (
                  <div key={h}>{h}</div>
                ))}
              </div>
              {/* Lignes */}
              {!kpi ? (
                <div className="ds-loading">Chargement</div>
              ) : kpi.kpiParCLR.length === 0 ? (
                <div className="ds-empty"><i className="fas fa-chart-bar"></i><p>Aucune donnée</p></div>
              ) : (
                kpi.kpiParCLR
                  .sort((a, b) => b.caEstimeDZD - a.caEstimeDZD)
                  .map((k) => (
                    <div key={k.clr.id} className="com-clr-row">
                      <div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: ".9rem", letterSpacing: ".05em" }}>
                          {k.clr.code}
                        </div>
                        <div style={{ fontSize: ".68rem", color: "#888" }}>{k.clr.nom} · {k.clr.wilaya}</div>
                      </div>
                      <div style={{ fontWeight: 700 }}>{k.nbCommandes}</div>
                      <div style={{ fontWeight: 700, color: "#10b981" }}>{k.nbLivrees}</div>
                      <div style={{ color: "#666" }}>{k.nbClients}</div>
                      <div style={{ fontWeight: 700, fontSize: ".75rem" }}>{fmtCA(k.caEstimeDZD)}</div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ flex: 1, height: 5, background: "rgba(0,0,0,.07)", borderRadius: 3 }}>
                            <div style={{
                              height: "100%", borderRadius: 3,
                              width: `${k.tauxService}%`,
                              background: tauxColor(k.tauxService),
                              transition: "width .5s",
                            }}></div>
                          </div>
                          <span style={{ fontSize: ".7rem", fontWeight: 800, color: tauxColor(k.tauxService), whiteSpace: "nowrap" }}>
                            {k.tauxService}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
