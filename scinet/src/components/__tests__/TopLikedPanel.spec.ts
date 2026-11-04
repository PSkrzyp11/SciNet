import { describe, expect, it } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import TopLikedPanel from '../TopLikedPanel.vue'
import { seedArticles } from '@/data/articles'

function mountPanel(articles = seedArticles.slice(0, 2)) {
  return mount(TopLikedPanel, {
    props: { articles },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('TopLikedPanel', () => {
  it('pokazuje tytuły z linkami i liczbą polubień', () => {
    const [first] = seedArticles
    const wrapper = mountPanel()
    const item = wrapper.find('li')

    expect(wrapper.findAll('li')).toHaveLength(2)
    expect(item.text()).toContain(first?.title)
    expect(item.find('.count').text()).toBe(String(first?.likes))
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe(`/artykuly/${first?.id}`)
  })

  it('bez polubionych artykułów pokazuje komunikat', () => {
    const wrapper = mountPanel([])

    expect(wrapper.find('li').exists()).toBe(false)
    expect(wrapper.find('.empty').text()).toContain('Żaden artykuł')
  })
})
