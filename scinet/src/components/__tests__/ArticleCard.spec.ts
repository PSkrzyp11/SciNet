import { describe, expect, it } from 'vitest'
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
