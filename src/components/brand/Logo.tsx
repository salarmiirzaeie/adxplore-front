import { useId } from 'react'

type LogoProps = {
  variant?: 'full' | 'icon'
  theme?: 'light' | 'dark'
  className?: string
  showEnglish?: boolean
}

function LogoMark({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '')
  const gradId = `ig-adx-${uid}`

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="AdXplore"
    >
      <defs>
        <linearGradient id={gradId} x1="2" y1="30" x2="30" y2="2">
          <stop offset="0%" stopColor="#5B21B6" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${gradId})`} />
      <rect x="6" y="6" width="20" height="20" rx="5.5" stroke="white" strokeWidth="1.75" fill="none" />
      <circle cx="16" cy="16" r="5.5" stroke="white" strokeWidth="1.75" fill="none" />
      <path
        d="M13.5 18L16 14.5M18.5 18L16 14.5"
        stroke="white"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22" cy="9.5" r="1.3" fill="white" />
    </svg>
  )
}

export function Logo({
  variant = 'full',
  theme = 'dark',
  className = '',
  showEnglish = true,
}: LogoProps) {
  const persianClass = theme === 'light' ? 'text-white' : 'text-navy'
  const englishClass = theme === 'light' ? 'text-slate-400' : 'text-muted'

  if (variant === 'icon') {
    return <LogoMark className={className} />
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" />
      <div className="flex flex-col leading-none">
        <span className={`text-[1.05rem] font-extrabold tracking-tight sm:text-[1.15rem] ${persianClass}`}>
          ادکسپلور
        </span>
        {showEnglish ? (
          <span
            className={`mt-1 text-[10px] font-bold tracking-[0.18em] uppercase sm:text-[11px] ${englishClass}`}
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            AdXplore
          </span>
        ) : null}
      </div>
    </div>
  )
}
