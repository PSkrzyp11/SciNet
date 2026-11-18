import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import CursorFollower from '../CursorFollower.vue'

function stubMedia({ fine, reduced }: { fine: boolean; reduced: boolean }) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query.includes('reduced-motion') ? reduced : fine,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
}

function element(html: string, selector: string) {
  const host = document.createElement('div')
  host.innerHTML = html
  return host.querySelector(selector)
}

describe('CursorFollower', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('pojawia się tylko z myszą', async () => {
    stubMedia({ fine: true, reduced: false })
    const withMouse = mount(CursorFollower)
    await nextTick()
    expect(withMouse.find('.cursor').exists()).toBe(true)

    stubMedia({ fine: false, reduced: false })
    const withTouch = mount(CursorFollower)
    await nextTick()
    expect(withTouch.find('.cursor').exists()).toBe(false)
  })

  it('przy ograniczonym ruchu się nie pojawia', async () => {
    stubMedia({ fine: true, reduced: true })
    const wrapper = mount(CursorFollower)
    await nextTick()

    expect(wrapper.find('.cursor').exists()).toBe(false)
  })

  it('jest ozdobą ukrytą przed czytnikami ekranu', async () => {
    stubMedia({ fine: true, reduced: false })
    const wrapper = mount(CursorFollower)
    await nextTick()

    expect(wrapper.find('.cursor').attributes('aria-hidden')).toBe('true')
  })

  it('dobiera stan do elementu pod kursorem', () => {
    stubMedia({ fine: true, reduced: false })
    const { stateFor } = mount(CursorFollower).vm

    expect(stateFor(element('<a href="/">Link</a>', 'a'))).toBe('link')
    expect(stateFor(element('<button><span>Ikona</span></button>', 'span'))).toBe('link')
    expect(stateFor(element('<article class="card"><p>Tekst</p></article>', 'p'))).toBe('read')
    expect(
      stateFor(element('<article class="card"><a class="title" href="/">Tytuł</a></article>', 'a')),
    ).toBe('read')
    expect(
      stateFor(element('<article class="card"><button>Lubię</button></article>', 'button')),
    ).toBe('link')
    expect(stateFor(element('<label><input type="text" /></label>', 'input'))).toBe('text')
    expect(stateFor(element('<p>Zwykły tekst</p>', 'p'))).toBe('default')
  })
})
