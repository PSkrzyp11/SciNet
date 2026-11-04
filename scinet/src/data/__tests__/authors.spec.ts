import { describe, expect, it } from 'vitest'
import { authorName, authors } from '../authors'

describe('dane autorów', () => {
  it('mają unikalne identyfikatory', () => {
    const ids = authors.map((a) => a.id)

    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('authorName', () => {
  it('zwraca imię i nazwisko autora o podanym identyfikatorze', () => {
    expect(authorName('anna-nowak')).toBe('Anna Nowak')
    expect(authorName('kasia-zielinska')).toBe('Kasia Zielińska')
  })
})
