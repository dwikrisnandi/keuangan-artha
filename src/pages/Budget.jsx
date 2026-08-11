import { PiggyBank } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'

/**
 * Budget — Budget management page (placeholder)
 */
export default function Budget() {
  return (
    <div className="animate-fade-in">
      <h2 className="text-text-primary text-xl font-bold mb-6">Anggaran</h2>
      <GlassCard hover={false} className="p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 rounded-2xl bg-glass flex items-center justify-center mb-4">
          <PiggyBank className="w-8 h-8 text-text-muted" />
        </div>
        <p className="text-text-secondary text-sm font-medium mb-1">Halaman Anggaran</p>
        <p className="text-text-muted text-xs text-center max-w-xs">
          Atur anggaran bulananmu dan pantau progresnya di sini. Fitur ini sedang dalam pengembangan.
        </p>
      </GlassCard>
    </div>
  )
}
