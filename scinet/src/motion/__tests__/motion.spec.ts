import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseModal from '@/components/ui/BaseModal.vue'
import { getLenis, jumpTo, lockScroll, unlockScroll } from '../index'

const overflow = () => document.documentElement.style.overflow

describe('warstwa ruchu bez uruchomionego Lenis', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn()
    // Zdejmuje blokady, które mógł zostawić poprzedni test
    unlockScroll()
    unlockScroll()
  })

  it('w testach płynny scroll nie jest uruchomiony', () => {
    expect(getLenis()).toBeNull()
  })

  it('jumpTo przewija natywnie', () => {
    jumpTo(240)

    expect(window.scrollTo).toHaveBeenCalledWith(0, 240)
  })

  it('blokada przewijania działa do zdjęcia ostatniej blokady', () => {
    lockScroll()
    lockScroll()
    expect(overflow()).toBe('hidden')

    unlockScroll()
    expect(overflow()).toBe('hidden')

    unlockScroll()
    expect(overflow()).toBe('')
  })

  it('nadmiarowe odblokowanie niczego nie psuje', () => {
    unlockScroll()
    lockScroll()

    expect(overflow()).toBe('hidden')
  })
})

describe('BaseModal', () => {
  beforeEach(() => {
    unlockScroll()
    unlockScroll()
  })

  const mountModal = (open: boolean) =>
    mount(BaseModal, { props: { open, title: 'Okno' }, global: { stubs: { teleport: true } } })

  it('blokuje przewijanie strony, gdy jest otwarty', async () => {
    const wrapper = mountModal(false)
    expect(overflow()).toBe('')

    await wrapper.setProps({ open: true })
    expect(overflow()).toBe('hidden')

    await wrapper.setProps({ open: false })
    expect(overflow()).toBe('')
  })

  it('odblokowuje przewijanie, gdy zniknie ze strony jako otwarty', () => {
    const wrapper = mountModal(true)
    expect(overflow()).toBe('hidden')

    wrapper.unmount()

    expect(overflow()).toBe('')
  })
})
