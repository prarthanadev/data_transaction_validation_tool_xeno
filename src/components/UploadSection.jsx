// ============================================================
// UploadSection.jsx — CSV file upload with drag-and-drop
// ============================================================
import { useRef, useState } from 'react'
import { IconUpload, IconCheck, IconFile, IconDownload } from './Icons.jsx'
import { SAMPLE_CSV_CONTENT } from '../utils/csvUtils.js'
import { downloadCSV } from '../utils/csvUtils.js'

export default function UploadSection({ onFileSelect, fileName, isOpen, onToggle }) {
  // dragOver is true when user is dragging a file over the drop zone
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  // Handle the file (whether from drag-drop or click-to-browse)
  function handleFile(file) {
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a .csv file.')
      return
    }
    onFileSelect(file)
  }

  function onDragOver(e) {
    e.preventDefault() // needed to allow dropping
    setDragOver(true)
  }

  function onDragLeave() {
    setDragOver(false)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  function onInputChange(e) {
    handleFile(e.target.files[0])
  }

  function handleSampleDownload(e) {
    e.stopPropagation()
    downloadCSV('sample_transactions.csv', SAMPLE_CSV_CONTENT)
  }

  const hasFile = !!fileName

  return (
    <div className="section">
      <div className="section-header" onClick={onToggle} role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onToggle()}
        aria-expanded={isOpen}>
        <div className="section-header-left">
          <span className={`section-step ${hasFile ? 'done' : ''}`}>
            {hasFile ? <IconCheck size={11} /> : '1'}
          </span>
          <span className="section-title">Upload</span>
          <span className="section-desc">— Upload your transaction CSV file</span>
        </div>
        <svg className={`section-chevron ${isOpen ? 'open' : ''}`} width="16" height="16"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {isOpen && (
        <div className="section-body">
          {/* Drop Zone */}
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''} ${hasFile ? 'has-file' : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !hasFile && inputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload CSV file"
            onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
          >
            <div className="upload-icon">
              {hasFile ? <IconCheck size={22} /> : <IconUpload size={22} />}
            </div>

            {hasFile ? (
              <>
                <p className="upload-label" style={{ color: 'var(--color-success)' }}>
                  File ready for validation
                </p>
                <p className="upload-sublabel">Click below to change file</p>
              </>
            ) : (
              <>
                <p className="upload-label">Drag and drop your CSV here</p>
                <p className="upload-sublabel">
                  or{' '}
                  <a
                    href="#"
                    onClick={e => { e.preventDefault(); e.stopPropagation(); inputRef.current?.click() }}
                  >
                    browse to choose a file
                  </a>
                </p>
              </>
            )}

            {/* Hidden real file input */}
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={onInputChange}
            />
          </div>

          {/* Show selected file info */}
          {hasFile && (
            <div className="file-selected">
              <span className="file-selected-icon"><IconFile size={16} /></span>
              <span className="file-selected-name">{fileName}</span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => inputRef.current?.click()}
                style={{ flexShrink: 0 }}
              >
                Change
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="upload-actions">
            {!hasFile && (
              <button className="btn btn-secondary btn-sm" onClick={() => inputRef.current?.click()}>
                <IconUpload size={14} /> Browse File
              </button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={handleSampleDownload}>
              <IconDownload size={14} /> Download Sample CSV
            </button>
          </div>

          {/* Helper text */}
          <div className="info-banner info" style={{ marginTop: 14, marginBottom: 0 }}>
            <span style={{ flexShrink: 0 }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></span>
            <span>
              Required columns: <strong>order_id, customer_name, phone, country_code, order_date, product_name, quantity, amount, payment_mode</strong>.
              Download the sample CSV above to see the expected format.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
