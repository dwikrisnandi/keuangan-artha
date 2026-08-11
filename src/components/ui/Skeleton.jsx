export default function Skeleton({ className = '', variant = 'rectangular' }) {
  const baseClass = 'animate-pulse bg-glass-border/50'
  
  const variants = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded-md',
  }

  return (
    <div className={`${baseClass} ${variants[variant]} ${className}`} />
  )
}
