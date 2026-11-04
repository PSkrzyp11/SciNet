import { describe, expect, it } from 'vitest'
import { authors, initials } from '../authors'

describe('dane autorów', () => {
  it('mają unikalne imiona i nazwiska', () => {
    const names = authors.map((a) => a.name)

    expect(new Set(names).size).toBe(names.length)
  })
})

describe('initials', () => {
  it('zwraca pierwsze litery imienia i nazwiska', () => {
    expect(initials('Anna Nowak')).toBe('AN')
    expect(initials('Kasia Zielińska')).toBe('KZ')
  })
})
