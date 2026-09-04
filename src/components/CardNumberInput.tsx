import {
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react'
import { extractDigits } from '../lib/digits'

const GROUP_COUNT = 4
const GROUP_SIZE = 4
const CARD_LENGTH = GROUP_COUNT * GROUP_SIZE

function splitGroups(value: string): string[] {
  const digits = extractDigits(value).slice(0, CARD_LENGTH)
  return Array.from({ length: GROUP_COUNT }, (_, i) =>
    digits.slice(i * GROUP_SIZE, i * GROUP_SIZE + GROUP_SIZE),
  )
}

interface CardNumberInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  id?: string
}

export function CardNumberInput({
  label = 'شماره کارت',
  value,
  onChange,
  onBlur,
  error,
  id,
}: CardNumberInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const groups = splitGroups(value)

  const write = (nextGroups: string[]) => {
    onChange(extractDigits(nextGroups.join('')).slice(0, CARD_LENGTH))
  }

  const focusGroup = (index: number, cursor: 'start' | 'end' = 'end') => {
    const el = inputsRef.current[index]
    if (!el) return
    el.focus()
    const pos = cursor === 'start' ? 0 : el.value.length
    el.setSelectionRange(pos, pos)
  }

  const applyFromIndex = (index: number, raw: string) => {
    const incoming = extractDigits(raw)
    const next = [...groups]

    if (incoming.length <= GROUP_SIZE) {
      next[index] = incoming
      write(next)
      if (incoming.length === GROUP_SIZE && index < GROUP_COUNT - 1) {
        focusGroup(index + 1, 'start')
      }
      return
    }

    let offset = 0
    let pos = index
    while (pos < GROUP_COUNT && offset < incoming.length) {
      next[pos] = incoming.slice(offset, offset + GROUP_SIZE)
      offset += GROUP_SIZE
      pos += 1
    }
    write(next)
    const lastFilled = Math.min(
      index + Math.ceil(incoming.length / GROUP_SIZE) - 1,
      GROUP_COUNT - 1,
    )
    focusGroup(lastFilled)
  }

  const onPaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const pasted = extractDigits(e.clipboardData.getData('text')).slice(0, CARD_LENGTH)
    if (!pasted) return
    onChange(pasted)
    const focusAt = Math.min(Math.floor((pasted.length - 1) / GROUP_SIZE), GROUP_COUNT - 1)
    focusGroup(Math.max(focusAt, 0))
  }

  const onKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0

    if (e.key === 'Backspace' && start === 0 && end === 0 && index > 0) {
      e.preventDefault()
      const next = [...groups]
      next[index - 1] = next[index - 1].slice(0, -1)
      write(next)
      focusGroup(index - 1)
      return
    }

    if (e.key === 'ArrowLeft' && start === 0 && end === 0 && index > 0) {
      e.preventDefault()
      focusGroup(index - 1)
      return
    }

    if (
      e.key === 'ArrowRight' &&
      start === el.value.length &&
      end === el.value.length &&
      index < GROUP_COUNT - 1
    ) {
      e.preventDefault()
      focusGroup(index + 1, 'start')
    }
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {label ? (
        <span className="text-sm font-semibold text-navy">{label}</span>
      ) : null}
      <div className="flex items-center gap-1 sm:gap-2" dir="ltr" onPaste={onPaste}>
        {groups.map((group, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el
            }}
            id={i === 0 ? id : undefined}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? 'cc-number' : 'off'}
            maxLength={GROUP_SIZE}
            value={group}
            placeholder="0000"
            aria-label={`شماره کارت، گروه ${i + 1}`}
            aria-invalid={error ? true : undefined}
            className="input-brand min-w-0 flex-1 px-1 text-center text-sm font-bold tabular-nums tracking-widest sm:px-3 sm:text-base"
            onChange={(e) => applyFromIndex(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onBlur={onBlur}
          />
        ))}
      </div>
      {error ? (
        <span className="text-xs font-medium text-red-500">{error}</span>
      ) : null}
    </div>
  )
}
