import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import ContactView from '../ContactView.vue'

let wrapper: VueWrapper

function mountForm() {
  wrapper = mount(ContactView, { attachTo: document.body })

  return {
    name: wrapper.find('input[type="text"]'),
    email: wrapper.find('input[type="email"]'),
    message: wrapper.find('textarea'),
  }
}

const errors = () => wrapper.findAll('.error').map((error) => error.text())

async function submit() {
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('ContactView', () => {
  afterEach(() => {
    wrapper.unmount()
  })

  it('nie pokazuje błędów przed wypełnieniem', () => {
    mountForm()

    expect(errors()).toEqual([])
  })

  it('nie pokazuje błędu po przejściu przez puste pole', async () => {
    const { name } = mountForm()

    await name.trigger('blur')

    expect(errors()).toEqual([])
  })

  it('pokazuje błąd po wyjściu z błędnie wypełnionego pola', async () => {
    const { email } = mountForm()

    await email.setValue('zly-adres')
    await email.trigger('blur')

    expect(errors()).toEqual(['Podaj poprawny adres e-mail.'])
    expect(email.attributes('aria-invalid')).toBe('true')
    expect(email.attributes('aria-describedby')).toBe('email-error')
  })

  it('nie wysyła pustego formularza i ustawia kursor w pierwszym błędnym polu', async () => {
    const { name } = mountForm()

    await submit()

    expect(errors()).toEqual([
      'Podaj imię (co najmniej 2 znaki).',
      'Podaj poprawny adres e-mail.',
      'Napisz wiadomość (co najmniej 10 znaków).',
    ])
    expect(wrapper.find('.success').exists()).toBe(false)
    expect(document.activeElement).toBe(name.element)
  })

  it('ustawia kursor w błędnym polu, a nie w pierwszym poprawnym', async () => {
    const { name, email, message } = mountForm()

    await name.setValue('Ania')
    await email.setValue('ania@example.test')
    await message.setValue('za malo')
    await submit()

    expect(errors()).toEqual(['Napisz wiadomość (co najmniej 10 znaków).'])
    expect(document.activeElement).toBe(message.element)
  })

  it.each([
    ['bez-malpy.pl', false],
    ['a@b', false],
    ['a b@example.test', false],
    ['ania@example.test', true],
    ['  ania@example.test  ', true],
  ])('sprawdza adres %s', async (address, valid) => {
    const { email } = mountForm()

    await email.setValue(address)
    await email.trigger('blur')

    expect(errors()).toEqual(valid ? [] : ['Podaj poprawny adres e-mail.'])
  })

  it('nie uznaje samych spacji za wypełnione pole', async () => {
    const { name, email, message } = mountForm()

    await name.setValue('    ')
    await email.setValue('ania@example.test')
    await message.setValue('           ')
    await submit()

    expect(errors()).toEqual([
      'Podaj imię (co najmniej 2 znaki).',
      'Napisz wiadomość (co najmniej 10 znaków).',
    ])
  })

  it('usuwa błąd od razu po poprawieniu wartości', async () => {
    const { email } = mountForm()

    await submit()
    await email.setValue('ania@example.test')

    expect(errors()).not.toContain('Podaj poprawny adres e-mail.')
  })

  it('wysyła poprawny formularz, a kolejna wiadomość zaczyna się od czystego', async () => {
    const { name, email, message } = mountForm()

    await name.setValue('Ania')
    await email.setValue('ania@example.test')
    await message.setValue('Wiadomość testowa')
    await submit()

    expect(wrapper.find('.success').exists()).toBe(true)
    expect(wrapper.find('form').exists()).toBe(false)

    await wrapper.find('.success .link').trigger('click')

    expect((wrapper.find('input[type="text"]').element as HTMLInputElement).value).toBe('')
    expect(errors()).toEqual([])
  })

  it('wciśnięcie przycisku nie zabiera kursora z pola', () => {
    mountForm()
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })

    wrapper.find('button[type="submit"]').element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
  })
})
