import { extractDigits, toEnglishDigits } from './digits'

export function normalizeCardNumber(value: string): string {
  return extractDigits(value)
}

export function normalizeSheba(value: string): string {
  const raw = toEnglishDigits(value).replace(/[\s-]/g, '').toUpperCase()
  if (/^\d{24}$/.test(raw)) return `IR${raw}`
  return raw
}

export function formatCardGroups(cardNumber: string): string {
  const d = normalizeCardNumber(cardNumber)
  return d.replace(/(\d{4})(?=\d)/g, '$1-')
}

export function formatMaskedCard(cardMasked: string): string {
  const m = cardMasked.replace(/[\s-]/g, '')
  if (m.length < 10) return cardMasked
  return `${m.slice(0, 4)}-${m.slice(4, 6)}**-****-${m.slice(-4)}`
}

export function formatSheba(sheba: string): string {
  const s = normalizeSheba(sheba)
  return s.replace(/(.{4})(?=.)/g, '$1 ')
}

function luhnOk(digits: string): boolean {
  let sum = 0
  let alt = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i])
    if (alt) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}

function shebaChecksumOk(sheba: string): boolean {
  const s = normalizeSheba(sheba)
  if (!/^IR\d{24}$/.test(s)) return false
  const rearranged = s.slice(4) + s.slice(0, 4)
  let numeric = ''
  for (const ch of rearranged) {
    if (ch >= 'A' && ch <= 'Z') numeric += String(ch.charCodeAt(0) - 55)
    else numeric += ch
  }
  let remainder = 0
  for (const ch of numeric) {
    remainder = (remainder * 10 + Number(ch)) % 97
  }
  return remainder === 1
}

export function isValidCardNumber(value: string): boolean {
  const d = normalizeCardNumber(value)
  return d.length === 16 && luhnOk(d)
}

export function isValidSheba(value: string): boolean {
  return shebaChecksumOk(value)
}
