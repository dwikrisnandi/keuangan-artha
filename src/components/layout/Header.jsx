import { useState, useRef, useEffect } from 'react'
import { Bell, Search, X, Check, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'

export default function Header() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const popoverRef = useRef(null)
  
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsPopoverOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Selamat Pagi'
    if (hour < 17) return 'Selamat Siang'
    if (hour < 20) return 'Selamat Sore'
    return 'Selamat Malam'
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-primary" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-primary" />
      default: return <Info className="w-5 h-5 text-blue-primary" />
    }
  }

  return (
    <header className="flex items-center justify-between px-4 py-4 md:px-8 md:py-5 relative z-50">
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
          className="w-10 h-10 rounded-xl bg-glass flex items-center justify-center border border-glass-border hover:border-glass-border-hover transition-all duration-200 cursor-pointer"
          aria-label="Cari transaksi"
        >
          <Search className="w-4 h-4 text-text-secondary" />
        </button>

        {/* Notification wrapper */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className={`w-10 h-10 rounded-xl bg-glass flex items-center justify-center border transition-all duration-200 cursor-pointer ${isPopoverOpen ? 'border-text-primary' : 'border-glass-border hover:border-glass-border-hover'}`}
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4 text-text-secondary" />
            {/* Unread dot */}
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-primary rounded-full animate-pulse" />
            )}
          </button>

          {/* Popover */}
          {isPopoverOpen && (
            <div className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-32px)] bg-bg-card border border-glass-border rounded-2xl shadow-glass overflow-hidden animate-slide-up z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border bg-bg-secondary/50">
                <h3 className="text-sm font-bold text-text-primary">Notifikasi</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[11px] font-medium text-emerald-primary hover:text-emerald-primary/80 transition-colors cursor-pointer flex items-center gap-1">
                    <Check className="w-3 h-3" /> Tandai semua dibaca
                  </button>
                )}
              </div>
              
              <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-text-muted text-sm flex flex-col items-center gap-2">
                    <Bell className="w-6 h-6 opacity-20" />
                    Belum ada notifikasi
                  </div>
                ) : (
                  <div className="divide-y divide-glass-border">
                    {notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className={`p-4 flex gap-3 transition-colors ${notif.isRead ? 'opacity-70 bg-transparent' : 'bg-glass'}`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className="shrink-0 mt-0.5">
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1 cursor-pointer">
                          <h4 className={`text-sm font-semibold mb-1 ${notif.isRead ? 'text-text-secondary' : 'text-text-primary'}`}>{notif.title}</h4>
                          <p className="text-xs text-text-muted leading-relaxed">{notif.message}</p>
                          {!notif.isRead && (
                            <span className="inline-block mt-2 text-[10px] font-medium text-blue-primary bg-blue-primary/10 px-2 py-0.5 rounded-full">Baru</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
