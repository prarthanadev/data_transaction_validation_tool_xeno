// ============================================================
// App.jsx — Root component
//
// How this app works (big picture):
//   1. User uploads a CSV file
//   2. PapaParse reads the CSV in the browser → gives us an array of row objects
//   3. Our validateAll() function checks each row against the rules
//   4. Results go into state, which flows down to all sections
//   5. User can download cleaned file, error report, or chunked files
//
// All logic runs in the browser. No server, no API calls, no login.
// ============================================================

import { useState, useCallback } from 'react'
import Papa from 'papaparse'

import { validateAll, buildSummary, DEFAULT_PHONE_RULES, REQUIRED_FIELDS } from './utils/validation.js'

import UploadSection    from './components/UploadSection.jsx'
import RulesSection     from './components/RulesSection.jsx'
import SummarySection   from './components/SummarySection.jsx'
import ResultsSection   from './components/ResultsSection.jsx'
import DownloadsSection from './components/DownloadsSection.jsx'
import { IconLogo }     from './components/Icons.jsx'

export default function App() {
  // ── File state ─────────────────────────────────────────────
  const [file, setFile]           = useState(null)      // the File object
  const [fileName, setFileName]   = useState('')        // display name
  const [parsedRows, setParsedRows] = useState([])      // raw parsed CSV rows
  const [headers, setHeaders]     = useState([])        // CSV column names
  const [parseError, setParseError] = useState('')      // CSV parse error if any

  // ── Validation config ───────────────────────────────────────
  const [phoneRules, setPhoneRules] = useState({ ...DEFAULT_PHONE_RULES })
  const [chunkSize, setChunkSize]   = useState(500)

  // ── Validation results ─────────────────────────────────────
  const [results, setResults]   = useState(null)        // array of { rowNumber, row, valid, errors }
  const [summary, setSummary]   = useState(null)        // summary object for cards
  const [validating, setValidating] = useState(false)   // loading state

  // ── Section open/close toggles ─────────────────────────────
  const [openSections, setOpenSections] = useState({
    upload:    true,
    rules:     true,
    summary:   false,
    results:   false,
    downloads: false,
  })

  function toggleSection(name) {
    setOpenSections(prev => ({ ...prev, [name]: !prev[name] }))
  }

  // ── Handle file selected from UploadSection ─────────────────
  const handleFileSelect = useCallback((selectedFile) => {
    setFile(selectedFile)
    setFileName(selectedFile.name)
    setResults(null)
    setSummary(null)
    setParseError('')

    // Parse CSV in the browser using PapaParse library
    Papa.parse(selectedFile, {
      header: true,           // First row = column headers
      skipEmptyLines: true,   // Ignore completely blank lines
      trimHeaders: true,      // Remove spaces around header names
      transform: (val) => val.trim(), // Trim whitespace from every cell value

      complete: (parsed) => {
        if (parsed.errors.length > 0) {
          setParseError(`CSV parse error: ${parsed.errors[0].message}`)
          return
        }

        const detectedHeaders = parsed.meta.fields || []
        setHeaders(detectedHeaders)
        setParsedRows(parsed.data)

        // Check that all required columns exist
        const missing = REQUIRED_FIELDS.filter(f => !detectedHeaders.includes(f))
        if (missing.length > 0) {
          setParseError(`Missing required columns: ${missing.join(', ')}`)
        }
      },

      error: (err) => {
        setParseError(`Failed to read file: ${err.message}`)
      },
    })
  }, [])

  // ── Run validation ──────────────────────────────────────────
  function handleValidate() {
    if (!parsedRows.length) return
    setValidating(true)

    // Use setTimeout so React has time to re-render the loading state
    // before we start the (potentially slow) validation loop
    setTimeout(() => {
      const validationResults = validateAll(parsedRows, phoneRules)
      const validationSummary = buildSummary(validationResults)

      setResults(validationResults)
      setSummary(validationSummary)
      setValidating(false)

      // Auto-open the result sections after validation
      setOpenSections(prev => ({
        ...prev,
        summary:   true,
        results:   true,
        downloads: true,
      }))
    }, 50)
  }

  const canValidate = parsedRows.length > 0 && !parseError

  return (
    <div className="app-shell">
      {/* ── Top navigation bar ─────────────────────────────────── */}
      <header className="top-bar" role="banner">
        <div className="top-bar-brand">
          <div className="top-bar-logo" aria-hidden="true">
            <IconLogo size={15} />
          </div>
          <div>
            <div className="top-bar-title">Transaction Data Validator</div>
            <div className="top-bar-subtitle">Pre-import readiness tool for CRM data onboarding</div>
          </div>
        </div>
        <span className="top-bar-badge">Browser-only · No server</span>
      </header>

      {/* ── Main content ───────────────────────────────────────── */}
      <main className="main-content" id="main" role="main">

        {/* ── Parse error banner ───────────────────────────────── */}
        {parseError && (
          <div className="info-banner error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <span>{parseError}</span>
          </div>
        )}

        {/* ── Step 1: Upload ───────────────────────────────────── */}
        <UploadSection
          onFileSelect={handleFileSelect}
          fileName={fileName}
          isOpen={openSections.upload}
          onToggle={() => toggleSection('upload')}
        />

        {/* ── Step 2: Validation Rules ─────────────────────────── */}
        <RulesSection
          phoneRules={phoneRules}
          setPhoneRules={setPhoneRules}
          chunkSize={chunkSize}
          setChunkSize={setChunkSize}
          isOpen={openSections.rules}
          onToggle={() => toggleSection('rules')}
        />

        {/* ── Validate Button ──────────────────────────────────── */}
        {parsedRows.length > 0 && !parseError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleValidate}
              disabled={!canValidate || validating}
              style={{ minWidth: 180 }}
            >
              {validating
                ? 'Validating…'
                : results
                  ? `Re-validate ${parsedRows.length.toLocaleString()} rows`
                  : `Validate ${parsedRows.length.toLocaleString()} rows`
              }
            </button>
            {results && (
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                Last run:
                <strong style={{ color: 'var(--color-success)', marginLeft: 4 }}>{summary.validCount} valid</strong>
                {' · '}
                <strong style={{ color: 'var(--color-error)' }}>{summary.invalidCount} invalid</strong>
              </span>
            )}
          </div>
        )}

        {/* ── Step 3: Summary ──────────────────────────────────── */}
        <SummarySection
          summary={summary}
          isOpen={openSections.summary}
          onToggle={() => toggleSection('summary')}
        />

        {/* ── Step 4: Results Table ────────────────────────────── */}
        <ResultsSection
          results={results}
          isOpen={openSections.results}
          onToggle={() => toggleSection('results')}
        />

        {/* ── Step 5: Downloads ────────────────────────────────── */}
        <DownloadsSection
          results={results}
          chunkSize={chunkSize}
          isOpen={openSections.downloads}
          onToggle={() => toggleSection('downloads')}
        />

      </main>
    </div>
  )
}
