import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useArticlesStore } from '../articles'
import { useFavoritesStore } from '../favorites'
import { seedArticles, type ArticleDraft } from '@/data/articles'

const STORAGE_KEY = 'scinet-favorites'

describe('useFavoritesStore', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('usunięty artykuł znika z zapisanych', () => {
    const favorites = useFavoritesStore()
    favorites.toggle(1)

    useArticlesStore().remove(1)

    expect(favorites.count).toBe(0)
    expect(favorites.savedArticles).toEqual([])
  })

  it('nowy artykuł nie przejmuje zakładki po usuniętym', () => {
    const articles = useArticlesStore()
    const favorites = useFavoritesStore()
    const draft: ArticleDraft = {
      title: 'Nowy',
      author: 'Jan',
      category: 'Fizyka',
      content: ['Treść.'],
    }
    const newestId = () => articles.articles[0]?.id ?? 0

    vi.setSystemTime(new Date('2026-11-04T12:00:00.000Z'))
    articles.add(draft)
    const removedId = newestId()
    favorites.toggle(removedId)
    articles.remove(removedId)

    vi.setSystemTime(new Date('2026-11-04T12:00:01.000Z'))
    articles.add(draft)

    expect(newestId()).not.toBe(removedId)
    expect(favorites.isFavorite(newestId())).toBe(false)
    expect(favorites.count).toBe(0)
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

  it('korzysta z artykułów zapisanych w przeglądarce', () => {
    const [first] = seedArticles
    localStorage.setItem('scinet-articles', JSON.stringify([{ ...first, id: 100 }]))
    localStorage.setItem(STORAGE_KEY, '[100,1]')

    expect(useFavoritesStore().savedArticles.map((a) => a.id)).toEqual([100])
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
