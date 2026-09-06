import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '../api/client'
import { ChatDeliverableCard, ChatSystemMessage } from './ChatEventCards'
import { MediaPreview } from './MediaPreview'
import { DealChatActions } from './DealChatActions'
import { OfferProposalCard } from './OfferProposalCard'
import { AudienceProofGallery } from './AudienceProofGallery'
import { Avatar } from './ui/Avatar'
import { Button } from './ui/Button'
import { ConfirmModal } from './ui/ConfirmModal'
import { useMe } from '../hooks/useAuth'
import { useDeals, useDeal } from '../hooks/useDeals'
import {
  messagesKey,
  useConversationByOffer,
  useMarkConversationRead,
  useMessages,
  useSendMessage,
} from '../hooks/useChat'
import { useOffer, useUpdateOfferStatus, offerQueryKey, offersQueryKey } from '../hooks/useOffers'
import { dealStatusLabel } from '../lib/brand-options'
import { connectChatSocket } from '../lib/chat-socket'
import { invalidateWalletQueries } from '../hooks/useWallets'
import type { ChatMessage } from '../types/api'

interface ChatThreadProps {
  offerId: string
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-me-1 inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-navy transition hover:bg-surface active:bg-surface lg:hidden"
      aria-label="بازگشت به پیام‌ها"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M9 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export function ChatThread({ offerId }: ChatThreadProps) {
  const navigate = useNavigate()
  const { data: me } = useMe()
  const qc = useQueryClient()
  const { data: offer, isLoading: loadingOffer, isError: offerError } =
    useOffer(offerId)
  const { data: deals } = useDeals(undefined, Boolean(me))
  const relatedDealFromList = deals?.find((d) => d.offerId === offerId)
  const { data: dealDetail } = useDeal(
    relatedDealFromList?.id,
    Boolean(relatedDealFromList?.id),
  )
  const relatedDeal = dealDetail ?? relatedDealFromList
  const update = useUpdateOfferStatus(offerId)
  const {
    data: conversation,
    isLoading: loadingConv,
    isError: convError,
  } = useConversationByOffer(offerId)
  const { data: messages = [], isLoading: loadingMsgs } = useMessages(
    conversation?.id,
  )
  const send = useSendMessage(conversation?.id ?? '')
  const markRead = useMarkConversationRead(conversation?.id)
  const [text, setText] = useState('')
  const [attach, setAttach] = useState<File | null>(null)
  const attachRef = useRef<HTMLInputElement>(null)
  const [offerConfirm, setOfferConfirm] = useState<
    'accept' | 'reject' | 'cancel' | 'undoReject' | null
  >(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const markedRef = useRef<string | null>(null)

  const isBrand = me?.role === 'BRAND'
  const peer = offer ? (isBrand ? offer.influencer : offer.brand) : null
  const pending = offer?.status === 'PENDING'
  const canUndoReject =
    Boolean(isBrand) &&
    offer?.status === 'REJECTED' &&
    (offer.canUndoReject ?? true)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages.length, offer?.id])

  useEffect(() => {
    if (!conversation?.id || markedRef.current === conversation.id) return
    markedRef.current = conversation.id
    markRead.mutate()
  }, [conversation?.id])

  useEffect(() => {
    if (!conversation?.id || !me) return

    const socket = connectChatSocket()
    socket.emit('conversation:join', { conversationId: conversation.id })

    const onNew = (message: ChatMessage) => {
      if (message.conversationId !== conversation.id) return
      qc.setQueryData<ChatMessage[]>(messagesKey(conversation.id), (prev) => {
        if (!prev) return [message]
        if (prev.some((m) => m.id === message.id)) return prev
        return [...prev, message]
      })
      if (message.senderId !== me.id) markRead.mutate()
      const event = message.metadata?.event
      if (
        event === 'OFFER_UPDATED' ||
        event === 'OFFER_REJECTED' ||
        event === 'OFFER_CANCELLED' ||
        event === 'OFFER_ACCEPTED' ||
        event === 'OFFER_REOPENED'
      ) {
        qc.invalidateQueries({ queryKey: offerQueryKey(offerId) })
        qc.invalidateQueries({ queryKey: offersQueryKey })
        qc.invalidateQueries({ queryKey: ['conversations'] })
      }
      if (
        event === 'DEAL_CANCELLED' ||
        event === 'DEAL_REACTIVATED' ||
        event === 'DEAL_STARTED' ||
        event === 'DEAL_COMPLETED' ||
        event === 'DELIVERABLE_SUBMITTED' ||
        event === 'REVISION_REQUESTED' ||
        event === 'PAYMENT_HELD' ||
        event === 'PAYMENT_REQUIRED' ||
        event === 'PAYMENT_RELEASED' ||
        event === 'PAYMENT_FAILED'
      ) {
        qc.invalidateQueries({ queryKey: ['deals'] })
        qc.invalidateQueries({ queryKey: ['conversations'] })
        if (
          event === 'DEAL_CANCELLED' ||
          event === 'DEAL_REACTIVATED' ||
          event === 'DEAL_COMPLETED' ||
          event === 'PAYMENT_HELD' ||
          event === 'PAYMENT_RELEASED'
        ) {
          invalidateWalletQueries(qc)
        }
      }
    }

    socket.on('message:new', onNew)
    return () => {
      socket.emit('conversation:leave', {
        conversationId: conversation.id,
      })
      socket.off('message:new', onNew)
    }
  }, [conversation?.id, me?.id, offerId, qc])

  if (loadingOffer || loadingConv) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-elevated">
        <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
      </div>
    )
  }

  if (offerError || convError || !offer || !conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-surface-elevated px-6 text-center">
        <p className="text-sm text-red-600">گفتگو پیدا نشد.</p>
        <button
          type="button"
          onClick={() => navigate('/app/messages')}
          className="text-sm font-bold text-purple"
        >
          بازگشت به پیام‌ها
        </button>
      </div>
    )
  }

  const refreshTimeline = () => {
    qc.invalidateQueries({ queryKey: ['deals'] })
    qc.invalidateQueries({ queryKey: ['offers'] })
    invalidateWalletQueries(qc)
    if (conversation?.id) {
      qc.invalidateQueries({ queryKey: messagesKey(conversation.id) })
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const body = text.trim()
    if ((!body && !attach) || send.isPending) return
    send.mutate(
      { body: body || undefined, file: attach ?? undefined },
      {
        onSuccess: () => {
          setText('')
          setAttach(null)
          if (attachRef.current) attachRef.current.value = ''
        },
      },
    )
  }

  const offerConfirmCopy =
    offerConfirm === 'accept'
      ? {
          title: 'قبول پیشنهاد؟',
          description: `با قبول این پیشنهاد همکاری شروع می‌شود و باید ${offer.fee.toLocaleString('fa-IR')} تومان را پرداخت کنید.`,
          confirmLabel: 'قبول پیشنهاد',
          tone: 'primary' as const,
          status: 'ACCEPTED' as const,
        }
      : offerConfirm === 'reject'
        ? {
            title: 'رد پیشنهاد؟',
            description: 'این پیشنهاد رد می‌شود و بلاگر مطلع خواهد شد.',
            confirmLabel: 'رد پیشنهاد',
            tone: 'danger' as const,
            status: 'REJECTED' as const,
          }
        : offerConfirm === 'cancel'
          ? {
              title: 'لغو پیشنهاد؟',
              description: 'پیشنهاد شما لغو می‌شود و صاحب کسب و کار دیگر آن را نمی‌بیند.',
              confirmLabel: 'لغو پیشنهاد',
              tone: 'danger' as const,
              status: 'CANCELLED' as const,
            }
          : offerConfirm === 'undoReject'
            ? {
                title: 'لغو رد پیشنهاد؟',
                description:
                  'پیشنهاد دوباره در انتظار بررسی قرار می‌گیرد و می‌توانید آن را قبول کنید.',
                confirmLabel: 'لغو رد',
                tone: 'primary' as const,
                status: 'PENDING' as const,
              }
            : null

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-surface-elevated">
      <div className="shrink-0">
        <header className="flex items-center gap-2 border-b border-border bg-surface-elevated px-2 py-2 max-lg:pt-[max(0.5rem,env(safe-area-inset-top))] sm:gap-3 sm:px-4 sm:py-3 lg:px-5">
        <BackButton onClick={() => navigate('/app/messages')} />
        <Link
          to={peer?.id ? `/app/profiles/${peer.id}` : '#'}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-xl py-1 transition hover:bg-surface sm:gap-3"
        >
          <Avatar src={peer?.photoUrl} name={peer?.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-navy">
              {peer?.name ?? 'طرف مقابل'}
            </p>
            <p className="truncate text-xs text-muted">{offer.campaign.title}</p>
          </div>
        </Link>
        {relatedDeal ? (
          <span className="shrink-0 rounded-xl bg-purple-soft/70 px-3 py-2 text-xs font-bold text-purple-deep">
            {dealStatusLabel(relatedDeal.status)}
          </span>
        ) : offer.status === 'REJECTED' || offer.status === 'CANCELLED' ? (
          <span className="shrink-0 rounded-xl bg-surface px-3 py-2 text-xs font-bold text-muted">
            {offer.status === 'REJECTED' ? 'رد شده' : 'لغو شده'}
          </span>
        ) : null}
        </header>

        {update.isError ? (
          <p className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">
            {getApiErrorMessage(update.error, 'عملیات ناموفق بود')}
          </p>
        ) : null}
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-surface/50 px-3 py-3 sm:px-4 sm:py-4 lg:px-6"
      >
        <OfferProposalCard
          offer={offer}
          dealStatus={relatedDeal?.status}
          canEdit={
            offer.canEdit ?? (!isBrand && offer.status === 'PENDING')
          }
          onUpdated={refreshTimeline}
        />

        {isBrand && (peer?.bio || peer?.audienceProofs?.length) ? (
          <section className="mx-auto mt-3 w-full max-w-md rounded-2xl border border-border bg-surface-elevated p-3 sm:p-4">
            <p className="text-[11px] font-bold text-purple">درباره بلاگر</p>
            {peer?.bio ? (
              <p className="mt-2 text-sm leading-7 text-navy whitespace-pre-wrap">
                {peer.bio}
              </p>
            ) : null}
            {peer?.audienceProofs?.length ? (
              <div className="mt-3">
                <AudienceProofGallery proofs={peer.audienceProofs} compact />
              </div>
            ) : null}
          </section>
        ) : null}

        <div className="mt-3 space-y-3">
        {loadingMsgs ? (
          <p className="py-6 text-center text-sm text-muted">بارگذاری پیام‌ها…</p>
        ) : messages.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted">
            درباره جزئیات همکاری اینجا گفتگو کنید.
          </p>
        ) : (
          messages.map((m) => {
            const kind = m.kind ?? 'TEXT'
            if (kind === 'SYSTEM') {
              return (
                <ChatSystemMessage
                  key={m.id}
                  body={m.body}
                  metadata={m.metadata}
                  createdAt={m.createdAt}
                  isBrand={Boolean(isBrand)}
                  fee={offer.fee}
                />
              )
            }
            if (kind === 'DELIVERABLE') {
              return (
                <ChatDeliverableCard
                  key={m.id}
                  body={m.body}
                  metadata={m.metadata}
                  createdAt={m.createdAt}
                />
              )
            }
            const mine = m.senderId === me?.id
            const mediaUrl = m.metadata?.mediaUrl
            const showCaption =
              m.body &&
              !(m.kind === 'IMAGE' && m.body === 'تصویر') &&
              !(m.kind === 'VIDEO' && m.body === 'ویدیو')
            return (
              <div
                key={m.id}
                className={`flex ${mine ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`w-fit max-w-[min(85%,20rem)] overflow-hidden rounded-2xl text-sm leading-6 shadow-sm ${
                    mine
                      ? 'rounded-br-md bg-purple text-white'
                      : 'rounded-bl-md border border-border bg-surface text-navy'
                  } ${mediaUrl ? 'p-1.5' : 'px-3.5 py-2'}`}
                >
                  {m.kind === 'IMAGE' || m.kind === 'VIDEO' ? (
                    <MediaPreview
                      kind={m.kind}
                      url={mediaUrl}
                      alt={m.body}
                      className={
                        m.kind === 'VIDEO'
                          ? 'max-h-64 w-full rounded-xl bg-black'
                          : 'max-h-64 w-full rounded-xl object-cover'
                      }
                    />
                  ) : null}
                  {showCaption ? (
                    <p
                      className={`whitespace-pre-wrap break-words ${
                        mediaUrl ? 'px-2 pt-2' : ''
                      }`}
                    >
                      {m.body}
                    </p>
                  ) : null}
                  <p
                    className={`mt-1 text-[10px] ${mediaUrl ? 'px-2 pb-1' : ''} ${
                      mine ? 'text-white/65' : 'text-muted'
                    }`}
                  >
                    {new Date(m.createdAt).toLocaleTimeString('fa-IR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        </div>
      </div>

      <footer className="shrink-0 border-t border-border bg-surface-elevated pb-[env(safe-area-inset-bottom)]">
      {pending ? (
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-3 sm:px-4">
          <p className="min-w-0 flex-1 text-xs leading-6 text-muted">
            {isBrand
              ? 'برای شروع همکاری، این پیشنهاد را قبول یا رد کنید.'
              : 'در انتظار پاسخ صاحب کسب و کار هستید؛ می‌توانید پیشنهاد را ویرایش یا لغو کنید.'}
          </p>
          <div className="flex shrink-0 gap-2">
            {isBrand ? (
              <>
                <Button
                  type="button"
                  fullWidth={false}
                  className="px-3 py-2 text-xs"
                  loading={update.isPending}
                  onClick={() => setOfferConfirm('accept')}
                >
                  قبول
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth={false}
                  className="px-3 py-2 text-xs"
                  loading={update.isPending}
                  onClick={() => setOfferConfirm('reject')}
                >
                  رد
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                fullWidth={false}
                className="px-3 py-2 text-xs"
                loading={update.isPending}
                onClick={() => setOfferConfirm('cancel')}
              >
                لغو پیشنهاد
              </Button>
            )}
          </div>
        </div>
      ) : null}

      {canUndoReject ? (
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-3 sm:px-4">
          <p className="min-w-0 flex-1 text-xs leading-6 text-muted">
            این پیشنهاد رد شده است. می‌توانید رد را لغو کنید یا آن را قبول کنید.
          </p>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              fullWidth={false}
              className="px-3 py-2 text-xs"
              loading={update.isPending}
              onClick={() => setOfferConfirm('accept')}
            >
              قبول
            </Button>
            <Button
              type="button"
              variant="outline"
              fullWidth={false}
              className="px-3 py-2 text-xs"
              loading={update.isPending}
              onClick={() => setOfferConfirm('undoReject')}
            >
              لغو رد
            </Button>
          </div>
        </div>
      ) : null}

      {relatedDeal ? (
        <DealChatActions
          deal={relatedDeal}
          isBrand={Boolean(isBrand)}
          onUpdated={refreshTimeline}
        />
      ) : null}

        {send.isError ? (
          <p className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">
            {getApiErrorMessage(send.error, 'ارسال پیام ناموفق بود')}
          </p>
        ) : null}

        <form
          onSubmit={onSubmit}
          className="shrink-0 px-3 py-2 sm:px-4 sm:py-3"
        >
          {attach ? (
            <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 py-2">
              <p className="min-w-0 truncate text-xs font-semibold text-navy">
                {attach.name}
              </p>
              <button
                type="button"
                className="shrink-0 text-xs font-bold text-red-600"
                onClick={() => {
                  setAttach(null)
                  if (attachRef.current) attachRef.current.value = ''
                }}
              >
                حذف
              </button>
            </div>
          ) : null}
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-end gap-2">
          <input
            ref={attachRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => setAttach(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => attachRef.current?.click()}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-navy transition hover:bg-surface"
            aria-label="ارسال تصویر یا ویدیو"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M21 15V8a5 5 0 0 0-10 0v8a3 3 0 0 0 6 0V9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="پیام…"
            rows={1}
            maxLength={2000}
            className="input-brand max-h-24 min-h-10 w-full resize-none py-2.5 text-sm sm:min-h-11"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                onSubmit(e)
              }
            }}
          />
          <Button
            type="submit"
            fullWidth={false}
            className="self-end px-3 py-2.5 text-xs sm:px-5 sm:text-sm"
            loading={send.isPending}
            disabled={!text.trim() && !attach}
          >
            <span className="hidden sm:inline">ارسال پیام</span>
            <span className="sm:hidden">ارسال</span>
          </Button>
          </div>
        </form>
      </footer>

      {offerConfirmCopy ? (
        <ConfirmModal
          open
          title={offerConfirmCopy.title}
          description={offerConfirmCopy.description}
          confirmLabel={offerConfirmCopy.confirmLabel}
          tone={offerConfirmCopy.tone}
          loading={update.isPending}
          error={
            update.isError
              ? getApiErrorMessage(update.error, 'عملیات ناموفق بود')
              : null
          }
          onConfirm={() =>
            update.mutate(
              { status: offerConfirmCopy.status },
              {
                onSuccess: () => {
                  setOfferConfirm(null)
                  refreshTimeline()
                },
              },
            )
          }
          onClose={() => {
            if (!update.isPending) setOfferConfirm(null)
          }}
        />
      ) : null}
    </div>
  )
}
