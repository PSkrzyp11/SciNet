import { describe, expect, it } from 'vitest'
import { authors, currentUser, initials } from '../authors'

describe('dane autorów', () => {
  it('mają unikalne imiona i nazwiska', () => {
    const names = authors.map((a) => a.name)

    expect(new Set(names).size).toBe(names.length)
  })

  it('obejmują użytkowniczkę portalu', () => {
    expect(authors).toContain(currentUser)
  })
})

describe('initials', () => {
  it('zwraca pierwsze litery imienia i nazwiska', () => {
    expect(initials('Anna Nowak')).toBe('AN')
    expect(initials('Kasia Zielińska')).toBe('KZ')
  })

  it('radzi sobie z tekstem wpisanym przez użytkownika', () => {
    expect(initials('jan kowalski')).toBe('JK')
    expect(initials('  Jan   Kowalski  ')).toBe('JK')
    expect(initials('Jan Maria Kowalski')).toBe('JM')
    expect(initials('Jan')).toBe('J')
  })
})
