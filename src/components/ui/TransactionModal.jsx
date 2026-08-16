import { useState } from 'react'
import { X, Loader2, TrendingUp, TrendingDown } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useCurrency } from '../../context/CurrencyContext'

const EXPENSE_CATEGORIES = [
  { value: 'Needs', label: 'Needs (50%)' },
  { value: 'Wants', label: 'Wants (30%)' },
  { value: 'Savings', label: 'Savings (20%)' },
]

/**
 * TransactionModal — Glassmorphism modal form for adding transactions
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {function} onSubmit - async (txData) => void
 */
export default function TransactionModal({ isOpen, onClose, onSubmit }) {
  const { currencyCode } = useCurrency()
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('Needs')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const resetForm = () => {
    setType('expense')
    setAmount('')
    setDate(new Date().toISOString().split('T')[0])
    setCategory('Kebutuhan')
    setDescription('')
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) {
      setError('Amount must be greater than 0.')
      return
    }
    if (!date) {
      setError('Category is required for expenses.')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        type,
        amount: numAmount,
        category: type === 'income' ? 'Income' : category,
        description: description.trim() || null,
        date,
      })
      resetForm()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save transaction.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-bg-primary/60 border border-glass-border rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-emerald-primary/50 focus:ring-1 focus:ring-emerald-primary/20 transition-all duration-[var(--transition-base)]'

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 mb-0 sm:mb-0 animate-slide-up">
        <div className="glass-card-static rounded-t-2xl sm:rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-glass-border">
            <h3 className="text-text-primary text-base font-semibold">Add Transaction</h3>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg bg-glass flex items-center justify-center hover:bg-glass-hover transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Type toggle */}
            <div>
              <label className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wider">
                Transaction Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setType('income')
                    setCategory('Income')
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    type === 'income'
                      ? 'bg-emerald-bg text-emerald-primary border border-emerald-primary/30'
                      : 'bg-glass text-text-secondary border border-glass-border hover:border-glass-border-hover'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('expense')
                    setCategory('Needs')
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    type === 'expense'
                      ? 'bg-rose-bg text-rose-primary border border-rose-primary/30'
                      : 'bg-glass text-text-secondary border border-glass-border hover:border-glass-border-hover'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  Expense
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="tx-amount" className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wider">
                Amount ({currencyCode || 'IDR'})
              </label>
              <input
                id="tx-amount"
                type="number"
                min="0"
                step={(currencyCode || 'IDR').toUpperCase() === 'IDR' ? '1000' : '0.01'}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
                className={`${inputClass} font-mono text-lg`}
              />
            </div>

            {/* Date */}
            <div>
              <label htmlFor="tx-date" className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wider">
                Date
              </label>
              <input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            {/* Category — only for expense */}
            {type === 'expense' && (
              <div className="animate-fade-in">
                <label htmlFor="tx-category" className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wider">
                  Expense Category
                </label>
                <select
                  id="tx-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`${inputClass} cursor-pointer`}
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Description */}
            <div>
              <label htmlFor="tx-desc" className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wider">
                Description <span className="text-text-muted">(optional)</span>
              </label>
              <input
                id="tx-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Example: Monthly salary"
                maxLength={255}
                className={inputClass}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 text-rose-primary text-xs bg-rose-bg rounded-xl px-3 py-2.5 animate-fade-in">
                <span className="shrink-0 mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-text-secondary bg-glass border border-glass-border hover:bg-glass-hover transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] ${
                  type === 'income'
                    ? 'bg-emerald-primary hover:bg-emerald-dark text-text-inverse hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    : 'bg-rose-primary hover:bg-rose-dark text-white hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                }`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  )
}
