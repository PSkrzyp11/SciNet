import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import ArticleForm from '../ArticleForm.vue'
import { CATEGORIES, type ArticleDraft } from '@/data/articles'
import { currentUser } from '@/data/authors'

let wrapper: VueWrapper

function mountForm(initial?: ArticleDraft) {
  // Podpięcie do dokumentu jest potrzebne, żeby sprawdzać, gdzie jest kursor
  wrapper = mount(ArticleForm, { attachTo: document.body, props: { initial } })
  return wrapper
}

const value = (name: string) => (wrapper.find(`[name="${name}"]`).element as HTMLInputElement).value

const draft: ArticleDraft = {
  title: 'Istniejący tytuł',
  author: 'Jan Kowalski',
  category: 'Ekologia',
  content: ['Pierwszy akapit.', 'Drugi akapit.\nNowa linia.'],
  image: 'https://example.com/obrazek.jpg',
}

async function fill(values: {
  title?: string
  author?: string
  category?: string
  content?: string
  image?: string
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

  it('przy nowym artykule ma nagłówek i przycisk publikacji', () => {
    mountForm()

    expect(wrapper.find('h2').text()).toBe('Nowy artykuł')
    expect(wrapper.find('.publish').text()).toBe('Opublikuj')
  })

  it('przy edycji wypełnia pola danymi artykułu', () => {
    mountForm(draft)

    expect(value('title')).toBe('Istniejący tytuł')
    expect(value('author')).toBe('Jan Kowalski')
    expect(value('category')).toBe('Ekologia')
    expect(value('content')).toBe('Pierwszy akapit.\n\nDrugi akapit.\nNowa linia.')
    expect(value('image')).toBe('https://example.com/obrazek.jpg')
    expect(wrapper.find('h2').exists()).toBe(false)
    expect(wrapper.find('.publish').text()).toBe('Zapisz zmiany')
  })

  it('zapis bez zmian oddaje te same dane, także podział na akapity', async () => {
    mountForm(draft)

    await submit()

    expect(wrapper.emitted('save')).toEqual([[draft]])
  })

  it('przy edycji też sprawdza pola', async () => {
    mountForm(draft)

    await fill({ title: '' })
    await submit()

    expect(wrapper.emitted('save')).toBeUndefined()
    expect(errorTexts()).toEqual(['Podaj tytuł artykułu.'])
  })

  it('przy edycji pozwala usunąć obrazek', async () => {
    mountForm(draft)

    await fill({ image: '' })
    await submit()

    expect(wrapper.emitted('save')?.[0]?.[0]).toMatchObject({ image: undefined })
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

    expect(wrapper.emitted('save')).toEqual([
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

    expect(wrapper.emitted('save')).toBeUndefined()
    expect(errorTexts()).toEqual([message])
  })

  it('publikuje artykuł z adresem obrazka', async () => {
    mountForm()

    await fill({
      title: 'Tytuł',
      category: 'Fizyka',
      content: 'Treść',
      image: '  https://example.com/obrazek.jpg ',
    })
    await submit()

    expect(wrapper.emitted('save')?.[0]?.[0]).toMatchObject({
      image: 'https://example.com/obrazek.jpg',
    })
  })

  it('obrazek jest opcjonalny', async () => {
    mountForm()

    await fill({ title: 'Tytuł', category: 'Fizyka', content: 'Treść', image: '   ' })
    await submit()

    expect(wrapper.emitted('save')).toHaveLength(1)
    expect(wrapper.emitted('save')?.[0]?.[0]).toMatchObject({ image: undefined })
  })

  it.each([
    'obrazek.jpg',
    'ftp://example.com/a.jpg',
    'javascript:alert(1)',
    'data:image/png;base64,AA',
  ])('nie publikuje z adresem obrazka: %s', async (image) => {
    mountForm()

    await fill({ title: 'Tytuł', category: 'Fizyka', content: 'Treść', image })
    await submit()

    expect(wrapper.emitted('save')).toBeUndefined()
    expect(errorTexts()).toEqual(['Podaj pełny adres zaczynający się od http:// lub https://.'])
    expect(document.activeElement).toBe(wrapper.find('[name="image"]').element)
  })

  it('pokazuje błąd adresu obrazka po wyjściu z pola', async () => {
    mountForm()

    await fill({ image: 'obrazek.jpg' })
    expect(errorTexts()).toEqual([])

    await wrapper.find('[name="image"]').trigger('blur')
    expect(errorTexts()).toEqual(['Podaj pełny adres zaczynający się od http:// lub https://.'])
  })

  it('nie publikuje bez dziedziny', async () => {
    mountForm()

    await fill({ title: 'Tytuł', content: 'Treść' })
    await submit()

    expect(wrapper.emitted('save')).toBeUndefined()
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
    expect(wrapper.emitted('save')).toBeUndefined()
  })
})
