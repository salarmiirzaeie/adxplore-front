/** Normalize Iranian mobile numbers to 09xxxxxxxxx. */
export function normalizeIranPhone(phone: string): string {
  const digits = phone.replace(/[\s\-()]/g, '')
  let normalized = digits

  if (normalized.startsWith('+98')) {
    normalized = '0' + normalized.slice(3)
  } else if (normalized.startsWith('98') && normalized.length === 12) {
    normalized = '0' + normalized.slice(2)
  } else if (normalized.startsWith('9') && normalized.length === 10) {
    normalized = '0' + normalized
  }

  return normalized
}

/** Accepts 09… / 9… / +989… / 989… */
export const IRAN_MOBILE_PATTERN = /^(\+98|0|98)?9\d{9}$/

export function isValidIranMobile(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '')
  return IRAN_MOBILE_PATTERN.test(cleaned)
}

export function formatPhoneDisplay(phone: string): string {
  const n = normalizeIranPhone(phone)
  if (n.length === 11) {
    return `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7)}`
  }
  return phone
}
