import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Wallet, TrendingUp, TrendingDown, Plus, ArrowDownLeft, ArrowUpRight,
  RefreshCw, Trash2, PieChart as PieChartIcon, BarChart2
} from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getTransactions, addTransaction, deleteTransaction } from '../utils/api'
import { formatRupiah, formatRupiahShort } from '../utils/formatCurrency'
import BentoCard from '../components/ui/BentoCard'
import Skeleton from '../components/ui/Skeleton'
import TransactionModal from '../components/ui/TransactionModal'
import { useNotificationEngine } from '../hooks/useNotificationEngine'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-tertiary/95 backdrop-blur-md border border-glass-border p-3 rounded-xl shadow-glass">
        <p className="text-text-primary text-xs font-medium mb-1">{payload[0].name || payload[0].payload.name}</p>
        <p className="text-emerald-primary font-bold">{formatRupiah(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await getTransactions(user.id)
      setTransactions(res.data || [])
    } catch (err) {
      showError(err.message || 'Failed to load transaction data.')
    } finally {
      setLoading(false)
    }
  }, [user, showError])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const metrics = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const thisMonth = transactions.filter((tx) => {
      const d = new Date(tx.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    const totalIncome = thisMonth.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0)
    const totalExpense = thisMonth.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0)
    const balance = totalIncome - totalExpense

    const kebutuhan = thisMonth.filter((tx) => tx.type === 'expense' && tx.category === 'Needs').reduce((sum, tx) => sum + tx.amount, 0)
    const keinginan = thisMonth.filter((tx) => tx.type === 'expense' && tx.category === 'Wants').reduce((sum, tx) => sum + tx.amount, 0)
    const tabungan = thisMonth.filter((tx) => tx.type === 'expense' && tx.category === 'Savings').reduce((sum, tx) => sum + tx.amount, 0)

    const expenseRatioData = [
      { name: 'Needs', value: kebutuhan, color: '#10B981' },
      { name: 'Wants', value: keinginan, color: '#F59E0B' },
      { name: 'Savings', value: tabungan, color: '#3B82F6' },
    ].filter(d => d.value > 0)

    const last7DaysData = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const shortDay = d.toLocaleDateString('id-ID', { weekday: 'short' })
      
      const dayExpense = transactions
        .filter(tx => tx.type === 'expense' && tx.date === dateStr)
        .reduce((sum, tx) => sum + tx.amount, 0)
        
      last7DaysData.push({ name: shortDay, fullDate: dateStr, value: dayExpense })
    }
    const has7DaysData = last7DaysData.some(d => d.value > 0)

    return { 
      totalIncome, 
      totalExpense, 
      total_income: totalIncome, 
      total_expense: totalExpense, 
      balance, 
      expenseRatioData, 
      last7DaysData, 
      has7DaysData 
    }
  }, [transactions])

  // Fire Smart Notification Engine!
  useNotificationEngine(metrics)

  const handleAddTransaction = async (txData) => {
    try {
      await addTransaction({ ...txData, user_id: user.id })
      success('Transaction added successfully!')
      await fetchData()
    } catch (err) {
      showError(err.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id, user.id)
      success('Transaction deleted.')
      await fetchData()
    } catch (err) {
      showError(err.message)
    }
  }

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

  // Skeleton Loaders
  if (loading && transactions.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
        <BentoCard colSpan={2}><Skeleton className="h-full w-full" /></BentoCard>
        <BentoCard><Skeleton className="h-full w-full" /></BentoCard>
        <BentoCard colSpan={3} rowSpan={2}><Skeleton className="h-[400px] w-full" /></BentoCard>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-text-primary text-xl font-bold tracking-tight">This Month Summary</h2>
        <button onClick={fetchData} className="p-2 hover:bg-glass rounded-full transition-colors text-text-muted hover:text-text-primary">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(160px,auto)]">
        
        {/* Main Balance Card (Hero) */}
        <BentoCard colSpan={2} className="bg-gradient-to-br from-bg-secondary to-bg-tertiary !border-glass-border-hover relative overflow-hidden group">
          <div className="absolute top-4 right-4 p-3 rounded-full bg-bg-card border border-glass-border shadow-sm">
            <Wallet className="w-6 h-6 text-emerald-primary" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between pt-2">
            <div className="w-full pr-12">
              <p className="text-text-secondary text-sm font-medium mb-1">Current Balance</p>
              <h3 className="text-text-primary text-3xl sm:text-4xl font-bold tracking-tight truncate w-full" title={formatRupiah(metrics.balance)}>
                {formatRupiah(metrics.balance)}
              </h3>
            </div>
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-bg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-primary" />
                </div>
                <div>
                  <p className="text-text-muted text-[11px] uppercase tracking-wider font-semibold">Income</p>
                  <p className="text-text-primary text-sm font-medium">{formatRupiahShort(metrics.totalIncome)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-bg flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-rose-primary" />
                </div>
                <div>
                  <p className="text-text-muted text-[11px] uppercase tracking-wider font-semibold">Expense</p>
                  <p className="text-text-primary text-sm font-medium">{formatRupiahShort(metrics.totalExpense)}</p>
                </div>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Expense Ratio Chart */}
        <BentoCard colSpan={1} md:colSpan={1} lg:colSpan={1} title="Ratio">
          <div className="flex-1 w-full h-full min-h-[140px] flex items-center justify-center relative">
            {metrics.expenseRatioData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.expenseRatioData}
                    cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" paddingAngle={4}
                    dataKey="value" stroke="none"
                  >
                    {metrics.expenseRatioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-text-muted">
                <PieChartIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Empty</p>
              </div>
            )}
          </div>
        </BentoCard>

        {/* Recent Transactions List (Spans 2 rows) */}
        <BentoCard colSpan={1} md:colSpan={3} lg:colSpan={1} rowSpan={2} title="Recent" className="overflow-y-auto max-h-[450px] no-scrollbar">
          <div className="flex flex-col gap-3">
            {transactions.slice(0, 7).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between group p-2 -mx-2 rounded-xl hover:bg-glass transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    tx.type === 'income' ? 'bg-emerald-primary/10 text-emerald-primary' : 'bg-rose-primary/10 text-rose-primary'
                  }`}>
                    {tx.type === 'income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-text-primary text-sm font-medium truncate">{tx.description || tx.category}</p>
                    <p className="text-text-muted text-[11px] truncate">{formatDate(tx.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className={`text-sm font-semibold whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-primary' : 'text-text-primary'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatRupiahShort(tx.amount)}
                  </p>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-rose-primary/20 text-text-muted hover:text-rose-primary transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-text-muted text-sm text-center py-8">No transactions yet.</p>
            )}
          </div>
        </BentoCard>

        {/* 7 Days Trend Chart */}
        <BentoCard colSpan={1} md:colSpan={2} lg:colSpan={2} title="7 Days Trend">
          <div className="flex-1 w-full min-h-[160px] relative">
            {metrics.has7DaysData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.last7DaysData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 11 }} tickFormatter={(val) => formatRupiahShort(val)} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.03)'}} />
                  <Bar dataKey="value" fill="#333" radius={[4, 4, 0, 0]} activeBar={{ fill: '#F43F5E' }} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted">
                <BarChart2 className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs">No expenses yet</p>
              </div>
            )}
          </div>
        </BentoCard>

        {/* Quick Action */}
        <BentoCard colSpan={1} md:colSpan={1} lg:colSpan={1} className="flex items-center justify-center hover:bg-glass cursor-pointer" >
          <div onClick={() => setModalOpen(true)} className="flex flex-col items-center justify-center h-full w-full text-text-muted hover:text-text-primary transition-colors">
            <div className="w-12 h-12 rounded-full border border-glass-border flex items-center justify-center mb-2">
              <Plus className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium">Add Transaction</p>
          </div>
        </BentoCard>

      </div>

      {/* FAB — Floating Action Button (Mobile only) */}
      <button
        onClick={() => setModalOpen(true)}
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 rounded-full bg-text-primary hover:bg-text-secondary text-bg-primary flex items-center justify-center shadow-glass-sm transition-transform active:scale-90 z-50"
        aria-label="Add transaction"
      >
        <Plus className="w-6 h-6" />
      </button>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddTransaction}
      />
    </div>
  )
}
