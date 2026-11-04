import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ArticleImage from '../ArticleImage.vue'

const src = 'https://example.com/obrazek.jpg'

describe('ArticleImage', () => {
  it('pokazuje obrazek z opisem i ładuje go dopiero, gdy jest potrzebny', () => {
    const img = mount(ArticleImage, { props: { src, alt: 'Opis' } }).find('img')

    expect(img.attributes('src')).toBe(src)
    expect(img.attributes('alt')).toBe('Opis')
    expect(img.attributes('loading')).toBe('lazy')
  })

  it('bez adresu nie zostawia żadnego elementu', () => {
    const wrapper = mount(ArticleImage, { props: { alt: 'Opis' } })

    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('chowa obrazek, którego nie udało się wczytać', async () => {
    const wrapper = mount(ArticleImage, { props: { src, alt: 'Opis' } })

    await wrapper.find('img').trigger('error')

    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('po zmianie adresu próbuje wczytać obrazek od nowa', async () => {
    const wrapper = mount(ArticleImage, { props: { src, alt: 'Opis' } })
    await wrapper.find('img').trigger('error')

    await wrapper.setProps({ src: 'https://example.com/inny.jpg' })

    expect(wrapper.find('img').attributes('src')).toBe('https://example.com/inny.jpg')
  })
})
