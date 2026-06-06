// design-system.js — Système de design partagé (inspiré de KeepContact)
// Importer dans chaque page : import { DS_STYLE, DS } from './design-system';

export const DS = {
  bg: "#f8f8f7",
  surface: "#ffffff",
  surface2: "#f2f2f0",
  border: "#e6e6e3",
  border2: "#d0d0cc",
  ink: "#111110",
  ink2: "#555553",
  ink3: "#9a9a96",
  red: "#c0392b",
  redSoft: "rgba(192,57,43,.07)",
  redMid: "rgba(192,57,43,.15)",
  green: "#1a7a4a",
  greenSoft: "rgba(26,122,74,.07)",
  amber: "#b45309",
  amberSoft: "rgba(180,83,9,.08)",
  blue: "#1d4ed8",
  blueSoft: "rgba(29,78,216,.07)",
  radius: "5px",
  radiusLg: "10px",
  shadowSm: "0 1px 3px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.03)",
  shadow: "0 4px 14px rgba(0,0,0,.07)",
  font: "'DM Sans', system-ui, sans-serif",
  mono: "'DM Mono', monospace",
};

export const DS_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;900&display=swap');

  :root {
    --ds-bg: #f8f8f7;
    --ds-surface: #ffffff;
    --ds-surface-2: #f2f2f0;
    --ds-border: #e6e6e3;
    --ds-border-2: #d0d0cc;
    --ds-ink: #111110;
    --ds-ink-2: #555553;
    --ds-ink-3: #9a9a96;
    --ds-red: #c0392b;
    --ds-red-soft: rgba(192,57,43,.07);
    --ds-red-mid: rgba(192,57,43,.15);
    --ds-green: #1a7a4a;
    --ds-green-soft: rgba(26,122,74,.07);
    --ds-amber: #b45309;
    --ds-amber-soft: rgba(180,83,9,.08);
    --ds-blue: #1d4ed8;
    --ds-blue-soft: rgba(29,78,216,.07);
    --ds-purple: #6d28d9;
    --ds-purple-soft: rgba(109,40,217,.07);
    --ds-radius: 5px;
    --ds-radius-lg: 10px;
    --ds-shadow-sm: 0 1px 3px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.03);
    --ds-shadow: 0 4px 14px rgba(0,0,0,.07);
    --ds-font: 'DM Sans', system-ui, sans-serif;
    --ds-mono: 'DM Mono', monospace;
  }

  *, *::before, *::after { box-sizing: border-box; }

  .ds-layout {
    display: flex; min-height: 100vh;
    background: var(--ds-bg); font-family: var(--ds-font);
    color: var(--ds-ink); -webkit-font-smoothing: antialiased;
  }
  .ds-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

  /* Page Header */
  .ds-page-header {
    background: var(--ds-surface); border-bottom: 1px solid var(--ds-border);
    padding: 28px 36px 24px;
  }
  .ds-eyebrow {
    font-size: .62rem; font-weight: 700; letter-spacing: .18em;
    text-transform: uppercase; color: var(--ds-red);
    margin-bottom: 6px; display: flex; align-items: center; gap: 7px;
  }
  .ds-eyebrow::before { content: ''; width: 18px; height: 2px; background: var(--ds-red); }
  .ds-page-title {
    font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 900;
    line-height: 1; letter-spacing: -.02em; color: var(--ds-ink); margin-bottom: 4px;
  }
  .ds-page-title span { color: var(--ds-red); }
  .ds-page-sub { font-size: .82rem; color: var(--ds-ink-3); font-weight: 400; }

  /* KPI Strip */
  .ds-kpi-strip {
    display: flex; background: var(--ds-surface);
    border-bottom: 1px solid var(--ds-border);
  }
  .ds-kpi {
    flex: 1; padding: 16px 28px; border-right: 1px solid var(--ds-border);
    position: relative; overflow: hidden;
  }
  .ds-kpi:last-child { border-right: none; }
  .ds-kpi-lbl {
    font-size: .62rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .1em; color: var(--ds-ink-3); margin-bottom: 4px;
  }
  .ds-kpi-val {
    font-size: 1.7rem; font-weight: 700; font-family: var(--ds-mono); line-height: 1;
  }
  .ds-kpi-val.red { color: var(--ds-red); }
  .ds-kpi-val.green { color: var(--ds-green); }
  .ds-kpi-val.amber { color: var(--ds-amber); }
  .ds-kpi-val.blue { color: var(--ds-blue); }
  .ds-kpi-icon {
    position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
    font-size: 1.4rem; opacity: .06; color: var(--ds-ink);
  }

  /* Tabs */
  .ds-tabs {
    display: flex; padding: 0 36px; background: var(--ds-surface);
    border-bottom: 2px solid var(--ds-border); gap: 0;
  }
  .ds-tab {
    padding: 14px 20px; font-size: .8rem; font-weight: 600;
    color: var(--ds-ink-3); cursor: pointer; border: none;
    background: none; border-bottom: 2px solid transparent;
    margin-bottom: -2px; transition: all .15s; display: flex;
    align-items: center; gap: 7px; letter-spacing: .01em;
  }
  .ds-tab:hover { color: var(--ds-ink); }
  .ds-tab.active { color: var(--ds-ink); border-bottom-color: var(--ds-red); }
  .ds-tab-badge {
    min-width: 18px; height: 18px; padding: 0 5px;
    display: inline-flex; align-items: center; justify-content: center;
    background: var(--ds-red); color: #fff;
    border-radius: 20px; font-size: .62rem; font-weight: 800;
  }
  .ds-tab-badge.neutral { background: var(--ds-surface-2); color: var(--ds-ink-2); }

  /* Content area */
  .ds-content { padding: 28px 36px; flex: 1; }

  /* Card */
  .ds-card {
    background: var(--ds-surface); border: 1px solid var(--ds-border);
    border-radius: var(--ds-radius-lg); box-shadow: var(--ds-shadow-sm);
    overflow: hidden; margin-bottom: 16px;
  }
  .ds-card-head {
    padding: 16px 22px; border-bottom: 1px solid var(--ds-border);
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .ds-card-title {
    font-size: .75rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .09em; color: var(--ds-ink); display: flex; align-items: center; gap: 8px;
  }
  .ds-card-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ds-red); flex-shrink: 0; }
  .ds-card-body { padding: 22px; }

  /* Buttons */
  .ds-btn {
    display: inline-flex; align-items: center; gap: 7px;
    font-family: var(--ds-font); font-size: .8rem; font-weight: 600;
    padding: 9px 18px; border-radius: var(--ds-radius);
    border: 1px solid transparent; cursor: pointer;
    transition: all .15s; white-space: nowrap;
  }
  .ds-btn:disabled { opacity: .4; cursor: not-allowed; }
  .ds-btn-primary { background: var(--ds-ink); color: #fff; border-color: var(--ds-ink); }
  .ds-btn-primary:hover:not(:disabled) { background: #2a2a28; }
  .ds-btn-red { background: var(--ds-red); color: #fff; border-color: var(--ds-red); }
  .ds-btn-red:hover:not(:disabled) { background: #a93226; }
  .ds-btn-outline { background: transparent; color: var(--ds-ink); border-color: var(--ds-border-2); }
  .ds-btn-outline:hover:not(:disabled) { border-color: var(--ds-ink); background: var(--ds-surface-2); }
  .ds-btn-ghost { background: none; border: none; color: var(--ds-ink-3); padding: 7px 10px; }
  .ds-btn-ghost:hover:not(:disabled) { color: var(--ds-red); background: var(--ds-red-soft); }
  .ds-btn-sm { font-size: .74rem; padding: 6px 13px; }

  /* Table */
  .ds-table-wrap { overflow-x: auto; }
  .ds-table { width: 100%; border-collapse: collapse; }
  .ds-table th {
    padding: 10px 14px; text-align: left; font-size: .62rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .09em; color: var(--ds-ink-3);
    border-bottom: 2px solid var(--ds-border); background: var(--ds-surface-2); white-space: nowrap;
  }
  .ds-table td { padding: 11px 14px; font-size: .8rem; border-bottom: 1px solid var(--ds-border); vertical-align: middle; }
  .ds-table tbody tr:hover td { background: var(--ds-surface-2); }
  .ds-table tbody tr:last-child td { border-bottom: none; }

  /* Badge */
  .ds-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: .62rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .07em; padding: 2px 8px; border-radius: 20px;
  }
  .ds-badge-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .ds-badge-red { background: var(--ds-red-soft); color: var(--ds-red); border: 1px solid var(--ds-red-mid); }
  .ds-badge-green { background: var(--ds-green-soft); color: var(--ds-green); border: 1px solid #bbf7d0; }
  .ds-badge-amber { background: var(--ds-amber-soft); color: var(--ds-amber); border: 1px solid #fde68a; }
  .ds-badge-blue { background: var(--ds-blue-soft); color: var(--ds-blue); border: 1px solid #bfdbfe; }
  .ds-badge-purple { background: var(--ds-purple-soft); color: var(--ds-purple); border: 1px solid #ddd6fe; }
  .ds-badge-neutral { background: var(--ds-surface-2); color: var(--ds-ink-2); border: 1px solid var(--ds-border); }

  /* Alert */
  .ds-alert {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 16px; border-radius: var(--ds-radius);
    font-size: .82rem; margin-top: 16px;
  }
  .ds-alert-success { background: var(--ds-green-soft); color: var(--ds-green); border: 1px solid #bbf7d0; }
  .ds-alert-error { background: var(--ds-red-soft); color: var(--ds-red); border: 1px solid var(--ds-red-mid); }
  .ds-alert-warn { background: var(--ds-amber-soft); color: var(--ds-amber); border: 1px solid #fde68a; }
  .ds-alert-info { background: var(--ds-blue-soft); color: var(--ds-blue); border: 1px solid #bfdbfe; }

  /* Score bar */
  .ds-bar-track {
    height: 6px; background: var(--ds-border); border-radius: 3px; overflow: hidden;
  }
  .ds-bar-fill { height: 100%; border-radius: 3px; transition: width .5s ease; }

  /* Form */
  .ds-input, .ds-select {
    width: 100%; padding: 9px 11px; border: 1px solid var(--ds-border-2);
    border-radius: var(--ds-radius); font-family: var(--ds-font); font-size: .84rem;
    color: var(--ds-ink); background: var(--ds-surface); outline: none;
    transition: border-color .15s, box-shadow .15s;
  }
  .ds-input:focus, .ds-select:focus {
    border-color: var(--ds-ink); box-shadow: 0 0 0 3px rgba(0,0,0,.05);
  }
  .ds-input::placeholder { color: var(--ds-ink-3); }
  .ds-label {
    font-size: .68rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .08em; color: var(--ds-ink-2); display: block; margin-bottom: 5px;
  }
  .ds-field { display: flex; flex-direction: column; gap: 5px; }

  /* Filter chips */
  .ds-chip {
    padding: 5px 13px; font-size: .7rem; font-weight: 700; border-radius: 20px;
    border: 1.5px solid var(--ds-border); background: transparent; color: var(--ds-ink-3); cursor: pointer; transition: all .15s;
  }
  .ds-chip:hover { border-color: var(--ds-border-2); color: var(--ds-ink); }
  .ds-chip.active { background: var(--ds-ink); color: #fff; border-color: var(--ds-ink); }
  .ds-chip.active-red { background: var(--ds-red-soft); color: var(--ds-red); border-color: var(--ds-red-mid); }
  .ds-chip.active-green { background: var(--ds-green-soft); color: var(--ds-green); border-color: #bbf7d0; }
  .ds-chip.active-amber { background: var(--ds-amber-soft); color: var(--ds-amber); border-color: #fde68a; }

  /* Empty / Loading */
  .ds-empty { text-align: center; padding: 48px 20px; color: var(--ds-ink-3); }
  .ds-empty i { font-size: 2rem; opacity: .2; margin-bottom: 12px; display: block; }
  .ds-empty p { font-size: .84rem; }
  .ds-loading { text-align: center; padding: 32px; color: var(--ds-ink-3); font-size: .84rem; }

  /* Section divider */
  .ds-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0 16px; }
  .ds-divider-line { flex: 1; height: 1px; background: var(--ds-border); }
  .ds-divider-txt {
    font-size: .62rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .12em; color: var(--ds-ink-3); white-space: nowrap;
  }

  /* Modal overlay */
  .ds-overlay {
    position: fixed; inset: 0; background: rgba(17,17,16,.4);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 16px; backdrop-filter: blur(2px);
  }
  .ds-modal {
    background: var(--ds-surface); border: 1px solid var(--ds-border);
    border-radius: var(--ds-radius-lg); padding: 28px;
    width: 100%; max-width: 480px; box-shadow: var(--ds-shadow);
  }
  .ds-modal-title {
    font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700;
    color: var(--ds-ink); margin-bottom: 20px; display: flex; align-items: center; gap: 10px;
  }
  .ds-modal-actions {
    display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px;
    padding-top: 18px; border-top: 1px solid var(--ds-border);
  }

  /* Pagination */
  .ds-pagination { display: flex; justify-content: center; align-items: center; gap: 4px; margin-top: 20px; }
  .ds-page-btn {
    min-width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center;
    border: 1px solid var(--ds-border); border-radius: var(--ds-radius);
    background: var(--ds-surface); color: var(--ds-ink-2); font-size: .78rem;
    font-weight: 600; cursor: pointer; transition: all .15s;
  }
  .ds-page-btn:hover { border-color: var(--ds-ink); color: var(--ds-ink); }
  .ds-page-btn.active { background: var(--ds-ink); color: #fff; border-color: var(--ds-ink); }
  .ds-page-btn:disabled { opacity: .3; cursor: not-allowed; }

  .mono { font-family: var(--ds-mono); font-size: .72rem !important; }
`;
