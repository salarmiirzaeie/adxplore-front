import { useMemo, useState } from 'react'
import { getApiErrorMessage } from '../api/client'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useMe } from '../hooks/useAuth'
import {
  useMyWallet,
  useRequestWithdraw,
  useWalletTransactions,
} from '../hooks/useWallets'
import { parseNumber } from '../lib/digits'
import type { WalletTxType } from '../types/api'

const TX_LABELS: Record<WalletTxType, string> = {
  TOP_UP: 'شارژ کیف پول',
  ESCROW_HOLD: 'قفل امانی (همکاری)',
  ESCROW_RELEASE: 'آزادسازی امانی',
  ESCROW_REFUND: 'برگشت امانی',
  DEAL_EARNING: 'درآمد همکاری',
  WITHDRAW_REQUEST: 'درخواست برداشت',
  WITHDRAW_DONE: 'برداشت انجام شد',
  WITHDRAW_CANCEL: 'لغو برداشت',
}

function formatToman(n: number) {
  return `${n.toLocaleString('fa-IR')} تومان`
}

export function WalletPage() {
  const { data: me } = useMe()
  const { data: wallet, isLoading, isError } = useMyWallet()
  const { data: txs = [], isLoading: loadingTx } = useWalletTransactions()
  const withdraw = useRequestWithdraw()
  const [amount, setAmount] = useState('')
  const isInfluencer = me?.role === 'INFLUENCER'
  const isBrand = me?.role === 'BRAND'

  const parsedAmount = useMemo(() => {
    const n = parseNumber(amount)
    return Number.isFinite(n) ? n : 0
  }, [amount])

  const onWithdraw = () => {
    if (parsedAmount < 10_000) return
    withdraw.mutate(parsedAmount, {
      onSuccess: () => setAmount(''),
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
      </div>
    )
  }

  if (isError || !wallet) {
    return (
      <p className="py-16 text-center text-sm text-red-600">
        بارگذاری کیف پول ناموفق بود.
      </p>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-navy">کیف پول</h1>
        <p className="mt-1 text-sm text-muted">
          {isBrand
            ? 'موجودی قابل استفاده و مبالغ قفل‌شده در همکاری‌های فعال'
            : 'درآمد همکاری‌ها و درخواست برداشت'}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface-elevated p-4">
          <p className="text-xs font-semibold text-muted">قابل استفاده</p>
          <p className="mt-2 text-lg font-extrabold text-navy">
            {formatToman(wallet.availableToman)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface-elevated p-4">
          <p className="text-xs font-semibold text-muted">
            {isBrand ? 'در امانت (همکاری)' : 'در انتظار برداشت'}
          </p>
          <p className="mt-2 text-lg font-extrabold text-purple">
            {formatToman(wallet.heldToman)}
          </p>
        </div>
        <div className="rounded-2xl border border-purple/20 bg-purple-soft/40 p-4">
          <p className="text-xs font-semibold text-purple-deep">جمع</p>
          <p className="mt-2 text-lg font-extrabold text-purple-deep">
            {formatToman(wallet.totalToman)}
          </p>
        </div>
      </div>

      {isBrand ? (
        <div className="rounded-2xl border border-border bg-surface-elevated p-4 text-sm leading-7 text-muted">
          وقتی پیشنهاد را می‌پذیرید و از زرین‌پال پرداخت می‌کنید، مبلغ در بخش
          <span className="font-bold text-navy"> «در امانت» </span>
          قفل می‌شود. بعد از تأیید تحویل، از امانت خارج و به کیف پول اینفلوئنسر
          واریز می‌شود. اگر همکاری لغو شود، مبلغ به
          <span className="font-bold text-navy"> قابل استفاده </span>
          برمی‌گردد.
        </div>
      ) : null}

      {isInfluencer ? (
        <div className="rounded-2xl border border-border bg-surface-elevated p-4">
          <h2 className="text-sm font-extrabold text-navy">درخواست برداشت</h2>
          <p className="mt-1 text-xs text-muted">
            حداقل ۱۰٬۰۰۰ تومان. پس از بررسی، واریز دستی انجام می‌شود.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <Input
                label="مبلغ (تومان)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="numeric"
                dir="ltr"
                placeholder="500000"
              />
            </div>
            <Button
              type="button"
              fullWidth={false}
              className="px-5"
              loading={withdraw.isPending}
              disabled={parsedAmount < 10_000}
              onClick={onWithdraw}
            >
              ثبت درخواست
            </Button>
          </div>
          {withdraw.isError ? (
            <p className="mt-2 text-xs text-red-600">
              {getApiErrorMessage(withdraw.error, 'برداشت ناموفق بود')}
            </p>
          ) : null}
          {withdraw.isSuccess ? (
            <p className="mt-2 text-xs font-semibold text-emerald-700">
              درخواست برداشت ثبت شد.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-surface-elevated">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-extrabold text-navy">گردش حساب</h2>
        </div>
        {loadingTx ? (
          <p className="px-4 py-8 text-center text-sm text-muted">بارگذاری…</p>
        ) : txs.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted">
            هنوز تراکنشی ثبت نشده است.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {txs.map((tx) => (
              <li
                key={tx.id}
                className="flex items-start justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-navy">
                    {TX_LABELS[tx.type] ?? tx.type}
                  </p>
                  {tx.description ? (
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {tx.description}
                    </p>
                  ) : null}
                  <p className="mt-1 text-[10px] text-muted">
                    {new Date(tx.createdAt).toLocaleString('fa-IR')}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-extrabold text-navy" dir="ltr">
                  {formatToman(tx.amountToman)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
