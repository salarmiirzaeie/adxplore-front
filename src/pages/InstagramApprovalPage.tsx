import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../api/client";
import { confirmInstagramDmSent, getInstagramApproval } from "../api/users";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/ui/Button";
import { meQueryKey, useLogout, useMe } from "../hooks/useAuth";
import { getAccessToken, postAuthPath } from "../lib/auth-storage";
import { copyText } from "../lib/clipboard";
import { openInstagram } from "../lib/open-instagram";

const instagramApprovalQueryKey = ["users", "instagram-approval"] as const;

const instagramMark = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.75" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
  </svg>
);

const checkIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function InstagramApprovalPage() {
  const token = getAccessToken();
  const { data: user, isLoading: userLoading, isError: userError } = useMe(Boolean(token));
  const logout = useLogout();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const approval = useQuery({
    queryKey: instagramApprovalQueryKey,
    queryFn: getInstagramApproval,
    enabled: Boolean(token) && user?.role === "INFLUENCER",
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data || data.canAccessPanel) return false;
      return (data.pollIntervalSeconds || 15) * 1000;
    },
  });

  const confirmSent = useMutation({
    mutationFn: confirmInstagramDmSent,
    onSuccess: (data) => {
      queryClient.setQueryData(instagramApprovalQueryKey, data);
      if (user) {
        queryClient.setQueryData(meQueryKey, {
          ...user,
          canAccessPanel: true,
          canSendOffers: false,
          nextScreen: "PANEL" as const,
          approvalStatus: user.approvalStatus ?? "PENDING",
        });
      }
      navigate("/app", { replace: true });
    },
  });

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (userError) {
    return <Navigate to="/login" replace />;
  }

  if (!userLoading && user) {
    if (postAuthPath(user) === "/onboarding") {
      return <Navigate to="/onboarding" replace />;
    }
    if (user.approvalStatus === "APPROVED") {
      return <Navigate to="/app" replace />;
    }
  }

  if (userLoading || !user || approval.isLoading || !approval.data) {
    return (
      <AuthLayout title="تأیید اینستاگرام" subtitle="در حال آماده‌سازی…">
        <div className="flex justify-center py-10">
          <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
        </div>
      </AuthLayout>
    );
  }

  if (approval.isError) {
    return (
      <AuthLayout title="تأیید اینستاگرام" subtitle="نتوانستیم اطلاعات تأیید را بگیریم.">
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
          {getApiErrorMessage(approval.error, "لطفاً دوباره تلاش کنید")}
        </p>
        <Button type="button" onClick={() => void approval.refetch()}>
          تلاش دوباره
        </Button>
      </AuthLayout>
    );
  }

  const data = approval.data;
  const waiting = data.uiStatus === "WAITING_REVIEW";
  const rejected = data.uiStatus === "REJECTED";
  const canEnterPanel = waiting || data.canAccessPanel;
  const username = data.page.username.replace(/^@/, "");
  const dmText = data.dmMessage || data.actions.copyMessage?.text || "";

  async function handleFollowAndDm() {
    if (dmText) {
      const ok = await copyText(dmText);
      setCopyError(!ok);
      if (ok) setCopied(true);
    }
    openInstagram(data.actions.follow);
  }

  return (
    <AuthLayout title="دسترسی به پنل">
      {rejected ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-6 text-red-600">
          {data.rejectionReason || "درخواست رد شد. دوباره فالو کنید و دایرکت بفرستید."}
        </div>
      ) : null}

      {canEnterPanel ? (
        <>
          <p className="mb-5 text-sm leading-7 text-muted">
            دایرکت شما ثبت شد. می‌توانید وارد پنل شوید و کمپین‌ها را ببینید. ارسال پیشنهاد بعد از تأیید ادمین فعال
            می‌شود.
          </p>
          <Button type="button" onClick={() => navigate("/app", { replace: true })}>
            ورود به پنل
          </Button>
        </>
      ) : (
        <>
          <p className="mb-5 text-sm leading-7 text-muted">
            برای کار در پنل، پیج{" "}
            <span dir="ltr" className="font-bold text-navy">
              @{username}
            </span>{" "}
            را فالو کنید و پیام کپی‌شده را دایرکت بفرستید.
          </p>

          {copyError ? (
            <p className="mb-3 text-xs text-red-600">کپی انجام نشد. بعد از باز شدن اینستاگرام، متن را دستی کپی کنید.</p>
          ) : null}

          <Button type="button" onClick={() => void handleFollowAndDm()}>
            {instagramMark}
            {copied ? "پیام کپی شد — اینستاگرام" : "فالو و دایرکت در اینستاگرام"}
          </Button>

          {data.actions.confirmSent.enabled ? (
            <Button
              type="button"
              variant="outline"
              className="mt-2.5"
              loading={confirmSent.isPending}
              onClick={() => confirmSent.mutate()}
            >
              {checkIcon}
              انجام دادم
            </Button>
          ) : null}

          {confirmSent.isError ? (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
              {getApiErrorMessage(confirmSent.error, "ثبت ارسال پیام ناموفق بود")}
            </p>
          ) : null}
        </>
      )}

      <button
        type="button"
        onClick={logout}
        className="mt-5 w-full text-center text-sm font-medium text-muted transition hover:text-red-600"
      >
        خروج از حساب
      </button>
    </AuthLayout>
  );
}
