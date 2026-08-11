import { useState, useEffect } from 'react'
import { LogOut, KeyRound, Shield, Bell, Moon, Smartphone, Sun } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import BentoCard from '../components/ui/BentoCard'

export default function Settings() {
  const { user, logout } = useAuth()
  const [isDark, setIsDark] = useState(false)

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setIsDark(true)
      document.documentElement.setAttribute('data-theme', 'dark')
    } else if (savedTheme === 'light') {
      setIsDark(false)
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(prefersDark)
    }
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    const newTheme = newIsDark ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-0 max-w-4xl">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-text-primary text-xl font-bold tracking-tight">Setelan</h2>
        <p className="text-text-secondary text-sm">Kelola profil dan preferensi aplikasi Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Info */}
        <BentoCard colSpan={1} md:colSpan={2} title="Informasi Akun">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-glass flex items-center justify-center shrink-0 border border-glass-border">
              <span className="text-2xl font-bold text-text-primary">
                {user?.access_code?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary mb-1">Pengguna Artha</h3>
              <div className="flex items-center gap-2 text-text-secondary text-sm mb-4">
                <KeyRound className="w-4 h-4" />
                <span className="font-mono bg-bg-primary px-2 py-0.5 rounded border border-glass-border">
                  {user?.access_code}
                </span>
              </div>
              <p className="text-text-muted text-xs leading-relaxed max-w-md">
                Ini adalah kode akses unik Anda. Simpan kode ini baik-baik karena berfungsi sebagai identitas Anda untuk masuk ke aplikasi.
              </p>
            </div>
          </div>
        </BentoCard>

        {/* Security / Logout */}
        <BentoCard colSpan={1} title="Keamanan">
          <div className="flex flex-col h-full justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <Shield className="w-5 h-5 text-emerald-primary" />
                <span>Enkripsi Aktif</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <Smartphone className="w-5 h-5 text-text-primary" />
                <span>Sesi Perangkat Saat Ini</span>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-primary/10 text-rose-primary font-semibold text-sm hover:bg-rose-primary hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Keluar Akun
            </button>
          </div>
        </BentoCard>

        {/* Preferences */}
        <BentoCard colSpan={1} md:colSpan={3} title="Preferensi Aplikasi">
          <div className="divide-y divide-glass-border">
            
            {/* Theme Toggle */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-glass flex items-center justify-center">
                  {isDark ? <Moon className="w-5 h-5 text-text-primary" /> : <Sun className="w-5 h-5 text-text-primary" />}
                </div>
                <div>
                  <h4 className="text-text-primary font-medium text-sm">Mode Gelap</h4>
                  <p className="text-text-muted text-xs">Ubah tema aplikasi sesuai kenyamanan mata</p>
                </div>
              </div>
              {/* Toggle switch */}
              <button 
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${isDark ? 'bg-emerald-primary' : 'bg-glass-border'}`}
                aria-label="Toggle Dark Mode"
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${isDark ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {/* Notification Toggle (Mock) */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-glass flex items-center justify-center">
                  <Bell className="w-5 h-5 text-text-primary" />
                </div>
                <div>
                  <h4 className="text-text-primary font-medium text-sm">Notifikasi Pengingat</h4>
                  <p className="text-text-muted text-xs">Ingatkan untuk mencatat pengeluaran harian</p>
                </div>
              </div>
              <button className="w-12 h-6 rounded-full bg-glass-border relative cursor-not-allowed opacity-50">
                <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-text-muted" />
              </button>
            </div>

          </div>
        </BentoCard>

      </div>
    </div>
  )
}
