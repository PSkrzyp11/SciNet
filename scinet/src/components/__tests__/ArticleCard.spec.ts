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

function mountCard() {
  return mount(ArticleCard, {
    props: { article },
    global: { plugins: [createPinia()], stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('ArticleCard', () => {
  afterEach(() => {
    vi.restoreAllMocks()
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

  it('prowadzi do strony artykułu', () => {
    const link = mountCard().findComponent(RouterLinkStub)

    expect(link.props('to')).toBe('/artykuly/7')
  })
})
