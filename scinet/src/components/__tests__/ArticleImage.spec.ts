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

  it('obraz z Wikimedia pobiera się z CORS, żeby mógł trafić do WebGL', () => {
    const wiki = 'https://thumb.wikimedia.org/obraz.jpg'
    const img = mount(ArticleImage, { props: { src: wiki, alt: 'Opis' } }).find('img')

    expect(img.attributes('crossorigin')).toBe('anonymous')
  })

  it('obraz z innego hosta pobiera się zwyczajnie, bez CORS', () => {
    const img = mount(ArticleImage, { props: { src, alt: 'Opis' } }).find('img')

    expect(img.attributes('crossorigin')).toBeUndefined()
  })

  it('gdy CORS zawiedzie, próbuje jeszcze raz jako zwykły obraz', async () => {
    const wrapper = mount(ArticleImage, {
      props: { src: 'https://thumb.wikimedia.org/obraz.jpg', alt: 'Opis' },
    })

    await wrapper.find('img').trigger('error')

    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.find('img').attributes('crossorigin')).toBeUndefined()

    await wrapper.find('img').trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('obraz widoczny od razu ładuje się bez czekania i z wysokim priorytetem', () => {
    const img = mount(ArticleImage, { props: { src, alt: 'Opis', eager: true } }).find('img')

    expect(img.attributes('loading')).toBe('eager')
    expect(img.attributes('fetchpriority')).toBe('high')
  })
})
