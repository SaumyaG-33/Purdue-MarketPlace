export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-md font-semibold text-[13px] px-4 py-2.5 transition-colors whitespace-nowrap'
  const variants = {
    primary: 'bg-gold text-ink border border-gold-border hover:bg-gold-dark hover:text-white',
    secondary: 'bg-white text-ink border border-border-card hover:bg-surface-alt',
    ghost: 'text-text-faint hover:text-ink',
    danger: 'bg-white text-text-faint border border-border-card hover:text-ink',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`border border-border rounded-lg p-3 flex flex-col gap-2 bg-white ${className}`} {...props}>
      {children}
    </div>
  )
}

export function Chip({ children, active = false, className = '', ...props }) {
  return (
    <span
      className={`text-[11px] rounded-full border px-3 py-1.5 cursor-pointer select-none ${
        active ? 'bg-gold border-gold-border text-ink font-semibold' : 'bg-white border-border-field text-gray-600'
      } ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

export function Field({ label, className = '', children, ...props }) {
  if (children) {
    return (
      <label className="flex flex-col gap-1.5">
        {label && <span className="text-[11.5px] font-semibold text-ink">{label}</span>}
        {children}
      </label>
    )
  }
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-[11.5px] font-semibold text-ink">{label}</span>}
      <input
        className={`border border-border-field bg-surface-muted rounded-md px-3 py-2.5 text-[13px] text-ink placeholder:text-text-mono focus:outline-none focus:ring-2 focus:ring-gold ${className}`}
        {...props}
      />
    </label>
  )
}

export function TextArea({ label, className = '', ...props }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-[11.5px] font-semibold text-ink">{label}</span>}
      <textarea
        className={`border border-border-field bg-surface-muted rounded-md px-3 py-2.5 text-[13px] text-ink placeholder:text-text-mono focus:outline-none focus:ring-2 focus:ring-gold resize-none ${className}`}
        {...props}
      />
    </label>
  )
}

export function Select({ label, className = '', children, ...props }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-[11.5px] font-semibold text-ink">{label}</span>}
      <select
        className={`border border-border-field bg-surface-muted rounded-md px-3 py-2.5 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-gold ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex border-b border-border-nav bg-white">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`text-[12px] px-4 py-2.5 border-b-2 -mb-px transition-colors ${
            active === t.value ? 'border-gold text-ink font-bold' : 'border-transparent text-text-faint hover:text-ink'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function Slot({ children, state = 'default', onClick, className = '' }) {
  const states = {
    default: 'bg-white border-border-card text-ink hover:border-gold-border cursor-pointer',
    off: 'bg-surface-alt text-gray-300 border-border cursor-not-allowed',
    on: 'bg-gold border-gold-border text-ink cursor-pointer',
    selected: 'bg-gold-dark border-gold-dark text-white cursor-pointer',
  }
  return (
    <div
      onClick={state === 'off' ? undefined : onClick}
      className={`border rounded font-mono text-[10px] text-center py-2 ${states[state]} ${className}`}
    >
      {children}
    </div>
  )
}

export function Mono({ children, className = '' }) {
  return <p className={`font-mono text-[10px] text-text-mono ${className}`}>{children}</p>
}

export function P({ children, className = '' }) {
  return <p className={`text-[12px] leading-relaxed text-text-muted ${className}`}>{children}</p>
}

export function H1({ children, className = '' }) {
  return <p className={`text-[24px] font-bold leading-tight ${className}`}>{children}</p>
}

export function H2({ children, className = '' }) {
  return <p className={`text-[16px] font-semibold leading-snug ${className}`}>{children}</p>
}

export function H3({ children, className = '' }) {
  return <p className={`text-[13px] font-semibold ${className}`}>{children}</p>
}

export function Line({ className = '' }) {
  return <div className={`h-px bg-border ${className}`} />
}

export function Box({ className = '' }) {
  return <div className={`bg-box border border-border-soft rounded-md ${className}`} />
}

export function Checkbox({ label, ...props }) {
  return (
    <label className="flex items-start gap-2 cursor-pointer">
      <input type="checkbox" className="mt-0.5 accent-gold-dark" {...props} />
      <span className="text-[12px] text-text-muted leading-relaxed">{label}</span>
    </label>
  )
}
