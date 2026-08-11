import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingCart,
  Coffee,
  Zap,
  Home,
} from 'lucide-react'
import StatCard from '../components/cards/StatCard'
import GlassCard from '../components/ui/GlassCard'

/** Sample recent transactions for demonstration */
const recentTransactions = [
  { id: 1, name: 'Gaji Bulanan', amount: 12500000, type: 'income', icon: ArrowDownLeft, date: '1 Agu 2026' },
  { id: 2, name: 'Belanja Groceries', amount: 450000, type: 'expense', icon: ShoppingCart, date: '3 Agu 2026' },
  { id: 3, name: 'Kopi & Snack', amount: 75000, type: 'expense', icon: Coffee, date: '4 Agu 2026' },
  { id: 4, name: 'Listrik & Air', amount: 620000, type: 'expense', icon: Zap, date: '5 Agu 2026' },
  { id: 5, name: 'Freelance Project', amount: 3500000, type: 'income', icon: ArrowDownLeft, date: '7 Agu 2026' },
  { id: 6, name: 'Sewa Kos', amount: 2000000, type: 'expense', icon: Home, date: '10 Agu 2026' },
]

/**
 * formatRupiah — Format number to Indonesian Rupiah
 */
function formatRupiah(num) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * Dashboard — Main overview page
 */
export default function Dashboard() {
  return (
    <div className="space-y-6 stagger-children">
      {/* Stat cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Saldo"
          value={formatRupiah(24850000)}
          subtitle="Semua akun"
          variant="balance"
          icon={Wallet}
          trend="+8.2%"
          trendDir="up"
        />
        <StatCard
          title="Pemasukan"
          value={formatRupiah(16000000)}
          subtitle="Bulan ini"
          variant="income"
          icon={TrendingUp}
          trend="+12.5%"
          trendDir="up"
        />
        <StatCard
          title="Pengeluaran"
          value={formatRupiah(3145000)}
          subtitle="Bulan ini"
          variant="expense"
          icon={TrendingDown}
          trend="-4.1%"
          trendDir="down"
        />
        <StatCard
          title="Tabungan"
          value={formatRupiah(12855000)}
          subtitle="Target: Rp20.000.000"
          variant="info"
          icon={Target}
          trend="64%"
          trendDir="up"
        />
      </div>

      {/* Recent transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-text-primary text-lg font-semibold">Transaksi Terakhir</h2>
          <button className="text-emerald-primary text-sm font-medium hover:text-emerald-light transition-colors cursor-pointer">
            Lihat Semua
          </button>
        </div>

        <GlassCard hover={false} className="divide-y divide-glass-border overflow-hidden">
          {recentTransactions.map(({ id, name, amount, type, icon: TxIcon, date }) => (
            <div
              key={id}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-glass-hover transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  type === 'income' ? 'bg-emerald-bg' : 'bg-rose-bg'
                }`}>
                  <TxIcon className={`w-4 h-4 ${
                    type === 'income' ? 'text-emerald-primary' : 'text-rose-primary'
                  }`} />
                </div>
                <div>
                  <p className="text-text-primary text-sm font-medium">{name}</p>
                  <p className="text-text-muted text-xs">{date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${
                  type === 'income' ? 'text-emerald-primary' : 'text-rose-primary'
                }`}>
                  {type === 'income' ? '+' : '-'}{formatRupiah(amount)}
                </p>
              </div>
            </div>
          ))}
        </GlassCard>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-text-primary text-lg font-semibold mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Tambah Pemasukan', icon: ArrowDownLeft, color: 'emerald' },
            { label: 'Tambah Pengeluaran', icon: ArrowUpRight, color: 'rose' },
            { label: 'Atur Anggaran', icon: Target, color: 'amber' },
            { label: 'Lihat Laporan', icon: TrendingUp, color: 'blue' },
          ].map(({ label, icon: ActionIcon, color }) => (
            <GlassCard key={label} className="p-4 flex flex-col items-center gap-3 cursor-pointer">
              <div className={`w-11 h-11 rounded-xl bg-${color}-bg flex items-center justify-center`}>
                <ActionIcon className={`w-5 h-5 text-${color}-primary`} />
              </div>
              <p className="text-text-secondary text-xs font-medium text-center">{label}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  )
}
