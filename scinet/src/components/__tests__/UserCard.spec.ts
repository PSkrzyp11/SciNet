import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import UserCard from '../UserCard.vue'
import { currentUser } from '@/data/authors'

describe('UserCard', () => {
  it('pokazuje dane użytkownika i jego statystyki', () => {
    const wrapper = mount(UserCard, {
      props: { user: currentUser, articleCount: 3, likeCount: 12 },
    })

    expect(wrapper.find('.avatar').text()).toBe('AN')
    expect(wrapper.find('h2').text()).toBe(currentUser.name)
    expect(wrapper.find('.field').text()).toBe(currentUser.field)
    expect(wrapper.findAll('dd').map((value) => value.text())).toEqual(['3', '12'])
  })
})
