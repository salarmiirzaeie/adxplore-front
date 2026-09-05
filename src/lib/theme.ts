export type Theme = 'dark' | 'light'

export const THEME_KEY = 'adxplore-theme-v2'

const LIGHT_THEME_COLOR = '#ffffff'
const DARK_THEME_COLOR = '#0b1120'

export function getStoredTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('light', theme === 'light')
  root.style.colorScheme = theme

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute(
      'content',
      theme === 'light' ? LIGHT_THEME_COLOR : DARK_THEME_COLOR,
    )
  }

  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    /* ignore */
  }
}

export function toggleThemeValue(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark'
}
