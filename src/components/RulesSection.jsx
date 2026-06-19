// ============================================================
// RulesSection.jsx — Configurable phone rules and settings
// Users can edit digit counts per country before validating.
// ============================================================
import { useState } from 'react'
import { IconCheck, IconShield } from './Icons.jsx'
import { VALID_PAYMENT_MODES } from '../utils/validation.js'

export default function RulesSection({ phoneRules, setPhoneRules, chunkSize, setChunkSize, isOpen, onToggle }) {
  const [newCode, setNewCode]   = useState('')
  const [newDigits, setNewDigits] = useState('')

  // Update digit count for an existing country
  function updateRule(code, value) {
    const digits = parseInt(value)
    if (!isNaN(digits) && digits > 0) {
      setPhoneRules(prev => ({ ...prev, [code]: digits }))
    }
  }

  // Add a new country code rule
  function addRule() {
    const code   = newCode.trim().toUpperCase()
    const digits = parseInt(newDigits)
    if (code.length < 2 || isNaN(digits) || digits <= 0) return
    setPhoneRules(prev => ({ ...prev, [code]: digits }))
    setNewCode('')
    setNewDigits('')
  }

  // Remove a country rule
  function removeRule(code) {
    setPhoneRules(prev => {
      const copy = { ...prev }
      delete copy[code]
      return copy
    })
  }

  return (
    <div className="section">
      <div className="section-header" onClick={onToggle} role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onToggle()}
        aria-expanded={isOpen}>
        <div className="section-header-left">
          <span className="section-step"><IconShield size={11} /></span>
          <span className="section-title">Validation Rules</span>
          <span className="section-desc">— Configure phone digit rules & chunk size</span>
        </div>
        <svg className={`section-chevron ${isOpen ? 'open' : ''}`} width="16" height="16"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {isOpen && (
        <div className="section-body">

          {/* ── Country Phone Rules ──────────────────────────────── */}
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 10 }}>
            Define how many digits are valid for phone numbers by country code.
            These rules apply during validation.
          </p>

          <table className="rules-table">
            <thead>
              <tr>
                <th>Country Code</th>
                <th>Expected Phone Digits</th>
                <th>Example Phone</th>
                <th style={{ width: 60 }}>Remove</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(phoneRules).map(([code, digits]) => (
                <tr key={code}>
                  <td><span className="country-code-badge">{code}</span></td>
                  <td>
                    <input
                      type="number"
                      value={digits}
                      min={4} max={15}
                      onChange={e => updateRule(code, e.target.value)}
                      aria-label={`Phone digits for ${code}`}
                    />
                    <span style={{ marginLeft: 6, fontSize: 12, color: 'var(--color-text-muted)' }}>digits</span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {code === 'IN' ? '9876543210' : code === 'SG' ? '98765432' : code === 'US' ? '4155552671' : code === 'AE' ? '501234567' : '—'}
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => removeRule(code)}
                      aria-label={`Remove ${code}`}
                      style={{ padding: '3px 8px', color: 'var(--color-error)', borderColor: 'var(--color-error-border)' }}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}

              {/* Add new row */}
              <tr>
                <td>
                  <input
                    type="text"
                    placeholder="e.g. GB"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value.toUpperCase())}
                    maxLength={3}
                    aria-label="New country code"
                    style={{ width: 70, textTransform: 'uppercase' }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="e.g. 11"
                    value={newDigits}
                    min={4} max={15}
                    onChange={e => setNewDigits(e.target.value)}
                    aria-label="Digits for new country"
                  />
                </td>
                <td></td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={addRule}
                    disabled={!newCode || !newDigits}
                  >
                    + Add
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <hr className="divider" />

          {/* ── Payment Modes ──────────────────────────────────────── */}
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Accepted Payment Modes
          </p>
          <div className="payment-modes-row">
            {VALID_PAYMENT_MODES.map(m => (
              <span key={m} className="mode-badge">{m}</span>
            ))}
          </div>

          <hr className="divider" />

          {/* ── Chunk Size ─────────────────────────────────────────── */}
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            CSV Chunk Size (for large file splitting)
          </p>
          <div className="chunk-row">
            <label htmlFor="chunk-size">Rows per chunk:</label>
            <input
              id="chunk-size"
              type="number"
              value={chunkSize}
              min={10} max={10000} step={10}
              onChange={e => setChunkSize(Math.max(10, parseInt(e.target.value) || 500))}
              aria-label="Rows per chunk"
            />
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              Valid rows will be split into files of this size for download.
            </span>
          </div>

          <hr className="divider" />

          {/* ── Accepted Date Formats ──────────────────────────────── */}
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Accepted Date Formats
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              'YYYY-MM-DD',
              'DD/MM/YYYY',
              'DD-MM-YYYY',
              'YYYY-MM-DDTHH:MM:SS',
              'YYYY-MM-DD HH:MM:SS',
            ].map(f => (
              <span key={f} className="mode-badge" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{f}</span>
            ))}
          </div>

        </div>
      )}
    </div>
  )
}
