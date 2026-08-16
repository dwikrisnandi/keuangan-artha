/**
 * Get formatting options based on currency
 */
function getCurrencyOptions(currencyCode) {
  const code = currencyCode || 'IDR'
  
  // By default, Intl.NumberFormat handles correct decimal places for most currencies (like USD = 2).
  // But for IDR, we explicitly want 0 decimals as it's common practice in Indonesia.
  if (code.toUpperCase() === 'IDR') {
    return {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }
  }

  return {
    style: 'currency',
    currency: code,
  }
}

/**
 * Get appropriate locale based on currency for formatting
 */
function getLocaleForCurrency(currencyCode) {
  const code = (currencyCode || 'IDR').toUpperCase()
  if (code === 'IDR') return 'id-ID'
  if (code === 'USD') return 'en-US'
  if (code === 'EUR') return 'de-DE' // or en-GB, fr-FR depending on preference
  if (code === 'GBP') return 'en-GB'
  return undefined // Use browser default
}

/**
 * Format number to currency
 * @param {number} num
 * @param {string} currencyCode (e.g. 'IDR', 'USD')
 * @returns {string} e.g. "Rp12.500.000" or "$10.50"
 */
export function formatCurrency(num, currencyCode = 'IDR') {
  const options = getCurrencyOptions(currencyCode)
  const locale = getLocaleForCurrency(currencyCode)
  
  return new Intl.NumberFormat(locale, options).format(num)
}

/**
 * Format number to short currency (e.g. "Rp12.5jt" or "$12.5K")
 * @param {number} num
 * @param {string} currencyCode
 * @returns {string}
 */
export function formatCurrencyShort(num, currencyCode = 'IDR') {
  const code = (currencyCode || 'IDR').toUpperCase()
  
  // For IDR we use local abbreviations
  if (code === 'IDR') {
    if (Math.abs(num) >= 1_000_000_000) {
      return `Rp ${(num / 1_000_000_000).toFixed(1)}M`
    }
    if (Math.abs(num) >= 1_000_000) {
      return `Rp ${(num / 1_000_000).toFixed(1)}jt`
    }
    if (Math.abs(num) >= 1_000) {
      return `Rp ${(num / 1_000).toFixed(0)}rb`
    }
    return `Rp ${num}`
  }
  
  // For other currencies, use the Intl standard compact notation!
  // This automatically handles K, M, B based on locale.
  const locale = getLocaleForCurrency(code)
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(num)
}
