// hooks/useOptimisticLock.js — Sprint 6
/**
 * Verrouillage concurrent optimiste (UI-level).
 *
 * Principe :
 *   - Quand un utilisateur ouvre un formulaire d'édition, on enregistre
 *     un "verrou" en localStorage avec son identité et un timestamp.
 *   - Si un autre onglet/utilisateur détecte ce verrou, il affiche un
 *     avertissement mais ne bloque pas (optimiste).
 *   - Le verrou expire automatiquement après `ttlMs` (défaut 5 min).
 *
 * Usage :
 *   const { lock, unlock, isLockedByOther, lockInfo } = useOptimisticLock(
 *     "ordre_transport_42",   // clé unique de la ressource
 *     currentUser,            // { id, email }
 *     { ttlMs: 300_000 }
 *   );
 *
 *   // Dans onOpen du formulaire :
 *   lock();
 *
 *   // Dans onClose/onSubmit :
 *   unlock();
 *
 *   // Dans le JSX :
 *   {isLockedByOther && (
 *     <LockWarning user={lockInfo.user} since={lockInfo.since} />
 *   )}
 */
import { useState, useEffect, useCallback, useRef } from "react";

const PREFIX = "logiplatform_lock_";
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export function useOptimisticLock(resourceKey, currentUser, { ttlMs = DEFAULT_TTL } = {}) {
  const storageKey = `${PREFIX}${resourceKey}`;
  const [lockInfo, setLockInfo] = useState(null);
  const intervalRef = useRef(null);

  const readLock = useCallback(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const data = JSON.parse(raw);
      // Vérifier expiration
      if (Date.now() - data.since > ttlMs) {
        localStorage.removeItem(storageKey);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }, [storageKey, ttlMs]);

  // Écrire le verrou pour l'utilisateur courant
  const lock = useCallback(() => {
    const data = {
      userId: currentUser?.id,
      userEmail: currentUser?.email || "Utilisateur",
      since: Date.now(),
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
    setLockInfo(data);
  }, [storageKey, currentUser]);

  // Supprimer le verrou (seulement si on en est le propriétaire)
  const unlock = useCallback(() => {
    const existing = readLock();
    if (!existing || existing.userId === currentUser?.id) {
      localStorage.removeItem(storageKey);
      setLockInfo(null);
    }
  }, [storageKey, currentUser, readLock]);

  // Polling léger pour détecter les verrous posés par d'autres onglets
  useEffect(() => {
    const check = () => {
      const current = readLock();
      setLockInfo(current);
    };

    check(); // vérification initiale
    intervalRef.current = setInterval(check, 5000); // toutes les 5s

    // Nettoyage au démontage
    return () => {
      clearInterval(intervalRef.current);
      unlock();
    };
  }, [resourceKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Est-ce que c'est locké par quelqu'un d'autre ?
  const isLockedByOther =
    lockInfo !== null && lockInfo.userId !== currentUser?.id;

  const isLockedByMe =
    lockInfo !== null && lockInfo.userId === currentUser?.id;

  return {
    lock,
    unlock,
    lockInfo,
    isLockedByOther,
    isLockedByMe,
  };
}

// ─────────────────────────────────────────────────────────────
// Composant LockWarning — affiché quand la ressource est verrouillée
// ─────────────────────────────────────────────────────────────
export function LockWarning({ lockInfo, onProceedAnyway }) {
  if (!lockInfo) return null;

  const since = new Date(lockInfo.since);
  const sinceLabel = since.toLocaleTimeString("fr-DZ", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div style={{
      background: "rgba(234,179,8,0.1)",
      border: "1px solid rgba(234,179,8,0.3)",
      borderRadius: 10,
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18 }}>🔒</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#eab308" }}>
            En cours d'édition par {lockInfo.userEmail}
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            Depuis {sinceLabel} — vos modifications pourraient créer un conflit
          </div>
        </div>
      </div>
      {onProceedAnyway && (
        <button
          onClick={onProceedAnyway}
          style={{
            background: "transparent",
            border: "1px solid rgba(234,179,8,0.5)",
            borderRadius: 6,
            color: "#eab308",
            fontSize: 12,
            fontWeight: 600,
            padding: "5px 12px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Continuer quand même
        </button>
      )}
    </div>
  );
}
