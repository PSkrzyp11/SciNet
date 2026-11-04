import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import CommentSection from '../CommentSection.vue'
import type { ArticleComment } from '@/data/articles'
import { currentUser } from '@/data/authors'

const comments: ArticleComment[] = [
  { id: 1, author: 'Ola', text: 'Pierwszy komentarz', date: '2026-03-09T10:00:00.000Z' },
  { id: 2, author: 'Tomek', text: 'Drugi komentarz', date: '2026-03-10T10:00:00.000Z' },
]

let wrapper: VueWrapper

function mountSection(list: ArticleComment[] = comments) {
  // Podpięcie do dokumentu jest potrzebne, żeby sprawdzać, gdzie jest kursor
  wrapper = mount(CommentSection, { props: { comments: list }, attachTo: document.body })
  return wrapper
}

const submit = async () => {
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

const errorTexts = () => wrapper.findAll('.error').map((error) => error.text())

describe('CommentSection', () => {
  afterEach(() => {
    wrapper.unmount()
  })

  it('pokazuje liczbę komentarzy, ich autorów, treść i datę', () => {
    mountSection()

    expect(wrapper.find('h2').text()).toBe('Komentarze (2)')
    const items = wrapper.findAll('li')
    expect(items.map((item) => item.find('.text').text())).toEqual([
      'Pierwszy komentarz',
      'Drugi komentarz',
    ])
    expect(items[0]?.find('strong').text()).toBe('Ola')
    expect(items[0]?.find('.date').text()).toBe(
      new Date('2026-03-09T10:00:00.000Z').toLocaleDateString('pl-PL'),
    )
  })

  it('bez komentarzy pokazuje komunikat', () => {
    mountSection([])

    expect(wrapper.find('h2').text()).toBe('Komentarze (0)')
    expect(wrapper.find('ul').exists()).toBe(false)
    expect(wrapper.find('.empty').exists()).toBe(true)
  })

  it('podpowiada autora, ale pozwala go zmienić', async () => {
    mountSection()
    const author = wrapper.find('[name="author"]')

    expect((author.element as HTMLInputElement).value).toBe(currentUser.name)

    await author.setValue('  Jan Kowalski ')
    await wrapper.find('[name="text"]').setValue('  Ciekawy tekst. ')
    await submit()

    expect(wrapper.emitted('add')).toEqual([[{ author: 'Jan Kowalski', text: 'Ciekawy tekst.' }]])
  })

  it('po dodaniu czyści treść, a autora zostawia', async () => {
    mountSection()

    await wrapper.find('[name="text"]').setValue('Treść')
    await submit()

    expect((wrapper.find('[name="text"]').element as HTMLTextAreaElement).value).toBe('')
    expect((wrapper.find('[name="author"]').element as HTMLInputElement).value).toBe(
      currentUser.name,
    )
    expect(errorTexts()).toEqual([])
  })

  it.each(['', '   ', ' \n\n '])('nie dodaje pustego komentarza: "%s"', async (text) => {
    mountSection()

    await wrapper.find('[name="text"]').setValue(text)
    await submit()

    expect(wrapper.emitted('add')).toBeUndefined()
    expect(errorTexts()).toEqual(['Napisz treść komentarza.'])
    expect(document.activeElement).toBe(wrapper.find('[name="text"]').element)
    expect(wrapper.find('[name="text"]').attributes('aria-invalid')).toBe('true')
  })

  it('nie dodaje komentarza bez autora', async () => {
    mountSection()

    await wrapper.find('[name="author"]').setValue(' ')
    await wrapper.find('[name="text"]').setValue('Treść')
    await submit()

    expect(wrapper.emitted('add')).toBeUndefined()
    expect(errorTexts()).toEqual(['Podaj autora komentarza.'])
    expect(document.activeElement).toBe(wrapper.find('[name="author"]').element)
  })

  it('nie pokazuje błędów przed próbą dodania', async () => {
    mountSection()

    await wrapper.find('[name="author"]').setValue('')

    expect(errorTexts()).toEqual([])
  })

  it('chowa błąd po wpisaniu treści', async () => {
    mountSection()

    await submit()
    expect(errorTexts()).toEqual(['Napisz treść komentarza.'])

    await wrapper.find('[name="text"]').setValue('Treść')
    expect(errorTexts()).toEqual([])
  })
})
