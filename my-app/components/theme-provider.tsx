"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

const THEME_STORAGE_KEY = "oy-theme-palette"
const VALID_PALETTES: ThemePalette[] = ["default", "caffeine"]

export type ThemePalette = "default" | "caffeine"

type ThemePaletteContextValue = {
  palette: ThemePalette
  setPalette: (palette: ThemePalette) => void
}

const ThemePaletteContext = React.createContext<ThemePaletteContextValue | null>(
  null
)

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [palette, setPaletteState] = React.useState<ThemePalette>("default")
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored && VALID_PALETTES.includes(stored as ThemePalette)) {
      setPaletteState(stored as ThemePalette)
    }
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (!hydrated) return

    const root = document.documentElement
    // Remove all palette classes
    VALID_PALETTES.forEach((p) => root.classList.remove(`theme-${p}`))
    // Add the current palette class
    root.classList.add(`theme-${palette}`)
    window.localStorage.setItem(THEME_STORAGE_KEY, palette)
  }, [palette, hydrated])

  const setPalette = React.useCallback((nextPalette: ThemePalette) => {
    setPaletteState(nextPalette)
  }, [])

  const value = React.useMemo(
    () => ({
      palette,
      setPalette,
    }),
    [palette, setPalette]
  )

  return (
    <ThemePaletteContext.Provider value={value}>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </ThemePaletteContext.Provider>
  )
}

export function useThemePalette() {
  const context = React.useContext(ThemePaletteContext)
  if (!context) {
    throw new Error("useThemePalette must be used within ThemeProvider")
  }
  return context
}