import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import WeightText from '../WeightText.vue'

describe('WeightText', () => {
  it('dzieli napis na litery ukryte przed czytnikami ekranu', () => {
    const wrapper = mount(WeightText, { props: { text: '404' } })

    expect(wrapper.findAll('.wt-char').map((c) => c.text())).toEqual(['4', '0', '4'])
    expect(wrapper.find('.wt-chars').attributes('aria-hidden')).toBe('true')
  })

  it('czytnik ekranu dostaje cały tekst z etykiety', () => {
    const wrapper = mount(WeightText, { props: { text: '404', label: 'Błąd 404' } })

    expect(wrapper.find('.visually-hidden').text()).toBe('Błąd 404')
  })

  it('bez etykiety napis jest tylko ozdobą', () => {
    const wrapper = mount(WeightText, { props: { text: 'SciNet' } })

    expect(wrapper.find('.visually-hidden').exists()).toBe(false)
  })

  it('spacja zostaje widoczna jako twarda spacja', () => {
    const wrapper = mount(WeightText, { props: { text: 'a b' } })

    expect(wrapper.findAll('.wt-char')[1]?.element.textContent).toBe(' ')
  })

  it('grubość w spoczynku pochodzi z propsa', () => {
    const wrapper = mount(WeightText, { props: { text: 'Sci', min: 500 } })

    expect(wrapper.attributes('style')).toContain('--wt-min: 500')
  })
})
