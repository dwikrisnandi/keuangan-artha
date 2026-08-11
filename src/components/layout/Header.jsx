import { Bell, Search } from 'lucide-react'

/**
 * Header — Top bar with greeting, search, and notification
 */
export default function Header() {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Selamat Pagi'
    if (hour < 17) return 'Selamat Siang'
    if (hour < 20) return 'Selamat Sore'
    return 'Selamat Malam'
  }

  return (
    <header className="flex items-center justify-between px-4 py-4 md:px-8 md:py-5">
      {/* Greeting */}
      <div>
        <p className="text-text-secondary text-sm">{getGreeting()} 👋</p>
        <h1 className="text-text-primary text-lg md:text-xl font-bold tracking-tight">
          Dasbor Keuangan
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search button */}
        <button
          id="btn-search"
          className="w-10 h-10 rounded-xl bg-glass flex items-center justify-center border border-glass-border hover:border-glass-border-hover transition-all duration-[var(--transition-base)] cursor-pointer"
          aria-label="Cari transaksi"
        >
          <Search className="w-4 h-4 text-text-secondary" />
        </button>

        {/* Notification button */}
        <button
          id="btn-notification"
          className="relative w-10 h-10 rounded-xl bg-glass flex items-center justify-center border border-glass-border hover:border-glass-border-hover transition-all duration-[var(--transition-base)] cursor-pointer"
          aria-label="Notifikasi"
        >
          <Bell className="w-4 h-4 text-text-secondary" />
          {/* Notification dot */}
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-primary rounded-full animate-pulse" />
        </button>
      </div>
    </header>
  )
}
