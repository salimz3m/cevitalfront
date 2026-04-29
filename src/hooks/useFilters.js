// hooks/useFilters.js — Sprint 6
/**
 * Hook de filtrage générique avec debounce.
 * 
 * Usage :
 *   const { filtered, filters, setFilter, resetFilters } = useFilters(
 *     items,
 *     {
 *       search: { fields: ["orderNumber", "prestataire"], debounce: 300 },
 *       statut: { exact: true },
 *       date:   { type: "dateRange", field: "createdAt" },
 *       clrId:  { exact: true, field: "clrId" },
 *     }
 *   );
 */
import { useState, useEffect, useMemo, useCallback } from "react";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function useFilters(items = [], filterDefs = {}) {
  // État des filtres : { [key]: value }
  const [filters, setFiltersState] = useState(() => {
    const init = {};
    for (const key of Object.keys(filterDefs)) init[key] = "";
    return init;
  });

  // Debounce pour la recherche texte
  const debouncedSearch = useDebounce(
    filters.search,
    filterDefs.search?.debounce ?? 300
  );

  const setFilter = useCallback((key, value) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(() => {
      const init = {};
      for (const key of Object.keys(filterDefs)) init[key] = "";
      return init;
    });
  }, [filterDefs]);

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== "" && v !== null && v !== undefined
  );

  // Appliquer les filtres
  const filtered = useMemo(() => {
    let result = items;

    for (const [key, def] of Object.entries(filterDefs)) {
      const value = key === "search" ? debouncedSearch : filters[key];
      if (!value && value !== 0) continue;

      if (key === "search" && def.fields) {
        // Recherche texte multi-champ
        const query = String(value).toLowerCase().trim();
        if (query) {
          result = result.filter((item) =>
            def.fields.some((field) => {
              const fieldValue = _getNestedValue(item, field);
              return fieldValue != null &&
                String(fieldValue).toLowerCase().includes(query);
            })
          );
        }
      } else if (def.type === "dateRange") {
        // Filtre plage de dates : value = { from, to }
        const { from, to } = value || {};
        if (from) {
          result = result.filter(
            (item) => new Date(item[def.field || key]) >= new Date(from)
          );
        }
        if (to) {
          result = result.filter(
            (item) => new Date(item[def.field || key]) <= new Date(to)
          );
        }
      } else if (def.exact) {
        // Filtre exact
        const field = def.field || key;
        result = result.filter((item) =>
          String(_getNestedValue(item, field)) === String(value)
        );
      } else if (def.custom) {
        // Filtre personnalisé
        result = result.filter((item) => def.custom(item, value));
      }
    }

    return result;
  }, [items, debouncedSearch, filters, filterDefs]);

  return {
    filtered,
    filters,
    setFilter,
    resetFilters,
    hasActiveFilters,
    count: { total: items.length, filtered: filtered.length },
  };
}

// Helper pour accéder à des champs imbriqués : "clr.nom"
function _getNestedValue(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}
