import { useState } from 'react'
import { useLogout } from '../hooks/useAuth'
import { ConfirmModal } from './ui/ConfirmModal'

const logoutIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2M14 12H4m0 0l3-3M4 12l3 3"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

type LogoutButtonProps = {
  collapsed?: boolean
}

export function LogoutButton({ collapsed = false }: LogoutButtonProps) {
  const logout = useLogout()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="خروج از حساب"
        className={`flex w-full items-center rounded-xl border border-border text-sm font-semibold text-navy-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 ${
          collapsed ? 'justify-center px-2 py-2.5' : 'justify-center gap-2 px-3 py-2.5'
        }`}
      >
        {logoutIcon}
        {!collapsed ? 'خروج از حساب' : null}
      </button>
      <ConfirmModal
        open={open}
        title="خروج از حساب؟"
        description="برای ورود دوباره باید کد تأیید بگیرید."
        confirmLabel="خروج"
        tone="danger"
        onConfirm={logout}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
