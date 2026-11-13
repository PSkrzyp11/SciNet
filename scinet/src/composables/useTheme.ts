import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'scinet-theme'

const isThemeMode = (value: unknown): value is ThemeMode => value === 'light' || value === 'dark'

// Motyw ustawia skrypt w index.html, zanim strona się wyświetli. Portal jest domyślnie ciemny.
function readInitialTheme(): ThemeMode {
  if (typeof document !== 'undefined') {
    const applied = document.documentElement.getAttribute('data-theme')
    if (isThemeMode(applied)) return applied
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isThemeMode(saved)) return saved
  } catch {
    // Bez dostępu do localStorage zostaje motyw domyślny
  }
  return 'dark'
}

const theme = ref<ThemeMode>(readInitialTheme())

function applyTheme(mode: ThemeMode) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', mode)
  }
}

applyTheme(theme.value)

// Zapisujemy dopiero świadomy wybór użytkownika, a nie motyw domyślny
watch(theme, (mode) => {
  applyTheme(mode)
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // Brak zapisu nie blokuje przełączenia motywu w bieżącej sesji
  }
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
