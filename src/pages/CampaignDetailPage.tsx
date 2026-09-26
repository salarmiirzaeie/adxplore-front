import { useEffect, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { CampaignImageGallery } from "../components/CampaignImageGallery";
import { InviteInfluencersModal } from "../components/InviteInfluencersModal";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useMe } from "../hooks/useAuth";
import { useCampaign, useUpdateCampaign } from "../hooks/useCampaigns";
import { useDeals } from "../hooks/useDeals";
import { useInvitations } from "../hooks/useInvitations";
import { useOffers } from "../hooks/useOffers";
import {
  brandCategoriesLabel,
  campaignStatusLabel,
  deliverablesLabel,
  formatBudgetRange,
  isCampaignAcceptingInvites,
  offerPipelineLabel,
} from "../lib/brand-options";
import { formatLocation } from "../lib/iran-locations";
import { canSendOffers } from "../lib/auth-storage";
import { isBrandInfluencerDiscoveryEnabled } from "../lib/feature-flags";

function DetailRow({ label, value, dir }: { label: string; value: string; dir?: "ltr" }) {
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <dt className="text-xs font-semibold text-muted">{label}</dt>
      <dd className="mt-1.5 text-sm font-bold text-navy whitespace-pre-wrap" dir={dir}>
        {value}
      </dd>
    </div>
  );
}

function MetaChip({ label, value, dir }: { label: string; value: string; dir?: "ltr" }) {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated px-4 py-3">
      <p className="text-[11px] font-semibold text-muted">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-navy" dir={dir}>
        {value}
      </p>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      className="size-4 shrink-0 text-muted"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function CampaignNavCard({ to, count, label, hint }: { to: string; count: number; label: string; hint: string }) {
  const hasItems = count > 0;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-2xl border px-4 py-4 transition hover:border-purple/30 ${
        hasItems ? "border-purple/20 bg-purple-soft/25" : "border-border bg-surface-elevated hover:bg-surface"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className={`text-2xl font-extrabold tabular-nums ${hasItems ? "text-purple-deep" : "text-navy"}`}>
          {count.toLocaleString("fa-IR")}
        </p>
        <p className="mt-0.5 text-sm font-extrabold text-navy">{label}</p>
        <p className="mt-1 text-xs text-muted">{hint}</p>
      </div>
      <ChevronIcon />
    </Link>
  );
}

function BrandCampaignDetail({ id }: { id: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [confirm, setConfirm] = useState<"open" | "close" | "reopen" | null>(null);
  const { data: campaign, isLoading, isError } = useCampaign(id, true);
  const update = useUpdateCampaign(id);
  const { data: invitations } = useInvitations(id, true);
  const { data: offers } = useOffers(id, true);
  const canInviteInfluencers = isBrandInfluencerDiscoveryEnabled();

  useEffect(() => {
    if (
      canInviteInfluencers &&
      searchParams.get("invite") === "1" &&
      isCampaignAcceptingInvites(campaign?.status)
    ) {
      setInviteOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete("invite");
      setSearchParams(next, { replace: true });
    }
  }, [canInviteInfluencers, campaign?.status, searchParams, setSearchParams]);

  if (isLoading) {
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

  const budget = formatBudgetRange(campaign.budgetMin, campaign.budgetMax) ?? "—";
  const images = campaign.images ?? [];

  return (
    <div>
      <section className="mb-6 sm:mb-8">
        <Link
          to="/app/campaigns"
          className="mb-3 inline-block text-sm font-medium text-muted transition hover:text-purple"
        >
          ← بازگشت به کمپین‌های من
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 text-sm font-medium text-purple">{campaignStatusLabel(campaign.status)}</p>
            <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">{campaign.title}</h1>
          </div>
          <Link
            to={`/app/campaigns/${campaign.id}/edit`}
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm font-bold text-navy transition hover:border-purple/40 hover:bg-surface"
          >
            ویرایش
          </Link>
        </div>
      </section>

      {images.length > 0 ? (
        <div className="mb-4">
          <CampaignImageGallery images={images} />
        </div>
      ) : null}

      <section className="mb-4">
        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MetaChip label="دسته" value={brandCategoriesLabel(campaign.categories, campaign.category) ?? "—"} />
          <MetaChip label="شهر" value={formatLocation(campaign.city, campaign.province) ?? "—"} />
          <MetaChip label="نوع محتوا" value={deliverablesLabel(campaign.deliverables, campaign.deliverable) ?? "—"} />
          <MetaChip label="بودجه" value={budget} dir="ltr" />
        </div>
        <div className="card-elevated rounded-2xl px-5 py-5 sm:px-7">
          <p className="text-xs font-semibold text-muted">توضیحات کمپین</p>
          <p className="mt-2 text-sm leading-7 text-navy whitespace-pre-wrap">{campaign.brief}</p>
        </div>
      </section>

      {campaign.rejectionReason ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-7 text-red-700">
          {campaign.rejectionReason}
        </p>
      ) : null}

      {update.isError ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
          {getApiErrorMessage(update.error, "به‌روزرسانی کمپین ناموفق بود")}
        </p>
      ) : null}

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <CampaignNavCard
          to={`/app/campaigns/${campaign.id}/invitations`}
          count={invitations?.length ?? 0}
          label="دعوت‌ها"
          hint="مشاهده و مدیریت دعوت‌ها"
        />
        <CampaignNavCard
          to={`/app/campaigns/${campaign.id}/offers`}
          count={offers?.length ?? 0}
          label="پیشنهادها"
          hint="مشاهده پیشنهادها و گفتگو"
        />
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        {campaign.status === "DRAFT" ? (
          <Button disabled={update.isPending} onClick={() => setConfirm("open")}>
            {canInviteInfluencers ? "فعال‌سازی و دعوت" : "فعال‌سازی"}
          </Button>
        ) : null}
        {isCampaignAcceptingInvites(campaign.status) ? (
          <>
            {canInviteInfluencers ? (
              <Button onClick={() => setInviteOpen(true)}>دعوت بلاگر</Button>
            ) : null}
            <Button variant="outline" disabled={update.isPending} onClick={() => setConfirm("close")}>
              بستن کمپین
            </Button>
          </>
        ) : null}
        {campaign.status === "CLOSED" ? (
          <Button variant="outline" disabled={update.isPending} onClick={() => setConfirm("reopen")}>
            بازگشایی کمپین
          </Button>
        ) : null}
      </div>

      {canInviteInfluencers ? (
        <InviteInfluencersModal
          campaignId={campaign.id}
          campaignTitle={campaign.title}
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
        />
      ) : null}
      <ConfirmModal
        open={confirm === "open"}
        title="فعال‌سازی کمپین؟"
        description={
          canInviteInfluencers
            ? "کمپین برای بلاگرها قابل مشاهده می‌شود و می‌توانید دعوت بفرستید."
            : "کمپین برای بلاگرها قابل مشاهده می‌شود."
        }
        confirmLabel="فعال کن"
        loading={update.isPending}
        error={update.isError ? getApiErrorMessage(update.error, "به‌روزرسانی کمپین ناموفق بود") : null}
        onConfirm={() =>
          update.mutate(
            { status: "OPEN" },
            {
              onSuccess: () => {
                setConfirm(null);
                if (canInviteInfluencers) setInviteOpen(true);
              },
            },
          )
        }
        onClose={() => {
          if (!update.isPending) setConfirm(null);
        }}
      />
      <ConfirmModal
        open={confirm === "close"}
        title="بستن کمپین؟"
        description="کمپین از لیست کمپین‌های باز حذف می‌شود و پیشنهاد جدید نمی‌پذیرد."
        confirmLabel="بستن کمپین"
        tone="danger"
        loading={update.isPending}
        error={update.isError ? getApiErrorMessage(update.error, "به‌روزرسانی کمپین ناموفق بود") : null}
        onConfirm={() => update.mutate({ status: "CLOSED" }, { onSuccess: () => setConfirm(null) })}
        onClose={() => {
          if (!update.isPending) setConfirm(null);
        }}
      />
      <ConfirmModal
        open={confirm === "reopen"}
        title="بازگشایی کمپین؟"
        description="کمپین دوباره برای بلاگرها باز می‌شود."
        confirmLabel="بازگشایی"
        loading={update.isPending}
        error={update.isError ? getApiErrorMessage(update.error, "به‌روزرسانی کمپین ناموفق بود") : null}
        onConfirm={() => update.mutate({ status: "OPEN" }, { onSuccess: () => setConfirm(null) })}
        onClose={() => {
          if (!update.isPending) setConfirm(null);
        }}
      />
    </div>
  );
}

function InfluencerCampaignDetail({ id }: { id: string }) {
  const { data: user } = useMe();
  const { data: campaign, isLoading, isError } = useCampaign(id, true);
  const { data: invitations } = useInvitations(undefined, true);
  const { data: offers, isLoading: offersLoading } = useOffers(id, true);
  const { data: deals } = useDeals(undefined, true);

  if (isLoading || offersLoading) {
    return (
      <div className="flex justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-600">کمپین پیدا نشد یا فعال نیست.</p>
        <Link to="/app/campaigns" className="mt-4 inline-block text-sm font-semibold text-purple">
          بازگشت به کمپین‌ها
        </Link>
      </div>
    );
  }

  const budget = formatBudgetRange(campaign.budgetMin, campaign.budgetMax) ?? "—";
  const images = campaign.images ?? [];
  const invite = invitations?.find((i) => i.campaignId === id && i.status === "PENDING");
  const existingOffer = offers?.[0];
  const relatedDeal = existingOffer ? deals?.find((d) => d.offerId === existingOffer.id) : undefined;
  const offerHref = existingOffer ? `/app/messages/${existingOffer.id}` : null;

  return (
    <div>
      <section className="mb-6 sm:mb-8">
        <Link
          to={invite ? "/app/invitations" : "/app/campaigns"}
          className="mb-3 inline-block text-sm font-medium text-muted transition hover:text-purple"
        >
          ← {invite ? "بازگشت به دعوت‌ها" : "بازگشت به کمپین‌ها"}
        </Link>
        {existingOffer ? (
          <span className="mb-2 inline-block rounded-lg bg-purple-soft/60 px-2 py-1 text-[11px] font-bold text-purple-deep">
            پیشنهاد ارسال شده · {offerPipelineLabel(existingOffer.status, relatedDeal?.status)}
          </span>
        ) : invite ? (
          <span className="mb-2 inline-block rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">
            دعوت‌شده
          </span>
        ) : null}
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">{campaign.title}</h1>
        <div className="mt-4 flex items-center gap-3">
          <Link
            to={`/app/profiles/${campaign.brandId}`}
            className="flex min-w-0 items-center gap-3 rounded-xl transition hover:opacity-80"
          >
            <Avatar src={campaign.brand?.photoUrl} name={campaign.brand?.name} size="md" />
            <div>
              <p className="text-sm font-bold text-navy">{campaign.brand?.name ?? "صاحب کسب و کار"}</p>
              <p className="text-xs text-muted">
                {brandCategoriesLabel(campaign.categories, campaign.category)} ·{" "}
                {formatLocation(campaign.city, campaign.province)}
              </p>
            </div>
          </Link>
        </div>
      </section>

      {images.length > 0 ? (
        <div className="mb-4">
          <CampaignImageGallery images={images} />
        </div>
      ) : null}

      <section className="card-elevated mb-5 rounded-2xl px-5 py-2 sm:px-7">
        <dl>
          <DetailRow label="توضیحات کمپین" value={campaign.brief} />
          <DetailRow label="نوع محتوا" value={deliverablesLabel(campaign.deliverables, campaign.deliverable) ?? "—"} />
          <DetailRow label="بودجه" value={budget} dir="ltr" />
          {invite?.message ? <DetailRow label="پیام دعوت" value={invite.message} /> : null}
        </dl>
      </section>

      {offerHref ? (
        <Link
          to={`/app/messages/${existingOffer!.id}`}
          className="btn-primary inline-flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-bold"
        >
          باز کردن گفتگو و پیشنهاد
        </Link>
      ) : campaign.status === "OPEN" && user && !canSendOffers(user) ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm leading-7 text-amber-800">
          منتظر تأیید ادمین بمانید. پس از بررسی فالو و دایرکت می‌توانید پیشنهاد بفرستید.
        </p>
      ) : campaign.status === "OPEN" ? (
        <Link
          to={`/app/offers/new?campaignId=${campaign.id}`}
          className="btn-primary inline-flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-bold"
        >
          ارسال پیشنهاد قیمت
        </Link>
      ) : (
        <p className="rounded-xl bg-surface px-4 py-3 text-center text-sm text-muted">این کمپین دیگر باز نیست.</p>
      )}
    </div>
  );
}

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user } = useMe();

  if (!user || !id) return null;
  if (user.role === "BRAND") return <BrandCampaignDetail id={id} />;
  if (user.role === "INFLUENCER") return <InfluencerCampaignDetail id={id} />;
  return <Navigate to="/app" replace />;
}
