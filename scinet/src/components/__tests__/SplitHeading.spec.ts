import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import SplitHeading from '../SplitHeading.vue'

// Poziom efektów ustawiany w teście (w jsdom nie ma WebGL, więc prawdziwy byłby „off”)
vi.mock('@/motion/fxTier', async () => {
  const { ref } = await import('vue')
  return { fxTier: ref('full') }
})

const create = vi.fn()
const revert = vi.fn()
const from = vi.fn()

vi.mock('@/motion/text', () => ({
  loadSplitText: vi.fn(async () => ({
    gsap: { from },
    SplitText: { create },
  })),
}))

let viewCallback: ((entries: { isIntersecting: boolean }[]) => void) | null = null

class FakeIntersectionObserver {
  constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
    viewCallback = callback
  }
  observe() {}
  disconnect() {}
}

function stubMotion(reduced = false) {
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  )
}

describe('SplitHeading', () => {
  beforeEach(() => {
    create.mockReset().mockImplementation((_target, vars) => {
      vars.onSplit?.({ lines: ['linia'] })
      return { revert }
    })
    revert.mockReset()
    from.mockReset()
    viewCallback = null
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('bez animacji jest zwykłym nagłówkiem z tekstem', () => {
    const wrapper = mount(SplitHeading, { props: { text: 'Nie ma takiej strony' } })

    expect(wrapper.element.tagName).toBe('H1')
    expect(wrapper.text()).toBe('Nie ma takiej strony')
    expect(wrapper.classes()).not.toContain('split-pending')
    expect(create).not.toHaveBeenCalled()
  })

  it('może być nagłówkiem innego poziomu', () => {
    const wrapper = mount(SplitHeading, { props: { text: 'Stopka', as: 'h2' } })

    expect(wrapper.element.tagName).toBe('H2')
  })

  it('dzieli tekst na linie z maską i daje czytnikom cały tekst', async () => {
    stubMotion()
    const wrapper = mount(SplitHeading, {
      props: { text: 'Długi tytuł', delay: 0.2 },
      attachTo: document.body,
    })
    await flushPromises()

    expect(create).toHaveBeenCalledWith(
      wrapper.element,
      expect.objectContaining({ type: 'lines', mask: 'lines', aria: 'auto', autoSplit: true }),
    )
    expect(from).toHaveBeenCalledWith(['linia'], expect.objectContaining({ delay: 0.2 }))
    expect(wrapper.classes()).not.toContain('split-pending')
    wrapper.unmount()
  })

  it('przy ograniczonym ruchu niczego nie dzieli', async () => {
    stubMotion(true)
    const wrapper = mount(SplitHeading, { props: { text: 'Tytuł' } })
    await flushPromises()

    expect(create).not.toHaveBeenCalled()
    expect(wrapper.classes()).not.toContain('split-pending')
  })

  it('z wyzwalaczem „view” czeka, aż nagłówek pojawi się na ekranie', async () => {
    stubMotion()
    const wrapper = mount(SplitHeading, {
      props: { text: 'Stopka', trigger: 'view' },
      attachTo: document.body,
    })
    await nextTick()
    // Poza ekranem tekst czeka ukryty, ale zajmuje swoje miejsce
    expect(wrapper.classes()).toContain('split-pending')
    await flushPromises()
    expect(create).not.toHaveBeenCalled()

    viewCallback?.([{ isIntersecting: true }])
    await flushPromises()
    expect(create).toHaveBeenCalledTimes(1)
    expect(wrapper.classes()).not.toContain('split-pending')
    wrapper.unmount()
  })

  it('przywraca oryginalny tekst przy zmianie tytułu i przy odmontowaniu', async () => {
    stubMotion()
    const wrapper = mount(SplitHeading, { props: { text: 'Stary tytuł' }, attachTo: document.body })
    await flushPromises()

    await wrapper.setProps({ text: 'Nowy tytuł' })
    await flushPromises()
    expect(revert).toHaveBeenCalledTimes(1)
    expect(create).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toBe('Nowy tytuł')

    wrapper.unmount()
    expect(revert).toHaveBeenCalledTimes(2)
  })

  it('gdy biblioteka się nie wczyta, pokazuje zwykły nagłówek', async () => {
    stubMotion()
    create.mockImplementation(() => {
      throw new Error('brak sieci')
    })
    const wrapper = mount(SplitHeading, { props: { text: 'Tytuł' }, attachTo: document.body })
    await flushPromises()

    expect(create).toHaveBeenCalled()
    expect(wrapper.classes()).not.toContain('split-pending')
    expect(wrapper.text()).toBe('Tytuł')
    wrapper.unmount()
  })

  it('w trybie statycznym nie dzieli tekstu, nawet gdy ruch jest dozwolony', async () => {
    stubMotion()
    const wrapper = mount(SplitHeading, {
      props: { text: 'Tytuł z karty', static: true },
      attachTo: document.body,
    })
    await flushPromises()

    expect(create).not.toHaveBeenCalled()
    expect(wrapper.classes()).not.toContain('split-pending')
    wrapper.unmount()
  })
})
