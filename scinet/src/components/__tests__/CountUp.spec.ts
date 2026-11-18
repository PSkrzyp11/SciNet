import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import CountUp from '../CountUp.vue'

let viewCallback: ((entries: { isIntersecting: boolean }[]) => void) | null = null

function stubBrowser({ reduced = false } = {}) {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
        viewCallback = callback
      }
      observe() {}
      disconnect() {}
    },
  )
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: reduced })),
  )
}

const visible = (wrapper: ReturnType<typeof mount>) => wrapper.find('[aria-hidden="true"]').text()
const forReaders = (wrapper: ReturnType<typeof mount>) => wrapper.find('.visually-hidden').text()

describe('CountUp', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
    viewCallback = null
  })

  it('bez animacji od razu pokazuje prawdziwą liczbę', () => {
    const wrapper = mount(CountUp, { props: { value: 42 } })

    expect(visible(wrapper)).toBe('42')
    expect(forReaders(wrapper)).toBe('42')
  })

  it('dolicza od zera, gdy pojawi się na ekranie, a czytnik od razu zna wynik', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'requestAnimationFrame', 'performance'] })
    stubBrowser()
    const wrapper = mount(CountUp, { props: { value: 42 }, attachTo: document.body })
    await nextTick()

    expect(visible(wrapper)).toBe('0')
    expect(forReaders(wrapper)).toBe('42')

    viewCallback?.([{ isIntersecting: true }])
    vi.advanceTimersByTime(1500)
    await nextTick()

    expect(visible(wrapper)).toBe('42')
    wrapper.unmount()
  })

  it('przy ograniczonym ruchu nie dolicza', async () => {
    stubBrowser({ reduced: true })
    const wrapper = mount(CountUp, { props: { value: 42 }, attachTo: document.body })
    await nextTick()

    expect(visible(wrapper)).toBe('42')
    wrapper.unmount()
  })

  it('po polubieniu liczba zmienia się od razu', async () => {
    const wrapper = mount(CountUp, { props: { value: 42 } })

    await wrapper.setProps({ value: 43 })

    expect(visible(wrapper)).toBe('43')
    expect(forReaders(wrapper)).toBe('43')
  })
})
