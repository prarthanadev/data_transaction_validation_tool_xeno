// ============================================================
// ResultsSection.jsx — Row-by-row validation results table
// Supports filter by status and search by order_id
// ============================================================
import { useState, useMemo } from 'react'
import { IconDatabase } from './Icons.jsx'

const PAGE_SIZE = 50 // show 50 rows per page for performance

export default function ResultsSection({ results, isOpen, onToggle }) {
  const [filter, setFilter]   = useState('all')   // 'all' | 'valid' | 'invalid'
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)

  // Filter + search logic
  const filtered = useMemo(() => {
    if (!results) return []
    return results.filter(r => {
      const matchStatus = filter === 'all' || (filter === 'valid' && r.valid) || (filter === 'invalid' && !r.valid)
      const matchSearch = !search || (r.row.order_id || '').toLowerCase().includes(search.toLowerCase())
      return matchStatus && matchSearch
    })
  }, [results, filter, search])

  // Pagination
  const totalPages   = Math.ceil(filtered.length / PAGE_SIZE)
  const paginatedRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reset to page 1 when filters change
  function handleFilter(f) { setFilter(f); setPage(1) }
  function handleSearch(e) { setSearch(e.target.value); setPage(1) }

  if (!results || results.length === 0) return null

  return (
    <div className="section">
      <div className="section-header" onClick={onToggle} role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onToggle()}
        aria-expanded={isOpen}>
        <div className="section-header-left">
          <span className="section-step done"><IconDatabase size={11} /></span>
          <span className="section-title">Results</span>
          <span className="section-desc">— Row-by-row validation detail ({results.length} rows)</span>
        </div>
        <svg className={`section-chevron ${isOpen ? 'open' : ''}`} width="16" height="16"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {isOpen && (
        <div className="section-body">

          {/* ── Table Controls ──────────────────────────────────────── */}
          <div className="table-controls">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilter('all')}
            >
              All ({results.length})
            </button>
            <button
              className={`filter-btn success-btn ${filter === 'valid' ? 'active' : ''}`}
              onClick={() => handleFilter('valid')}
            >
              Valid ({results.filter(r => r.valid).length})
            </button>
            <button
              className={`filter-btn error-btn ${filter === 'invalid' ? 'active' : ''}`}
              onClick={() => handleFilter('invalid')}
            >
              Invalid ({results.filter(r => !r.valid).length})
            </button>

            <input
              type="text"
              className="search-input"
              placeholder="Search by order_id…"
              value={search}
              onChange={handleSearch}
              aria-label="Search by order ID"
            />

            {filtered.length !== results.length && (
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                Showing {filtered.length} results
              </span>
            )}
          </div>

          {/* ── Table ───────────────────────────────────────────────── */}
          <div className="table-wrap">
            <table className="val-table" role="table">
              <thead>
                <tr>
                  <th style={{ width: 50, textAlign: 'center' }}>#</th>
                  <th style={{ minWidth: 120 }}>Order ID</th>
                  <th style={{ minWidth: 130 }}>Customer</th>
                  <th style={{ minWidth: 90 }}>Country</th>
                  <th style={{ minWidth: 90 }}>Amount</th>
                  <th style={{ minWidth: 80 }}>Payment</th>
                  <th style={{ width: 80 }}>Status</th>
                  <th>Error Messages</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-muted)', fontSize: 13 }}>
                      No rows match the current filter.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((r) => (
                    <tr key={r.rowNumber} className={r.valid ? 'row-valid' : 'row-invalid'}>
                      <td className="row-num">{r.rowNumber}</td>

                      <td className="order-id-cell">
                        {r.row.order_id || <span style={{ color: 'var(--color-text-light)', fontStyle: 'italic' }}>—</span>}
                      </td>

                      <td style={{ fontSize: 12 }}>
                        {r.row.customer_name || <span style={{ color: 'var(--color-text-light)' }}>—</span>}
                      </td>

                      <td>
                        {r.row.country_code
                          ? <span className="country-code-badge">{r.row.country_code}</span>
                          : <span style={{ color: 'var(--color-text-light)', fontSize: 12 }}>—</span>
                        }
                      </td>

                      <td style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                        {r.row.amount || '—'}
                      </td>

                      <td style={{ fontSize: 11 }}>
                        {r.row.payment_mode
                          ? <span className="mode-badge" style={{ padding: '2px 6px' }}>{r.row.payment_mode}</span>
                          : <span style={{ color: 'var(--color-text-light)' }}>—</span>
                        }
                      </td>

                      <td>
                        {r.valid
                          ? <span className="status-badge status-valid">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              Valid
                            </span>
                          : <span className="status-badge status-invalid">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              Invalid
                            </span>
                        }
                      </td>

                      <td>
                        {r.errors.length > 0 ? (
                          <ul className="error-list">
                            {r.errors.map((err, i) => (
                              <li key={i} className="error-item">{err}</li>
                            ))}
                          </ul>
                        ) : (
                          <span style={{ color: 'var(--color-success)', fontSize: 12 }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ──────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="pagination">
              <span className="pagination-info">
                Page {page} of {totalPages} — showing rows {(page-1)*PAGE_SIZE + 1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(1)} disabled={page === 1}>«</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹ Prev</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next ›</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
