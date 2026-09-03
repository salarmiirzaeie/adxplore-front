import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { getApiErrorMessage } from '../api/client'
import { useUpsertBankCard } from '../hooks/useWallets'
import {
  formatMaskedCard,
  formatSheba,
  isValidCardNumber,
  isValidSheba,
  normalizeCardNumber,
  normalizeSheba,
} from '../lib/bank-card'
import type { BankCard } from '../types/api'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

const bankCardSchema = z.object({
  holderName: z
    .string()
    .trim()
    .min(2, 'نام صاحب کارت را وارد کنید')
    .max(80, 'نام حداکثر ۸۰ کاراکتر باشد'),
  cardNumber: z
    .string()
    .refine(isValidCardNumber, 'شماره کارت معتبر نیست'),
  sheba: z.string().refine(isValidSheba, 'شماره شبا معتبر نیست'),
})

type BankCardFormValues = z.infer<typeof bankCardSchema>

function toFormValues(card: BankCard | null): BankCardFormValues {
  return {
    holderName: card?.holderName ?? '',
    cardNumber: card?.cardNumber ?? '',
    sheba: card?.sheba ?? '',
  }
}

export function BankCardSection({ card }: { card: BankCard | null }) {
  const [editing, setEditing] = useState(!card)
  const save = useUpsertBankCard()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BankCardFormValues>({
    resolver: zodResolver(bankCardSchema),
    defaultValues: toFormValues(card),
  })

  useEffect(() => {
    reset(toFormValues(card))
    if (!card) setEditing(true)
  }, [card, reset])

  const onSubmit = handleSubmit((values) => {
    save.mutate(
      {
        holderName: values.holderName.trim(),
        cardNumber: normalizeCardNumber(values.cardNumber),
        sheba: normalizeSheba(values.sheba),
      },
      {
        onSuccess: () => setEditing(false),
      },
    )
  })

  return (
    <div className="rounded-2xl border border-border bg-surface-elevated p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-navy">کارت بانکی</h2>
          <p className="mt-1 text-xs text-muted">
            کارت و شبا برای واریز برداشت استفاده می‌شود.
          </p>
        </div>
        {card && !editing ? (
          <Button
            type="button"
            variant="outline"
            fullWidth={false}
            className="px-4 py-2 text-xs"
            onClick={() => setEditing(true)}
          >
            ویرایش
          </Button>
        ) : null}
      </div>

      {card && !editing ? (
        <div className="mt-4 space-y-2 rounded-xl border border-border bg-surface px-4 py-3">
          <p className="text-sm font-extrabold text-navy">{card.bankName}</p>
          <p className="text-sm text-navy">{card.holderName}</p>
          <p className="text-sm font-bold tracking-wide text-navy" dir="ltr">
            {formatMaskedCard(card.cardMasked)}
          </p>
          <p className="text-xs text-muted" dir="ltr">
            {formatSheba(card.sheba)}
          </p>
        </div>
      ) : (
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <Input
            label="نام صاحب کارت"
            autoComplete="name"
            error={errors.holderName?.message}
            {...register('holderName')}
          />
          <Input
            label="شماره کارت"
            inputMode="numeric"
            dir="ltr"
            placeholder="6037-9981-8181-8187"
            error={errors.cardNumber?.message}
            {...register('cardNumber')}
          />
          <Input
            label="شماره شبا"
            dir="ltr"
            placeholder="IR76 0170 0000 0000 0000 0000 01"
            hint="با یا بدون IR"
            error={errors.sheba?.message}
            {...register('sheba')}
          />
          {save.isError ? (
            <p className="text-xs text-red-600">
              {getApiErrorMessage(save.error, 'ثبت کارت ناموفق بود')}
            </p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" loading={save.isPending}>
              {card ? 'ذخیره تغییرات' : 'ثبت کارت'}
            </Button>
            {card ? (
              <Button
                type="button"
                variant="outline"
                disabled={save.isPending}
                onClick={() => {
                  reset(toFormValues(card))
                  setEditing(false)
                }}
              >
                انصراف
              </Button>
            ) : null}
          </div>
        </form>
      )}
    </div>
  )
}
