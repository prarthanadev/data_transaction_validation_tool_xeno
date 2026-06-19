// ============================================================
// validation.js — Core validation logic for transaction data
// All processing happens in the browser — no server needed.
// ============================================================

/**
 * Required fields every row must have.
 * These map 1:1 to the CSV column headers.
 */
export const REQUIRED_FIELDS = [
  'order_id',
  'customer_name',
  'phone',
  'country_code',
  'order_date',
  'product_name',
  'quantity',
  'amount',
  'payment_mode',
]

/**
 * Default country phone rules.
 * countryCode → number of digits expected in phone number.
 * This is editable by the user in the UI.
 */
export const DEFAULT_PHONE_RULES = {
  IN: 10, // India
  SG: 8,  // Singapore
  US: 10, // United States
  AE: 9,  // UAE
}

/**
 * Valid payment modes accepted by the system.
 */
export const VALID_PAYMENT_MODES = ['UPI', 'Card', 'Cash', 'NetBanking', 'Wallet']

/**
 * Date formats we accept. We try to parse the date using these.
 * We use regex to detect common formats.
 */
const DATE_REGEXES = [
  /^\d{4}-\d{2}-\d{2}$/,                        // 2024-01-15
  /^\d{2}\/\d{2}\/\d{4}$/,                      // 01/15/2024 or 15/01/2024
  /^\d{2}-\d{2}-\d{4}$/,                        // 15-01-2024
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,     // 2024-01-15T10:30:00
  /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,     // 2024-01-15 10:30:00
  /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}(:\d{2})?$/, // 15/01/2024 10:30
]

/**
 * isValidDate — checks if a date string matches one of our accepted formats
 * and is an actual real calendar date (not Feb 30, etc.)
 */
export function isValidDate(dateStr) {
  if (!dateStr) return false
  const trimmed = dateStr.trim()

  // Check if it matches any of our allowed formats
  const matchesFormat = DATE_REGEXES.some((re) => re.test(trimmed))
  if (!matchesFormat) return false

  // Also check that Date can actually parse it (rules out Feb 30 etc.)
  // We normalize common formats before passing to Date()
  const normalized = trimmed
    .replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1') // DD/MM/YYYY → YYYY-MM-DD
    .replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1')   // DD-MM-YYYY → YYYY-MM-DD

  const d = new Date(normalized)
  return !isNaN(d.getTime())
}

/**
 * validateRow — validates a single row object against all rules.
 * Returns: { valid: boolean, errors: string[] }
 *
 * @param {object} row       — the parsed CSV row (key → value)
 * @param {object} phoneRules — { IN: 10, SG: 8, ... }
 * @param {Set}    seenIds    — Set of order_ids already seen (for duplicate check)
 */
export function validateRow(row, phoneRules, seenIds) {
  const errors = []

  // ── 1. order_id must not be blank ──────────────────────────
  const orderId = (row.order_id || '').trim()
  if (!orderId) {
    errors.push('order_id is blank')
  } else if (seenIds.has(orderId)) {
    errors.push(`Duplicate order_id: "${orderId}"`)
  } else {
    seenIds.add(orderId)
  }

  // ── 2. customer_name must not be blank ─────────────────────
  if (!(row.customer_name || '').trim()) {
    errors.push('customer_name is blank')
  }

  // ── 3. product_name must not be blank ──────────────────────
  if (!(row.product_name || '').trim()) {
    errors.push('product_name is blank')
  }

  // ── 4. country_code must be in our phone rules ─────────────
  const countryCode = (row.country_code || '').trim().toUpperCase()
  if (!countryCode) {
    errors.push('country_code is blank')
  } else if (!phoneRules[countryCode]) {
    errors.push(`country_code "${countryCode}" not in configured rules`)
  } else {
    // ── 5. phone must match country-specific digit count ───────
    const phone = (row.phone || '').replace(/\D/g, '') // strip non-digits
    const expectedDigits = phoneRules[countryCode]
    if (!phone) {
      errors.push('phone is blank')
    } else if (phone.length !== expectedDigits) {
      errors.push(
        `phone must be ${expectedDigits} digits for ${countryCode} (got ${phone.length})`
      )
    }
  }

  // ── 6. order_date must match accepted formats ───────────────
  if (!isValidDate(row.order_date)) {
    errors.push(`order_date "${row.order_date || ''}" is invalid or wrong format`)
  }

  // ── 7. quantity must be a positive integer ─────────────────
  const qty = (row.quantity || '').toString().trim()
  if (!qty) {
    errors.push('quantity is blank')
  } else {
    const qtyNum = Number(qty)
    if (!Number.isInteger(qtyNum) || qtyNum <= 0) {
      errors.push(`quantity must be a positive integer (got "${qty}")`)
    }
  }

  // ── 8. amount must be a positive number ────────────────────
  const amt = (row.amount || '').toString().trim()
  if (!amt) {
    errors.push('amount is blank')
  } else {
    const amtNum = parseFloat(amt)
    if (isNaN(amtNum) || amtNum <= 0) {
      errors.push(`amount must be a positive number (got "${amt}")`)
    }
  }

  // ── 9. payment_mode must be one of the allowed values ─────
  const pm = (row.payment_mode || '').trim()
  if (!pm) {
    errors.push('payment_mode is blank')
  } else if (!VALID_PAYMENT_MODES.includes(pm)) {
    errors.push(
      `payment_mode "${pm}" invalid — must be one of: ${VALID_PAYMENT_MODES.join(', ')}`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * validateAll — runs validateRow on every parsed CSV row.
 * Returns a results array with one entry per row.
 *
 * @param {object[]} rows      — array of row objects from PapaParse
 * @param {object}   phoneRules — configurable phone digit rules
 */
export function validateAll(rows, phoneRules) {
  const seenIds = new Set()

  return rows.map((row, index) => {
    const result = validateRow(row, phoneRules, seenIds)
    return {
      rowNumber: index + 2, // +2 because row 1 is the header in the CSV
      row,
      valid: result.valid,
      errors: result.errors,
    }
  })
}

/**
 * buildSummary — creates a summary object from the validation results.
 * This powers the dashboard summary cards.
 */
export function buildSummary(results) {
  const total = results.length
  const validRows = results.filter((r) => r.valid)
  const invalidRows = results.filter((r) => !r.valid)

  // Count duplicate order_ids
  const idCounts = {}
  results.forEach((r) => {
    const id = (r.row.order_id || '').trim()
    if (id) idCounts[id] = (idCounts[id] || 0) + 1
  })
  const duplicateCount = Object.values(idCounts).filter((c) => c > 1).length

  // Count how often each type of error occurs (to find the most common)
  const errorTypeCounts = {}
  invalidRows.forEach((r) => {
    r.errors.forEach((err) => {
      // Extract the field name from the error message (e.g. "phone must be...")  → "phone"
      const field = err.split(' ')[0]
      errorTypeCounts[field] = (errorTypeCounts[field] || 0) + 1
    })
  })

  // Sort to find top error type
  const errorTypesSorted = Object.entries(errorTypeCounts).sort((a, b) => b[1] - a[1])
  const mostCommonError = errorTypesSorted.length > 0 ? errorTypesSorted[0] : null

  return {
    total,
    validCount: validRows.length,
    invalidCount: invalidRows.length,
    duplicateCount,
    mostCommonError, // [field, count] or null
    errorTypeCounts,
  }
}

/**
 * chunkArray — splits an array into smaller sub-arrays of a given size.
 * Used when generating chunked download files.
 *
 * Example: chunkArray([1,2,3,4,5], 2) → [[1,2], [3,4], [5]]
 */
export function chunkArray(arr, size) {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}
