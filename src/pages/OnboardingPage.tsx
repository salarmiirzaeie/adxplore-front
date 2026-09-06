import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { AuthLayout } from "../components/AuthLayout";
import { brandFormToUpdateBody, brandProfileSchema, type BrandProfileFormValues } from "../components/BrandProfileForm";
import {
  influencerFormToUpdateBody,
  influencerProfileSchema,
  type InfluencerProfileFormValues,
} from "../components/InfluencerProfileForm";
import { ProfilePhotoEditor } from "../components/ProfilePhotoEditor";
import { AudienceProofsEditor } from "../components/AudienceProofsEditor";
import { IranCitySelect } from "../components/IranCitySelect";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { OptionGrid } from "../components/ui/OptionGrid";
import { Textarea } from "../components/ui/Textarea";
import { useMe, useUpdateProfile } from "../hooks/useAuth";
import { getAccessToken, isProfileComplete, postAuthPath } from "../lib/auth-storage";
import {
  BRAND_CATEGORIES,
  BRAND_GOALS,
  BUSINESS_SIZES,
  FOLLOWER_RANGES,
  INFLUENCER_CATEGORIES,
} from "../lib/brand-options";
import type { AudienceProof } from "../types/api";

const BRAND_STEPS = 3;
const INFLUENCER_STEPS = 4;

type BrandValues = BrandProfileFormValues;
type InfluencerValues = InfluencerProfileFormValues;

function InfluencerOnboarding({
  defaults,
  photoUrl,
  audienceProofs,
}: {
  defaults: Partial<InfluencerValues>;
  photoUrl?: string | null;
  audienceProofs: AudienceProof[];
}) {
  const update = useUpdateProfile();
  const [step, setStep] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    clearErrors,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InfluencerValues>({
    resolver: zodResolver(influencerProfileSchema),
    defaultValues: {
      name: defaults.name ?? "",
      website: defaults.website ?? "",
      bio: defaults.bio ?? "",
      categories: defaults.categories ?? [],
      province: defaults.province ?? "",
      city: defaults.city ?? "",
      followerRange: defaults.followerRange,
    },
  });

  const stepFields: Array<(keyof InfluencerValues)[]> = [
    ["name", "website"],
    ["categories", "province", "city"],
    ["followerRange"],
    ["bio"],
  ];

  const goNext = async () => {
    const ok = await trigger(stepFields[step], { shouldFocus: true });
    if (!ok) return;
    // Full-schema trigger can attach errors for later steps; clear those.
    const laterFields = stepFields.slice(step + 1).flat();
    if (laterFields.length) clearErrors(laterFields);
    setStep((s) => Math.min(s + 1, INFLUENCER_STEPS - 1));
  };

  const goBack = () => {
    clearErrors(stepFields[step]);
    setStep((s) => Math.max(s - 1, 0));
  };

  const onFinalSubmit = handleSubmit((values) => {
    update.mutate(influencerFormToUpdateBody(values));
  });

  const titles = [
    {
      title: "معرفی شما",
      subtitle: "نام نمایشی و آیدی اینستاگرام را وارد کنید.",
    },
    {
      title: "دسته بندی و شهر",
      subtitle: "صاحبان کسب و کار بر اساس دسته و شهر شما را پیدا می‌کنند.",
    },
    {
      title: "بازه فالوور",
      subtitle: "اندازه مخاطب‌تان را مشخص کنید.",
    },
    {
      title: "درباره پیج و مخاطب",
      subtitle:
        "چند خط درباره خودتان بنویسید و اسکرین‌شات آنالیتیکس آپلود کنید تا صاحب کسب‌وکار پیشنهادتان را راحت‌تر بپذیرد.",
    },
  ];

  return (
    <AuthLayout
      title={titles[step].title}
      subtitle={titles[step].subtitle}
      step={`مرحله ${step + 1} از ${INFLUENCER_STEPS}`}
    >
      <form noValidate onSubmit={onFinalSubmit} className="flex flex-col gap-5">
        {step === 0 ? (
          <>
            <ProfilePhotoEditor photoUrl={photoUrl} name={defaults.name} optional compact />
            <Input
              label="نام نمایشی"
              autoComplete="name"
              placeholder="مثلاً سارا محمدی"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="اینستاگرام"
              placeholder="@username یا instagram.com/username"
              dir="ltr"
              className="text-left"
              error={errors.website?.message}
              {...register("website")}
            />
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Controller
              name="categories"
              control={control}
              render={({ field }) => (
                <OptionGrid
                  label="دسته‌بندی محتوا"
                  options={INFLUENCER_CATEGORIES}
                  value={field.value}
                  onChange={(v) => field.onChange(Array.isArray(v) ? v : v ? [v] : [])}
                  error={errors.categories?.message}
                  multiple
                />
              )}
            />
            <IranCitySelect
              province={watch("province")}
              city={watch("city")}
              provinceError={errors.province?.message}
              cityError={errors.city?.message}
              onChange={({ province, city }) => {
                setValue("province", province, { shouldValidate: true });
                setValue("city", city, { shouldValidate: true });
              }}
            />
          </>
        ) : null}

        {step === 2 ? (
          <Controller
            name="followerRange"
            control={control}
            render={({ field }) => (
              <OptionGrid
                label="بازه فالوور"
                options={FOLLOWER_RANGES}
                value={field.value}
                onChange={field.onChange}
                error={errors.followerRange?.message}
              />
            )}
          />
        ) : null}

        {step === 3 ? (
          <>
            <Textarea
              label="درباره شما"
              placeholder="سبک محتوا، مخاطب پیج و چرا یک برند باید با شما کار کند."
              hint="حداقل ۲۰ کاراکتر — برای صاحب کسب‌وکار نمایش داده می‌شود"
              maxLength={1000}
              error={errors.bio?.message}
              {...register("bio")}
            />
            <AudienceProofsEditor proofs={audienceProofs} compact />
          </>
        ) : null}

        {update.isError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
            {getApiErrorMessage(update.error, "ذخیره پروفایل ناموفق بود")}
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          {step < INFLUENCER_STEPS - 1 ? (
            <Button type="button" onClick={goNext}>
              ادامه
            </Button>
          ) : (
            <Button type="submit" loading={update.isPending}>
              ادامه برای تأیید اینستاگرام
            </Button>
          )}

          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="text-sm font-medium text-muted transition hover:text-navy"
            >
              بازگشت
            </button>
          ) : null}
        </div>
      </form>
    </AuthLayout>
  );
}

function BrandOnboarding({ defaults, photoUrl }: { defaults: Partial<BrandValues>; photoUrl?: string | null }) {
  const update = useUpdateProfile();
  const [step, setStep] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    clearErrors,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BrandValues>({
    resolver: zodResolver(brandProfileSchema),
    defaultValues: {
      name: defaults.name ?? "",
      website: defaults.website ?? "",
      bio: defaults.bio ?? "",
      categories: defaults.categories ?? [],
      province: defaults.province ?? "",
      city: defaults.city ?? "",
      goal: defaults.goal ?? "",
      businessSize: defaults.businessSize ?? "",
    },
  });

  const stepFields: Array<(keyof BrandValues)[]> = [
    ["name", "website", "bio"],
    ["categories", "province", "city"],
    ["goal", "businessSize"],
  ];

  const goNext = async () => {
    const ok = await trigger(stepFields[step], { shouldFocus: true });
    if (!ok) return;
    const laterFields = stepFields.slice(step + 1).flat();
    if (laterFields.length) clearErrors(laterFields);
    setStep((s) => Math.min(s + 1, BRAND_STEPS - 1));
  };

  const goBack = () => {
    clearErrors(stepFields[step]);
    setStep((s) => Math.max(s - 1, 0));
  };

  const submitProfile = (values: BrandValues) => {
    update.mutate(brandFormToUpdateBody(values));
  };

  const onFinalSubmit = handleSubmit(submitProfile);

  const skipOptional = async () => {
    const ok = await trigger(["name", "website", "categories", "province", "city"]);
    if (!ok) {
      const values = getValues();
      if (!values.name?.trim() || (values.website && values.website.length > 200)) {
        setStep(0);
        return;
      }
      setStep(1);
      return;
    }
    const values = getValues();
    submitProfile({
      ...values,
      goal: "",
      businessSize: "",
    });
  };

  const titles = [
    {
      title: "معرفی صاحب کسب و کار",
      subtitle: "نام صاحب کسب و کار، لینک و چند خط درباره صاحب کسب و کار را وارد کنید.",
    },
    { title: "دسته و شهر", subtitle: "برای پیشنهاد بلاگرهای مرتبط، دسته و شهر را مشخص کنید." },
    { title: "هدف کمپین", subtitle: "اختیاری — می‌توانید بعداً هم تکمیل کنید." },
  ];

  return (
    <AuthLayout
      title={titles[step].title}
      subtitle={titles[step].subtitle}
      step={`مرحله ${step + 1} از ${BRAND_STEPS}`}
    >
      <form noValidate onSubmit={onFinalSubmit} className="flex flex-col gap-5">
        {step === 0 ? (
          <>
            <ProfilePhotoEditor photoUrl={photoUrl} name={defaults.name} optional compact />
            <Input
              label="نام صاحب کسب و کار"
              autoComplete="organization"
              placeholder="مثلاً کافه نوآ"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="اینستاگرام یا وب‌سایت"
              placeholder="instagram.com/brand یا @brand"
              dir="ltr"
              className="text-left"
              hint="اختیاری"
              error={errors.website?.message}
              {...register("website")}
            />
            <Textarea
              label="درباره صاحب کسب و کار"
              placeholder="چند خط درباره صاحب کسب و کار، محصولات و مخاطب‌تان بنویسید."
              hint="اختیاری — در پروفایل عمومی نمایش داده می‌شود"
              maxLength={1000}
              error={errors.bio?.message}
              {...register("bio")}
            />
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Controller
              name="categories"
              control={control}
              render={({ field }) => (
                <OptionGrid
                  label="دسته فعالیت"
                  options={BRAND_CATEGORIES}
                  value={field.value}
                  onChange={(v) => field.onChange(Array.isArray(v) ? v : v ? [v] : [])}
                  error={errors.categories?.message}
                  multiple
                />
              )}
            />
            <IranCitySelect
              province={watch("province")}
              city={watch("city")}
              provinceError={errors.province?.message}
              cityError={errors.city?.message}
              onChange={({ province, city }) => {
                setValue("province", province, { shouldValidate: true });
                setValue("city", city, { shouldValidate: true });
              }}
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Controller
              name="goal"
              control={control}
              render={({ field }) => (
                <OptionGrid
                  label="هدف اصلی"
                  options={BRAND_GOALS}
                  value={field.value || ""}
                  onChange={field.onChange}
                  error={errors.goal?.message}
                  optional
                />
              )}
            />
            <Controller
              name="businessSize"
              control={control}
              render={({ field }) => (
                <OptionGrid
                  label="اندازه کسب‌وکار"
                  options={BUSINESS_SIZES}
                  value={field.value || ""}
                  onChange={field.onChange}
                  error={errors.businessSize?.message}
                  optional
                />
              )}
            />
          </>
        ) : null}

        {update.isError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
            {getApiErrorMessage(update.error, "ذخیره پروفایل ناموفق بود")}
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          {step < BRAND_STEPS - 1 ? (
            <Button type="button" onClick={goNext}>
              ادامه
            </Button>
          ) : (
            <>
              <Button type="submit" loading={update.isPending}>
                ورود به داشبورد
              </Button>
              <button
                type="button"
                disabled={update.isPending}
                onClick={skipOptional}
                className="text-sm font-semibold text-muted transition hover:text-purple disabled:opacity-50"
              >
                فعلاً رد شو
              </button>
            </>
          )}

          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="text-sm font-medium text-muted transition hover:text-navy"
            >
              بازگشت
            </button>
          ) : null}
        </div>
      </form>
    </AuthLayout>
  );
}

export function OnboardingPage() {
  const token = getAccessToken();
  const { data: user, isLoading, isError } = useMe(Boolean(token));

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isLoading && user && isProfileComplete(user)) {
    return <Navigate to={postAuthPath(user)} replace />;
  }

  if (isError) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading || !user) {
    return (
      <AuthLayout title="تکمیل پروفایل" subtitle="در حال بارگذاری…">
        <div className="flex justify-center py-10">
          <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
        </div>
      </AuthLayout>
    );
  }

  if (user.role === "BRAND") {
    return (
      <BrandOnboarding
        photoUrl={user.photoUrl}
        defaults={{
          name: user.name ?? "",
          website: user.website ?? "",
          bio: user.bio ?? "",
          categories: user.categories?.length ? user.categories : user.category ? [user.category] : [],
          province: user.province ?? "",
          city: user.city ?? "",
          goal: user.goal ?? "",
          businessSize: user.businessSize ?? "",
        }}
      />
    );
  }

  return (
    <InfluencerOnboarding
      photoUrl={user.photoUrl}
      audienceProofs={user.audienceProofs ?? []}
      defaults={{
        name: user.name ?? "",
        website: user.website ?? "",
        bio: user.bio ?? "",
        categories: user.categories?.length ? user.categories : user.category ? [user.category] : [],
        province: user.province ?? "",
        city: user.city ?? "",
        followerRange: user.followerRange ?? undefined,
      }}
    />
  );
}
