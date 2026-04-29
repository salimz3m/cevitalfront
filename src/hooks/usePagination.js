// hooks/usePagination.js — Sprint 6
/**
 * Hook de pagination côté client.
 * Utilisable sur n'importe quelle liste.
 *
 * Usage :
 *   const { page, totalPages, paginated, setPage, setPageSize } = usePagination(items, 20);
 */
import { useState, useMemo } from "react";

export function usePagination(items = [], defaultPageSize = 20) {
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(defaultPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // S'assurer que page reste dans les bornes quand items change
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  const goTo     = (n) => setPage(Math.max(1, Math.min(n, totalPages)));
  const next     = () => goTo(safePage + 1);
  const prev     = () => goTo(safePage - 1);
  const reset    = () => setPage(1);

  return {
    page: safePage,
    totalPages,
    pageSize,
    paginated,
    totalItems: items.length,
    setPage: goTo,
    setPageSize: (s) => { setPageSize(s); reset(); },
    next,
    prev,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
    reset,
  };
}
