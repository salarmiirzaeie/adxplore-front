import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChatThread } from '../components/ChatThread'
import { Avatar } from '../components/ui/Avatar'
import { useMe } from '../hooks/useAuth'
import { useConversations } from '../hooks/useChat'
import { useOffers } from '../hooks/useOffers'
import { messageSnippet } from '../components/MediaPreview'
import { offerPipelineLabel } from '../lib/brand-options'
import type { Conversation, Offer } from '../types/api'

function formatRelative(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  if (sameDay) {
    return d.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return d.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })
}

function ConversationRow({
  conversation,
  offer,
  active,
  isBrand,
  onSelect,
}: {
  conversation: Conversation
  offer?: Offer
  active: boolean
  isBrand: boolean
  onSelect: () => void
}) {
  const snippet =
    (conversation.lastMessage
      ? messageSnippet(
          conversation.lastMessage.kind,
          conversation.lastMessage.body,
        )
      : null) ||
    (offer
      ? `پیشنهاد ${offer.fee.toLocaleString('fa-IR')} تومان`
      : 'گفتگوی پیشنهاد')

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-3 border-b border-border px-4 py-3.5 text-right transition active:bg-surface ${
        active ? 'bg-purple-soft/50' : 'hover:bg-surface'
      }`}
    >
      <Avatar
        src={conversation.peerPhotoUrl}
        name={conversation.peerName}
        size="md"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-extrabold text-navy">
            {conversation.peerName ?? 'کاربر'}
          </p>
          <span className="shrink-0 text-[10px] font-semibold text-muted">
            {formatRelative(
              conversation.lastMessage?.createdAt ?? conversation.updatedAt,
            )}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted">
          {conversation.campaignTitle ?? 'کمپین'}
          {offer ? ` · ${offerPipelineLabel(offer.status)}` : ''}
        </p>
        <p className="mt-1 truncate text-xs font-medium text-navy/80">
          {isBrand ? 'پیشنهاد روی کمپین' : 'پیشنهاد شما'} · {snippet}
        </p>
      </div>
      {conversation.unreadCount > 0 ? (
        <span className="mt-1 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-purple px-1 text-[10px] font-bold text-white">
          {conversation.unreadCount.toLocaleString('fa-IR')}
        </span>
      ) : null}
    </button>
  )
}

export function MessagesPage() {
  const { offerId: selectedOfferId } = useParams<{ offerId?: string }>()
  const navigate = useNavigate()
  const { data: me } = useMe()
  const { data: conversations = [], isLoading: loadingConv } =
    useConversations()
  const { data: offers = [] } = useOffers(undefined, Boolean(me))
  const [query, setQuery] = useState('')

  const offerById = useMemo(() => {
    const map = new Map<string, Offer>()
    for (const o of offers) map.set(o.id, o)
    return map
  }, [offers])

  const filtered = useMemo(() => {
    const q = query.trim()
    if (!q) return conversations
    return conversations.filter((c) => {
      const hay = `${c.peerName ?? ''} ${c.campaignTitle ?? ''}`.toLowerCase()
      return hay.includes(q.toLowerCase())
    })
  }, [conversations, query])

  const isBrand = me?.role === 'BRAND'
  const isThread = Boolean(selectedOfferId)
  const showListOnMobile = !isThread

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-surface-elevated lg:flex-row">
      <aside
        className={`flex h-full min-h-0 w-full shrink-0 flex-col border-border lg:w-[22rem] lg:border-l ${
          showListOnMobile ? 'flex' : 'hidden lg:flex'
        }`}
      >
        <div className="shrink-0 border-b border-border bg-surface-elevated px-4 pb-3 pt-4 lg:pt-3">
          <h1 className="mb-3 text-lg font-extrabold text-navy">پیام‌ها</h1>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی طرف مقابل یا کمپین…"
            className="input-brand w-full text-sm"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {loadingConv ? (
            <div className="flex justify-center py-16">
              <span className="size-7 animate-spin rounded-full border-2 border-purple border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-bold text-navy">هنوز گفتگویی نیست</p>
              <p className="mt-2 text-xs leading-6 text-muted">
                با ارسال یا دریافت پیشنهاد، گفتگو اینجا ساخته می‌شود.
              </p>
              <Link
                to="/app/campaigns"
                className="mt-4 inline-block text-sm font-bold text-purple"
              >
                مشاهده کمپین‌ها
              </Link>
            </div>
          ) : (
            filtered.map((c) => (
              <ConversationRow
                key={c.id}
                conversation={c}
                offer={offerById.get(c.offerId)}
                active={c.offerId === selectedOfferId}
                isBrand={Boolean(isBrand)}
                onSelect={() => navigate(`/app/messages/${c.offerId}`)}
              />
            ))
          )}
        </div>
      </aside>

      <section
        className={`flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${
          showListOnMobile ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {selectedOfferId ? (
          <ChatThread offerId={selectedOfferId} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-surface text-purple">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 6h16v12H4z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                />
                <path
                  d="M4 6l8 7 8-7"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-base font-extrabold text-navy">
              یک گفتگو را انتخاب کنید
            </p>
            <p className="max-w-xs text-sm leading-7 text-muted">
              از لیست کنار، پیشنهاد یا مخاطب را باز کنید تا گفتگو و کارت پیشنهاد
              را ببینید.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
