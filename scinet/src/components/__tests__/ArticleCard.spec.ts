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
