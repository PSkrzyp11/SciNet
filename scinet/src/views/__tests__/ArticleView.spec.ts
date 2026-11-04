import { beforeEach, describe, expect, it } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia } from 'pinia'
import ArticleView from '../ArticleView.vue'
import { seedArticles } from '@/data/articles'

function mountArticle(id: string) {
  return mount(ArticleView, {
    props: { id },
    global: { plugins: [createPinia()], stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('ArticleView', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('pokazuje pełną treść artykułu', () => {
    const [first] = seedArticles
    const wrapper = mountArticle(String(first?.id))

    expect(wrapper.find('h1').text()).toBe(first?.title)
    expect(wrapper.findAll('.article > p').map((p) => p.text())).toEqual(first?.content)
  })

  it('pokazuje obrazek artykułu, który go ma', () => {
    const withImage = seedArticles.find((a) => a.image)
    const wrapper = mountArticle(String(withImage?.id))

    expect(wrapper.find('img').attributes('src')).toBe(withImage?.image)
  })

  it('nie pokazuje pustej ramki przy artykule bez obrazka', () => {
    const withoutImage = seedArticles.find((a) => !a.image)
    const wrapper = mountArticle(String(withoutImage?.id))

    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('pokazuje komunikat dla artykułu, którego nie ma', () => {
    expect(mountArticle('999').find('h1').text()).toBe('Nie ma takiego artykułu')
  })
})
