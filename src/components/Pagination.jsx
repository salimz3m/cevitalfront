// components/Pagination.jsx — Sprint 6
/**
 * Barre de pagination universelle.
 * S'adapte au design system dark de LOGIPLATFORM.
 *
 * Props :
 *   page, totalPages, totalItems, pageSize
 *   onPage(n), onPageSize(n)
 *   pageSizeOptions (défaut [10, 20, 50])
 */
const C = {
  bg:      "#0f1117",
  surface: "#181c27",
  border:  "#252a38",
  accent:  "#3b82f6",
  text:    "#e2e8f0",
  muted:   "#64748b",
};

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPage,
  onPageSize,
  pageSizeOptions = [10, 20, 50],
}) {
  if (totalPages <= 1 && totalItems <= pageSizeOptions[0]) return null;

  // Générer les numéros à afficher (fenêtre glissante de 5)
  const pages = [];
  const window = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - window && i <= page + window)
    ) {
      pages.push(i);
    }
  }
  // Ajouter les ellipses
  const withEllipsis = [];
  let prev = null;
  for (const p of pages) {
    if (prev !== null && p - prev > 1) withEllipsis.push("…");
    withEllipsis.push(p);
    prev = p;
  }

  const btnStyle = (active, disabled = false) => ({
    padding: "6px 11px",
    borderRadius: 6,
    border: `1px solid ${active ? C.accent : C.border}`,
    background: active ? C.accent : C.surface,
    color: disabled ? C.muted : active ? "#fff" : C.text,
    fontSize: 13,
    fontWeight: active ? 700 : 400,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    fontFamily: "inherit",
    transition: "all .12s",
  });

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 0",
      borderTop: `1px solid ${C.border}`,
      flexWrap: "wrap",
      gap: 12,
    }}>
      {/* Info */}
      <div style={{ fontSize: 12, color: C.muted }}>
        {totalItems} résultat{totalItems !== 1 ? "s" : ""}
        {totalPages > 1 && ` · Page ${page}/${totalPages}`}
      </div>

      {/* Contrôles */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* Précédent */}
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          style={btnStyle(false, page === 1)}
        >
          ‹
        </button>

        {/* Pages numérotées */}
        {withEllipsis.map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} style={{ color: C.muted, padding: "0 4px", fontSize: 13 }}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              style={btnStyle(p === page)}
            >
              {p}
            </button>
          )
        )}

        {/* Suivant */}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          style={btnStyle(false, page === totalPages)}
        >
          ›
        </button>
      </div>

      {/* Page size */}
      {onPageSize && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: C.muted }}>Par page :</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              color: C.text,
              fontSize: 12,
              padding: "4px 8px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {pageSizeOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
