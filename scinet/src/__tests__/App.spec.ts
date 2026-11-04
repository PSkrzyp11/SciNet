import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import App from '../App.vue'
import router from '../router'

async function mountAt(path: string) {
  await router.push(path)
  await router.isReady()

  const wrapper = mount(App, { global: { plugins: [router, createPinia()] } })
  await flushPromises()

  return wrapper
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    window.scrollTo = vi.fn()
  })

  it('pokazuje menu, tablicę i stopkę z bieżącym rokiem', async () => {
    const wrapper = await mountAt('/')

    expect(wrapper.find('.top-menu').exists()).toBe(true)
    expect(wrapper.find('main h1').text()).toBe('Tablica')
    expect(wrapper.find('.site-footer').text()).toContain(String(new Date().getFullYear()))
  })

  it.each([
    ['/autorzy', 'Autorzy'],
    ['/zapisane', 'Zapisane'],
    ['/kontakt', 'Kontakt'],
    ['/artykuly/1', 'Jak działają komputery kwantowe?'],
    ['/artykuly/1/edytuj', 'Edycja artykułu'],
    ['/nie/ma/takiej/strony', 'Nie ma takiej strony'],
  ])('pod adresem %s pokazuje stronę „%s”', async (path, title) => {
    const wrapper = await mountAt(path)

    expect(wrapper.find('main h1').text()).toBe(title)
  })

  it('przechodzi między stronami po kliknięciu w menu', async () => {
    const wrapper = await mountAt('/')
    const contact = wrapper.findAll('nav a').find((link) => link.text() === 'Kontakt')

    await contact?.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/kontakt')
    expect(wrapper.find('main h1').text()).toBe('Kontakt')
  })
})
