/**
 * GlassCard — Reusable glassmorphism card component
 * Base building block for all card-like surfaces in the app
 */
export default function GlassCard({ children, className = '', hover = true, onClick, ...props }) {
  return (
    <div
      className={`${hover ? 'glass-card' : 'glass-card-static'} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e) } : undefined}
      {...props}
    >
      {children}
    </div>
  )
}
