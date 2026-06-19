// ============================================================
// csvUtils.js — Utilities for parsing and generating CSV files
// ============================================================

/**
 * REQUIRED_FIELDS and the sample CSV template data.
 * Used when the user clicks "Download Sample CSV".
 */
export const SAMPLE_CSV_CONTENT = `order_id,customer_name,phone,country_code,order_date,product_name,quantity,amount,payment_mode
ORD001,Priya Sharma,9876543210,IN,2024-01-15,Running Shoes,2,4999.00,UPI
ORD002,Wei Ling,98765432,SG,2024-01-16,Wireless Earbuds,1,159.90,Card
ORD003,John Smith,4155552671,US,2024-01-17,Coffee Maker,1,89.99,NetBanking
ORD004,Fatima Al-Rashid,501234567,AE,2024-01-18,Silk Scarf,3,299.00,Cash
ORD005,Rahul Verma,8800112233,IN,2024-01-19,Laptop Stand,1,1299.00,Wallet
ORD006,Sarah Tan,87654321,SG,2024-01-20,Yoga Mat,2,45.00,Card
ORD007,,9812345678,IN,2024-01-21,Notebook,5,299.00,UPI
ORD008,Carlos Mendez,1234567890,US,2024-01-22,Headphones,1,149.99,Card
ORD001,Duplicate Row,9876543210,IN,2024-01-23,Phone Case,1,499.00,UPI
ORD009,Li Wei,87654321,SG,32-13-2024,Smart Watch,1,399.00,NetBanking
ORD010,Ahmed Hassan,505123456,AE,2024-01-25,Perfume,2,150.00,Wallet
ORD011,Nina Patel,987654,IN,2024-01-26,Tea Set,1,899.00,Cash
ORD012,Tom Bradley,5551234567,US,2024-01-27,Running Shoes,1,120.00,Venmo
ORD013,Siti Rahma,91234567,SG,2024-01-28,Cotton T-Shirt,-3,25.00,Card
ORD014,Omar Khalid,971501234567,AE,2024-01-29,Leather Wallet,1,0,UPI
`

/**
 * downloadCSV — creates a CSV file in the browser and triggers download.
 *
 * @param {string} filename  — name of the file to download
 * @param {string} content   — the raw CSV text content
 */
export function downloadCSV(filename, content) {
  // Create a Blob (binary large object) with our CSV content
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })

  // Create a temporary URL pointing to the blob
  const url = URL.createObjectURL(blob)

  // Create an invisible <a> tag and click it to trigger the download
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()

  // Clean up
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * rowsToCSV — converts an array of row objects back into CSV text.
 * Handles values that contain commas by wrapping them in quotes.
 *
 * @param {object[]} rows    — array of row objects
 * @param {string[]} headers — column headers (in order)
 */
export function rowsToCSV(rows, headers) {
  if (!rows || rows.length === 0) return headers.join(',') + '\n'

  const escape = (val) => {
    const s = (val === undefined || val === null) ? '' : String(val)
    // If value contains comma, newline, or quote — wrap in double quotes
    if (s.includes(',') || s.includes('\n') || s.includes('"')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }

  const headerLine = headers.map(escape).join(',')
  const dataLines = rows.map((row) => headers.map((h) => escape(row[h])).join(','))
  return [headerLine, ...dataLines].join('\n')
}

/**
 * errorReportToCSV — converts invalid rows into a CSV with an extra
 * "error_messages" column so the client can see exactly what's wrong.
 *
 * @param {object[]} invalidResults — results array filtered to invalid rows
 * @param {string[]} originalHeaders — the original CSV headers
 */
export function errorReportToCSV(invalidResults, originalHeaders) {
  const headers = ['row_number', ...originalHeaders, 'error_messages']

  const escape = (val) => {
    const s = (val === undefined || val === null) ? '' : String(val)
    if (s.includes(',') || s.includes('\n') || s.includes('"')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }

  const headerLine = headers.map(escape).join(',')
  const dataLines = invalidResults.map((r) => {
    const rowData = originalHeaders.map((h) => escape(r.row[h]))
    const errorMsg = r.errors.join(' | ')
    return [r.rowNumber, ...rowData, escape(errorMsg)].join(',')
  })

  return [headerLine, ...dataLines].join('\n')
}
