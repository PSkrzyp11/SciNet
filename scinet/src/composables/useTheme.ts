import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'scinet-theme'

function readInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark'
    }
  } catch {
    // W środowisku testowym lub bez dostępu do localStorage domyślny jest tryb jasny
  }
  return 'light'
}

const theme = ref<ThemeMode>(readInitialTheme())

function applyTheme(mode: ThemeMode) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', mode)
  }
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // Brak zapisu nie blokuje przełączenia motywu w bieżącej sesji
  }
}

applyTheme(theme.value)

watch(theme, (mode) => {
  applyTheme(mode)
})

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  function setTheme(mode: ThemeMode) {
    theme.value = mode
  }

  return {
    theme,
    toggleTheme,
    setTheme,
  }
}
