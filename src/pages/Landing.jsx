import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
   LANDING PAGE — LogiPlatform
   Fusion iHC Holding (typo, univers industriel)
   + Skillzone (parallax, sections image, chatbot)
───────────────────────────────────────────────*/

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,600;0,700;1,300&family=DM+Serif+Display:ital@0;1&display=swap');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

  :root {
    --red:    #e63946;
    --red-dk: #b8262f;
    --dark:   #080808;
    --dark2:  #111111;
    --dark3:  #1a1a1a;
    --light:  #f5f3ef;
    --gray:   #8a8a8a;
    --gold:   #c9a84c;
    --ease:   cubic-bezier(0.23, 1, 0.32, 1);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .lp-body {
    background: var(--dark);
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }

  /* ── PRELOADER ── */
  .lp-preloader {
    position: fixed; inset: 0; z-index: 9999;
    background: var(--dark);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 24px;
    transition: opacity .7s var(--ease), visibility .7s;
  }
  .lp-preloader.hidden { opacity: 0; visibility: hidden; pointer-events: none; }
  .lp-pre-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(2rem, 6vw, 3.5rem);
    letter-spacing: .15em;
  }
  .lp-pre-logo span { color: var(--red); }
  .lp-pre-bar {
    width: 200px; height: 2px;
    background: rgba(255,255,255,.1);
    border-radius: 2px; overflow: hidden;
  }
  .lp-pre-bar::after {
    content: ''; display: block;
    width: 0; height: 100%;
    background: var(--red);
    animation: lpPreload 1.4s var(--ease) forwards;
  }
  @keyframes lpPreload { to { width: 100%; } }

  /* ── NAV ── */
  .lp-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    padding: 28px 60px;
    display: flex; align-items: center; justify-content: space-between;
    transition: padding .5s var(--ease), background .5s;
  }
  .lp-nav.scrolled {
    padding: 14px 60px;
    background: rgba(8,8,8,.97);
    border-bottom: 1px solid rgba(230,57,70,.2);
    backdrop-filter: blur(20px);
  }
  @media(max-width:1024px) {
    .lp-nav { padding: 20px 24px; }
    .lp-nav.scrolled { padding: 14px 24px; }
  }
  .lp-nav-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.9rem; letter-spacing: .08em;
    text-decoration: none; color: #fff;
  }
  .lp-nav-logo span { color: var(--red); }
  .lp-nav-links {
    display: flex; align-items: center; gap: 36px; list-style: none;
  }
  .lp-nav-links a {
    font-size: .7rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .18em;
    color: rgba(255,255,255,.65);
    text-decoration: none;
    position: relative; transition: color .3s;
  }
  .lp-nav-links a::after {
    content: ''; position: absolute;
    bottom: -3px; left: 0; width: 0; height: 1px;
    background: var(--red);
    transition: width .4s var(--ease);
  }
  .lp-nav-links a:hover { color: #fff; }
  .lp-nav-links a:hover::after { width: 100%; }
  .lp-nav-cta {
    background: var(--red) !important;
    color: #fff !important;
    padding: 11px 26px;
    transition: background .3s, color .3s !important;
    cursor: pointer; border: none; outline: none;
    font-family: 'DM Sans', sans-serif;
    font-size: .7rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .2em;
  }
  .lp-nav-cta:hover { background: #fff !important; color: var(--dark) !important; }
  .lp-nav-cta::after { display: none !important; }
  .lp-burger {
    display: none; background: none; border: none;
    color: #fff; font-size: 1.4rem; cursor: pointer;
  }
  @media(max-width:1024px) {
    .lp-nav-links { display: none; }
    .lp-burger { display: block; }
  }

  /* ── MOBILE MENU ── */
  .lp-mobile {
    position: fixed; inset: 0; z-index: 200;
    background: var(--dark);
    display: none; flex-direction: column;
    align-items: center; justify-content: center; gap: 36px;
  }
  .lp-mobile.open { display: flex; }
  .lp-mobile a {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(2rem, 8vw, 3rem);
    letter-spacing: .1em;
    color: rgba(255,255,255,.7);
    text-decoration: none;
    transition: color .3s;
  }
  .lp-mobile a:hover { color: var(--red); }
  .lp-mobile-close {
    position: absolute; top: 24px; right: 24px;
    background: none; border: none;
    color: #fff; font-size: 1.8rem; cursor: pointer;
  }

  /* ── UTILS ── */
  .lp-container { max-width: 1360px; margin: 0 auto; padding: 0 60px; }
  @media(max-width:768px) { .lp-container { padding: 0 24px; } }
  .lp-label {
    display: block;
    font-size: .65rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .35em;
    color: var(--red); margin-bottom: 20px;
  }
  .lp-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(3rem, 7vw, 6rem);
    letter-spacing: .05em; line-height: 1;
    text-transform: uppercase;
  }
  .lp-btn {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 16px 36px;
    font-family: 'DM Sans', sans-serif;
    font-size: .7rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .2em;
    transition: all .35s var(--ease);
    cursor: pointer; border: none; text-decoration: none;
  }
  .lp-btn-red { background: var(--red); color: #fff; }
  .lp-btn-red:hover { background: #fff; color: var(--dark); }
  .lp-btn-outline { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,.25); }
  .lp-btn-outline:hover { background: #fff; color: var(--dark); border-color: #fff; }
  .lp-btn-outline-dark { background: transparent; color: var(--dark); border: 1px solid rgba(0,0,0,.2); }
  .lp-btn-outline-dark:hover { background: var(--dark); color: #fff; }
  .lp-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent);
  }
  .lp-divider-light {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,0,0,.1), transparent);
  }

  /* ── REVEAL ── */
  .lp-reveal {
    opacity: 0; transform: translateY(50px);
    transition: opacity .9s var(--ease), transform .9s var(--ease);
  }
  .lp-reveal.left { opacity: 0; transform: translateX(-50px); }
  .lp-reveal.right { opacity: 0; transform: translateX(50px); }
  .lp-reveal.scale { opacity: 0; transform: scale(.93); }
  .lp-reveal.visible { opacity: 1; transform: none; }
  .lp-d1 { transition-delay: .1s; }
  .lp-d2 { transition-delay: .2s; }
  .lp-d3 { transition-delay: .3s; }
  .lp-d4 { transition-delay: .4s; }

  /* ── HERO ── */
  .lp-hero {
    min-height: 100vh; position: relative;
    display: flex; align-items: center; overflow: hidden;
  }
  .lp-hero-bg {
    position: absolute; inset: 0;
    background-image: url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2400&q=85');
    background-size: cover; background-position: center;
    will-change: transform;
    transition: transform 6s ease-out;
  }
  .lp-hero-bg::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(8,8,8,.94) 0%, rgba(8,8,8,.65) 60%, rgba(230,57,70,.12) 100%);
  }
  .lp-hero-content { position: relative; z-index: 2; width: 100%; padding: 160px 0 100px; }
  .lp-hero-eyebrow {
    display: flex; align-items: center; gap: 16px; margin-bottom: 32px;
    transform: translateY(30px); opacity: 0;
    transition: all 1s ease .2s;
  }
  .lp-hero-eyebrow::before {
    content: ''; display: block;
    width: 48px; height: 2px; background: var(--red);
  }
  .lp-hero-eyebrow span {
    font-size: .65rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .35em; color: var(--red);
  }
  .lp-hero-h1 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(5rem, 14vw, 12rem);
    line-height: .9; letter-spacing: .02em;
    text-transform: uppercase; margin-bottom: 48px;
    transform: translateY(40px); opacity: 0;
    transition: all 1.2s cubic-bezier(.23,1,.32,1) .4s;
  }
  .lp-hero-h1 .outline {
    -webkit-text-stroke: 2px rgba(255,255,255,.2);
    color: transparent;
  }
  .lp-hero-sub {
    max-width: 560px;
    font-size: 1.1rem; font-weight: 300; line-height: 1.75;
    color: rgba(255,255,255,.7); margin-bottom: 52px;
    transform: translateY(30px); opacity: 0;
    transition: all 1s ease .8s;
  }
  .lp-hero-actions {
    display: flex; flex-wrap: wrap; gap: 16px;
    transform: translateY(30px); opacity: 0;
    transition: all 1s ease 1s;
  }
  .lp-hero-stats {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.08);
    margin-top: 80px;
    transform: translateY(30px); opacity: 0;
    transition: all 1.2s var(--ease) 1.2s;
  }
  @media(max-width:768px) { .lp-hero-stats { grid-template-columns: repeat(2,1fr); } }
  .lp-hero-stat {
    padding: 28px 24px;
    background: var(--dark);
    border-right: 1px solid rgba(255,255,255,.06);
  }
  .lp-hero-stat:last-child { border-right: none; }
  .lp-stat-val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2.8rem; color: var(--red);
    letter-spacing: .05em; line-height: 1;
  }
  .lp-stat-lbl {
    font-size: .62rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: .2em;
    color: rgba(255,255,255,.35); margin-top: 6px;
  }
  .lp-hero-visible .lp-hero-eyebrow,
  .lp-hero-visible .lp-hero-h1,
  .lp-hero-visible .lp-hero-sub,
  .lp-hero-visible .lp-hero-actions,
  .lp-hero-visible .lp-hero-stats {
    opacity: 1; transform: none;
  }
  .lp-scroll-hint {
    position: absolute; bottom: 48px; left: 50%;
    transform: translateX(-50%);
    display: flex; flex-direction: column;
    align-items: center; gap: 12px; z-index: 2;
  }
  .lp-scroll-hint span {
    font-size: .6rem; text-transform: uppercase;
    letter-spacing: .3em; color: rgba(255,255,255,.3);
  }
  .lp-scroll-line {
    width: 1px; height: 60px;
    background: linear-gradient(to bottom, rgba(255,255,255,.4), transparent);
    animation: lpScrollLine 2.5s infinite var(--ease);
  }
  @keyframes lpScrollLine {
    0%,100% { opacity: .3; transform: scaleY(1); }
    50% { opacity: 1; transform: scaleY(.6); }
  }

  /* ── MANIFESTE (parallax bg + texte reveal) ── */
  .lp-manifeste {
    min-height: 80vh; display: flex; align-items: center;
    position: relative; overflow: hidden;
    background-image: url('https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1920&q=80');
    background-size: cover; background-position: center;
    background-attachment: fixed;
  }
  .lp-manifeste::before {
    content: ''; position: absolute; inset: 0;
    background: rgba(255,255,255,.88);
  }
  .lp-manifeste-inner {
    position: relative; z-index: 1;
    max-width: 900px; margin: 0 auto; text-align: center;
    padding: 120px 60px;
  }
  @media(max-width:768px) { .lp-manifeste-inner { padding: 80px 24px; } }
  .lp-manifeste-inner h2 {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2.2rem, 5vw, 4.5rem);
    color: var(--dark); line-height: 1.2;
    margin-bottom: 32px; font-style: italic;
  }
  .lp-manifeste-inner h2 strong {
    font-style: normal; color: var(--red);
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.2em; letter-spacing: .05em;
  }
  .lp-manifeste-inner p {
    font-size: 1.15rem; line-height: 1.8;
    color: #444; margin-bottom: 20px;
  }
  .lp-quote {
    font-family: 'DM Serif Display', serif;
    font-style: italic; font-size: 1.5rem;
    color: var(--dark); line-height: 1.6;
    border-left: 3px solid var(--red);
    padding-left: 24px; text-align: left;
    margin: 40px 0;
  }

  /* ── FONCTIONNALITÉS (dark, cards) ── */
  .lp-features { background: var(--dark2); padding: 140px 0; }
  .lp-features-header {
    display: flex; justify-content: space-between;
    align-items: flex-end; flex-wrap: wrap; gap: 24px;
    margin-bottom: 72px;
  }
  .lp-features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
  }
  @media(max-width:900px) { .lp-features-grid { grid-template-columns: 1fr; } }
  .lp-feature-card {
    background: var(--dark3);
    border: 1px solid rgba(255,255,255,.06);
    padding: 48px 36px;
    position: relative; overflow: hidden;
    transition: border-color .4s, transform .5s var(--ease);
  }
  .lp-feature-card::before {
    content: '';
    position: absolute; bottom: 0; left: 0;
    width: 100%; height: 3px;
    background: var(--red);
    transform: scaleX(0); transform-origin: left;
    transition: transform .5s var(--ease);
  }
  .lp-feature-card:hover { border-color: rgba(230,57,70,.35); transform: translateY(-6px); }
  .lp-feature-card:hover::before { transform: scaleX(1); }
  .lp-feature-icon {
    font-size: 2rem; color: var(--red); margin-bottom: 24px;
  }
  .lp-feature-card h3 {
    font-size: 1rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .1em;
    margin-bottom: 16px;
  }
  .lp-feature-card p {
    font-size: .9rem; line-height: 1.7;
    color: rgba(255,255,255,.55);
  }
  .lp-feature-card .lp-tag {
    display: inline-block; margin-top: 20px;
    font-size: .6rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .2em;
    color: var(--red);
    border: 1px solid rgba(230,57,70,.4);
    padding: 4px 12px;
  }

  /* ── PROCESSUS (parallax dark) ── */
  .lp-process {
    min-height: 80vh; position: relative;
    display: flex; align-items: center;
    background-image: url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1920&q=80');
    background-size: cover; background-position: center;
    background-attachment: fixed;
  }
  .lp-process::before {
    content: ''; position: absolute; inset: 0;
    background: rgba(8,8,8,.9);
  }
  .lp-process-inner {
    position: relative; z-index: 1;
    width: 100%; padding: 120px 0;
  }
  .lp-process-grid {
    display: grid; grid-template-columns: 1fr 2fr; gap: 100px;
    align-items: center;
  }
  @media(max-width:900px) {
    .lp-process-grid { grid-template-columns: 1fr; gap: 48px; }
  }
  .lp-steps {
    display: flex; flex-direction: column; gap: 0;
    border-left: 2px solid rgba(255,255,255,.1);
    padding-left: 32px;
  }
  .lp-step {
    position: relative; padding-bottom: 40px;
    transition: opacity .3s;
  }
  .lp-step:last-child { padding-bottom: 0; }
  .lp-step::before {
    content: '';
    position: absolute; left: -40px; top: 6px;
    width: 14px; height: 14px;
    background: var(--red); border-radius: 50%;
  }
  .lp-step-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: .75rem; color: var(--red);
    letter-spacing: .3em; margin-bottom: 8px;
  }
  .lp-step h4 {
    font-size: .9rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .12em;
    margin-bottom: 8px;
  }
  .lp-step p {
    font-size: .85rem; line-height: 1.65;
    color: rgba(255,255,255,.5);
  }

  /* ── STATS BAND ── */
  .lp-stats-band { background: var(--red); padding: 60px 0; }
  .lp-stats-inner {
    display: flex; justify-content: space-around;
    flex-wrap: wrap; gap: 40px;
  }
  .lp-stat-item { text-align: center; }
  .lp-stat-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(2.5rem, 5vw, 4rem);
    letter-spacing: .05em; line-height: 1;
  }
  .lp-stat-lbl {
    font-size: .65rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .2em;
    opacity: .8; margin-top: 8px;
  }

  /* ── MODULES (light section parallax) ── */
  .lp-modules {
    min-height: 80vh; display: flex; align-items: center;
    position: relative; overflow: hidden;
    background-image: url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=80');
    background-size: cover; background-position: center;
    background-attachment: fixed;
  }
  .lp-modules::before {
    content: ''; position: absolute; inset: 0;
    background: rgba(245,243,239,.88);
  }
  .lp-modules-inner { position: relative; z-index: 1; width: 100%; padding: 120px 0; }
  .lp-modules-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;
    margin-top: 64px;
  }
  @media(max-width:768px) { .lp-modules-grid { grid-template-columns: 1fr; } }
  .lp-module-card {
    background: #fff;
    box-shadow: 0 4px 40px rgba(0,0,0,.08);
    padding: 40px 36px;
    border-left: 4px solid transparent;
    transition: border-color .3s, transform .4s var(--ease);
    position: relative; overflow: hidden;
  }
  .lp-module-card:hover { border-color: var(--red); transform: translateY(-4px); }
  .lp-module-card .lp-module-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 4rem; color: rgba(0,0,0,.06);
    position: absolute; top: 12px; right: 20px;
    line-height: 1; letter-spacing: .05em;
    pointer-events: none;
  }
  .lp-module-card h3 {
    font-size: 1rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .1em;
    color: var(--dark); margin-bottom: 12px;
    display: flex; align-items: center; gap: 12px;
  }
  .lp-module-card h3 i { color: var(--red); font-size: .9rem; }
  .lp-module-card p {
    font-size: .88rem; line-height: 1.7; color: #555;
  }
  .lp-module-badge {
    display: inline-block; margin-top: 16px;
    font-size: .6rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .2em;
    color: var(--red); border: 1px solid rgba(230,57,70,.3);
    padding: 4px 12px;
  }

  /* ── ROLES (dark grid) ── */
  .lp-roles { background: var(--dark2); padding: 140px 0; }
  .lp-roles-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px;
    margin-top: 72px;
  }
  @media(max-width:900px) { .lp-roles-grid { grid-template-columns: 1fr; } }
  .lp-role-card {
    background: var(--dark3);
    border: 1px solid rgba(255,255,255,.05);
    padding: 48px 36px;
    transition: border-color .4s, background .4s;
    position: relative; overflow: hidden;
  }
  .lp-role-card:hover { border-color: rgba(230,57,70,.3); background: rgba(230,57,70,.04); }
  .lp-role-icon {
    width: 52px; height: 52px;
    background: var(--red); display: flex;
    align-items: center; justify-content: center;
    margin-bottom: 28px; font-size: 1.1rem;
  }
  .lp-role-card h3 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.8rem; letter-spacing: .1em;
    text-transform: uppercase; margin-bottom: 16px;
  }
  .lp-role-card p {
    font-size: .88rem; line-height: 1.7;
    color: rgba(255,255,255,.5); margin-bottom: 24px;
  }
  .lp-role-features {
    list-style: none; display: flex;
    flex-direction: column; gap: 10px;
  }
  .lp-role-features li {
    font-size: .8rem; color: rgba(255,255,255,.45);
    display: flex; align-items: center; gap: 10px;
  }
  .lp-role-features li::before {
    content: '→'; color: var(--red); font-size: .75rem;
  }

  /* ── CTA CONNEXION ── */
  .lp-cta {
    min-height: 50vh; display: flex; align-items: center;
    position: relative; overflow: hidden;
    background-image: url('https://images.unsplash.com/photo-1520453803296-c39eabe2dab4?auto=format&fit=crop&w=1920&q=80');
    background-size: cover; background-position: center;
    background-attachment: fixed;
  }
  .lp-cta::before {
    content: ''; position: absolute; inset: 0;
    background: rgba(8,8,8,.92);
  }
  .lp-cta-inner {
    position: relative; z-index: 1;
    width: 100%; padding: 100px 0; text-align: center;
  }
  .lp-cta-inner h2 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(3rem, 8vw, 7rem);
    letter-spacing: .05em; text-transform: uppercase;
    line-height: 1; margin-bottom: 24px;
  }
  .lp-cta-inner h2 span {
    -webkit-text-stroke: 2px rgba(255,255,255,.25);
    color: transparent;
  }
  .lp-cta-inner p {
    font-size: 1.1rem; color: rgba(255,255,255,.6);
    max-width: 560px; margin: 0 auto 48px;
    line-height: 1.75;
  }
  .lp-cta-btn {
    display: inline-flex; align-items: center; gap: 14px;
    background: var(--red); color: #fff;
    padding: 20px 52px;
    font-family: 'DM Sans', sans-serif;
    font-size: .8rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .25em;
    transition: all .4s var(--ease);
    cursor: pointer; border: none;
    box-shadow: 0 20px 60px rgba(230,57,70,.4);
  }
  .lp-cta-btn:hover {
    background: #fff; color: var(--dark);
    transform: translateY(-3px);
    box-shadow: 0 30px 80px rgba(255,255,255,.2);
  }
  .lp-cta-btn i { transition: transform .3s; }
  .lp-cta-btn:hover i { transform: translateX(4px); }

  /* ── FOOTER ── */
  .lp-footer {
    background: var(--dark);
    border-top: 1px solid rgba(255,255,255,.06);
    padding: 80px 0 40px;
  }
  .lp-footer-top {
    display: grid; grid-template-columns: 2fr 1fr 1fr;
    gap: 60px; margin-bottom: 60px;
  }
  @media(max-width:900px) {
    .lp-footer-top { grid-template-columns: 1fr 1fr; gap: 40px; }
  }
  @media(max-width:600px) {
    .lp-footer-top { grid-template-columns: 1fr; }
  }
  .lp-footer-brand .logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2rem; letter-spacing: .08em; margin-bottom: 20px;
    display: block;
  }
  .lp-footer-brand .logo span { color: var(--red); }
  .lp-footer-brand p {
    font-size: .88rem; line-height: 1.75;
    color: rgba(255,255,255,.4); margin-bottom: 28px;
  }
  .lp-footer-socials { display: flex; gap: 12px; }
  .lp-footer-social {
    width: 40px; height: 40px;
    border: 1px solid rgba(255,255,255,.1);
    display: flex; align-items: center; justify-content: center;
    font-size: .8rem; color: rgba(255,255,255,.4);
    text-decoration: none;
    transition: border-color .3s, color .3s, background .3s;
  }
  .lp-footer-social:hover { border-color: var(--red); background: var(--red); color: #fff; }
  .lp-footer-col h4 {
    font-size: .65rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .25em;
    color: rgba(255,255,255,.3); margin-bottom: 20px;
  }
  .lp-footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 12px; }
  .lp-footer-col ul a {
    font-size: .88rem; color: rgba(255,255,255,.5);
    text-decoration: none; transition: color .3s;
  }
  .lp-footer-col ul a:hover { color: #fff; }
  .lp-footer-bottom {
    border-top: 1px solid rgba(255,255,255,.06);
    padding-top: 32px;
    display: flex; justify-content: space-between;
    align-items: center; flex-wrap: wrap; gap: 16px;
  }
  .lp-footer-bottom span { font-size: .75rem; color: rgba(255,255,255,.25); }
  .lp-footer-links { display: flex; gap: 24px; }
  .lp-footer-links a {
    font-size: .75rem; color: rgba(255,255,255,.25);
    text-decoration: none; transition: color .3s;
  }
  .lp-footer-links a:hover { color: rgba(255,255,255,.6); }

  /* ── BTT ── */
  .lp-btt {
    position: fixed; bottom: 32px; right: 32px;
    width: 48px; height: 48px;
    background: var(--red); color: #fff;
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: .9rem;
    opacity: 0; visibility: hidden;
    transition: all .4s; z-index: 99;
  }
  .lp-btt.visible { opacity: 1; visibility: visible; }
  .lp-btt:hover { background: #fff; color: var(--dark); transform: translateY(-3px); }

  /* ── CHATBOT ── */
  .lp-chat-btn {
    position: fixed; bottom: 92px; right: 32px;
    width: 56px; height: 56px;
    background: var(--dark3);
    border: 1px solid rgba(230,57,70,.4);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; z-index: 100;
    transition: all .3s var(--ease);
    box-shadow: 0 8px 32px rgba(0,0,0,.4);
    color: #fff; font-size: 1.2rem;
  }
  .lp-chat-btn:hover { background: var(--red); border-color: var(--red); transform: scale(1.1); }
  .lp-chat-win {
    position: fixed; bottom: 160px; right: 32px;
    width: 360px; max-width: calc(100vw - 48px);
    background: rgba(10,10,10,.98);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 12px;
    box-shadow: 0 20px 80px rgba(0,0,0,.6);
    backdrop-filter: blur(40px);
    display: none; flex-direction: column;
    overflow: hidden; z-index: 101;
  }
  .lp-chat-win.open {
    display: flex;
    animation: lpChatUp .4s var(--ease);
  }
  @keyframes lpChatUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .lp-chat-head {
    background: linear-gradient(135deg, var(--dark3), var(--dark));
    padding: 16px 20px;
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid rgba(255,255,255,.08);
  }
  .lp-chat-head-info { display: flex; align-items: center; gap: 12px; }
  .lp-chat-avatar {
    width: 36px; height: 36px;
    background: var(--red); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: .85rem;
  }
  .lp-chat-head-name { font-size: .85rem; font-weight: 700; }
  .lp-chat-head-sub { font-size: .7rem; color: rgba(255,255,255,.4); }
  .lp-chat-close { background: none; border: none; color: rgba(255,255,255,.5); cursor: pointer; font-size: 1rem; }
  .lp-chat-close:hover { color: #fff; }
  .lp-chat-msgs {
    flex: 1; overflow-y: auto; padding: 16px;
    max-height: 280px;
    scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.15) transparent;
  }
  .lp-chat-msg { margin-bottom: 12px; animation: lpFadeIn .3s ease; }
  @keyframes lpFadeIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: none; } }
  .lp-bubble {
    display: inline-block; padding: 10px 14px;
    border-radius: 16px; max-width: 85%;
    font-size: .82rem; line-height: 1.5;
    word-wrap: break-word;
  }
  .lp-bubble.bot { background: rgba(255,255,255,.1); }
  .lp-bubble.user { background: #fff; color: #000; float: right; }
  .lp-chat-actions { padding: 12px 16px; border-top: 1px solid rgba(255,255,255,.08); }
  .lp-quick-btns { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
  .lp-quick-btn {
    background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
    color: rgba(255,255,255,.7); padding: 8px 12px;
    font-size: .75rem; text-align: left; cursor: pointer;
    transition: all .2s; border-radius: 6px;
  }
  .lp-quick-btn:hover { background: rgba(230,57,70,.15); border-color: rgba(230,57,70,.4); color: #fff; }
  .lp-chat-input-row { display: flex; gap: 8px; }
  .lp-chat-input {
    flex: 1; background: rgba(255,255,255,.07);
    border: 1px solid rgba(255,255,255,.1);
    color: #fff; padding: 10px 14px;
    font-size: .8rem; border-radius: 8px; outline: none;
    font-family: 'DM Sans', sans-serif;
  }
  .lp-chat-input:focus { border-color: var(--red); }
  .lp-chat-send {
    background: var(--red); color: #fff; border: none;
    padding: 10px 14px; border-radius: 8px;
    cursor: pointer; transition: background .2s;
    font-size: .85rem;
  }
  .lp-chat-send:hover { background: var(--red-dk); }

  @media(max-width:768px) {
    .lp-process-grid { grid-template-columns: 1fr; gap: 48px; }
    .lp-hero-stats { grid-template-columns: repeat(2,1fr); }
  }
`;

// ─── Données chatbot ──────────────────────────────────────────
const BOT_RESPONSES = {
  default:
    "Je suis votre assistant LogiPlatform. Je peux vous renseigner sur nos fonctionnalités, nos modules ou comment accéder à la plateforme.",
  connexion:
    "Pour accéder à la plateforme, cliquez sur le bouton **Accéder à la Plateforme** en haut de page ou en bas. Vous aurez besoin d'un compte fourni par votre administrateur.",
  fonctionnalites:
    "LogiPlatform centralise 4 modules : ✅ Import Excel des ordres d'achat ✅ Planification des livraisons ✅ Suivi en temps réel ✅ Comparateur stock vs commandé.",
  contact:
    "Pour créer un compte ou nous contacter : contactez votre responsable logistique ou écrivez à support@logiplatform.dz",
  modules:
    "Nos modules : 📦 Keep Contact (import commandes) — 📋 Planification (programme livraisons) — 🚛 Transport (affectation chauffeurs) — 📊 Stock (comparateur).",
};

// ─── Composant principal ──────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const [preloaded, setPreloaded] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState([
    {
      from: "bot",
      text: "👋 Bonjour ! Je suis l'assistant LogiPlatform. Comment puis-je vous aider ?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [bttVisible, setBttVisible] = useState(false);
  const heroRef = useRef(null);
  const chatMsgsRef = useRef(null);

  // Preloader
  useEffect(() => {
    const t = setTimeout(() => setPreloaded(true), 1400);
    return () => clearTimeout(t);
  }, []);

  // Hero visible
  useEffect(() => {
    if (preloaded && heroRef.current) {
      heroRef.current.classList.add("lp-hero-visible");
    }
  }, [preloaded]);

  // Scroll events
  useEffect(() => {
    const onScroll = () => {
      setNavScrolled(window.scrollY > 60);
      setBttVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reveal on scroll
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
    );
    document.querySelectorAll(".lp-reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [preloaded]);

  // Counter animation
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const target = parseFloat(el.dataset.target);
          const dur = 1800;
          const step = target / (dur / 16);
          let cur = 0;
          const tick = () => {
            cur = Math.min(cur + step, target);
            el.textContent =
              target % 1 === 0 ? Math.floor(cur) : cur.toFixed(1);
            if (cur < target) requestAnimationFrame(tick);
          };
          tick();
          obs.unobserve(el);
        });
      },
      { threshold: 0.5 },
    );
    document.querySelectorAll(".lp-counter").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [preloaded]);

  // Chat auto-scroll
  useEffect(() => {
    if (chatMsgsRef.current)
      chatMsgsRef.current.scrollTop = chatMsgsRef.current.scrollHeight;
  }, [chatMsgs]);

  const sendChat = (text) => {
    const msg = text || chatInput;
    if (!msg.trim()) return;
    setChatInput("");
    setChatMsgs((prev) => [...prev, { from: "user", text: msg }]);
    const lower = msg.toLowerCase();
    let reply = BOT_RESPONSES.default;
    if (
      lower.includes("connexion") ||
      lower.includes("accès") ||
      lower.includes("login") ||
      lower.includes("connecter")
    )
      reply = BOT_RESPONSES.connexion;
    else if (lower.includes("fonctionnalit") || lower.includes("feature"))
      reply = BOT_RESPONSES.fonctionnalites;
    else if (
      lower.includes("contact") ||
      lower.includes("compte") ||
      lower.includes("email")
    )
      reply = BOT_RESPONSES.contact;
    else if (
      lower.includes("module") ||
      lower.includes("keep") ||
      lower.includes("planning") ||
      lower.includes("stock")
    )
      reply = BOT_RESPONSES.modules;
    setTimeout(
      () => setChatMsgs((prev) => [...prev, { from: "bot", text: reply }]),
      600,
    );
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <div className="lp-body">
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      {/* PRELOADER */}
      <div className={`lp-preloader${preloaded ? " hidden" : ""}`}>
        <div className="lp-pre-logo">
          LOGI<span>PLATFORM</span>
        </div>
        <div className="lp-pre-bar"></div>
      </div>

      {/* NAV */}
      <nav className={`lp-nav${navScrolled ? " scrolled" : ""}`}>
        <a
          href="#home"
          className="lp-nav-logo"
          onClick={(e) => {
            e.preventDefault();
            scrollTo("home");
          }}
        >
          LOGI<span>PLATFORM</span>
        </a>
        <ul className="lp-nav-links">
          {[
            ["home", "Accueil"],
            ["fonctionnalites", "Fonctionnalités"],
            ["processus", "Processus"],
            ["modules", "Modules"],
            ["roles", "Équipes"],
          ].map(([id, label]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(id);
                }}
              >
                {label}
              </a>
            </li>
          ))}
          <li>
            <button className="lp-nav-cta" onClick={() => navigate("/login")}>
              Connexion →
            </button>
          </li>
        </ul>
        <button className="lp-burger" onClick={() => setMobileOpen(true)}>
          <i className="fas fa-bars"></i>
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`lp-mobile${mobileOpen ? " open" : ""}`}>
        <button
          className="lp-mobile-close"
          onClick={() => setMobileOpen(false)}
        >
          <i className="fas fa-times"></i>
        </button>
        {[
          ["home", "Accueil"],
          ["fonctionnalites", "Fonctionnalités"],
          ["processus", "Processus"],
          ["modules", "Modules"],
          ["roles", "Équipes"],
        ].map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault();
              scrollTo(id);
            }}
          >
            {label}
          </a>
        ))}
        <a
          href="/login"
          onClick={(e) => {
            e.preventDefault();
            navigate("/login");
          }}
          style={{ color: "var(--red)" }}
        >
          Connexion
        </a>
      </div>

      {/* ═══ HERO ═══ */}
      <section id="home" className="lp-hero" ref={heroRef}>
        <div className="lp-hero-bg" />
        <div className="lp-hero-content">
          <div className="lp-container">
            <div className="lp-hero-eyebrow">
              <span>Plateforme de Gestion Logistique Collaborative</span>
            </div>
            <h1 className="lp-hero-h1">
              GÉRER.
              <br />
              <span className="outline">PLANIFIER.</span>
              <br />
              LIVRER.
            </h1>
            <p className="lp-hero-sub">
              Centralisez vos commandes, optimisez vos programmes de livraison
              et connectez vos équipes en temps réel — tout sur une seule
              plateforme.
            </p>
            <div className="lp-hero-actions">
              <button
                className="lp-btn lp-btn-red"
                onClick={() => navigate("/login")}
              >
                <span>Accéder à la Plateforme</span>
                <i className="fas fa-arrow-right"></i>
              </button>
              <button
                className="lp-btn lp-btn-outline"
                onClick={() => scrollTo("fonctionnalites")}
              >
                <span>Découvrir les fonctionnalités</span>
              </button>
            </div>
            <div className="lp-hero-stats">
              {[
                { val: "3", suffix: "", lbl: "Équipes Connectées" },
                { val: "100", suffix: "%", lbl: "Zéro Double Affectation" },
                { val: "<2", suffix: "s", lbl: "Temps de Réponse" },
                { val: "24", suffix: "/7", lbl: "Disponibilité" },
              ].map(({ val, suffix, lbl }, i) => (
                <div key={i} className="lp-hero-stat">
                  <div className="lp-stat-val">
                    {val}
                    {suffix}
                  </div>
                  <div className="lp-stat-lbl">{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lp-scroll-hint">
          <span>Scroll</span>
          <div className="lp-scroll-line" />
        </div>
      </section>

      {/* ═══ MANIFESTE (parallax clair) ═══ */}
      <section className="lp-manifeste">
        <div className="lp-manifeste-inner">
          <span className="lp-label lp-reveal" style={{ textAlign: "center" }}>
            Notre Vision
          </span>
          <h2 className="lp-reveal lp-d1">
            La logistique,
            <br />
            <strong>RÉINVENTÉE</strong>
            <br />
            de l'intérieur
          </h2>
          <p
            className="lp-reveal lp-d2"
            style={{ color: "#444", marginBottom: "12px" }}
          >
            Aujourd'hui, les équipes logistiques travaillent dans des silos. Les
            commandes circulent par Excel, les affectations se perdent, et
            personne n'a une vision globale en temps réel.
          </p>
          <p className="lp-reveal lp-d3" style={{ color: "#444" }}>
            LogiPlatform brise ces silos. Une seule interface, trois équipes
            synchronisées, zéro perte d'information du bon de commande jusqu'à
            la livraison finale.
          </p>
          <blockquote className="lp-quote lp-reveal lp-d4">
            "Une commande importée le matin est planifiée, affectée et livrée le
            soir — sans un seul email."
          </blockquote>
        </div>
      </section>

      {/* ═══ FONCTIONNALITÉS (dark cards) ═══ */}
      <section id="fonctionnalites" className="lp-features">
        <div className="lp-container">
          <div className="lp-features-header">
            <div>
              <span className="lp-label lp-reveal">Ce que nous faisons</span>
              <h2 className="lp-title lp-reveal lp-d1">
                FONCTIONNALITÉS
                <br />
                <span style={{ color: "var(--red)" }}>CLÉS</span>
              </h2>
            </div>
          </div>
          <div className="lp-features-grid">
            {[
              {
                icon: "fa-file-excel",
                title: "Import Excel Intelligent",
                desc: "Importez vos templates Excel standards en un clic. Détection automatique des colonnes, validation des données et insertion directe en base sans ressaisie.",
                tag: "Keep Contact",
              },
              {
                icon: "fa-calendar-check",
                title: "Planification Temps Réel",
                desc: "Élaborez vos programmes de livraison J+1 directement dans la plateforme. Visualisez les commandes en attente et assignez les ressources en quelques secondes.",
                tag: "Planification",
              },
              {
                icon: "fa-lock",
                title: "Verrouillage Concurrent",
                desc: "Évitez les conflits d'édition simultanée. Le système verrouille automatiquement les enregistrements en cours de modification et libère après 5 minutes d'inactivité.",
                tag: "Sécurité",
              },
              {
                icon: "fa-chart-bar",
                title: "Comparateur Stock/Commandé",
                desc: "Visualisez en temps réel l'écart entre votre stock disponible et les quantités commandées. Alertes automatiques RUPTURE, FAIBLE ou OK par produit et dépôt.",
                tag: "Stock",
              },
              {
                icon: "fa-truck",
                title: "Tableau de Bord Livreur",
                desc: "Chaque chauffeur accède à son programme du jour, met à jour le statut de ses livraisons en temps réel et signale les incidents directement depuis l'interface.",
                tag: "Transport",
              },
              {
                icon: "fa-history",
                title: "Traçabilité Complète",
                desc: "Chaque action est horodatée et enregistrée dans l'AuditLog. Qui a modifié quoi, quand et pourquoi — une transparence totale pour audit et conformité.",
                tag: "Audit",
              },
            ].map((f, i) => (
              <div
                key={i}
                className={`lp-feature-card lp-reveal lp-d${(i % 4) + 1}`}
              >
                <div className="lp-feature-icon">
                  <i className={`fas ${f.icon}`}></i>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <span className="lp-tag">{f.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROCESSUS (parallax sombre) ═══ */}
      <section id="processus" className="lp-process">
        <div className="lp-process-inner">
          <div className="lp-container">
            <div className="lp-process-grid">
              <div>
                <span className="lp-label lp-reveal">Comment ça marche</span>
                <h2
                  className="lp-title lp-reveal lp-d1"
                  style={{ marginBottom: "24px" }}
                >
                  LE FLUX
                  <br />
                  <span style={{ color: "var(--red)" }}>LOGISTIQUE</span>
                  <br />
                  OPTIMISÉ
                </h2>
                <p
                  className="lp-reveal lp-d2"
                  style={{
                    color: "rgba(255,255,255,.5)",
                    fontSize: ".95rem",
                    lineHeight: "1.75",
                    marginBottom: "32px",
                  }}
                >
                  De l'import Excel jusqu'à la livraison confirmée, chaque étape
                  est tracée, validée et visible par l'ensemble des équipes
                  concernées.
                </p>
                <button
                  className="lp-btn lp-btn-red lp-reveal lp-d3"
                  onClick={() => navigate("/login")}
                >
                  <span>Démarrer maintenant</span>
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
              <div className="lp-steps lp-reveal right">
                {[
                  {
                    n: "01",
                    title: "Import des Ordres d'Achat",
                    desc: "L'équipe Keep Contact importe le fichier Excel des commandes J+1. La plateforme extrait, valide et enregistre chaque ligne automatiquement.",
                  },
                  {
                    n: "02",
                    title: "Planification des Livraisons",
                    desc: "L'équipe Planification visualise toutes les commandes en attente et crée le programme de livraison en assignant dates, dépôts et routes.",
                  },
                  {
                    n: "03",
                    title: "Affectation des Chauffeurs",
                    desc: "L'équipe Transport assigne les chauffeurs aux livraisons planifiées. Le système empêche toute double affectation en temps réel.",
                  },
                  {
                    n: "04",
                    title: "Exécution & Suivi",
                    desc: "Chaque chauffeur met à jour le statut de ses livraisons. Les équipes voient l'avancement en direct et reçoivent les alertes automatiques.",
                  },
                ].map((s, i) => (
                  <div key={i} className="lp-step">
                    <div className="lp-step-num">ÉTAPE {s.n}</div>
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS BAND ═══ */}
      <div className="lp-stats-band">
        <div className="lp-container">
          <div className="lp-stats-inner">
            {[
              { target: 3, suffix: "", lbl: "Équipes Intégrées" },
              { target: 99, suffix: "%", lbl: "Disponibilité Garantie" },
              { target: 0, suffix: "", lbl: "Double Affectation" },
              { target: 4, suffix: "", lbl: "Modules Actifs" },
            ].map(({ target, suffix, lbl }, i) => (
              <div
                key={i}
                className={`lp-stat-item lp-reveal scale lp-d${i + 1}`}
              >
                <div className="lp-stat-num">
                  <span className="lp-counter" data-target={target}>
                    0
                  </span>
                  {suffix}
                </div>
                <div className="lp-stat-lbl">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ MODULES (parallax clair) ═══ */}
      <section id="modules" className="lp-modules">
        <div className="lp-modules-inner">
          <div className="lp-container">
            <span
              className="lp-label lp-reveal"
              style={{ color: "var(--red)" }}
            >
              Architecture Modulaire
            </span>
            <h2
              className="lp-title lp-reveal lp-d1"
              style={{ color: "var(--dark)" }}
            >
              4 MODULES,
              <br />
              <span style={{ color: "var(--red)" }}>1 PLATEFORME</span>
            </h2>
            <div className="lp-modules-grid">
              {[
                {
                  num: "01",
                  icon: "fa-inbox",
                  title: "Keep Contact",
                  badge: "Import & Commandes",
                  desc: "Interface dédiée à l'import des fichiers Excel, la visualisation des ordres d'achat et la gestion quotidienne des commandes entrantes.",
                },
                {
                  num: "02",
                  icon: "fa-calendar-alt",
                  title: "Planification",
                  badge: "Programme Livraisons",
                  desc: "Outil de planification pour construire le programme J+1, assigner les livraisons aux dépôts et anticiper les ruptures de stock.",
                },
                {
                  num: "03",
                  icon: "fa-truck-loading",
                  title: "Transport",
                  badge: "Affectation Chauffeurs",
                  desc: "Module dédié à l'équipe transport pour affecter les chauffeurs, gérer les tournées et suivre l'exécution opérationnelle en temps réel.",
                },
                {
                  num: "04",
                  icon: "fa-chart-line",
                  title: "Tableau de Bord",
                  badge: "Stock & Analytics",
                  desc: "Vue globale du stock disponible vs commandé, alertes visuelles par produit et dépôt, historique complet des actions via l'AuditLog.",
                },
              ].map((m, i) => (
                <div
                  key={i}
                  className={`lp-module-card lp-reveal lp-d${i + 1}`}
                >
                  <div className="lp-module-num">{m.num}</div>
                  <h3>
                    <i className={`fas ${m.icon}`}></i>
                    {m.title}
                  </h3>
                  <p>{m.desc}</p>
                  <span className="lp-module-badge">{m.badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ RÔLES (dark grid) ═══ */}
      <section id="roles" className="lp-roles">
        <div className="lp-container">
          <span className="lp-label lp-reveal">Accès par Équipe</span>
          <h2 className="lp-title lp-reveal lp-d1">
            UN OUTIL,
            <br />
            <span style={{ color: "var(--red)" }}>TROIS ÉQUIPES</span>
          </h2>
          <div className="lp-roles-grid">
            {[
              {
                icon: "fa-inbox",
                title: "Keep Contact",
                desc: "Point d'entrée des informations. Collecte les commandes, importe les Excel et s'assure de la complétude des données pour J+1.",
                features: [
                  "Import fichiers Excel",
                  "Création de commandes",
                  "Suivi des statuts",
                  "Visualisation stock",
                ],
              },
              {
                icon: "fa-project-diagram",
                title: "Planification",
                desc: "Cerveau opérationnel de la chaîne. Analyse les commandes, construit le programme de livraison et optimise les ressources disponibles.",
                features: [
                  "Programme de livraison",
                  "Gestion des dépôts",
                  "Comparateur stock",
                  "Verrouillage concurrent",
                ],
              },
              {
                icon: "fa-truck",
                title: "Transport",
                desc: "Exécution terrain. Affecte les chauffeurs, valide les tournées et suit l'avancement des livraisons en temps réel.",
                features: [
                  "Affectation chauffeurs",
                  "Suivi des tournées",
                  "Mise à jour statuts",
                  "Tableau de bord livreur",
                ],
              },
            ].map((r, i) => (
              <div key={i} className={`lp-role-card lp-reveal lp-d${i + 1}`}>
                <div className="lp-role-icon">
                  <i className={`fas ${r.icon}`}></i>
                </div>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
                <ul className="lp-role-features">
                  {r.features.map((f, j) => (
                    <li key={j}>{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA CONNEXION (parallax sombre) ═══ */}
      <section className="lp-cta">
        <div className="lp-cta-inner">
          <div className="lp-container">
            <h2 className="lp-reveal">
              PRÊT À<br />
              <span>OPTIMISER</span>
              <br />
              VOTRE LOGISTIQUE ?
            </h2>
            <p className="lp-reveal lp-d1">
              Connectez-vous à votre espace et commencez à importer, planifier
              et livrer plus efficacement dès aujourd'hui.
            </p>
            <button
              className="lp-cta-btn lp-reveal lp-d2"
              onClick={() => navigate("/login")}
            >
              <span>Accéder à la Plateforme</span>
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-top">
            <div className="lp-footer-brand">
              <span className="logo">
                LOGI<span>PLATFORM</span>
              </span>
              <p>
                Plateforme collaborative de gestion logistique — centralisant
                commandes, planification et livraisons en temps réel.
              </p>
              <div className="lp-footer-socials">
                {["fa-linkedin-in", "fa-facebook-f", "fa-instagram"].map(
                  (ic, i) => (
                    <a key={i} href="#" className="lp-footer-social">
                      <i className={`fab ${ic}`}></i>
                    </a>
                  ),
                )}
              </div>
            </div>
            <div className="lp-footer-col">
              <h4>Navigation</h4>
              <ul>
                {[
                  ["home", "Accueil"],
                  ["fonctionnalites", "Fonctionnalités"],
                  ["processus", "Processus"],
                  ["modules", "Modules"],
                  ["roles", "Équipes"],
                ].map(([id, label]) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollTo(id);
                      }}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lp-footer-col">
              <h4>Modules</h4>
              <ul>
                {[
                  "Keep Contact",
                  "Planification",
                  "Transport",
                  "Tableau de Bord",
                ].map((m) => (
                  <li key={m}>
                    <a
                      href="#modules"
                      onClick={(e) => {
                        e.preventDefault();
                        scrollTo("modules");
                      }}
                    >
                      {m}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>© 2026 LOGIPLATFORM — Tous droits réservés.</span>
            <div className="lp-footer-links">
              <a href="#">Mentions légales</a>
              <a href="#">Confidentialité</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══ BACK TO TOP ═══ */}
      <button
        className={`lp-btt${bttVisible ? " visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Retour en haut"
      >
        <i className="fas fa-arrow-up"></i>
      </button>

      {/* ═══ CHATBOT ═══ */}
      <button
        className="lp-chat-btn"
        onClick={() => setChatOpen((o) => !o)}
        aria-label="Chat assistant"
      >
        <i className={`fas ${chatOpen ? "fa-times" : "fa-comments"}`}></i>
      </button>

      <div className={`lp-chat-win${chatOpen ? " open" : ""}`}>
        <div className="lp-chat-head">
          <div className="lp-chat-head-info">
            <div className="lp-chat-avatar">
              <i className="fas fa-robot"></i>
            </div>
            <div>
              <div className="lp-chat-head-name">Assistant LogiPlatform</div>
              <div className="lp-chat-head-sub">Toujours disponible</div>
            </div>
          </div>
          <button className="lp-chat-close" onClick={() => setChatOpen(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="lp-chat-msgs" ref={chatMsgsRef}>
          {chatMsgs.map((m, i) => (
            <div key={i} className="lp-chat-msg" style={{ overflow: "hidden" }}>
              <span className={`lp-bubble ${m.from}`}>{m.text}</span>
            </div>
          ))}
        </div>

        <div className="lp-chat-actions">
          <div className="lp-quick-btns">
            {[
              ["fa-sign-in-alt", "Comment me connecter ?", "connexion"],
              ["fa-th-large", "Quels sont les modules ?", "modules"],
              ["fa-envelope", "Comment créer un compte ?", "contact"],
            ].map(([icon, label, key]) => (
              <button
                key={key}
                className="lp-quick-btn"
                onClick={() => sendChat(label)}
              >
                <i
                  className={`fas ${icon}`}
                  style={{ marginRight: "8px", fontSize: ".7rem" }}
                ></i>
                {label}
              </button>
            ))}
          </div>
          <div className="lp-chat-input-row">
            <input
              className="lp-chat-input"
              placeholder="Votre question..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
            />
            <button className="lp-chat-send" onClick={() => sendChat()}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
