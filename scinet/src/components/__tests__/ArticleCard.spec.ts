import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia } from 'pinia'
import ArticleCard from '../ArticleCard.vue'
import type { Article } from '@/data/articles'

const article: Article = {
  id: 7,
  title: 'Tytuł testowy',
  author: 'Jan Kowalski',
  category: 'Biologia',
  date: '2026-03-09',
  content: ['Pierwszy akapit.', 'Drugi akapit.'],
  likes: 0,
  liked: false,
  comments: [],
}

function mountCard(changes: Partial<Article> = {}) {
  return mount(ArticleCard, {
    props: { article: { ...article, ...changes } },
    global: { plugins: [createPinia()], stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('ArticleCard', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('menu „Więcej opcji”', () => {
    const isOpen = (wrapper: ReturnType<typeof mountCard>) =>
      wrapper.find('.menu-toggle').attributes('aria-expanded') === 'true'

    it('otwiera się przyciskiem i zamyka drugim kliknięciem', async () => {
      const wrapper = mountCard()

      const listHidden = () =>
        (wrapper.find('.menu-list').element as HTMLElement).style.display === 'none'

      expect(isOpen(wrapper)).toBe(false)
      expect(listHidden()).toBe(true)

      await wrapper.find('.menu-toggle').trigger('click')
      expect(isOpen(wrapper)).toBe(true)
      expect(listHidden()).toBe(false)

      await wrapper.find('.menu-toggle').trigger('click')
      expect(isOpen(wrapper)).toBe(false)
    })

    it('zamyka się klawiszem Esc i oddaje kursor przyciskowi', async () => {
      const wrapper = mount(ArticleCard, {
        props: { article },
        attachTo: document.body,
        global: { plugins: [createPinia()], stubs: { RouterLink: RouterLinkStub } },
      })

      await wrapper.find('.menu-toggle').trigger('click')
      await wrapper.find('.menu-item.delete').trigger('keydown', { key: 'Escape' })

      expect(isOpen(wrapper)).toBe(false)
      expect(document.activeElement).toBe(wrapper.find('.menu-toggle').element)
      wrapper.unmount()
    })

    it('zamyka się po kliknięciu poza menu', async () => {
      const wrapper = mountCard()

      await wrapper.find('.menu-toggle').trigger('click')
      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
      await wrapper.vm.$nextTick()

      expect(isOpen(wrapper)).toBe(false)
    })

    it('kliknięcie w samo menu go nie zamyka', async () => {
      const wrapper = mount(ArticleCard, {
        props: { article },
        attachTo: document.body,
        global: { plugins: [createPinia()], stubs: { RouterLink: RouterLinkStub } },
      })

      await wrapper.find('.menu-toggle').trigger('click')
      wrapper.find('.menu-list').element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
      await wrapper.vm.$nextTick()

      expect(isOpen(wrapper)).toBe(true)
      wrapper.unmount()
    })

    it('przy usuwaniu najpierw zamyka menu', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false)
      const wrapper = mountCard()

      await wrapper.find('.menu-toggle').trigger('click')
      await wrapper.find('.menu-item.delete').trigger('click')

      expect(isOpen(wrapper)).toBe(false)
      expect(wrapper.emitted('delete')).toBeUndefined()
    })
  })

  it('pokazuje awatar autora i czas czytania', () => {
    const wrapper = mountCard()

    expect(wrapper.find('.avatar').text()).toBe('JK')
    expect(wrapper.find('.meta').text()).toContain('1 min czytania')
    expect(wrapper.find('time').attributes('datetime')).toBe('2026-03-09')
  })

  it('pokazuje polubienia i zgłasza kliknięcie rodzicowi', async () => {
    const wrapper = mountCard({ likes: 7, liked: true })

    expect(wrapper.find('.like .count').text()).toBe('7')
    expect(wrapper.find('.like').attributes('aria-pressed')).toBe('true')

    await wrapper.find('.like').trigger('click')

    expect(wrapper.emitted('like')).toHaveLength(1)
  })

  it('pokazuje liczbę komentarzy', () => {
    const comment = { id: 1, author: 'Ola', text: 'Komentarz', date: '2026-03-10' }

    expect(mountCard().find('.comment-count').text()).toBe('0')

    const count = mountCard({ comments: [comment, { ...comment, id: 2 }] }).find('.comment-count')
    expect(count.text()).toBe('2')
    expect(count.attributes('aria-label')).toBe('Komentarze: 2')
  })

  it('pokazuje obrazek artykułu, który go ma', () => {
    const img = mountCard({ image: 'https://example.com/obrazek.jpg' }).find('img')

    expect(img.attributes('src')).toBe('https://example.com/obrazek.jpg')
    expect(img.attributes('alt')).toBe('Tytuł testowy')
  })

  it('bez obrazka nie zostawia pustej ramki', () => {
    expect(mountCard().find('img').exists()).toBe(false)
  })

  it('przy złym adresie obrazka karta zostaje, ale bez ramki', async () => {
    const wrapper = mountCard({ image: 'https://example.com/nie-ma.jpg' })

    await wrapper.find('img').trigger('error')

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toContain('Tytuł testowy')
  })

  it('po potwierdzeniu prosi rodzica o usunięcie artykułu', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const wrapper = mountCard()

    await wrapper.find('.delete').trigger('click')

    expect(confirm.mock.calls[0]?.[0]).toContain('Tytuł testowy')
    expect(wrapper.emitted('delete')).toHaveLength(1)
  })

  it('bez potwierdzenia nie usuwa artykułu', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const wrapper = mountCard()

    await wrapper.find('.delete').trigger('click')

    expect(wrapper.emitted('delete')).toBeUndefined()
  })

  it('pokazuje tytuł, autora, datę i treść', () => {
    const text = mountCard().text()

    expect(text).toContain('Tytuł testowy')
    expect(text).toContain('Jan Kowalski')
    expect(text).toContain(new Date('2026-03-09').toLocaleDateString('pl-PL'))
    expect(text).toContain('Pierwszy akapit. Drugi akapit.')
  })

  it('prowadzi do strony artykułu i do jego edycji', () => {
    const links = mountCard().findAllComponents(RouterLinkStub)

    expect(links.map((link) => link.props('to'))).toEqual(['/artykuly/7/edytuj', '/artykuly/7'])
  })
})
