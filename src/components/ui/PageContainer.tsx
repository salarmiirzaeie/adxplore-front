import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  className?: string
  /** Page enter animation uses transform and breaks `position:fixed` children (e.g. chat). */
  animate?: boolean
}

/** Shared page width wrapper — applied once in AppLayout for every screen. */
export function PageContainer({
  children,
  className = '',
  animate = true,
}: PageContainerProps) {
  return (
    <div
      className={`w-full min-w-0 ${animate ? 'animate-fade-slide-in' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
