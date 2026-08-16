import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, ArrowDownLeft, ArrowUpRight, Trash2, Filter } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useCurrency } from '../context/CurrencyContext'
import { getTransactions, deleteTransaction } from '../utils/api'
import { formatCurrency } from '../utils/formatCurrency'
import BentoCard from '../components/ui/BentoCard'
import Skeleton from '../components/ui/Skeleton'

export default function Transactions() {
  const { user } = useAuth()
  const { currencyCode } = useCurrency()
  const { success, error: showError } = useToast()
  
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // all, income, expense

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

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return
    try {
      await deleteTransaction(id, user.id)
      success('Transaction deleted.')
      await fetchData()
    } catch (err) {
      showError(err.message)
    }
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = (tx.description || tx.category).toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === 'all' || tx.type === filterType
      return matchesSearch && matchesType
    })
  }, [transactions, searchQuery, filterType])

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  if (loading && transactions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4"><Skeleton className="h-10 w-full md:w-64" /><Skeleton className="h-10 w-32" /></div>
        <BentoCard><Skeleton className="h-[400px] w-full" /></BentoCard>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h2 className="text-text-primary text-xl font-bold tracking-tight">All Transactions</h2>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-text-muted" />
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-glass-border rounded-xl leading-5 bg-bg-secondary text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary transition-colors sm:text-sm"
            />
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none block w-full pl-3 pr-8 py-2 border border-glass-border rounded-xl bg-bg-secondary text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary transition-colors sm:text-sm cursor-pointer"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <Filter className="h-3.5 w-3.5 text-text-muted" />
            </div>
          </div>
        </div>
      </div>

      <BentoCard className="!p-0 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-glass-border/30 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-text-muted" />
            </div>
            <p className="text-text-primary font-medium mb-1">No transactions found</p>
            <p className="text-text-secondary text-sm">Try adjusting your search keywords or filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-glass-border">
            {filteredTransactions.map(tx => (
              <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-glass-hover transition-colors group gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    tx.type === 'income' ? 'bg-emerald-primary/10 text-emerald-primary' : 'bg-rose-primary/10 text-rose-primary'
                  }`}>
                    {tx.type === 'income' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-text-primary font-semibold tracking-tight">{tx.description || tx.category}</p>
                    <p className="text-text-muted text-sm">{tx.category} • {formatDate(tx.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-16 sm:pl-0">
                  <div className={`font-semibold ${tx.type === 'income' ? 'text-emerald-primary' : 'text-rose-primary'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currencyCode)}
                  </div>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="p-2 rounded-lg hover:bg-rose-primary/10 text-text-muted hover:text-rose-primary transition-colors focus:outline-none"
                    aria-label="Delete transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </BentoCard>
    </div>
  )
}
