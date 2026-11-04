import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia } from 'pinia'
import FavoritesView from '../FavoritesView.vue'
import { seedArticles } from '@/data/articles'

function mountView() {
  const wrapper = mount(FavoritesView, {
    global: { plugins: [createPinia()], stubs: { RouterLink: RouterLinkStub } },
  })
  const titles = () => wrapper.findAll('.card h3').map((title) => title.text())

  return { wrapper, titles }
}

describe('FavoritesView', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('pokazuje zapisane artykuły', () => {
    localStorage.setItem('scinet-favorites', '[2]')

    const { titles } = mountView()

    expect(titles()).toEqual(['CRISPR w praktyce'])
  })

  it('pozwala polubić zapisany artykuł', async () => {
    localStorage.setItem('scinet-favorites', '[2]')
    const startLikes = seedArticles.find((a) => a.id === 2)?.likes ?? 0
    const { wrapper } = mountView()

    await wrapper.find('.like').trigger('click')

    expect(wrapper.find('.like .count').text()).toBe(String(startLikes + 1))
  })

  it('po usunięciu artykułu znika on z listy i z tablicy', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    localStorage.setItem('scinet-favorites', '[1,2]')
    const { wrapper, titles } = mountView()

    await wrapper.find('.card .delete').trigger('click')

    expect(titles()).toEqual(['CRISPR w praktyce'])

    const saved: { id: number }[] = JSON.parse(localStorage.getItem('scinet-articles') ?? '[]')
    expect(saved.map((a) => a.id)).not.toContain(1)
  })

  it('po usunięciu ostatniego zapisanego artykułu pokazuje pusty stan', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    localStorage.setItem('scinet-favorites', '[2]')
    const { wrapper } = mountView()

    await wrapper.find('.card .delete').trigger('click')

    expect(wrapper.find('.empty').text()).toContain('Nie masz jeszcze zapisanych artykułów')
  })
})
