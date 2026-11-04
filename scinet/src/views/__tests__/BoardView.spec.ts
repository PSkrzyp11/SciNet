import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import BoardView from '../BoardView.vue'
import { seedArticles as articles } from '@/data/articles'
import { useArticlesStore } from '@/stores/articles'

async function mountAt(url: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: BoardView },
      { path: '/artykuly/:id', component: { template: '<div />' } },
    ],
  })
  await router.push(url)
  await router.isReady()

  const pinia = createPinia()
  const wrapper = mount(BoardView, { global: { plugins: [router, pinia] } })

  const titles = () => wrapper.findAll('.card h3').map((title) => title.text())
  const filter = (name: string) => {
    const button = wrapper.findAll('.filters button').find((b) => b.text() === name)
    if (!button) throw new Error(`Brak filtra: ${name}`)
    return button
  }

  return { wrapper, router, titles, filter, store: useArticlesStore(pinia) }
}

describe('BoardView', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('pokazuje wszystkie artykuły, od najnowszego', async () => {
    const { wrapper, titles, filter } = await mountAt('/')

    expect(titles()).toEqual(
      [...articles].sort((a, b) => b.date.localeCompare(a.date)).map((a) => a.title),
    )
    expect(wrapper.find('.count').text()).toBe(`Znaleziono: ${articles.length}`)
    expect(filter('Wszystkie').classes()).toContain('active')
  })

  it('pokazuje artykuły zapisane w przeglądarce i ich dziedziny', async () => {
    const [first] = articles
    localStorage.setItem(
      'scinet-articles',
      JSON.stringify([{ ...first, title: 'Zapisany artykuł', category: 'Ekologia' }]),
    )

    const { wrapper, titles } = await mountAt('/')

    expect(titles()).toEqual(['Zapisany artykuł'])
    expect(wrapper.findAll('.filters button').map((b) => b.text())).toEqual([
      'Wszystkie',
      'Ekologia',
    ])
  })

  it('reaguje na zmiany w store', async () => {
    const { wrapper, store, titles } = await mountAt('/')

    store.articles = store.articles.filter((a) => a.title === 'CRISPR w praktyce')
    await wrapper.vm.$nextTick()

    expect(titles()).toEqual(['CRISPR w praktyce'])
  })

  it('czyta kategorię i wyszukiwanie z adresu', async () => {
    const { wrapper, titles, filter } = await mountAt('/?kategoria=Fizyka&q=kwant')

    expect(titles()).toEqual(['Jak działają komputery kwantowe?'])
    expect(filter('Fizyka').classes()).toContain('active')
    expect((wrapper.find('.search').element as HTMLInputElement).value).toBe('kwant')
  })

  it('ignoruje nieistniejącą kategorię w adresie', async () => {
    const { titles, filter } = await mountAt('/?kategoria=Nieistnieje')

    expect(titles()).toHaveLength(articles.length)
    expect(filter('Wszystkie').classes()).toContain('active')
  })

  it('ignoruje wyszukiwanie podane w adresie wiele razy', async () => {
    const { wrapper, titles } = await mountAt('/?q=a&q=b')

    expect(titles()).toHaveLength(articles.length)
    expect((wrapper.find('.search').element as HTMLInputElement).value).toBe('')
  })

  it('zapisuje wybraną kategorię w adresie', async () => {
    const { router, titles, filter } = await mountAt('/')

    await filter('Biologia').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query.kategoria).toBe('Biologia')
    expect(titles()).toEqual(['CRISPR w praktyce'])

    await filter('Wszystkie').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query.kategoria).toBeUndefined()
    expect(titles()).toHaveLength(articles.length)
  })

  it('szuka po tytule bez względu na wielkość liter', async () => {
    const { wrapper, router, titles } = await mountAt('/')

    await wrapper.find('.search').setValue('KWANTOWE')
    await flushPromises()

    expect(router.currentRoute.value.query.q).toBe('KWANTOWE')
    expect(titles()).toEqual(['Jak działają komputery kwantowe?'])
  })

  it.each(['Kasia', 'splątanie'])('nie szuka po autorze ani treści: %s', async (text) => {
    const { titles } = await mountAt(`/?q=${encodeURIComponent(text)}`)

    expect(titles()).toEqual([])
  })

  it('łączy kategorię z wyszukiwaniem', async () => {
    const { titles } = await mountAt('/?kategoria=Biologia&q=kwant')

    expect(titles()).toEqual([])
  })

  it('po braku wyników pozwala wyczyścić filtry jednym kliknięciem', async () => {
    const { wrapper, router, titles } = await mountAt('/?kategoria=Biologia&q=kwant')

    expect(wrapper.find('.empty').exists()).toBe(true)

    await wrapper.find('.reset').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({})
    expect(wrapper.find('.empty').exists()).toBe(false)
    expect(titles()).toHaveLength(articles.length)
  })

  it('sortuje od najstarszego i alfabetycznie', async () => {
    const { wrapper, titles } = await mountAt('/')

    await wrapper.find('.sort select').setValue('oldest')
    expect(titles()[0]).toBe('Matematyka w muzyce')
    expect(titles()[titles().length - 1]).toBe('Jak działają komputery kwantowe?')

    await wrapper.find('.sort select').setValue('title')
    expect(titles()).toEqual(
      [...articles].map((a) => a.title).sort((a, b) => a.localeCompare(b, 'pl')),
    )
  })

  it('nie zmienia kolejności wspólnej listy artykułów', async () => {
    const { wrapper, store } = await mountAt('/')
    const before = store.articles.map((a) => a.id)

    await wrapper.find('.sort select').setValue('title')

    expect(store.articles.map((a) => a.id)).toEqual(before)
  })
})
