import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import ArticleForm from '../ArticleForm.vue'
import { CATEGORIES } from '@/data/articles'
import { currentUser } from '@/data/authors'

let wrapper: VueWrapper

function mountForm() {
  // Podpięcie do dokumentu jest potrzebne, żeby sprawdzać, gdzie jest kursor
  wrapper = mount(ArticleForm, { attachTo: document.body })
  return wrapper
}

async function fill(values: {
  title?: string
  author?: string
  category?: string
  content?: string
}) {
  for (const [name, value] of Object.entries(values)) {
    await wrapper.find(`[name="${name}"]`).setValue(value)
  }
}

async function submit() {
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

const errorTexts = () => wrapper.findAll('.error').map((error) => error.text())

describe('ArticleForm', () => {
  afterEach(() => {
    wrapper.unmount()
  })

  it('ustawia kursor w polu tytułu i podpowiada autora', () => {
    mountForm()

    expect(document.activeElement).toBe(wrapper.find('[name="title"]').element)
    expect((wrapper.find('[name="author"]').element as HTMLInputElement).value).toBe(
      currentUser.name,
    )
  })

  it('pozwala wybrać każdą dziedzinę nauki', () => {
    mountForm()

    const options = wrapper.findAll('[name="category"] option').map((o) => o.text())

    expect(options).toEqual(['Wybierz dziedzinę', ...CATEGORIES])
  })

  it('nie pokazuje błędów przed próbą publikacji', () => {
    mountForm()

    expect(errorTexts()).toEqual([])
  })

  it('publikuje dane bez zbędnych spacji, z treścią podzieloną na akapity', async () => {
    mountForm()

    await fill({
      title: '  Nowy tytuł  ',
      author: '  Jan Kowalski ',
      category: 'Ekologia',
      content: ' Pierwszy akapit.\n\n  Drugi akapit. ',
    })
    await submit()

    expect(wrapper.emitted('publish')).toEqual([
      [
        {
          title: 'Nowy tytuł',
          author: 'Jan Kowalski',
          category: 'Ekologia',
          content: ['Pierwszy akapit.', 'Drugi akapit.'],
        },
      ],
    ])
  })

  it.each([
    ['tytułu', { title: '', content: 'Treść' }, 'Podaj tytuł artykułu.'],
    ['tytułu ze spacji', { title: '   ', content: 'Treść' }, 'Podaj tytuł artykułu.'],
    ['treści', { title: 'Tytuł', content: '' }, 'Napisz treść artykułu.'],
    ['treści ze spacji', { title: 'Tytuł', content: ' \n\n ' }, 'Napisz treść artykułu.'],
    ['autora', { title: 'Tytuł', author: ' ', content: 'Treść' }, 'Podaj autora.'],
  ])('nie publikuje bez %s', async (_, values, message) => {
    mountForm()

    await fill({ category: 'Fizyka', ...values })
    await submit()

    expect(wrapper.emitted('publish')).toBeUndefined()
    expect(errorTexts()).toEqual([message])
  })

  it('nie publikuje bez dziedziny', async () => {
    mountForm()

    await fill({ title: 'Tytuł', content: 'Treść' })
    await submit()

    expect(wrapper.emitted('publish')).toBeUndefined()
    expect(errorTexts()).toEqual(['Wybierz dziedzinę.'])
  })

  it('przenosi kursor do pierwszego błędnego pola i opisuje błąd', async () => {
    mountForm()

    await fill({ title: 'Tytuł' })
    await submit()

    const category = wrapper.find('[name="category"]')
    expect(document.activeElement).toBe(category.element)
    expect(category.attributes('aria-invalid')).toBe('true')
    expect(category.attributes('aria-describedby')).toBe('article-category-error')
  })

  it('chowa błąd po poprawieniu pola', async () => {
    mountForm()

    await submit()
    await fill({ title: 'Tytuł' })

    expect(errorTexts()).not.toContain('Podaj tytuł artykułu.')
  })

  it('przycisk Anuluj prosi rodzica o zamknięcie, bez publikacji', async () => {
    mountForm()

    await wrapper.find('.cancel').trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('publish')).toBeUndefined()
  })
})
