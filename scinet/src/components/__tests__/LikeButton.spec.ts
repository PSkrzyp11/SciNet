import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import LikeButton from '../LikeButton.vue'

describe('LikeButton', () => {
  it('pokazuje napis i licznik', () => {
    const wrapper = mount(LikeButton, { props: { count: 24, liked: false } })

    expect(wrapper.text()).toContain('Lubię to')
    expect(wrapper.find('.count').text()).toBe('24')
  })

  it('pokazuje, czy artykuł jest polubiony', () => {
    const notLiked = mount(LikeButton, { props: { count: 1, liked: false } })
    const liked = mount(LikeButton, { props: { count: 1, liked: true } })

    expect(notLiked.attributes('aria-pressed')).toBe('false')
    expect(notLiked.classes()).not.toContain('liked')
    expect(liked.attributes('aria-pressed')).toBe('true')
    expect(liked.classes()).toContain('liked')
  })

  it('po kliknięciu tylko zgłasza zdarzenie rodzicowi', async () => {
    const wrapper = mount(LikeButton, { props: { count: 5, liked: false } })

    await wrapper.trigger('click')

    expect(wrapper.emitted('toggle')).toHaveLength(1)
    expect(wrapper.find('.count').text()).toBe('5')
  })
})
