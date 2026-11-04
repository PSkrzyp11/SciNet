import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useArticlesStore } from '../articles'
import { seedArticles, type Article, type ArticleDraft } from '@/data/articles'

const STORAGE_KEY = 'scinet-articles'

const article: Article = {
  id: 100,
  title: 'Zapisany artykuł',
  author: 'Jan Kowalski',
  category: 'Biologia',
  date: '2026-11-01T10:00:00.000Z',
  content: ['Treść.'],
  image: 'https://example.com/obrazek.jpg',
  likes: 3,
  liked: true,
  comments: [{ id: 1, author: 'Ola', text: 'Ciekawe!', date: '2026-11-02T10:00:00.000Z' }],
}

// Nowy Pinia wczytuje dane od nowa, tak jak odświeżenie strony
function reload() {
  setActivePinia(createPinia())
  return useArticlesStore()
}

const draft: ArticleDraft = {
  title: 'Nowy artykuł',
  author: 'Jan Kowalski',
  category: 'Ekologia',
  content: ['Treść.'],
}

describe('useArticlesStore', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('dodaje artykuł na początek listy i uzupełnia pozostałe pola', () => {
    vi.setSystemTime(new Date('2026-11-04T12:00:00.000Z'))
    const store = reload()

    store.add(draft)

    expect(store.articles).toHaveLength(seedArticles.length + 1)
    expect(store.articles[0]).toEqual({
      ...draft,
      id: Date.now(),
      date: '2026-11-04T12:00:00.000Z',
      likes: 0,
      liked: false,
      comments: [],
    })
  })

  it('nadaje kolejnym artykułom różne identyfikatory', () => {
    const store = reload()

    vi.setSystemTime(new Date('2026-11-04T12:00:00.000Z'))
    store.add(draft)
    vi.setSystemTime(new Date('2026-11-04T12:00:01.000Z'))
    store.add(draft)

    expect(new Set(store.articles.map((a) => a.id)).size).toBe(store.articles.length)
  })

  it('dodany artykuł jest na miejscu po odświeżeniu', async () => {
    const store = reload()

    store.add(draft)
    await nextTick()

    expect(reload().articles[0]?.title).toBe('Nowy artykuł')
  })

  it('usuwa wskazany artykuł, a resztę zostawia', () => {
    const store = reload()

    store.remove(1)

    expect(store.articles.map((a) => a.id)).toEqual(
      seedArticles.filter((a) => a.id !== 1).map((a) => a.id),
    )
  })

  it('usunięty artykuł nie wraca po odświeżeniu', async () => {
    const store = reload()

    store.remove(1)
    await nextTick()

    const ids = reload().articles.map((a) => a.id)
    expect(ids).not.toContain(1)
    expect(ids).toHaveLength(seedArticles.length - 1)
  })

  it('po usunięciu wszystkich artykułów tablica zostaje pusta po odświeżeniu', async () => {
    const store = reload()

    for (const { id } of seedArticles) store.remove(id)
    await nextTick()

    expect(reload().articles).toEqual([])
  })

  it('usunięcie nie zmienia przykładowych danych', () => {
    const before = seedArticles.length
    const store = reload()

    store.remove(1)

    expect(seedArticles).toHaveLength(before)
  })

  it('dodanie artykułu nie zmienia przykładowych danych', () => {
    const before = seedArticles.length
    const store = reload()

    store.add(draft)

    expect(seedArticles).toHaveLength(before)
  })

  it('przy pierwszym uruchomieniu pokazuje przykładowe artykuły', () => {
    expect(reload().articles).toEqual(seedArticles)
  })

  it('zapisuje zmiany i wczytuje je po odświeżeniu', async () => {
    const store = reload()

    store.articles = [article]
    await nextTick()

    expect(reload().articles).toEqual([article])
  })

  it('nie przywraca przykładowych artykułów, gdy wszystkie zostały usunięte', async () => {
    const store = reload()

    store.articles = []
    await nextTick()

    expect(localStorage.getItem(STORAGE_KEY)).toBe('[]')
    expect(reload().articles).toEqual([])
  })

  it.each(['{zepsute', '"tekst"', '{"id":1}', 'null'])(
    'przy uszkodzonych danych wraca do przykładowych artykułów: %s',
    (saved) => {
      localStorage.setItem(STORAGE_KEY, saved)

      expect(reload().articles).toEqual(seedArticles)
    },
  )

  it.each([
    ['liczba zamiast artykułu', 1],
    ['brak tytułu', { ...article, title: undefined }],
    ['nieznana dziedzina', { ...article, category: 'Astrologia' }],
    ['treść nie jest listą tekstów', { ...article, content: [1] }],
    ['obrazek nie jest tekstem', { ...article, image: 1 }],
    ['polubienia nie są liczbą', { ...article, likes: '3' }],
    ['uszkodzony komentarz', { ...article, comments: [{ id: 1 }] }],
  ])('pomija uszkodzony wpis, a dobre zostawia: %s', (_, broken) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([article, broken]))

    expect(reload().articles).toEqual([article])
  })

  it('akceptuje artykuł bez obrazka', () => {
    const { image: _image, ...withoutImage } = article
    localStorage.setItem(STORAGE_KEY, JSON.stringify([withoutImage]))

    expect(reload().articles).toEqual([withoutImage])
  })

  it('działa, gdy odczyt z localStorage się nie udaje', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Brak dostępu')
    })

    expect(reload().articles).toEqual(seedArticles)
  })

  it('działa dalej, gdy zapis w localStorage się nie udaje', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Brak miejsca')
    })
    const store = reload()

    store.articles = [article]
    await nextTick()

    expect(store.articles).toEqual([article])
  })
})
