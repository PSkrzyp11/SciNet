import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseBadge from '../ui/BaseBadge.vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseCard from '../ui/BaseCard.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseModal from '../ui/BaseModal.vue'
import BaseSkeleton from '../ui/BaseSkeleton.vue'
import ThemeToggle from '../ui/ThemeToggle.vue'
import ToastContainer from '../ui/ToastContainer.vue'
import { useTheme } from '@/composables/useTheme'
import { useToast } from '@/composables/useToast'

describe('Design System & UI Components', () => {
  beforeEach(() => {
    localStorage.clear()
    const { setTheme } = useTheme()
    setTheme('light')
    const { toasts, dismiss } = useToast()
    toasts.value.forEach((t) => dismiss(t.id))
  })

  it('przełącza motyw jasny/ciemny i zapisuje wybór w localStorage', async () => {
    const wrapper = mount(ThemeToggle)

    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(wrapper.text()).toContain('Nocny')

    await wrapper.trigger('click')

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('scinet-theme')).toBe('dark')
    expect(wrapper.text()).toContain('Jasny')
  })

  it('wyświetla i zamyka powiadomienia Toast', async () => {
    const { notify } = useToast()
    const wrapper = mount(ToastContainer)

    notify('Zapisano artykuł', {
      description: 'Tekst jest na liście.',
      variant: 'success',
      duration: 0,
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.toast-title').text()).toBe('Zapisano artykuł')
    expect(wrapper.find('.toast-desc').text()).toBe('Tekst jest na liście.')

    await wrapper.find('.toast-close').trigger('click')
    expect(wrapper.find('.toast-item').exists()).toBe(false)
  })

  it.each([
    ['Fizyka', 'cat-physics'],
    ['Biologia', 'cat-biology'],
    ['Informatyka', 'cat-cs'],
    ['Astronomia', 'cat-astronomy'],
    ['Ekologia', 'cat-ecology'],
    ['Matematyka', 'cat-math'],
  ])('dobiera dedykowaną klasę kolorystyczną dla dziedziny %s', (category, expectedClass) => {
    const wrapper = mount(BaseBadge, { props: { category } })

    expect(wrapper.text()).toBe(category)
    expect(wrapper.classes()).toContain(expectedClass)
  })

  it('obsługuje stany disabled oraz loading w BaseButton', () => {
    const wrapper = mount(BaseButton, {
      props: { loading: true, variant: 'accent', size: 'lg' },
      slots: { default: 'Publikuj' },
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.find('.spinner').exists()).toBe(true)
    expect(wrapper.classes()).toContain('variant-accent')
    expect(wrapper.classes()).toContain('size-lg')
  })

  it('obsługuje walidację, aria-invalid i aktualizację wartości w BaseInput', async () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: '',
        label: 'E-mail',
        name: 'email',
        error: 'Błędny adres',
        errorId: 'email-err',
      },
    })

    const input = wrapper.find('input')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe('email-err')
    expect(wrapper.find('.error').text()).toBe('Błędny adres')

    await input.setValue('test@scinet.pl')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test@scinet.pl'])
  })

  it('renderuje BaseCard, BaseSkeleton oraz zamyka BaseModal klawiszem Escape', async () => {
    const card = mount(BaseCard, {
      props: { variant: 'interactive', padding: 'lg' },
      slots: { default: 'Treść karty' },
    })
    expect(card.text()).toBe('Treść karty')
    expect(card.classes()).toContain('variant-interactive')

    const skeleton = mount(BaseSkeleton, { props: { width: '120px', height: '24px' } })
    expect(skeleton.attributes('aria-hidden')).toBe('true')

    const modal = mount(BaseModal, {
      props: { open: true, title: 'Potwierdzenie' },
      global: { stubs: { Teleport: true } },
    })
    expect(modal.find('.modal-title').text()).toBe('Potwierdzenie')

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(modal.emitted('close')).toHaveLength(1)
    modal.unmount()
  })
})
