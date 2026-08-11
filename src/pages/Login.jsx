import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Wallet, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

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
      setError('Masukkan kode akses.')
      triggerShake()
      return
    }

    if (!/^[A-Za-z0-9]{4,20}$/.test(trimmed)) {
      setError('Kode akses harus alfanumerik, 4–20 karakter.')
      triggerShake()
      return
    }

    setLoading(true)

    try {
      await login(trimmed)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Gagal masuk. Coba lagi.')
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-bg-primary px-4">
      {/* Background subtle gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08)_0%,transparent_50%)] pointer-events-none" />

      <div className={`relative w-full max-w-sm ${shake ? 'animate-shake' : ''}`}>
        {/* Logo & Branding */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-emerald-bg mx-auto mb-5 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Wallet className="w-8 h-8 text-emerald-primary" />
          </div>
          <h1 className="text-gradient text-3xl font-extrabold tracking-tight mb-1">
            Artha
          </h1>
          <p className="text-text-muted text-sm">
            Dasbor Keuangan Pribadi
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
                Kode Akses
              </label>
              <input
                id="access-code"
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  if (error) setError('')
                }}
                placeholder="Contoh: ARTHA2026"
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
              className="w-full flex items-center justify-center gap-2 bg-emerald-primary hover:bg-emerald-dark text-text-inverse font-semibold text-sm rounded-xl px-4 py-3 transition-all duration-[var(--transition-base)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Helper text */}
          <p className="text-text-muted text-[11px] text-center mt-4 leading-relaxed">
            Masukkan kode akses alfanumerik unikmu.<br />
            Kode baru akan otomatis membuat akun.
          </p>
        </form>
      </div>
    </div>
  )
}
