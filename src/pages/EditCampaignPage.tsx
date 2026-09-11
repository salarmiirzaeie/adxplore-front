import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { CampaignFormFields } from "../components/CampaignFormFields";
import { CampaignImagesEditor } from "../components/CampaignImagesEditor";
import { Button } from "../components/ui/Button";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useMe } from "../hooks/useAuth";
import { useCampaign, useUpdateCampaign } from "../hooks/useCampaigns";
import {
  campaignFormSchema,
  campaignToFormValues,
  toUpdateCampaignBody,
  type CampaignFormValues,
} from "../lib/campaign-form";
import type { Campaign } from "../types/api";

function EditCampaignForm({ campaign }: { campaign: Campaign }) {
  const navigate = useNavigate();
  const update = useUpdateCampaign(campaign.id);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: campaignToFormValues(campaign),
  });

  const onSubmit = handleSubmit(() => setConfirmOpen(true));

  return (
    <div>
      <section className="mb-6 sm:mb-8">
        <Link
          to={`/app/campaigns/${campaign.id}`}
          className="mb-3 inline-block text-sm font-medium text-muted transition hover:text-purple"
        >
          ← بازگشت به کمپین
        </Link>
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">ویرایش کمپین</h1>
        <p className="mt-2 text-sm text-muted">عنوان، توضیحات کمپین، دسته، شهر، نوع محتوا و بودجه را به‌روز کنید.</p>
      </section>

      <div className="mb-4">
        <CampaignImagesEditor campaignId={campaign.id} images={campaign.images ?? []} />
      </div>

      <section className="card-elevated rounded-2xl px-5 py-6 sm:px-7 sm:py-8">
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <CampaignFormFields register={register} control={control} errors={errors} watch={watch} setValue={setValue} />

          {update.isError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
              {getApiErrorMessage(update.error, "ویرایش کمپین ناموفق بود")}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <Button type="submit" loading={update.isPending}>
              ذخیره تغییرات
            </Button>
            <Link
              to={`/app/campaigns/${campaign.id}`}
              className="inline-flex w-full items-center justify-center rounded-xl border border-border px-4 py-3.5 text-sm font-bold text-navy transition hover:bg-surface"
            >
              انصراف
            </Link>
          </div>
        </form>
      </section>

      <ConfirmModal
        open={confirmOpen}
        title="ذخیره تغییرات؟"
        description="جزئیات کمپین به‌روز می‌شود."
        confirmLabel="ذخیره تغییرات"
        loading={update.isPending}
        error={update.isError ? getApiErrorMessage(update.error, "ویرایش کمپین ناموفق بود") : null}
        onConfirm={() =>
          update.mutate(toUpdateCampaignBody(getValues()), {
            onSuccess: () => navigate(`/app/campaigns/${campaign.id}`, { replace: true }),
          })
        }
        onClose={() => {
          if (!update.isPending) setConfirmOpen(false);
        }}
      />
    </div>
  );
}

export function EditCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user } = useMe();
  const { data: campaign, isLoading, isError } = useCampaign(id, Boolean(id));

  if (!user) return null;
  if (user.role !== "BRAND") {
    return <Navigate to="/app/campaigns" replace />;
  }

  if (!id || isLoading) {
    return (
      <div className="flex justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-600">کمپین پیدا نشد.</p>
        <Link to="/app/campaigns" className="mt-4 inline-block text-sm font-semibold text-purple">
          بازگشت به کمپین‌ها
        </Link>
      </div>
    );
  }

  return <EditCampaignForm key={campaign.id} campaign={campaign} />;
}
