import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useFavoritesStore } from '../favorites'

const STORAGE_KEY = 'scinet-favorites'

describe('useFavoritesStore', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  it('na starcie jest pusty', () => {
    const favorites = useFavoritesStore()

    expect(favorites.count).toBe(0)
    expect(favorites.savedArticles).toEqual([])
  })

  it('dodaje i usuwa artykuł', () => {
    const favorites = useFavoritesStore()

    favorites.toggle(1)
    expect(favorites.isFavorite(1)).toBe(true)
    expect(favorites.count).toBe(1)
    expect(favorites.savedArticles.map((a) => a.id)).toEqual([1])

    favorites.toggle(1)
    expect(favorites.isFavorite(1)).toBe(false)
    expect(favorites.count).toBe(0)
  })

  it('zapisuje zmiany w localStorage', async () => {
    const favorites = useFavoritesStore()

    favorites.toggle(2)
    await nextTick()

    expect(localStorage.getItem(STORAGE_KEY)).toBe('[2]')
  })

  it('wczytuje zapisane artykuły przy starcie', () => {
    localStorage.setItem(STORAGE_KEY, '[1,3]')

    const favorites = useFavoritesStore()

    expect(favorites.savedArticles.map((a) => a.id)).toEqual([1, 3])
  })

  it('nie liczy artykułów, których już nie ma', () => {
    localStorage.setItem(STORAGE_KEY, '[1,999]')

    expect(useFavoritesStore().count).toBe(1)
  })

  it.each(['{zepsute', '"tekst"', '{"id":1}', 'null'])('ignoruje uszkodzone dane: %s', (saved) => {
    localStorage.setItem(STORAGE_KEY, saved)

    expect(useFavoritesStore().count).toBe(0)
  })

  it('pomija wartości, które nie są liczbami', () => {
    localStorage.setItem(STORAGE_KEY, '[1,"2",null]')

    const favorites = useFavoritesStore()

    expect(favorites.isFavorite(1)).toBe(true)
    expect(favorites.count).toBe(1)
  })

  it('działa dalej, gdy zapis w localStorage się nie udaje', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Brak miejsca')
    })
    const favorites = useFavoritesStore()

    favorites.toggle(1)
    await nextTick()

    expect(favorites.isFavorite(1)).toBe(true)
  })
})
