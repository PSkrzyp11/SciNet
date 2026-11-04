import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import router from '../index'

const scrollTo = vi.fn()

describe('router', () => {
  beforeEach(() => {
    window.scrollTo = scrollTo
    scrollTo.mockClear()
  })

  it.each([
    ['/', 'home', 'SciNet'],
    ['/artykuly/1', 'article', 'Artykuł | SciNet'],
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
