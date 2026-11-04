import { beforeEach, describe, expect, it } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia } from 'pinia'
import AuthorsView from '../AuthorsView.vue'
import { seedArticles } from '@/data/articles'
import { authors } from '@/data/authors'

const [first] = seedArticles

function mountView() {
  const wrapper = mount(AuthorsView, {
    global: { plugins: [createPinia()], stubs: { RouterLink: RouterLinkStub } },
  })
  const names = () => wrapper.findAll('.author h3').map((name) => name.text())
  const card = (name: string) => {
    const found = wrapper.findAll('.author').find((a) => a.find('h3').text() === name)
    if (!found) throw new Error(`Brak autora: ${name}`)
    return found
  }

  return { names, card }
}

function saveArticles(...articleAuthors: string[]) {
  const saved = articleAuthors.map((author, i) => ({ ...first, id: 100 + i, author }))
  localStorage.setItem('scinet-articles', JSON.stringify(saved))
}

describe('AuthorsView', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('pokazuje autorów z listy i liczbę ich artykułów', () => {
    const { names, card } = mountView()

    expect(names()).toEqual(authors.map((a) => a.name))
    expect(card('Anna Nowak').find('.written strong').text()).toBe('Artykuły (2)')
  })

  it('pokazuje osobę wpisaną w formularzu, bez opisu', () => {
    saveArticles('Jan Kowalski')

    const { names, card } = mountView()

    expect(names()).toEqual([...authors.map((a) => a.name), 'Jan Kowalski'])
    expect(card('Jan Kowalski').find('.avatar').text()).toBe('JK')
    expect(card('Jan Kowalski').find('.bio').exists()).toBe(false)
    expect(card('Jan Kowalski').find('.written strong').text()).toBe('Artykuły (1)')
  })

  it('nie powiela autorów przy kilku artykułach tej samej osoby', () => {
    saveArticles('Jan Kowalski', 'Jan Kowalski', 'Anna Nowak')

    const { names, card } = mountView()

    expect(names()).toEqual([...authors.map((a) => a.name), 'Jan Kowalski'])
    expect(card('Jan Kowalski').find('.written strong').text()).toBe('Artykuły (2)')
  })
})
