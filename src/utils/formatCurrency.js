/**
 * Format number to Indonesian Rupiah
 * @param {number} num
 * @returns {string} e.g. "Rp12.500.000"
 */
export function formatRupiah(num) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * Format number to short Rupiah (e.g. "12,5jt")
 * @param {number} num
 * @returns {string}
 */
export function formatRupiahShort(num) {
  if (Math.abs(num) >= 1_000_000_000) {
    return `Rp${(num / 1_000_000_000).toFixed(1)}M`
  }
  if (Math.abs(num) >= 1_000_000) {
    return `Rp${(num / 1_000_000).toFixed(1)}jt`
  }
  if (Math.abs(num) >= 1_000) {
    return `Rp${(num / 1_000).toFixed(0)}rb`
  }
  return `Rp${num}`
}
