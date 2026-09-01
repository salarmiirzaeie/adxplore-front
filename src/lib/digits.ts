/** Persian (۰-۹) and Arabic-Indic (٠-٩) digits → ASCII 0-9. */

const PERSIAN_ZERO = 0x06f0
const ARABIC_INDIC_ZERO = 0x0660

export function toEnglishDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (ch) => {
    const code = ch.charCodeAt(0)
    if (code >= PERSIAN_ZERO && code <= PERSIAN_ZERO + 9) {
      return String(code - PERSIAN_ZERO)
    }
    if (code >= ARABIC_INDIC_ZERO && code <= ARABIC_INDIC_ZERO + 9) {
      return String(code - ARABIC_INDIC_ZERO)
    }
    return ch
  })
}

/** Keep ASCII digits after converting Eastern/Persian numerals. */
export function extractDigits(value: string): string {
  return toEnglishDigits(value).replace(/\D/g, '')
}

/**
 * Parse a number from mixed English/Persian/Arabic digits.
 * Accepts `,` / `٬` thousand separators and `.` / `٫` decimals.
 */
export function parseNumber(value: string): number {
  const normalized = toEnglishDigits(value)
    .replace(/[٬,\s]/g, '')
    .replace(/٫/g, '.')
    .trim()
  if (!normalized) return NaN
  const n = Number(normalized)
  return Number.isFinite(n) ? n : NaN
}
