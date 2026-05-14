// components/ModuleGate.jsx — Sprint 8
// Guard React : affiche les enfants seulement si le module est actif pour la company

import { useState, useEffect } from "react";
import api from "../utils/api";

// Cache local pour éviter des appels répétés
let modulesCache = null;
let cacheExpiry = 0;

async function fetchModules() {
  if (modulesCache && Date.now() < cacheExpiry) return modulesCache;
  try {
    const res = await api.get("/admin/modules");
    modulesCache = res.data;
    cacheExpiry = Date.now() + 5 * 60 * 1000; // cache 5 minutes
    return modulesCache;
  } catch {
    return [];
  }
}

// Composant principal
// Usage : <ModuleGate module="TRANSPORT_INTEL">...</ModuleGate>
// Props :
//   module (string, requis) — clé du module (ex: 'STOCK_INTEL')
//   fallback (node) — contenu à afficher si module désactivé (optionnel)
//   silent (bool) — si true, ne rien afficher du tout si désactivé (défaut: false)
export default function ModuleGate({
  module: moduleKey,
  children,
  fallback,
  silent = false,
}) {
  const [status, setStatus] = useState("loading"); // 'loading' | 'active' | 'inactive'

  useEffect(() => {
    let mounted = true;
    fetchModules().then((modules) => {
      if (!mounted) return;
      const found = modules.find((m) => m.key === moduleKey);
      setStatus(found?.actif ? "active" : "inactive");
    });
    return () => {
      mounted = false;
    };
  }, [moduleKey]);

  if (status === "loading") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "16px",
          color: "#9ca3af",
        }}
      >
        <i className="fa-solid fa-circle-notch fa-spin" />
        <span>Vérification des droits…</span>
      </div>
    );
  }

  if (status === "inactive") {
    if (silent) return null;
    if (fallback) return fallback;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          padding: "48px 24px",
          background: "#181c27",
          borderRadius: "12px",
          border: "1px solid #2d3748",
          textAlign: "center",
          color: "#9ca3af",
        }}
      >
        <i
          className="fa-solid fa-lock"
          style={{ fontSize: "32px", color: "#4b5563" }}
        />
        <div>
          <div
            style={{ fontWeight: 600, color: "#e5e7eb", marginBottom: "4px" }}
          >
            Module non activé
          </div>
          <div style={{ fontSize: "14px" }}>
            Ce module n'est pas activé pour votre compte.
          </div>
          <div style={{ fontSize: "13px", marginTop: "8px", color: "#6b7280" }}>
            Contactez votre administrateur pour activer ce module.
          </div>
        </div>
      </div>
    );
  }

  return children;
}

// Hook utilitaire pour vérifier un module dans du code
// Usage : const isActive = useModule('STOCK_INTEL');
export function useModule(moduleKey) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchModules().then((modules) => {
      if (!mounted) return;
      const found = modules.find((m) => m.key === moduleKey);
      setActive(found?.actif || false);
    });
    return () => {
      mounted = false;
    };
  }, [moduleKey]);

  return active;
}

// Vider le cache (à appeler après activation/désactivation d'un module)
export function clearModulesCache() {
  modulesCache = null;
  cacheExpiry = 0;
}
