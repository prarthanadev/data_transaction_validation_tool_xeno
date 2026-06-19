// ============================================================
// DownloadsSection.jsx — Download clean file, error report,
//                        and chunked CSVs
// ============================================================
import { IconDownload, IconLayers, IconCheck } from './Icons.jsx'
import { downloadCSV, rowsToCSV, errorReportToCSV } from '../utils/csvUtils.js'
import { chunkArray, REQUIRED_FIELDS } from '../utils/validation.js'

export default function DownloadsSection({ results, chunkSize, isOpen, onToggle }) {
  if (!results || results.length === 0) return null

  const validRows   = results.filter(r => r.valid).map(r => r.row)
  const invalidRows = results.filter(r => !r.valid)

  // ── Download #1: Cleaned valid transactions ──────────────
  function downloadValid() {
    const csv = rowsToCSV(validRows, REQUIRED_FIELDS)
    downloadCSV('cleaned_valid_transactions.csv', csv)
  }

  // ── Download #2: Invalid rows with error report ──────────
  function downloadErrors() {
    const csv = errorReportToCSV(invalidRows, REQUIRED_FIELDS)
    downloadCSV('invalid_rows_error_report.csv', csv)
  }

  // ── Download #3: Chunked valid rows ──────────────────────
  function downloadChunks() {
    if (validRows.length === 0) return
    const chunks = chunkArray(validRows, chunkSize)
    chunks.forEach((chunk, i) => {
      const csv = rowsToCSV(chunk, REQUIRED_FIELDS)
      // Delay each download slightly so browsers don't block multiple simultaneous downloads
      setTimeout(() => {
        downloadCSV(`transactions_chunk_${i + 1}_of_${chunks.length}.csv`, csv)
      }, i * 300)
    })
  }

  const chunkCount = Math.ceil(validRows.length / chunkSize)

  return (
    <div className="section">
      <div className="section-header" onClick={onToggle} role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onToggle()}
        aria-expanded={isOpen}>
        <div className="section-header-left">
          <span className="section-step done"><IconDownload size={11} /></span>
          <span className="section-title">Downloads</span>
          <span className="section-desc">— Export processed files</span>
        </div>
        <svg className={`section-chevron ${isOpen ? 'open' : ''}`} width="16" height="16"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {isOpen && (
        <div className="section-body">
          <div className="downloads-grid">

            {/* Card 1 — Valid rows */}
            <div className="download-card">
              <div className="download-card-header">
                <div className="download-card-icon green">
                  <IconCheck size={18} />
                </div>
                <div>
                  <div className="download-card-title">cleaned_valid_transactions.csv</div>
                </div>
              </div>
              <p className="download-card-desc">
                Contains <strong>{validRows.length.toLocaleString()} valid rows</strong> that passed all validation checks.
                Ready for direct import into your CRM or data pipeline.
              </p>
              <button
                className="btn btn-success"
                onClick={downloadValid}
                disabled={validRows.length === 0}
              >
                <IconDownload size={14} /> Download Valid Rows
              </button>
            </div>

            {/* Card 2 — Error report */}
            <div className="download-card">
              <div className="download-card-header">
                <div className="download-card-icon red">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div>
                  <div className="download-card-title">invalid_rows_error_report.csv</div>
                </div>
              </div>
              <p className="download-card-desc">
                Contains <strong>{invalidRows.length.toLocaleString()} invalid rows</strong> with an extra{' '}
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--color-muted)', padding: '1px 4px', borderRadius: 3 }}>error_messages</code>{' '}
                column. Share this with the client to fix data issues before re-upload.
              </p>
              <button
                className="btn btn-danger"
                onClick={downloadErrors}
                disabled={invalidRows.length === 0}
              >
                <IconDownload size={14} /> Download Error Report
              </button>
            </div>

            {/* Card 3 — Chunked files */}
            <div className="download-card">
              <div className="download-card-header">
                <div className="download-card-icon blue">
                  <IconLayers size={18} />
                </div>
                <div>
                  <div className="download-card-title">
                    transactions_chunk_N_of_{chunkCount}.csv
                  </div>
                </div>
              </div>
              <p className="download-card-desc">
                Splits the <strong>{validRows.length.toLocaleString()} valid rows</strong> into{' '}
                <strong>{chunkCount} file{chunkCount !== 1 ? 's' : ''}</strong> of up to{' '}
                <strong>{chunkSize} rows</strong> each. Useful for rate-limited batch imports.
              </p>
              <button
                className="btn btn-primary"
                onClick={downloadChunks}
                disabled={validRows.length === 0}
              >
                <IconDownload size={14} /> Download {chunkCount} Chunk{chunkCount !== 1 ? 's' : ''}
              </button>
            </div>

          </div>

          {/* Helper note */}
          <div className="info-banner info" style={{ marginTop: 16, marginBottom: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>
              All processing is done in your browser — no data is sent to any server.
              Re-validate any time by modifying the rules above and clicking Validate again.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
