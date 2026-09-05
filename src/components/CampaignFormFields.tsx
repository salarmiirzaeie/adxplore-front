import type { ReactNode } from 'react'
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from 'react-hook-form'
import { IranCitySelect } from './IranCitySelect'
import { Input } from './ui/Input'
import { OptionGrid } from './ui/OptionGrid'
import { Textarea } from './ui/Textarea'
import { BRAND_CATEGORIES, DELIVERABLE_TYPES } from '../lib/brand-options'
import type { CampaignFormValues } from '../lib/campaign-form'

export function CampaignFormFields({
  register,
  control,
  errors,
  watch,
  setValue,
  afterBrief,
}: {
  register: UseFormRegister<CampaignFormValues>
  control: Control<CampaignFormValues>
  errors: FieldErrors<CampaignFormValues>
  watch: UseFormWatch<CampaignFormValues>
  setValue: UseFormSetValue<CampaignFormValues>
  afterBrief?: ReactNode
}) {
  return (
    <>
      <Input
        label="عنوان کمپین"
        placeholder="مثلاً لانچ محصول تابستانی"
        error={errors.title?.message}
        {...register('title')}
      />

      <Textarea
        label="بریف / توضیح"
        placeholder="هدف کمپین، پیام کلیدی و انتظارات از بلاگر را بنویسید."
        error={errors.brief?.message}
        {...register('brief')}
      />

      {afterBrief}

      <Controller
        name="categories"
        control={control}
        render={({ field }) => (
          <OptionGrid
            label="دسته"
            options={BRAND_CATEGORIES}
            value={field.value}
            onChange={(v) =>
              field.onChange(Array.isArray(v) ? v : v ? [v] : [])
            }
            error={errors.categories?.message}
            multiple
          />
        )}
      />

      <IranCitySelect
        allowNationwide
        province={watch('province')}
        city={watch('city')}
        provinceError={errors.province?.message}
        cityError={errors.city?.message}
        onChange={({ province, city }) => {
          setValue('province', province, { shouldValidate: true })
          setValue('city', city, { shouldValidate: true })
        }}
      />

      <Controller
        name="deliverables"
        control={control}
        render={({ field }) => (
          <OptionGrid
            label="نوع محتوا"
            options={DELIVERABLE_TYPES}
            value={field.value}
            onChange={(v) =>
              field.onChange(Array.isArray(v) ? v : v ? [v] : [])
            }
            error={errors.deliverables?.message}
            multiple
          />
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="حداقل بودجه (تومان)"
          inputMode="numeric"
          dir="ltr"
          className="text-left"
          placeholder="اختیاری"
          hint="اختیاری"
          error={errors.budgetMin?.message}
          {...register('budgetMin')}
        />
        <Input
          label="حداکثر بودجه (تومان)"
          inputMode="numeric"
          dir="ltr"
          className="text-left"
          placeholder="اختیاری"
          hint="اختیاری"
          error={errors.budgetMax?.message}
          {...register('budgetMax')}
        />
      </div>
    </>
  )
}
