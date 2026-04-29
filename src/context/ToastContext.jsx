// context/ToastContext.jsx — Sprint 6
/**
 * Système de notifications toast global pour LOGIPLATFORM.
 * 
 * Usage :
 *   1. Wrapper dans App.jsx : <ToastProvider><App/></ToastProvider>
 *   2. Dans n'importe quel composant :
 *      const { toast } = useToast();
 *      toast.success("Livraison confirmée ✓");
 *      toast.error("Erreur réseau");
 *      toast.warn("Délai dépassé");
 *      toast.info("Synchronisation en cours");
 */
import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

const C = {
  success: { bg: "#22c55e", icon: "✓" },
  error:   { bg: "#ef4444", icon: "✕" },
  warn:    { bg: "#f97316", icon: "⚠" },
  info:    { bg: "#3b82f6", icon: "ℹ" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, d) => push(msg, "success", d),
    error:   (msg, d) => push(msg, "error",   d || 6000),
    warn:    (msg, d) => push(msg, "warn",    d),
    info:    (msg, d) => push(msg, "info",    d),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* ── Rendu des toasts ─────────────────────────────── */}
      <div style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
      }}>
        {toasts.map((t) => {
          const cfg = C[t.type] || C.info;
          return (
            <div
              key={t.id}
              onClick={() => dismiss(t.id)}
              style={{
                background: cfg.bg,
                color: "#fff",
                padding: "11px 18px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                boxShadow: "0 6px 24px rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                maxWidth: 380,
                animation: "toastIn .2s ease",
                pointerEvents: "all",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 15, flexShrink: 0 }}>{cfg.icon}</span>
              <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
              <span style={{ fontSize: 16, opacity: 0.7, flexShrink: 0 }}>×</span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes toastIn {
          from { transform: translateX(60px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
