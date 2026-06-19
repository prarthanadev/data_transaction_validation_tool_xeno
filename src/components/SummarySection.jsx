// ============================================================
// SummarySection.jsx — Dashboard summary stats after validation
// ============================================================
import { IconGrid } from './Icons.jsx'

export default function SummarySection({ summary, isOpen, onToggle }) {
  if (!summary) return null

  const validPct  = summary.total > 0 ? Math.round((summary.validCount   / summary.total) * 100) : 0
  const invalidPct = summary.total > 0 ? Math.round((summary.invalidCount / summary.total) * 100) : 0

  // Sort errors by count descending
  const errorEntries = Object.entries(summary.errorTypeCounts || {})
    .sort((a, b) => b[1] - a[1])
  const maxErrorCount = errorEntries[0]?.[1] || 1

  return (
    <div className="section">
      <div className="section-header" onClick={onToggle} role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onToggle()}
        aria-expanded={isOpen}>
        <div className="section-header-left">
          <span className="section-step done"><IconGrid size={11} /></span>
          <span className="section-title">Summary</span>
          <span className="section-desc">— Validation results at a glance</span>
        </div>
        <svg className={`section-chevron ${isOpen ? 'open' : ''}`} width="16" height="16"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {isOpen && (
        <div className="section-body">

          {/* ── KPI Cards ──────────────────────────────────────────── */}
          <div className="summary-grid">
            <div className="stat-card primary">
              <div className="stat-label">Total Rows</div>
              <div className="stat-value">{summary.total.toLocaleString()}</div>
              <div className="stat-sub">in uploaded file</div>
            </div>

            <div className="stat-card success">
              <div className="stat-label">Valid Rows</div>
              <div className="stat-value">{summary.validCount.toLocaleString()}</div>
              <div className="stat-sub">{validPct}% pass rate</div>
            </div>

            <div className="stat-card error">
              <div className="stat-label">Invalid Rows</div>
              <div className="stat-value">{summary.invalidCount.toLocaleString()}</div>
              <div className="stat-sub">{invalidPct}% need fixing</div>
            </div>

            <div className="stat-card warning">
              <div className="stat-label">Duplicate IDs</div>
              <div className="stat-value">{summary.duplicateCount}</div>
              <div className="stat-sub">order_id duplicates</div>
            </div>

            <div className="stat-card neutral">
              <div className="stat-label">Top Error</div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text)', marginBottom: 2 }}>
                {summary.mostCommonError ? summary.mostCommonError[0] : '—'}
              </div>
              <div className="stat-sub">
                {summary.mostCommonError
                  ? `${summary.mostCommonError[1]} occurrences`
                  : 'No errors found'}
              </div>
            </div>
          </div>

          {/* ── Progress bars ──────────────────────────────────────── */}
          <div className="progress-wrap" style={{ marginTop: 16 }}>
            <div className="progress-label">
              Valid rows — {validPct}% ({summary.validCount.toLocaleString()} of {summary.total.toLocaleString()})
            </div>
            <div className="progress-bar">
              <div className="progress-fill success" style={{ width: `${validPct}%` }} />
            </div>
          </div>

          {/* ── Error Breakdown ────────────────────────────────────── */}
          {errorEntries.length > 0 && (
            <div className="error-breakdown">
              <div className="error-breakdown-title">Error breakdown by field</div>
              {errorEntries.map(([field, count]) => (
                <div key={field} className="error-row">
                  <span className="error-label">{field}</span>
                  <div className="error-bar-wrap">
                    <div
                      className="error-bar"
                      style={{ width: `${Math.round((count / maxErrorCount) * 100)}%` }}
                      role="progressbar"
                      aria-valuenow={count}
                      aria-valuemax={maxErrorCount}
                      aria-label={`${field}: ${count} errors`}
                    />
                  </div>
                  <span className="error-count">{count}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── Success banner if all valid ────────────────────────── */}
          {summary.invalidCount === 0 && (
            <div className="info-banner success" style={{ marginTop: 14, marginBottom: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>All rows passed validation — your dataset is clean and ready for import!</span>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
