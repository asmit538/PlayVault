import './Pagination.css'

/**
 * Reusable pagination bar.
 * Props: page (1-based), totalItems, pageSize, onPageChange(page)
 */
export default function Pagination({ page, totalItems, pageSize, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  if (totalItems <= pageSize) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <nav className="pv-pagination" aria-label="Pagination">
      <span className="pv-pagination-info">
        Showing {start}–{end} of {totalItems}
      </span>
      <div className="pv-pagination-controls">
        <button
          className="pv-page-btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          ← Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            className={`pv-page-btn ${n === page ? 'active' : ''}`}
            onClick={() => onPageChange(n)}
            aria-current={n === page ? 'page' : undefined}
          >
            {n}
          </button>
        ))}
        <button
          className="pv-page-btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next →
        </button>
      </div>
    </nav>
  )
}
