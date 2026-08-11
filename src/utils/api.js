/**
 * API Service Layer — Artha
 * Abstraksi fetch ke backend PHP
 */

const API_BASE = 'http://localhost/keuangan/api'

/**
 * Generic fetch wrapper with JSON parsing
 */
async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const data = await res.json()

  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Terjadi kesalahan pada server.')
  }

  return data
}

/**
 * Login / auto-create user by access code
 * @param {string} accessCode
 * @returns {Promise<{success, data: {id, access_code, created_at}, message}>}
 */
export async function login(accessCode) {
  return request(`${API_BASE}/?action=login`, {
    method: 'POST',
    body: JSON.stringify({ access_code: accessCode }),
  })
}

/**
 * Fetch all transactions for a user
 * @param {number} userId
 * @returns {Promise<{success, data: Array, message}>}
 */
export async function getTransactions(userId) {
  return request(`${API_BASE}/?action=transactions&user_id=${userId}`)
}

/**
 * Add a new transaction
 * @param {object} txData - { user_id, type, amount, category, description?, date }
 * @returns {Promise<{success, data, message}>}
 */
export async function addTransaction(txData) {
  return request(`${API_BASE}/?action=add_transaction`, {
    method: 'POST',
    body: JSON.stringify(txData),
  })
}

/**
 * Delete a transaction
 * @param {number} id
 * @param {number} userId
 * @returns {Promise<{success, data, message}>}
 */
export async function deleteTransaction(id, userId) {
  return request(`${API_BASE}/?action=delete_transaction&id=${id}&user_id=${userId}`, {
    method: 'DELETE',
  })
}
