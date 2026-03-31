// Design tokens partagés — identité LogiPlatform
export const DS_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;600;700&display=swap');
  :root {
    --red: #e63946; --red-dk: #b8262f;
    --dark: #080808; --dark2: #111111; --dark3: #1a1a1a;
    --light: #f5f3ef; --gold: #c9a84c;
    --ease: cubic-bezier(0.23,1,0.32,1);
    --font-display: 'Bebas Neue', sans-serif;
    --font-body: 'DM Sans', sans-serif;
  }
  *, *::before, *::after { box-sizing: border-box; }

  /* PAGE WRAPPER */
  .ds-page {
    font-family: var(--font-body);
    color: var(--dark2);
    min-height: 100vh;
    background: #f0eeea;
  }

  /* PAGE HEADER */
  .ds-header { margin-bottom: 40px; }
  .ds-header-eyebrow {
    display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
  }
  .ds-header-eyebrow::before {
    content: ''; display: block;
    width: 32px; height: 2px; background: var(--red);
  }
  .ds-header-eyebrow span {
    font-size: .62rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .3em; color: var(--red);
  }
  .ds-title {
    font-family: var(--font-display);
    font-size: clamp(2rem, 4vw, 3.2rem);
    letter-spacing: .05em; text-transform: uppercase;
    color: var(--dark); line-height: 1;
  }
  .ds-title span { color: var(--red); }
  .ds-subtitle {
    font-size: .9rem; color: #666; margin-top: 8px; line-height: 1.6;
  }

  /* CARDS KPI */
  .ds-kpi-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 16px; margin-bottom: 28px;
  }
  @media(max-width:640px){ .ds-kpi-grid { grid-template-columns: 1fr; } }
  .ds-kpi {
    background: var(--dark); color: #fff;
    padding: 28px 28px 24px;
    position: relative; overflow: hidden;
    border-left: 4px solid var(--red);
    transition: transform .3s var(--ease);
  }
  .ds-kpi:hover { transform: translateY(-3px); }
  .ds-kpi-label {
    font-size: .62rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .25em;
    color: rgba(255,255,255,.4); margin-bottom: 10px;
  }
  .ds-kpi-val {
    font-family: var(--font-display);
    font-size: 3rem; letter-spacing: .05em; line-height: 1;
    color: #fff;
  }
  .ds-kpi-val.red { color: var(--red); }
  .ds-kpi-val.yellow { color: #f59e0b; }
  .ds-kpi-val.green { color: #10b981; }
  .ds-kpi-bg {
    position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
    font-size: 4rem; opacity: .06; pointer-events: none;
    font-family: var(--font-display); letter-spacing: .05em;
  }

  /* PANEL (carte générique) */
  .ds-panel {
    background: #fff;
    border: 1px solid rgba(0,0,0,.07);
    border-top: 3px solid var(--dark);
    margin-bottom: 24px;
    overflow: hidden;
  }
  .ds-panel-head {
    padding: 20px 28px;
    border-bottom: 1px solid rgba(0,0,0,.06);
    display: flex; align-items: center; justify-content: space-between;
  }
  .ds-panel-title {
    font-family: var(--font-display);
    font-size: 1.3rem; letter-spacing: .08em;
    text-transform: uppercase; color: var(--dark);
  }
  .ds-panel-body { padding: 24px 28px; }

  /* BADGE count */
  .ds-badge {
    display: inline-flex; align-items: center; justify-content: center;
    background: var(--red); color: #fff;
    font-size: .6rem; font-weight: 700;
    min-width: 22px; height: 22px; padding: 0 6px;
    letter-spacing: .1em;
  }

  /* BUTTONS */
  .ds-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 24px;
    font-family: var(--font-body);
    font-size: .7rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .2em;
    cursor: pointer; border: none;
    transition: all .3s var(--ease);
  }
  .ds-btn-dark { background: var(--dark); color: #fff; }
  .ds-btn-dark:hover { background: var(--red); }
  .ds-btn-red { background: var(--red); color: #fff; }
  .ds-btn-red:hover { background: #fff; color: var(--dark); border: 1px solid var(--dark); }
  .ds-btn-outline { background: transparent; color: var(--dark); border: 1px solid rgba(0,0,0,.2); }
  .ds-btn-outline:hover { background: var(--dark); color: #fff; }
  .ds-btn:disabled { opacity: .4; cursor: not-allowed; }

  /* TABLE */
  .ds-table-wrap { overflow-x: auto; }
  .ds-table { width: 100%; border-collapse: collapse; font-size: .85rem; }
  .ds-table thead tr {
    background: var(--dark); color: #fff;
  }
  .ds-table thead th {
    padding: 12px 20px; text-align: left;
    font-size: .6rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .2em;
    white-space: nowrap;
  }
  .ds-table tbody tr {
    border-bottom: 1px solid rgba(0,0,0,.06);
    transition: background .2s;
  }
  .ds-table tbody tr:hover { background: rgba(230,57,70,.03); }
  .ds-table td { padding: 14px 20px; color: #333; vertical-align: middle; }
  .ds-table td.mono {
    font-family: 'Courier New', monospace;
    font-weight: 700; color: var(--dark); font-size: .82rem;
  }

  /* STATUS CHIPS */
  .ds-chip {
    display: inline-block;
    padding: 4px 10px;
    font-size: .6rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .15em;
  }
  .ds-chip-yellow { background: rgba(245,158,11,.12); color: #b45309; border: 1px solid rgba(245,158,11,.3); }
  .ds-chip-blue   { background: rgba(59,130,246,.1); color: #1d4ed8; border: 1px solid rgba(59,130,246,.25); }
  .ds-chip-purple { background: rgba(139,92,246,.1); color: #7c3aed; border: 1px solid rgba(139,92,246,.25); }
  .ds-chip-green  { background: rgba(16,185,129,.1); color: #065f46; border: 1px solid rgba(16,185,129,.25); }
  .ds-chip-red    { background: rgba(230,57,70,.1); color: var(--red); border: 1px solid rgba(230,57,70,.3); }

  /* FORM FIELDS */
  .ds-field { margin-bottom: 20px; }
  .ds-field-label {
    display: block; font-size: .62rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .25em;
    color: #888; margin-bottom: 8px;
  }
  .ds-input {
    width: 100%; background: var(--light);
    border: 1px solid rgba(0,0,0,.1); border-bottom: 2px solid rgba(0,0,0,.15);
    color: var(--dark); padding: 12px 16px;
    font-family: var(--font-body); font-size: .9rem;
    outline: none; transition: border-color .3s;
  }
  .ds-input:focus { border-bottom-color: var(--red); }

  /* EMPTY STATE */
  .ds-empty {
    padding: 60px 24px; text-align: center;
    color: #999;
  }
  .ds-empty i { font-size: 2.5rem; opacity: .3; margin-bottom: 16px; display: block; }
  .ds-empty p { font-size: .9rem; }

  /* ALERT IMPORT */
  .ds-alert { padding: 14px 20px; margin-top: 16px; font-size: .85rem; display: flex; align-items: flex-start; gap: 12px; }
  .ds-alert-success { background: rgba(16,185,129,.08); border: 1px solid rgba(16,185,129,.25); color: #065f46; }
  .ds-alert-error { background: rgba(230,57,70,.08); border: 1px solid rgba(230,57,70,.25); color: var(--red); }

  /* MODAL */
  .ds-modal-bg {
    position: fixed; inset: 0;
    background: rgba(8,8,8,.75); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 24px;
  }
  .ds-modal {
    background: #fff; width: 100%; max-width: 480px;
    border-top: 4px solid var(--red);
  }
  .ds-modal-head {
    padding: 20px 28px; border-bottom: 1px solid rgba(0,0,0,.07);
    display: flex; justify-content: space-between; align-items: center;
  }
  .ds-modal-title {
    font-family: var(--font-display);
    font-size: 1.3rem; letter-spacing: .08em; text-transform: uppercase;
  }
  .ds-modal-close {
    background: none; border: none; cursor: pointer;
    color: #999; font-size: 1rem; transition: color .2s;
  }
  .ds-modal-close:hover { color: var(--dark); }
  .ds-modal-body { padding: 28px; }
  .ds-modal-footer { padding: 16px 28px; border-top: 1px solid rgba(0,0,0,.07); display: flex; gap: 12px; }
  .ds-modal-footer .ds-btn { flex: 1; justify-content: center; }

  /* LOADING */
  .ds-loading {
    padding: 60px; text-align: center;
    font-size: .7rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .3em; color: #bbb;
  }
  .ds-loading::before {
    content: '';
    display: block; width: 32px; height: 2px;
    background: var(--red); margin: 0 auto 16px;
    animation: dsLoad 1.2s ease infinite alternate;
  }
  @keyframes dsLoad { from { width: 32px; } to { width: 80px; } }

  /* LINK BTN */
  .ds-link-btn {
    font-size: .7rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .15em; color: var(--red);
    background: none; border: none; cursor: pointer;
    padding: 0; transition: opacity .2s;
  }
  .ds-link-btn:hover { opacity: .7; }

  /* ACTION STATUS BUTTONS */
  .ds-action-row { display: flex; gap: 10px; margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(0,0,0,.06); }
`;

export const STATUS_CHIP = {
  pending: { label: "En attente", cls: "ds-chip ds-chip-yellow" },
  planned: { label: "Planifiée", cls: "ds-chip ds-chip-blue" },
  in_transit: { label: "En transit", cls: "ds-chip ds-chip-purple" },
  delivered: { label: "Livrée", cls: "ds-chip ds-chip-green" },
  cancelled: { label: "Annulée", cls: "ds-chip ds-chip-red" },
  scheduled: { label: "Planifiée", cls: "ds-chip ds-chip-blue" },
  failed: { label: "Échouée", cls: "ds-chip ds-chip-red" },
};
