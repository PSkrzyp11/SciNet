import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import ArticlesView from '../ArticlesView.vue'
import { articles } from '@/data/articles'

async function mountAt(url: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/artykuly', component: ArticlesView },
      { path: '/artykuly/:id', component: { template: '<div />' } },
    ],
  })
  await router.push(url)
  await router.isReady()

  const wrapper = mount(ArticlesView, { global: { plugins: [router, createPinia()] } })

  const titles = () => wrapper.findAll('.card h3').map((title) => title.text())
  const filter = (name: string) => {
    const button = wrapper.findAll('.filters button').find((b) => b.text() === name)
    if (!button) throw new Error(`Brak filtra: ${name}`)
    return button
  }

  return { wrapper, router, titles, filter }
}

describe('ArticlesView', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('pokazuje wszystkie artykuły, od najnowszego', async () => {
    const { wrapper, titles, filter } = await mountAt('/artykuly')

    expect(titles()).toEqual(
      [...articles].sort((a, b) => b.date.localeCompare(a.date)).map((a) => a.title),
    )
    expect(wrapper.find('.count').text()).toBe(`Znaleziono: ${articles.length}`)
    expect(filter('Wszystkie').classes()).toContain('active')
  })

  it('czyta kategorię i wyszukiwanie z adresu', async () => {
    const { wrapper, titles, filter } = await mountAt('/artykuly?kategoria=Fizyka&q=kwant')

    expect(titles()).toEqual(['Jak działają komputery kwantowe?'])
    expect(filter('Fizyka').classes()).toContain('active')
    expect((wrapper.find('.search').element as HTMLInputElement).value).toBe('kwant')
  })

  it('ignoruje nieistniejącą kategorię w adresie', async () => {
    const { titles, filter } = await mountAt('/artykuly?kategoria=Nieistnieje')

    expect(titles()).toHaveLength(articles.length)
    expect(filter('Wszystkie').classes()).toContain('active')
  })

  it('ignoruje wyszukiwanie podane w adresie wiele razy', async () => {
    const { wrapper, titles } = await mountAt('/artykuly?q=a&q=b')

    expect(titles()).toHaveLength(articles.length)
    expect((wrapper.find('.search').element as HTMLInputElement).value).toBe('')
  })

  it('zapisuje wybraną kategorię w adresie', async () => {
    const { router, titles, filter } = await mountAt('/artykuly')

    await filter('Biologia').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query.kategoria).toBe('Biologia')
    expect(titles()).toEqual(['CRISPR w praktyce'])

    await filter('Wszystkie').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query.kategoria).toBeUndefined()
    expect(titles()).toHaveLength(articles.length)
  })

  it('szuka bez względu na wielkość liter, także po autorze', async () => {
    const { wrapper, router, titles } = await mountAt('/artykuly')

    await wrapper.find('.search').setValue('KASIA')
    await flushPromises()

    expect(router.currentRoute.value.query.q).toBe('KASIA')
    expect(titles().sort()).toEqual(['Matematyka w muzyce', 'Sieci neuronowe od podstaw'])
  })

  it('łączy kategorię z wyszukiwaniem', async () => {
    const { titles } = await mountAt('/artykuly?kategoria=Biologia&q=kwant')

    expect(titles()).toEqual([])
  })

  it('po braku wyników pozwala wyczyścić filtry jednym kliknięciem', async () => {
    const { wrapper, router, titles } = await mountAt('/artykuly?kategoria=Biologia&q=kwant')

    expect(wrapper.find('.empty').exists()).toBe(true)

    await wrapper.find('.reset').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({})
    expect(wrapper.find('.empty').exists()).toBe(false)
    expect(titles()).toHaveLength(articles.length)
  })

  it('sortuje od najstarszego i alfabetycznie', async () => {
    const { wrapper, titles } = await mountAt('/artykuly')

    await wrapper.find('.sort select').setValue('oldest')
    expect(titles()[0]).toBe('Matematyka w muzyce')
    expect(titles()[titles().length - 1]).toBe('Jak działają komputery kwantowe?')

    await wrapper.find('.sort select').setValue('title')
    expect(titles()).toEqual(
      [...articles].map((a) => a.title).sort((a, b) => a.localeCompare(b, 'pl')),
    )
  })

  it('nie zmienia kolejności wspólnej listy artykułów', async () => {
    const before = articles.map((a) => a.id)
    const { wrapper } = await mountAt('/artykuly')

    await wrapper.find('.sort select').setValue('title')

    expect(articles.map((a) => a.id)).toEqual(before)
  })
})
