import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AuthorAvatar from '../AuthorAvatar.vue'

describe('AuthorAvatar', () => {
  it('pokazuje inicjały i jest pomijany przez czytniki ekranu', () => {
    const wrapper = mount(AuthorAvatar, { props: { name: 'jan kowalski' } })

    expect(wrapper.text()).toBe('JK')
    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  it('dopasowuje rozmiar, czcionkę i obwódkę', () => {
    const small = mount(AuthorAvatar, { props: { name: 'Anna Nowak' } })
    const large = mount(AuthorAvatar, { props: { name: 'Anna Nowak', size: 76 } })

    expect(small.attributes('style')).toContain('width: 40px')
    expect(small.attributes('style')).toContain('border-width: 2px')
    expect(large.attributes('style')).toContain('width: 76px')
    expect(large.attributes('style')).toContain('font-size: 27px')
    expect(large.attributes('style')).toContain('border-width: 3px')
  })
})
