import { describe, expect, it } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import SiteFooter from '../SiteFooter.vue'
import { CATEGORIES } from '@/data/articles'

function mountFooter() {
  return mount(SiteFooter, { global: { stubs: { RouterLink: RouterLinkStub } } })
}

describe('SiteFooter', () => {
  it('ma mapę strony z czterema głównymi podstronami', () => {
    const nav = mountFooter().find('nav[aria-label="Stopka"]')

    expect(nav.findAll('a').map((a) => a.text())).toEqual([
      'Tablica',
      'Autorzy',
      'Zapisane',
      'Kontakt',
    ])
  })

  it('pasek w stopce prowadzi do wszystkich dziedzin', () => {
    const marquee = mountFooter().find('nav[aria-label="Dziedziny nauki w stopce"]')
    const accessible = marquee
      .findAll('a')
      .filter((link) => !link.element.closest('[aria-hidden="true"]'))

    expect(accessible.map((a) => a.text())).toEqual([...CATEGORIES])
  })

  it('nagłówek stopki jest jednym zdaniem, a duży napis tylko ozdobą', () => {
    const wrapper = mountFooter()

    expect(wrapper.find('h2').text()).toBe('Nauka opowiedziana przystępnie')
    expect(wrapper.find('.footer-mega .wt-chars').attributes('aria-hidden')).toBe('true')
  })

  it('pokazuje bieżący rok', () => {
    expect(mountFooter().find('.footer-base').text()).toContain(String(new Date().getFullYear()))
  })
})
