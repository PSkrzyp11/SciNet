import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import TopMenu from '../TopMenu.vue'

async function mountAt(url: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
  })
  await router.push(url)
  await router.isReady()

  const wrapper = mount(TopMenu, { global: { plugins: [router, createPinia()] } })

  return { wrapper, router }
}

describe('TopMenu', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('pokazuje zakładki portalu', async () => {
    const { wrapper } = await mountAt('/')

    expect(wrapper.findAll('nav a').map((a) => a.text())).toEqual([
      'Tablica',
      'Autorzy',
      'Zapisane',
      'Kontakt',
    ])
  })

  it.each([
    ['/', 'Tablica'],
    ['/artykuly/3', 'Tablica'],
    ['/artykuly/3/edytuj', 'Tablica'],
    ['/autorzy', 'Autorzy'],
    ['/kontakt', 'Kontakt'],
  ])('na stronie %s podświetla zakładkę %s', async (url, label) => {
    const { wrapper } = await mountAt(url)

    expect(wrapper.findAll('nav a.active').map((a) => a.text())).toEqual([label])
  })

  it('pokazuje licznik zapisanych tylko, gdy coś jest zapisane', async () => {
    const empty = await mountAt('/')
    expect(empty.wrapper.find('.badge').exists()).toBe(false)

    localStorage.setItem('scinet-favorites', '[1,2]')
    const saved = await mountAt('/')
    expect(saved.wrapper.find('.badge').text()).toBe('2')
  })

  it('otwiera menu przyciskiem i zamyka klawiszem Esc', async () => {
    const { wrapper } = await mountAt('/')
    const toggle = wrapper.find('.menu-toggle')

    await toggle.trigger('click')
    expect(wrapper.find('nav').classes()).toContain('open')
    expect(toggle.attributes('aria-expanded')).toBe('true')

    await wrapper.find('nav a').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('nav').classes()).not.toContain('open')
    expect(toggle.attributes('aria-expanded')).toBe('false')
  })

  it('zamyka menu po przejściu na inną stronę', async () => {
    const { wrapper, router } = await mountAt('/')

    await wrapper.find('.menu-toggle').trigger('click')
    await router.push('/kontakt')
    await flushPromises()

    expect(wrapper.find('nav').classes()).not.toContain('open')
  })

  it('zamyka menu po kliknięciu linku', async () => {
    const { wrapper } = await mountAt('/')

    await wrapper.find('.menu-toggle').trigger('click')
    await wrapper.find('nav a').trigger('click')

    expect(wrapper.find('nav').classes()).not.toContain('open')
  })

  it('jedynym przyciskiem w menu jest rozwijanie na telefonie', async () => {
    const { wrapper } = await mountAt('/')

    expect(wrapper.findAll('button').map((b) => b.attributes('aria-label'))).toEqual(['Menu'])
  })
})
