import { TrendingUp, TrendingDown } from 'lucide-react'
import GlassCard from '../ui/GlassCard'

/**
 * StatCard — Displays a financial statistic (balance, income, expense)
 * @param {string} title - Card label
 * @param {string} value - Formatted currency value
 * @param {string} subtitle - Additional context (e.g. "vs bulan lalu")
 * @param {'income'|'expense'|'balance'|'info'} variant - Color variant
 * @param {React.ReactNode} icon - Lucide icon component
 * @param {string} trend - Trend percentage text (e.g. "+12%")
 * @param {'up'|'down'} trendDir - Trend direction
 */
export default function StatCard({
  title,
  value,
  subtitle,
  variant = 'balance',
  icon: Icon,
  trend,
  trendDir = 'up',
}) {
  const variantStyles = {
    income: {
      iconBg: 'bg-emerald-bg',
      iconColor: 'text-emerald-primary',
      glow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    },
    expense: {
      iconBg: 'bg-rose-bg',
      iconColor: 'text-rose-primary',
      glow: 'hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]',
    },
    balance: {
      iconBg: 'bg-blue-bg',
      iconColor: 'text-blue-primary',
      glow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    },
    info: {
      iconBg: 'bg-amber-bg',
      iconColor: 'text-amber-primary',
      glow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    },
  }

  const style = variantStyles[variant] || variantStyles.balance

  return (
    <GlassCard className={`p-5 ${style.glow}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${style.iconBg} flex items-center justify-center`}>
          {Icon && <Icon className={`w-5 h-5 ${style.iconColor}`} />}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
            trendDir === 'up'
              ? 'bg-emerald-bg text-emerald-primary'
              : 'bg-rose-bg text-rose-primary'
          }`}>
            {trendDir === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <p className="text-text-secondary text-[13px] font-medium mb-1.5">{title}</p>
      <p className="text-text-primary text-xl font-semibold tracking-tight">{value}</p>
      {subtitle && (
        <p className="text-text-muted text-xs mt-2.5">{subtitle}</p>
      )}
    </GlassCard>
  )
}
