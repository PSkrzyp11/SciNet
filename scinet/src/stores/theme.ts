import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'scinet-theme'

export const useThemeStore = defineStore('theme', () => {
  // Startowy motyw ustawia skrypt w index.html, zanim strona się wyświetli
  const isDarkAtStart = document.documentElement.dataset.theme === 'dark'
  const theme = ref(isDarkAtStart ? 'dark' : 'light')

  const isDark = computed(() => theme.value === 'dark')

  function toggle() {
    theme.value = isDark.value ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme.value
    try {
      localStorage.setItem(STORAGE_KEY, theme.value)
    } catch {
      // Bez zapisu wybór działa do odświeżenia strony
    }
  }

  return { isDark, toggle }
})
