import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

const STORAGE_KEY = 'scinet-theme'

// Motyw jest ustalany przy wczytaniu modułu, więc każdy test wczytuje go od nowa
async function loadTheme() {
  vi.resetModules()
  const { useTheme } = await import('../useTheme')
  return useTheme()
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('bez zapisanego wyboru portal jest ciemny', async () => {
    const { theme } = await loadTheme()

    expect(theme.value).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('motywu domyślnego nie zapisuje jako wyboru użytkownika', async () => {
    await loadTheme()

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('przejmuje motyw ustawiony przez skrypt w index.html', async () => {
    document.documentElement.setAttribute('data-theme', 'light')

    const { theme } = await loadTheme()

    expect(theme.value).toBe('light')
  })

  it('wczytuje zapisany wybór', async () => {
    localStorage.setItem(STORAGE_KEY, 'light')

    const { theme } = await loadTheme()

    expect(theme.value).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it.each(['purple', '', '{}'])('ignoruje nieznaną zapisaną wartość: "%s"', async (saved) => {
    localStorage.setItem(STORAGE_KEY, saved)

    const { theme } = await loadTheme()

    expect(theme.value).toBe('dark')
  })

  it('przełączenie zmienia motyw strony i zapisuje wybór', async () => {
    const { theme, toggleTheme } = await loadTheme()

    toggleTheme()
    await nextTick()

    expect(theme.value).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light')
  })

  it('działa dalej, gdy zapis w localStorage się nie udaje', async () => {
    const { theme, toggleTheme } = await loadTheme()
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Brak miejsca')
    })

    toggleTheme()
    await nextTick()

    expect(theme.value).toBe('light')
    setItem.mockRestore()
  })
})
