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

  it('pozwala polubić artykuł i cofnąć polubienie', async () => {
    const [first] = seedArticles
    const startLikes = first?.likes ?? 0
    const wrapper = mountArticle(String(first?.id))
    const like = wrapper.find('.like')

    expect(like.find('.count').text()).toBe(String(startLikes))

    await like.trigger('click')
    expect(like.find('.count').text()).toBe(String(startLikes + 1))
    expect(like.attributes('aria-pressed')).toBe('true')

    await like.trigger('click')
    expect(like.find('.count').text()).toBe(String(startLikes))
    expect(like.attributes('aria-pressed')).toBe('false')
  })

  it('ma link do edycji artykułu', () => {
    const links = mountArticle('4').findAllComponents(RouterLinkStub)

    expect(links.map((link) => link.props('to'))).toContain('/artykuly/4/edytuj')
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
