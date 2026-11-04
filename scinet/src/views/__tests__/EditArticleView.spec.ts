import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import EditArticleView from '../EditArticleView.vue'
import { seedArticles } from '@/data/articles'
import { useArticlesStore } from '@/stores/articles'

async function mountEdit(id: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/artykuly/:id', component: { template: '<div />' } },
      { path: '/artykuly/:id/edytuj', component: { template: '<div />' } },
    ],
  })
  await router.push(`/artykuly/${id}/edytuj`)
  await router.isReady()

  const pinia = createPinia()
  const wrapper = mount(EditArticleView, {
    props: { id },
    global: { plugins: [router, pinia] },
  })

  return { wrapper, router, store: useArticlesStore(pinia) }
}

const seed = seedArticles.find((a) => a.id === 4)

describe('EditArticleView', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('pokazuje formularz wypełniony danymi artykułu', async () => {
    const { wrapper } = await mountEdit('4')

    expect(wrapper.find('h1').text()).toBe('Edycja artykułu')
    expect((wrapper.find('[name="title"]').element as HTMLInputElement).value).toBe(seed?.title)
    expect((wrapper.find('[name="image"]').element as HTMLInputElement).value).toBe(seed?.image)
  })

  it('zapisuje zmiany i wraca do artykułu', async () => {
    const { wrapper, router, store } = await mountEdit('4')

    await wrapper.find('[name="title"]').setValue('Nowy tytuł')
    await wrapper.find('[name="category"]').setValue('Fizyka')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const edited = store.articles.find((a) => a.id === 4)
    expect(edited?.title).toBe('Nowy tytuł')
    expect(edited?.category).toBe('Fizyka')
    expect(edited?.date).toBe(seed?.date)
    expect(edited?.likes).toBe(seed?.likes)
    expect(router.currentRoute.value.path).toBe('/artykuly/4')
  })

  it('nie zapisuje zmian z błędnymi danymi', async () => {
    const { wrapper, router, store } = await mountEdit('4')

    await wrapper.find('[name="title"]').setValue('')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(store.articles.find((a) => a.id === 4)?.title).toBe(seed?.title)
    expect(router.currentRoute.value.path).toBe('/artykuly/4/edytuj')
  })

  it('Anuluj wraca do artykułu bez zmian', async () => {
    const { wrapper, router, store } = await mountEdit('4')

    await wrapper.find('[name="title"]').setValue('Nie zapisuj tego')
    await wrapper.find('.cancel').trigger('click')
    await flushPromises()

    expect(store.articles.find((a) => a.id === 4)?.title).toBe(seed?.title)
    expect(router.currentRoute.value.path).toBe('/artykuly/4')
  })

  it('pokazuje komunikat dla artykułu, którego nie ma', async () => {
    const { wrapper } = await mountEdit('999')

    expect(wrapper.find('h1').text()).toBe('Nie ma takiego artykułu')
    expect(wrapper.find('form').exists()).toBe(false)
  })
})
