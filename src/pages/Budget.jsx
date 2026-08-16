import { useState, useEffect, useCallback, useMemo } from 'react'
import { PiggyBank, TrendingDown, Target, AlertCircle, ArrowDownRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useCurrency } from '../context/CurrencyContext'
import { getTransactions } from '../utils/api'
import { formatCurrency } from '../utils/formatCurrency'
import BentoCard from '../components/ui/BentoCard'
import Skeleton from '../components/ui/Skeleton'

export default function Budget() {
  const { user } = useAuth()
  const { currencyCode } = useCurrency()
  const { error: showError } = useToast()
  
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

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

    const kebutuhan = thisMonth.filter((tx) => tx.type === 'expense' && (tx.category === 'Needs' || tx.category === 'Kebutuhan')).reduce((sum, tx) => sum + tx.amount, 0)
    const keinginan = thisMonth.filter((tx) => tx.type === 'expense' && (tx.category === 'Wants' || tx.category === 'Keinginan')).reduce((sum, tx) => sum + tx.amount, 0)
    const tabungan = thisMonth.filter((tx) => tx.type === 'expense' && (tx.category === 'Savings' || tx.category === 'Tabungan')).reduce((sum, tx) => sum + tx.amount, 0)

    return {
      totalIncome,
      totalExpense,
      budget: [
        { label: 'Needs', description: 'Rent, electricity, groceries', pct: 50, spent: kebutuhan, limit: totalIncome * 0.5, colorClass: 'bg-emerald-primary' },
        { label: 'Wants', description: 'Entertainment, dining out, hobbies', pct: 30, spent: keinginan, limit: totalIncome * 0.3, colorClass: 'bg-amber-primary' },
        { label: 'Savings', description: 'Investments, emergency fund', pct: 20, spent: tabungan, limit: totalIncome * 0.2, colorClass: 'bg-blue-primary' },
      ],
    }
  }, [transactions])

  if (loading && transactions.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BentoCard><Skeleton className="h-[200px]" /></BentoCard>
          <BentoCard><Skeleton className="h-[200px]" /></BentoCard>
          <BentoCard><Skeleton className="h-[200px]" /></BentoCard>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
      <div className="flex flex-col gap-1">
        <h2 className="text-text-primary text-xl font-bold tracking-tight">50/30/20 Budget</h2>
        <p className="text-text-secondary text-sm">Manage your ideal financial ratio based on this month's income.</p>
      </div>

      {metrics.totalIncome === 0 ? (
        <BentoCard className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="w-16 h-16 rounded-full bg-glass-border/30 flex items-center justify-center mb-4">
            <PiggyBank className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-text-primary font-semibold mb-2">No Income Yet</h3>
          <p className="text-text-secondary text-sm max-w-md">
            The 50/30/20 budget system requires income data to calculate your budget limits. Please add income first.
          </p>
        </BentoCard>
      ) : (
        <div className="space-y-6">
          {/* Summary Card */}
          <BentoCard className="bg-gradient-to-br from-bg-secondary to-bg-tertiary !border-glass-border-hover">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="mb-6">
                <p className="text-text-secondary text-sm mb-1 uppercase tracking-wider font-medium">Total Income</p>
                <h3 className="text-text-primary text-3xl font-bold tracking-tight">{formatCurrency(metrics.totalIncome, currencyCode)}</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-primary/10 flex items-center justify-center">
                  <ArrowDownRight className="w-5 h-5 text-rose-primary" />
                </div>
                <div>
                  <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Total Expense</p>
                  <p className="text-text-primary font-bold">{formatCurrency(metrics.totalExpense, currencyCode)}</p>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Budget Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.budget.map(({ label, description, pct, spent, limit, colorClass }) => {
              const progress = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
              const isOver = spent > limit
              const remaining = limit - spent

              return (
                <BentoCard key={label} className="relative overflow-hidden group">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                      <h3 className="text-text-primary font-bold text-lg">{label} ({pct}%)</h3>
                    </div>
                    <p className="text-text-muted text-xs">{description}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-text-secondary">{label}</span>
                        <span className="font-semibold text-text-primary">{formatCurrency(spent, currencyCode)}</span>
                      </div>
                      <div className="h-2.5 bg-bg-primary rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ease-out rounded-full ${
                            isOver ? 'bg-rose-primary' : colorClass
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-glass-border">
                      <div className="flex justify-between text-xs mt-2">
                        <span className="text-text-muted">Budget:</span>
                        <span className="font-medium text-text-primary">{formatCurrency(limit, currencyCode)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-text-secondary">Remaining</span>
                        <div className={`mt-2 text-xs font-medium ${isOver ? 'text-rose-primary' : 'text-emerald-primary'}`}>
                        {isOver ? 'Over budget: ' : 'Remaining: '}
                        {isOver ? '-' : ''}{formatCurrency(Math.abs(remaining), currencyCode)}
                        </div>
                      </div>
                    </div>

                    {isOver && (
                      <div className="mt-4 p-3 rounded-xl bg-rose-primary/10 border border-rose-primary/20 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-primary shrink-0 mt-0.5" />
                        <span className="text-rose-primary text-xs leading-relaxed">
                          You have exceeded your {label} budget this month by {formatCurrency(Math.abs(remaining), currencyCode)}.
                        </span>
                      </div>
                    )}
                  </div>
                </BentoCard>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
