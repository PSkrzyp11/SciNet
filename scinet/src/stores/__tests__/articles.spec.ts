import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useArticlesStore } from '../articles'
import { seedArticles, type Article } from '@/data/articles'

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

describe('useArticlesStore', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
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
