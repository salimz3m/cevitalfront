// frontend/src/pages/admin/Infrastructure.jsx
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { DS_STYLE } from '../ds';

const REGION_COLOR = {
  EST:    { bg: '#e63946', label: 'EST' },
  CENTRE: { bg: '#1d4ed8', label: 'CENTRE' },
  OUEST:  { bg: '#065f46', label: 'OUEST' },
};

const EXTRA_STYLE = `
  .infra-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-top: 32px;
  }
  @media(max-width: 1100px) { .infra-grid { grid-template-columns: 1fr; } }

  .plat-card {
    background: var(--dark);
    color: #fff;
    border-top: 4px solid var(--red);
    overflow: hidden;
  }
  .plat-card-head {
    padding: 24px 28px 20px;
    border-bottom: 1px solid rgba(255,255,255,.07);
  }
  .plat-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.6rem; letter-spacing: .08em;
    text-transform: uppercase; margin-bottom: 6px;
  }
  .plat-ville {
    font-size: .72rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .2em;
    color: rgba(255,255,255,.35);
  }
  .plat-capa {
    display: flex; align-items: baseline; gap: 6px;
    margin-top: 16px;
  }
  .plat-capa-val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2.8rem; color: var(--red);
    letter-spacing: .05em; line-height: 1;
  }
  .plat-capa-lbl {
    font-size: .6rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .2em;
    color: rgba(255,255,255,.3);
  }

  .clr-list { padding: 16px 0; }
  .clr-item {
    display: flex; align-items: center;
    padding: 10px 28px; gap: 14px;
    border-bottom: 1px solid rgba(255,255,255,.05);
    transition: background .2s;
  }
  .clr-item:last-child { border-bottom: none; }
  .clr-item:hover { background: rgba(255,255,255,.03); }
  .clr-code {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1rem; letter-spacing: .1em;
    color: var(--red); min-width: 36px;
  }
  .clr-info { flex: 1; }
  .clr-nom { font-size: .82rem; font-weight: 700; color: #fff; }
  .clr-wilaya { font-size: .72rem; color: rgba(255,255,255,.35); margin-top: 2px; }

  .region-badge {
    font-size: .55rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .15em;
    padding: 3px 8px; color: #fff;
  }

  .summary-band {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 2px; margin-bottom: 32px;
  }
  .summary-item {
    background: var(--dark3);
    border: 1px solid rgba(255,255,255,.06);
    padding: 24px 28px;
  }
  .summary-item-val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2.5rem; color: var(--red);
    letter-spacing: .05em; line-height: 1;
  }
  .summary-item-lbl {
    font-size: .6rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .25em;
    color: rgba(255,255,255,.3); margin-top: 6px;
  }

  .diap-info {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 16px; margin-top: 32px;
  }
  @media(max-width: 768px) { .diap-info { grid-template-columns: 1fr; } }
  .diap-card {
    background: #fff;
    border-left: 4px solid var(--dark);
    padding: 24px;
  }
  .diap-card.d2 { border-left-color: var(--red); }
  .diap-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.2rem; letter-spacing: .08em;
    color: var(--dark); margin-bottom: 12px;
  }
  .diap-flux {
    display: flex; align-items: center;
    flex-wrap: wrap; gap: 8px;
    font-size: .72rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .12em;
    color: #555; margin-bottom: 14px;
  }
  .diap-arrow { color: var(--red); font-size: .8rem; }
  .diap-node {
    background: var(--dark); color: #fff;
    padding: 4px 10px; font-size: .6rem;
  }
  .diap-node.opt { background: rgba(0,0,0,.12); color: var(--dark); }
  .diap-pros, .diap-cons { font-size: .8rem; line-height: 1.6; color: #555; }
  .diap-pros span, .diap-cons span { display: block; margin-bottom: 2px; }
  .diap-pros span::before { content: '+ '; color: #065f46; font-weight: 700; }
  .diap-cons span::before { content: '− '; color: var(--red); font-weight: 700; }
`;

export default function Infrastructure() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRegion, setActiveRegion] = useState('TOUTES');

  useEffect(() => {
    api.get('/infrastructure/summary')
      .then(({ data }) => setSummary(data))
      .finally(() => setLoading(false));
  }, []);

  const filteredPlat = summary?.plateformes?.filter(
    p => activeRegion === 'TOUTES' || p.region === activeRegion
  ) || [];

  if (loading) return (
    <div className="ds-page">
      <style dangerouslySetInnerHTML={{ __html: DS_STYLE + EXTRA_STYLE }} />
      <div className="ds-loading">Chargement de l'infrastructure</div>
    </div>
  );

  return (
    <div className="ds-page">
      <style dangerouslySetInnerHTML={{ __html: DS_STYLE + EXTRA_STYLE }} />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />

      {/* Header */}
      <div className="ds-header">
        <div className="ds-header-eyebrow"><span>Administration</span></div>
        <h1 className="ds-title">INFRA<span>STRUCTURE</span></h1>
        <p className="ds-subtitle">Plateformes logistiques et Centres de Livraison Régionaux</p>
      </div>

      {/* Chiffres clés */}
      {summary && (
        <div className="summary-band">
          <div className="summary-item">
            <div className="summary-item-val">{summary.totaux.nbPlateformes}</div>
            <div className="summary-item-lbl">Plateformes Logistiques</div>
          </div>
          <div className="summary-item">
            <div className="summary-item-val">
              {summary.totaux.capaciteTotale.toLocaleString('fr-DZ')}
            </div>
            <div className="summary-item-lbl">Palettes Capacité Totale</div>
          </div>
          <div className="summary-item">
            <div className="summary-item-val">{summary.totaux.nbClrs}</div>
            <div className="summary-item-lbl">Centres de Livraison (CLR)</div>
          </div>
        </div>
      )}

      {/* Filtre région */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
        {['TOUTES', 'EST', 'CENTRE', 'OUEST'].map(r => (
          <button key={r}
            className={`ds-btn ${activeRegion === r ? 'ds-btn-dark' : 'ds-btn-outline'}`}
            style={{ padding: '8px 18px' }}
            onClick={() => setActiveRegion(r)}>
            {r}
          </button>
        ))}
      </div>

      {/* Grille plateformes */}
      <div className="infra-grid">
        {filteredPlat.map(plat => {
          const rc = REGION_COLOR[plat.region];
          return (
            <div key={plat.id} className="plat-card">
              <div className="plat-card-head">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="plat-name">{plat.nom}</div>
                    <div className="plat-ville">
                      <i className="fas fa-map-pin" style={{ color: 'var(--red)', marginRight: 6, fontSize: '.7rem' }}></i>
                      {plat.ville}
                    </div>
                  </div>
                  <span className="region-badge" style={{ background: rc.bg }}>{rc.label}</span>
                </div>
                <div className="plat-capa">
                  <span className="plat-capa-val">{plat.capacite.toLocaleString('fr-DZ')}</span>
                  <span className="plat-capa-lbl">palettes</span>
                </div>
              </div>

              {/* CLR rattachés */}
              <div style={{ padding: '12px 0 0', background: 'rgba(255,255,255,.02)' }}>
                <div style={{ padding: '6px 28px 10px', fontSize: '.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.25em', color: 'rgba(255,255,255,.25)' }}>
                  {plat.nbClrs} CLR rattachés
                </div>
                <div className="clr-list">
                  {plat.clrs?.map(clr => (
                    <div key={clr.code} className="clr-item">
                      <span className="clr-code">{clr.code}</span>
                      <div className="clr-info">
                        <div className="clr-nom">{clr.nom}</div>
                        <div className="clr-wilaya">{clr.wilaya}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section Diapasons */}
      <div className="ds-panel" style={{ marginTop: 40 }}>
        <div className="ds-panel-head">
          <span className="ds-panel-title">Modes de Distribution — Diapasons</span>
        </div>
        <div className="ds-panel-body">
          <div className="diap-info">
            {/* D1 */}
            <div className="diap-card">
              <div className="diap-title">Diapason 1 — Via Plateforme</div>
              <div className="diap-flux">
                <span className="diap-node">Unité de production</span>
                <i className="fas fa-arrow-right diap-arrow"></i>
                <span className="diap-node">Plateforme logistique</span>
                <i className="fas fa-arrow-right diap-arrow"></i>
                <span className="diap-node">CLR</span>
              </div>
              <div className="diap-pros">
                <span>Haute disponibilité produits</span>
                <span>Meilleure gestion des stocks</span>
              </div>
              <div style={{ marginTop: 10 }} className="diap-cons">
                <span>Coût élevé</span>
                <span>Double chargement camions</span>
              </div>
            </div>
            {/* D2 */}
            <div className="diap-card d2">
              <div className="diap-title">Diapason 2 — Direct</div>
              <div className="diap-flux">
                <span className="diap-node">Unité de production</span>
                <i className="fas fa-arrow-right diap-arrow"></i>
                <span className="diap-node">CLR</span>
                <span className="diap-node opt">sans passage plateforme</span>
              </div>
              <div className="diap-pros">
                <span>Réduction des coûts logistiques</span>
                <span>Chargement unique</span>
              </div>
              <div style={{ marginTop: 10 }} className="diap-cons">
                <span>Délai jusqu'à 2 jours</span>
                <span>Risque rupture de stock</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
