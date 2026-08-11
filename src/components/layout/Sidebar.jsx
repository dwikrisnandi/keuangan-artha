import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Settings,
  Wallet,
  LogOut
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/', label: 'Dasbor', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { to: '/budget', label: 'Anggaran', icon: PiggyBank },
  { to: '/settings', label: 'Pengaturan', icon: Settings },
]

/**
 * Sidebar — Desktop navigation with glassmorphism
 * Hidden on mobile, visible from md breakpoint
 */
export default function Sidebar() {
  const { logout } = useAuth()
  
  return (
    <aside className="hidden md:flex flex-col w-[240px] lg:w-[260px] min-h-screen border-r border-glass-border bg-glass backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-glass-border">
        <div className="w-9 h-9 rounded-xl bg-emerald-bg flex items-center justify-center">
          <Wallet className="w-5 h-5 text-emerald-primary" />
        </div>
        <div>
          <h2 className="text-text-primary text-sm font-bold tracking-tight">Artha</h2>
          <p className="text-text-muted text-[11px]">Keuangan Pribadi</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-[var(--transition-base)] ${
                    isActive
                      ? 'bg-emerald-bg text-emerald-primary shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                      : 'text-text-secondary hover:text-text-primary hover:bg-glass-hover'
                  }`
                }
              >
                <Icon className="w-[18px] h-[18px]" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="px-4 py-4 border-t border-glass-border space-y-2">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-primary hover:bg-rose-primary/10 transition-all duration-[var(--transition-base)] cursor-pointer"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Keluar
        </button>
        <div className="glass-card p-3 text-center rounded-xl bg-glass border border-glass-border">
          <p className="text-text-muted text-[11px]">Versi 1.0.0</p>
        </div>
      </div>
    </aside>
  )
}
