import { describe, expect, it } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import MarqueeStrip from '../MarqueeStrip.vue'

const items = ['Fizyka', 'Biologia', 'Ekologia']

function mountStrip() {
  return mount(MarqueeStrip, {
    props: { items, label: 'Przeglądaj dziedziny' },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('MarqueeStrip', () => {
  it('jest nawigacją z nazwą dla czytników ekranu', () => {
    const nav = mountStrip().find('nav')

    expect(nav.attributes('aria-label')).toBe('Przeglądaj dziedziny')
  })

  it('czytnik i klawiatura dostają każdą dziedzinę tylko raz', () => {
    const wrapper = mountStrip()
    const links = wrapper.findAll('a')
    const accessible = links.filter((link) => !link.element.closest('[aria-hidden="true"]'))

    expect(links.length).toBeGreaterThan(items.length)
    expect(accessible.map((link) => link.text())).toEqual(items)
    expect(accessible.every((link) => link.attributes('tabindex') === undefined)).toBe(true)
    // Powtórzenia są ukryte, więc nie mogą łapać fokusu
    for (const link of links.filter((l) => l.element.closest('[aria-hidden="true"]'))) {
      expect(link.attributes('tabindex')).toBe('-1')
    }
  })

  it('link prowadzi do tablicy z wybraną dziedziną', () => {
    const link = mountStrip().findComponent(RouterLinkStub)

    expect(link.props('to')).toEqual({ path: '/', query: { kategoria: 'Fizyka' } })
  })

  it('przycisk zatrzymuje i wznawia przewijanie', async () => {
    const wrapper = mountStrip()
    const toggle = wrapper.find('.marquee-toggle')

    expect(toggle.attributes('aria-pressed')).toBe('false')
    expect(toggle.text()).toContain('Zatrzymaj przewijanie paska')

    await toggle.trigger('click')
    expect(toggle.attributes('aria-pressed')).toBe('true')
    expect(wrapper.find('nav').classes()).toContain('stopped')

    await toggle.trigger('click')
    expect(wrapper.find('nav').classes()).not.toContain('stopped')
  })
})
