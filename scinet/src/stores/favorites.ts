import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { articles } from '@/data/articles'

const STORAGE_KEY = 'scinet-favorites'

// localStorage może być niedostępny albo zawierać uszkodzone dane
function load(): number[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(saved) ? saved.filter((id) => typeof id === 'number') : []
  } catch {
    return []
  }
}

function save(ids: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Bez zapisu ulubione działają do odświeżenia strony
  }
}

export const useFavoritesStore = defineStore('favorites', () => {
  const ids = ref<number[]>(load())

  const savedArticles = computed(() => articles.filter((a) => ids.value.includes(a.id)))
  const count = computed(() => savedArticles.value.length)

  function isFavorite(id: number) {
    return ids.value.includes(id)
  }

  function toggle(id: number) {
    ids.value = isFavorite(id) ? ids.value.filter((saved) => saved !== id) : [...ids.value, id]
  }

  watch(ids, save)

  return { savedArticles, count, isFavorite, toggle }
})
