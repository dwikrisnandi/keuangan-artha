import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Wallet, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'

/**
 * Login — Fullscreen minimalist login page
 * Access code authentication with shake animation on error
 */
export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  // Onboarding state
  const { changeCurrency } = useCurrency()
  const [showCurrencySetup, setShowCurrencySetup] = useState(false)
  const [detectedCurrency, setDetectedCurrency] = useState('IDR')

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const trimmed = code.trim()

    // Client-side validation
    if (!trimmed) {
      setError('Enter access code.')
      triggerShake()
      return
    }

    if (!/^[A-Za-z0-9]{4,20}$/.test(trimmed)) {
      setError('Access code must be alphanumeric, 4–20 characters.')
      triggerShake()
      return
    }

    setLoading(true)

    try {
      const userData = await login(trimmed)
      
      // Check if user has a currency code
      if (!userData.currency_code) {
        // Auto detect based on timezone
        let guessed = 'IDR'
        try {
           const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
           if (tz.includes('America')) guessed = 'USD'
           else if (tz.includes('Europe')) guessed = 'EUR'
           else if (tz.includes('London')) guessed = 'GBP'
           else if (tz.includes('Singapore')) guessed = 'SGD'
        } catch(e){}
        
        setDetectedCurrency(guessed)
        setShowCurrencySetup(true)
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Login failed. Try again.')
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  if (showCurrencySetup) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-bg-primary px-4 animate-fade-in">
        <div className="glass-card-static p-8 w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-primary/10 border border-emerald-primary/20 mx-auto mb-5 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-emerald-primary" />
          </div>
          <h2 className="text-text-primary text-2xl font-bold tracking-tight mb-2">Welcome!</h2>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            We've detected your region.<br/>Please confirm your preferred currency.
          </p>
          
          <select 
             value={detectedCurrency} 
             onChange={(e) => setDetectedCurrency(e.target.value)}
             className="w-full bg-bg-primary/60 border border-glass-border rounded-xl px-4 py-3 mb-6 text-text-primary text-sm focus:outline-none focus:border-emerald-primary/50 transition-all cursor-pointer"
          >
             <option value="IDR">IDR (Indonesian Rupiah)</option>
             <option value="USD">USD (US Dollar)</option>
             <option value="EUR">EUR (Euro)</option>
             <option value="GBP">GBP (British Pound)</option>
             <option value="SGD">SGD (Singapore Dollar)</option>
          </select>
          
          <button 
            onClick={async () => {
              setLoading(true)
              await changeCurrency(detectedCurrency)
              navigate('/', { replace: true })
            }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-text-primary text-bg-primary font-semibold text-sm rounded-xl px-4 py-3 transition-all duration-[var(--transition-base)] disabled:opacity-50 hover:opacity-90 active:scale-[0.98] cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue to Dashboard'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-bg-primary px-4">
      <div className={`relative w-full max-w-sm ${shake ? 'animate-shake' : ''}`}>
        {/* Logo & Branding */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="w-12 h-12 rounded-xl bg-bg-secondary border border-glass-border mx-auto mb-5 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-text-primary" />
          </div>
          <h1 className="text-text-primary text-3xl font-semibold tracking-tight mb-1">
            Artha
          </h1>
          <p className="text-text-secondary text-sm">
            Personal Finance Dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="animate-slide-up">
          <div className="glass-card-static p-6 space-y-5">
            {/* Input */}
            <div>
              <label
                htmlFor="access-code"
                className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wider"
              >
                Access Code
              </label>
              <input
                id="access-code"
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  if (error) setError('')
                }}
                placeholder="Example: ARTHA2026"
                maxLength={20}
                autoComplete="off"
                autoFocus
                disabled={loading}
                className="w-full bg-bg-primary/60 border border-glass-border rounded-xl px-4 py-3 text-text-primary text-sm font-mono tracking-widest placeholder:text-text-muted/50 placeholder:font-sans placeholder:tracking-normal focus:outline-none focus:border-emerald-primary/50 focus:ring-1 focus:ring-emerald-primary/20 transition-all duration-[var(--transition-base)] disabled:opacity-50"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 text-rose-primary text-xs bg-rose-bg rounded-xl px-3 py-2.5 animate-fade-in">
                <span className="shrink-0 mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-text-primary text-bg-primary font-semibold text-sm rounded-xl px-4 py-3 transition-all duration-[var(--transition-base)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:opacity-90 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Login
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Helper text */}
          <p className="text-text-muted text-[11px] text-center mt-4 leading-relaxed">
            Only valid codes can be used.<br />
            Please request an access code from the Admin.
          </p>
        </form>
      </div>
    </div>
  )
}
