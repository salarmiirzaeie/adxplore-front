import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useQueryClient } from '@tanstack/react-query'

export function PaymentResultPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const ok = params.get('ok') === '1'
  const offerId = params.get('offerId') || ''
  const dealId = params.get('dealId') || ''
  const refId = params.get('refId') || ''
  const error = params.get('error') || ''

  const errorLabel = useMemo(() => {
    switch (error) {
      case 'cancelled':
        return 'پرداخت لغو شد یا انجام نشد.'
      case 'verify_failed':
        return 'تأیید پرداخت از زرین‌پال ناموفق بود.'
      case 'not_found':
        return 'تراکنش پیدا نشد.'
      case 'missing_authority':
        return 'کد پیگیری پرداخت ناقص است.'
      default:
        return 'پرداخت ناموفق بود.'
    }
  }, [error])

  useEffect(() => {
    qc.invalidateQueries({ queryKey: ['deals'] })
    qc.invalidateQueries({ queryKey: ['payments'] })
    qc.invalidateQueries({ queryKey: ['conversations'] })
    qc.invalidateQueries({ queryKey: ['offers'] })
  }, [qc])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div
        className={`mb-4 flex size-16 items-center justify-center rounded-2xl text-2xl ${
          ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
        }`}
      >
        {ok ? '✓' : '✕'}
      </div>
      <h1 className="text-xl font-extrabold text-navy">
        {ok ? 'پرداخت موفق بود' : 'پرداخت تکمیل نشد'}
      </h1>
      <p className="mt-2 max-w-md text-sm leading-7 text-muted">
        {ok
          ? 'مبلغ در حساب امانی قرار گرفت و همکاری شروع شد.'
          : errorLabel}
      </p>
      {ok && refId ? (
        <p className="mt-3 text-xs text-muted" dir="ltr">
          کد پیگیری: {refId}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {offerId ? (
          <Button
            type="button"
            fullWidth={false}
            className="px-5"
            onClick={() => navigate(`/app/messages/${offerId}`, { replace: true })}
          >
            بازگشت به گفتگو
          </Button>
        ) : (
          <Button
            type="button"
            fullWidth={false}
            className="px-5"
            onClick={() => navigate('/app/messages', { replace: true })}
          >
            پیام‌ها
          </Button>
        )}
        {!ok && dealId ? (
          <Link
            to={offerId ? `/app/messages/${offerId}` : '/app/messages'}
            className="text-sm font-bold text-purple"
          >
            تلاش مجدد از گفتگو
          </Link>
        ) : null}
      </div>
    </div>
  )
}
