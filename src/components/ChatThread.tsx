import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '../api/client'
import { ChatDeliverableCard, ChatSystemMessage } from './ChatEventCards'
import { DealChatActions } from './DealChatActions'
import { OfferProposalCard } from './OfferProposalCard'
import { Avatar } from './ui/Avatar'
import { Button } from './ui/Button'
import { useMe } from '../hooks/useAuth'
import { useDeals, useDeal } from '../hooks/useDeals'
import {
  messagesKey,
  useConversationByOffer,
  useMarkConversationRead,
  useMessages,
  useSendMessage,
} from '../hooks/useChat'
import { useOffer, useUpdateOfferStatus } from '../hooks/useOffers'
import { dealStatusLabel } from '../lib/brand-options'
import { connectChatSocket } from '../lib/chat-socket'
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const markedRef = useRef<string | null>(null)

  const isBrand = me?.role === 'BRAND'
  const peer = offer ? (isBrand ? offer.influencer : offer.brand) : null
  const pending = offer?.status === 'PENDING'

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
    }

    socket.on('message:new', onNew)
    return () => {
      socket.emit('conversation:leave', {
        conversationId: conversation.id,
      })
      socket.off('message:new', onNew)
    }
  }, [conversation?.id, me?.id, qc])

  if (loadingOffer || loadingConv) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
      </div>
    )
  }

  if (offerError || convError || !offer || !conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-white px-6 text-center">
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
    if (conversation?.id) {
      qc.invalidateQueries({ queryKey: messagesKey(conversation.id) })
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const body = text.trim()
    if (!body || send.isPending) return
    send.mutate(body, { onSuccess: () => setText('') })
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <div className="shrink-0">
        <header className="flex items-center gap-2 border-b border-border bg-white px-2 py-2 max-lg:pt-[max(0.5rem,env(safe-area-inset-top))] sm:gap-3 sm:px-4 sm:py-3 lg:px-5">
        <BackButton onClick={() => navigate('/app/messages')} />
        <Avatar src={peer?.photoUrl} name={peer?.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-navy">
            {peer?.name ?? 'طرف مقابل'}
          </p>
          <p className="truncate text-xs text-muted">{offer.campaign.title}</p>
        </div>
        {pending && isBrand ? (
          <div className="flex shrink-0 gap-1.5 sm:gap-2">
            <Button
              type="button"
              fullWidth={false}
              className="px-3 py-2 text-xs sm:px-4"
              loading={update.isPending}
              onClick={() =>
                update.mutate({ status: 'ACCEPTED' }, { onSuccess: refreshTimeline })
              }
            >
              <span className="sm:hidden">قبول</span>
              <span className="hidden sm:inline">قبول پیشنهاد</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              fullWidth={false}
              className="hidden px-3 py-2 text-xs sm:inline-flex"
              loading={update.isPending}
              onClick={() => update.mutate({ status: 'REJECTED' }, { onSuccess: refreshTimeline })}
            >
              رد
            </Button>
          </div>
        ) : relatedDeal ? (
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
          isBrand={Boolean(isBrand)}
          pending={Boolean(pending)}
          updating={update.isPending}
          onAccept={() => update.mutate({ status: 'ACCEPTED' })}
          onReject={() => update.mutate({ status: 'REJECTED' }, { onSuccess: refreshTimeline })}
          onCancel={() => update.mutate({ status: 'CANCELLED' }, { onSuccess: refreshTimeline })}
        />

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
            return (
              <div
                key={m.id}
                className={`flex ${mine ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`w-fit max-w-[min(85%,20rem)] rounded-2xl px-3.5 py-2 text-sm leading-6 shadow-sm ${
                    mine
                      ? 'rounded-br-md bg-purple text-white'
                      : 'rounded-bl-md border border-border bg-white text-navy'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p
                    className={`mt-1 text-[10px] ${
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

      <footer className="shrink-0 border-t border-border bg-white pb-[env(safe-area-inset-bottom)]">
        {relatedDeal && offer.status === 'ACCEPTED' ? (
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
          className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-2 px-3 py-2 sm:px-4 sm:py-3"
        >
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
            disabled={!text.trim()}
          >
            <span className="hidden sm:inline">ارسال پیام</span>
            <span className="sm:hidden">ارسال</span>
          </Button>
        </form>
      </footer>
    </div>
  )
}
