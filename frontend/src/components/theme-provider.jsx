'use client'

import { createContext, useEffect, useState } from 'react'

// Export the context so it can be imported by the hook file
export const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => null,
})

export function ThemeProvider({ children, storageKey = 'ui-theme' }) {
  const [theme, setTheme] = useState(() => {
    // Check for stored theme preference first
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem(storageKey)

      // If no stored theme, check browser preference
      if (!storedTheme && window.matchMedia) {
        // Check if user prefers dark mode
        return window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
      }

      return storedTheme || 'light'
    }
    return 'light'
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])

  const value = {
    theme,
    setTheme: (newTheme) => setTheme(newTheme),
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
