import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { afterScrollIdle, SCROLL_IDLE_MS, scrolledRecently } from '../scrollIdle'

describe('scrollIdle', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('wie, że strona przed chwilą się przewijała', () => {
    window.dispatchEvent(new Event('scroll'))
    expect(scrolledRecently()).toBe(true)

    vi.advanceTimersByTime(SCROLL_IDLE_MS + 10)
    expect(scrolledRecently()).toBe(false)
  })

  it('czeka z animacją, aż przewijanie ucichnie', () => {
    const run = vi.fn()
    window.dispatchEvent(new Event('scroll'))
    afterScrollIdle(run)

    vi.advanceTimersByTime(SCROLL_IDLE_MS / 2)
    window.dispatchEvent(new Event('scroll'))
    vi.advanceTimersByTime(SCROLL_IDLE_MS / 2 + 10)
    expect(run).not.toHaveBeenCalled()

    vi.advanceTimersByTime(SCROLL_IDLE_MS)
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('gdy strona stoi, rusza od razu', () => {
    // Moduł pamięta czas scrolla z poprzednich testów, więc zegar idzie daleko do przodu
    vi.advanceTimersByTime(60_000)
    const run = vi.fn()

    afterScrollIdle(run)

    expect(run).toHaveBeenCalledTimes(1)
  })

  it('daje się anulować', () => {
    const run = vi.fn()
    window.dispatchEvent(new Event('scroll'))
    const cancel = afterScrollIdle(run)

    cancel()
    vi.advanceTimersByTime(SCROLL_IDLE_MS * 2)

    expect(run).not.toHaveBeenCalled()
  })
})
