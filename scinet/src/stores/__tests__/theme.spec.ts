import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useThemeStore } from '../theme'

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    delete document.documentElement.dataset.theme
    setActivePinia(createPinia())
  })

  it('przejmuje motyw ustawiony przez skrypt w index.html', () => {
    document.documentElement.dataset.theme = 'dark'

    expect(useThemeStore().isDark).toBe(true)
  })

  it('domyślnie używa trybu jasnego', () => {
    expect(useThemeStore().isDark).toBe(false)
  })

  it('przełącza motyw i zapamiętuje wybór', () => {
    const theme = useThemeStore()

    theme.toggle()
    expect(theme.isDark).toBe(true)
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('scinet-theme')).toBe('dark')

    theme.toggle()
    expect(theme.isDark).toBe(false)
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem('scinet-theme')).toBe('light')
  })

  it('przełącza motyw, gdy zapis w localStorage się nie udaje', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Brak miejsca')
    })
    const theme = useThemeStore()

    theme.toggle()

    expect(theme.isDark).toBe(true)
  })
})
