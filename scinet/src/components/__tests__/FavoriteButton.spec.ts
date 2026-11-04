import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import FavoriteButton from '../FavoriteButton.vue'
import { useFavoritesStore } from '@/stores/favorites'

function mountButton(props: { articleId: number; withLabel?: boolean }) {
  const pinia = createPinia()
  const wrapper = mount(FavoriteButton, { props, global: { plugins: [pinia] } })

  return { wrapper, favorites: useFavoritesStore(pinia) }
}

describe('FavoriteButton', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('zapisuje artykuł po kliknięciu, a drugie kliknięcie usuwa zapis', async () => {
    const { wrapper, favorites } = mountButton({ articleId: 1 })

    expect(wrapper.attributes('aria-pressed')).toBe('false')

    await wrapper.trigger('click')
    expect(favorites.isFavorite(1)).toBe(true)
    expect(wrapper.attributes('aria-pressed')).toBe('true')
    expect(wrapper.classes()).toContain('saved')
    expect(wrapper.attributes('title')).toBe('Usuń z zapisanych')

    await wrapper.trigger('click')
    expect(favorites.isFavorite(1)).toBe(false)
    expect(wrapper.attributes('aria-pressed')).toBe('false')
  })

  it('bez napisu ma opis dla czytników ekranu', () => {
    const { wrapper } = mountButton({ articleId: 1 })

    expect(wrapper.text()).toBe('')
    expect(wrapper.attributes('aria-label')).toBe('Zapisz artykuł')
  })

  it('z napisem pokazuje, czy artykuł jest zapisany', async () => {
    const { wrapper } = mountButton({ articleId: 1, withLabel: true })

    expect(wrapper.text()).toBe('Zapisz')
    expect(wrapper.attributes('aria-label')).toBeUndefined()

    await wrapper.trigger('click')
    expect(wrapper.text()).toBe('Zapisano')
  })
})
