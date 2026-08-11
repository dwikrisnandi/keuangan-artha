export default function BentoCard({ children, className = '', title, colSpan = 1, rowSpan = 1 }) {
  const colClasses = {
    1: 'col-span-1',
    2: 'col-span-1 md:col-span-2',
    3: 'col-span-1 md:col-span-3',
  }
  
  const rowClasses = {
    1: 'row-span-1',
    2: 'row-span-2',
  }

  return (
    <div className={`
      relative bg-bg-secondary border border-glass-border rounded-[24px] overflow-hidden
      shadow-glass-sm transition-all duration-[var(--transition-base)]
      hover:border-glass-border-hover hover:shadow-glass
      ${colClasses[colSpan] || colClasses[1]}
      ${rowClasses[rowSpan] || rowClasses[1]}
      ${className}
    `}>
      {/* Subtle top glare effect for 3D feel */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {title && (
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-text-primary text-base font-semibold tracking-tight">{title}</h3>
        </div>
      )}
      
      <div className="p-6 h-full flex flex-col">
        {children}
      </div>
    </div>
  )
}
