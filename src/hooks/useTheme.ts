import { useCallback, useEffect, useState } from 'react'
import {
  applyTheme,
  getStoredTheme,
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
      if (event.key !== 'adxplore-theme') return
      setThemeState(event.newValue === 'light' ? 'light' : 'dark')
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
