import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import router, { scrollTarget } from '../index'

const scrollTo = vi.fn()

describe('router', () => {
  beforeEach(() => {
    window.scrollTo = scrollTo
    scrollTo.mockClear()
  })

  it.each([
    ['/', 'home', 'SciNet'],
    ['/artykuly/1', 'article', 'Artykuł | SciNet'],
    ['/artykuly/1/edytuj', 'article-edit', 'Edycja artykułu | SciNet'],
    ['/autorzy', 'authors', 'Autorzy | SciNet'],
    ['/zapisane', 'favorites', 'Zapisane | SciNet'],
    ['/kontakt', 'contact', 'Kontakt | SciNet'],
    ['/nie/ma/takiej/strony', 'not-found', 'Nie znaleziono strony | SciNet'],
  ])('adres %s prowadzi do %s i ustawia tytuł karty', async (path, name, title) => {
    await router.push(path)

    expect(router.currentRoute.value.name).toBe(name)
    expect(document.title).toBe(title)
  })

  it('przekierowuje /artykuly na tablicę i zachowuje filtry', async () => {
    await router.push('/artykuly?kategoria=Fizyka&q=kwant')

    expect(router.currentRoute.value.name).toBe('home')
    expect(router.currentRoute.value.query).toEqual({ kategoria: 'Fizyka', q: 'kwant' })
    expect(document.title).toBe('SciNet')
  })

  it('przewija na górę po przejściu na inną stronę', async () => {
    await router.push('/autorzy')
    await flushPromises()
    scrollTo.mockClear()

    await router.push('/kontakt')
    await flushPromises()

    expect(scrollTo).toHaveBeenCalledOnce()
  })

  it('nie przewija po zmianie samych parametrów adresu', async () => {
    await router.push('/')
    await flushPromises()
    scrollTo.mockClear()

    await router.push('/?q=kwant')
    await flushPromises()

    expect(scrollTo).not.toHaveBeenCalled()
  })
})

describe('scrollTarget', () => {
  it('nowa strona zaczyna się od góry', () => {
    expect(scrollTarget({ path: '/kontakt' }, { path: '/' }, null)).toBe(0)
  })

  it('przycisk „wstecz” wraca do zapamiętanej pozycji', () => {
    expect(scrollTarget({ path: '/' }, { path: '/artykuly/1' }, { top: 1240 })).toBe(1240)
  })

  it('zmiana samych parametrów adresu nie przewija strony', () => {
    expect(scrollTarget({ path: '/' }, { path: '/' }, null)).toBeNull()
    expect(scrollTarget({ path: '/' }, { path: '/' }, { top: 300 })).toBeNull()
  })

  it('po przejściu na inną stronę fokus trafia na początek jej treści', async () => {
    const main = document.createElement('main')
    main.id = 'main'
    main.tabIndex = -1
    document.body.append(main)
    await router.push('/')
    await flushPromises()

    await router.push('/kontakt')
    await flushPromises()

    expect(document.activeElement).toBe(main)
    main.remove()
  })

  it('zmiana samych filtrów zostawia fokus w wyszukiwarce', async () => {
    const main = document.createElement('main')
    main.id = 'main'
    main.tabIndex = -1
    const search = document.createElement('input')
    document.body.append(main, search)
    await router.push('/')
    await flushPromises()
    search.focus()

    await router.push('/?q=kwant')
    await flushPromises()

    expect(document.activeElement).toBe(search)
    main.remove()
    search.remove()
  })
})
