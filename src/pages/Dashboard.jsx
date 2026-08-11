import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getTransactions, addTransaction, deleteTransaction } from '../utils/api'
import { formatRupiah } from '../utils/formatCurrency'
import StatCard from '../components/cards/StatCard'
import GlassCard from '../components/ui/GlassCard'
import TransactionModal from '../components/ui/TransactionModal'

/**
 * Dashboard — Main overview page with real data from API
 * Features: metric cards, 50/30/20 budget bars, transaction list, FAB + modal
 */
export default function Dashboard() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState('')

  // Fetch transactions
  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const res = await getTransactions(user.id)
      setTransactions(res.data || [])
    } catch (err) {
      setError(err.message || 'Gagal memuat data.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Computed metrics — current month only
  const metrics = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const thisMonth = transactions.filter((tx) => {
      const d = new Date(tx.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    const totalIncome = thisMonth
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0)

    const totalExpense = thisMonth
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0)

    const balance = totalIncome - totalExpense

    // 50/30/20 breakdown (expense categories)
    const kebutuhan = thisMonth
      .filter((tx) => tx.type === 'expense' && tx.category === 'Kebutuhan')
      .reduce((sum, tx) => sum + tx.amount, 0)

    const keinginan = thisMonth
      .filter((tx) => tx.type === 'expense' && tx.category === 'Keinginan')
      .reduce((sum, tx) => sum + tx.amount, 0)

    const tabungan = thisMonth
      .filter((tx) => tx.type === 'expense' && tx.category === 'Tabungan')
      .reduce((sum, tx) => sum + tx.amount, 0)

    // Budgets based on income
    const budgetKebutuhan = totalIncome * 0.5
    const budgetKeinginan = totalIncome * 0.3
    const budgetTabungan = totalIncome * 0.2

    return {
      totalIncome,
      totalExpense,
      balance,
      budget: [
        { label: 'Kebutuhan', pct: 50, spent: kebutuhan, limit: budgetKebutuhan, color: 'emerald' },
        { label: 'Keinginan', pct: 30, spent: keinginan, limit: budgetKeinginan, color: 'amber' },
        { label: 'Tabungan', pct: 20, spent: tabungan, limit: budgetTabungan, color: 'blue' },
      ],
    }
  }, [transactions])

  // Add transaction handler
  const handleAddTransaction = useCallback(async (txData) => {
    await addTransaction({ ...txData, user_id: user.id })
    await fetchData()
  }, [user, fetchData])

  // Delete transaction handler
  const handleDelete = useCallback(async (id) => {
    try {
      await deleteTransaction(id, user.id)
      await fetchData()
    } catch (err) {
      setError(err.message)
    }
  }, [user, fetchData])

  // Format date to Indonesian
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-primary animate-spin" />
          <p className="text-text-muted text-sm">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between bg-rose-bg border border-rose-primary/20 rounded-xl px-4 py-3 animate-fade-in">
          <p className="text-rose-primary text-sm">{error}</p>
          <button onClick={fetchData} className="text-rose-primary hover:text-rose-light cursor-pointer">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <StatCard
          title="Saldo Bulan Ini"
          value={formatRupiah(metrics.balance)}
          subtitle="Pemasukan − Pengeluaran"
          variant="balance"
          icon={Wallet}
        />
        <StatCard
          title="Total Pemasukan"
          value={formatRupiah(metrics.totalIncome)}
          subtitle="Bulan ini"
          variant="income"
          icon={TrendingUp}
        />
        <StatCard
          title="Total Pengeluaran"
          value={formatRupiah(metrics.totalExpense)}
          subtitle="Bulan ini"
          variant="expense"
          icon={TrendingDown}
        />
      </div>

      {/* 50/30/20 Budget Rule */}
      {metrics.totalIncome > 0 && (
        <div className="animate-fade-in">
          <h2 className="text-text-primary text-lg font-semibold mb-4">
            Aturan 50/30/20
          </h2>
          <GlassCard hover={false} className="p-5 space-y-4">
            {metrics.budget.map(({ label, pct, spent, limit, color }) => {
              const progress = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
              const isOver = spent > limit

              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full bg-${color}-primary`} />
                      <span className="text-text-primary text-sm font-medium">
                        {label} ({pct}%)
                      </span>
                    </div>
                    <span className={`text-xs font-medium ${isOver ? 'text-rose-primary' : 'text-text-secondary'}`}>
                      {formatRupiah(spent)} / {formatRupiah(limit)}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 bg-bg-primary/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        isOver ? 'bg-rose-primary' : `bg-${color}-primary`
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </GlassCard>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-text-primary text-lg font-semibold">Transaksi Terakhir</h2>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 text-emerald-primary text-sm font-medium hover:text-emerald-light transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {transactions.length === 0 ? (
          <GlassCard hover={false} className="p-8 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-glass flex items-center justify-center mb-3">
              <Wallet className="w-7 h-7 text-text-muted" />
            </div>
            <p className="text-text-secondary text-sm font-medium mb-1">Belum ada transaksi</p>
            <p className="text-text-muted text-xs text-center">
              Tekan tombol <span className="text-emerald-primary font-semibold">+</span> untuk menambah transaksi pertamamu.
            </p>
          </GlassCard>
        ) : (
          <GlassCard hover={false} className="divide-y divide-glass-border overflow-hidden">
            {transactions.slice(0, 10).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-4 py-3.5 hover:bg-glass-hover transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.type === 'income' ? 'bg-emerald-bg' : 'bg-rose-bg'
                  }`}>
                    {tx.type === 'income'
                      ? <ArrowDownLeft className="w-4 h-4 text-emerald-primary" />
                      : <ArrowUpRight className="w-4 h-4 text-rose-primary" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-text-primary text-sm font-medium truncate">
                      {tx.description || tx.category}
                    </p>
                    <p className="text-text-muted text-xs">
                      {tx.category} · {formatDate(tx.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold whitespace-nowrap ${
                    tx.type === 'income' ? 'text-emerald-primary' : 'text-rose-primary'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                  </p>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-bg text-text-muted hover:text-rose-primary transition-all cursor-pointer"
                    aria-label="Hapus transaksi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </GlassCard>
        )}
      </div>

      {/* FAB — Floating Action Button */}
      <button
        id="fab-add-transaction"
        onClick={() => setModalOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 rounded-2xl bg-emerald-primary hover:bg-emerald-dark text-text-inverse flex items-center justify-center shadow-[0_8px_30px_rgba(16,185,129,0.35)] hover:shadow-[0_8px_40px_rgba(16,185,129,0.5)] transition-all duration-[var(--transition-base)] active:scale-90 cursor-pointer z-50 hover:rotate-90"
        aria-label="Tambah transaksi"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddTransaction}
      />
    </div>
  )
}
