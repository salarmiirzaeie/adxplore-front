import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react'

const LONG_PRESS_MS = 220
const MOVE_PX = 8

function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0) return items
  const next = [...items]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

function sameOrder<T>(a: T[], b: T[], getId: (item: T) => string) {
  return a.length === b.length && a.every((item, i) => getId(item) === getId(b[i]))
}

function cellFromPoint(x: number, y: number) {
  return document
    .elementFromPoint(x, y)
    ?.closest('[data-sortable-id]') as HTMLElement | null
}

type Ghost = {
  url: string
  width: number
  height: number
  x: number
  y: number
}

export function SortableImageGrid<T>({
  items,
  getId,
  getUrl,
  onReorder,
  disabled,
  renderItem,
}: {
  items: T[]
  getId: (item: T) => string
  getUrl: (item: T) => string
  onReorder: (items: T[]) => void
  disabled?: boolean
  renderItem: (item: T, index: number) => ReactNode
}) {
  const [draft, setDraft] = useState<T[] | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [ghost, setGhost] = useState<Ghost | null>(null)
  const displayed = draft ?? items
  const canSort = !disabled && items.length > 1
  const gridRef = useRef<HTMLDivElement>(null)

  const startRef = useRef<{
    id: string
    x: number
    y: number
    pointerId: number
    isTouch: boolean
  } | null>(null)
  const timerRef = useRef<number>(0)
  const draggingIdRef = useRef<string | null>(null)
  const draftRef = useRef<T[] | null>(null)
  const itemsRef = useRef(items)
  const getIdRef = useRef(getId)
  const getUrlRef = useRef(getUrl)
  const onReorderRef = useRef(onReorder)
  draggingIdRef.current = draggingId
  draftRef.current = draft
  itemsRef.current = items
  getIdRef.current = getId
  getUrlRef.current = getUrl
  onReorderRef.current = onReorder

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = 0
    }
  }

  const stopDrag = (commit: boolean) => {
    clearTimer()
    startRef.current = null
    const next = draftRef.current
    const original = itemsRef.current
    setDraggingId(null)
    setGhost(null)
    setDraft(null)
    document.body.style.overflow = ''
    document.body.style.userSelect = ''
    if (commit && next && !sameOrder(next, original, getIdRef.current)) {
      onReorderRef.current(next)
    }
  }

  useEffect(() => () => stopDrag(false), [])

  const beginDrag = (id: string, clientX: number, clientY: number, pointerId: number) => {
    const list = draftRef.current ?? itemsRef.current
    const item = list.find((entry) => getIdRef.current(entry) === id)
    const cell = gridRef.current?.querySelector(
      `[data-sortable-id="${CSS.escape(id)}"]`,
    ) as HTMLElement | null
    if (!item || !cell) return
    const rect = cell.getBoundingClientRect()
    try {
      gridRef.current?.setPointerCapture(pointerId)
    } catch {
      /* pointer already released */
    }
    draggingIdRef.current = id
    setDraggingId(id)
    setDraft([...list])
    setGhost({
      url: getUrlRef.current(item),
      width: rect.width,
      height: rect.height,
      x: clientX - rect.width / 2,
      y: clientY - rect.height / 2,
    })
    document.body.style.overflow = 'hidden'
    document.body.style.userSelect = 'none'
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!canSort || e.button !== 0) return
    if ((e.target as HTMLElement).closest('button')) return
    const cell = (e.target as HTMLElement).closest(
      '[data-sortable-id]',
    ) as HTMLElement | null
    const id = cell?.dataset.sortableId
    if (!id) return
    const isTouch = e.pointerType === 'touch'
    startRef.current = {
      id,
      x: e.clientX,
      y: e.clientY,
      pointerId: e.pointerId,
      isTouch,
    }
    if (isTouch) {
      clearTimer()
      timerRef.current = window.setTimeout(() => {
        const start = startRef.current
        if (!start || start.id !== id) return
        beginDrag(id, start.x, start.y, start.pointerId)
      }, LONG_PRESS_MS)
      return
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const start = startRef.current
    const activeId = draggingIdRef.current

    if (!activeId && start) {
      const dx = e.clientX - start.x
      const dy = e.clientY - start.y
      if (dx * dx + dy * dy < MOVE_PX * MOVE_PX) return
      if (start.isTouch) {
        clearTimer()
        startRef.current = null
        return
      }
      beginDrag(start.id, e.clientX, e.clientY, start.pointerId)
    }

    if (!draggingIdRef.current) return
    e.preventDefault()
    setGhost((prev) =>
      prev
        ? {
            ...prev,
            x: e.clientX - prev.width / 2,
            y: e.clientY - prev.height / 2,
          }
        : prev,
    )

    const overId = cellFromPoint(e.clientX, e.clientY)?.dataset.sortableId
    const currentId = draggingIdRef.current
    if (!overId || !currentId || overId === currentId) return

    setDraft((prev) => {
      const list = prev ?? itemsRef.current
      const from = list.findIndex((item) => getIdRef.current(item) === currentId)
      const to = list.findIndex((item) => getIdRef.current(item) === overId)
      if (from < 0 || to < 0) return list
      return moveItem(list, from, to)
    })
  }

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    if (draggingIdRef.current) stopDrag(true)
    else {
      clearTimer()
      startRef.current = null
    }
  }

  return (
    <>
      <div
        ref={gridRef}
        className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${canSort ? 'select-none' : ''} ${
          draggingId ? 'cursor-grabbing touch-none' : ''
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {displayed.map((item, index) => {
          const id = getId(item)
          const dragging = id === draggingId
          return (
            <div
              key={id}
              data-sortable-id={id}
              className={`group relative overflow-hidden rounded-xl border border-border bg-surface touch-manipulation select-none [-webkit-touch-callout:none] ${
                canSort ? 'cursor-grab' : ''
              } ${dragging ? 'opacity-40' : ''}`}
            >
              {renderItem(item, index)}
            </div>
          )
        })}
      </div>
      {ghost ? (
        <img
          src={ghost.url}
          alt=""
          draggable={false}
          className="pointer-events-none fixed z-200 rounded-xl object-cover opacity-90 shadow-2xl ring-2 ring-purple"
          style={{
            width: ghost.width,
            height: ghost.height,
            left: ghost.x,
            top: ghost.y,
          }}
        />
      ) : null}
    </>
  )
}
