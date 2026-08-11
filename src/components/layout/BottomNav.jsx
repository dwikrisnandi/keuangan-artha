import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Settings,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dasbor', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { to: '/budget', label: 'Anggaran', icon: PiggyBank },
  { to: '/settings', label: 'Setelan', icon: Settings },
]

/**
 * BottomNav — Mobile bottom navigation bar
 * Fixed at the bottom, visible only on mobile (below md breakpoint)
 */
export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary/80 backdrop-blur-xl border-t border-glass-border">
      <ul className="flex items-center justify-around py-2 px-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all duration-[var(--transition-base)] ${
                  isActive
                    ? 'text-emerald-primary'
                    : 'text-text-muted hover:text-text-secondary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-xl transition-all duration-[var(--transition-base)] ${
                    isActive ? 'bg-emerald-bg' : ''
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Safe area for phones with gesture bars */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
