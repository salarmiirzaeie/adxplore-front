import { useCallback, useEffect, useState } from 'react'
import {
  applyTheme,
  getStoredTheme,
  THEME_KEY,
  toggleThemeValue,
  type Theme,
} from '../lib/theme'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_KEY) return
      setThemeState(event.newValue === 'dark' ? 'dark' : 'light')
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((current) => toggleThemeValue(current))
  }, [])

  return { theme, setTheme, toggleTheme }
}
