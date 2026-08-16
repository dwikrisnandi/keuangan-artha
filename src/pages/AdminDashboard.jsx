import { useState, useEffect, useCallback } from 'react'
import { LogOut, Plus, Copy, Check, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { adminGenerateCode, adminGetUsers } from '../utils/api'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedCode, setCopiedCode] = useState(null)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await adminGetUsers(user.id)
      setUsers(res.data || [])
    } catch (err) {
      setError(err.message)
    }
  }, [user.id])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      await adminGenerateCode(user.id)
      await fetchUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-dvh bg-bg-primary text-text-primary px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-glass-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Admin Dashboard</h1>
            <p className="text-text-secondary text-sm">Manage Artha User Access Codes</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-glass-border hover:bg-glass-hover text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-bg border border-rose-primary/20 text-rose-primary text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <div className="flex items-center justify-between bg-bg-secondary p-6 rounded-2xl border border-glass-border shadow-glass-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-bg flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Total Users: {users.length}</h2>
              <p className="text-text-secondary text-sm">Generate new access codes to distribute.</p>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-text-primary text-bg-primary rounded-xl font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : (
              <>
                <Plus className="w-4 h-4" />
                Generate New Code
              </>
            )}
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-bg-secondary rounded-2xl border border-glass-border overflow-hidden shadow-glass-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-glass-border bg-bg-tertiary">
                  <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Access Code</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Total Transactions</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-glass-hover transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-glass border border-glass-border rounded-md font-mono text-sm tracking-wider">
                        {u.access_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="font-semibold text-text-primary">{u.tx_count}</span> transactions
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleCopy(u.access_code)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-glass text-text-secondary transition-colors"
                        title="Copy Code"
                      >
                        {copiedCode === u.access_code ? (
                          <Check className="w-4 h-4 text-emerald-primary" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-text-muted text-sm">
                      No users yet. Please generate your first code.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
