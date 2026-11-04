import { describe, expect, it } from 'vitest'
import {
  CATEGORIES,
  isImageUrl,
  readingTime,
  seedArticles,
  toParagraphs,
  type Article,
} from '../articles'
import { authors } from '../authors'

function articleWithWords(count: number): Article {
  return {
    id: 1,
    title: 'Test',
    author: 'Test',
    category: 'Fizyka',
    date: '2026-01-01',
    content: [Array(count).fill('słowo').join(' ')],
    likes: 0,
    liked: false,
    comments: [],
  }
}

describe('readingTime', () => {
  it('zwraca co najmniej 1 minutę dla krótkiego tekstu', () => {
    expect(readingTime(articleWithWords(5))).toBe(1)
  })

  it('liczy 200 słów na minutę', () => {
    expect(readingTime(articleWithWords(400))).toBe(2)
    expect(readingTime(articleWithWords(1000))).toBe(5)
  })

  it('liczy słowa ze wszystkich akapitów', () => {
    const article = articleWithWords(300)
    article.content.push(Array(300).fill('słowo').join(' '))

    expect(readingTime(article)).toBe(3)
  })
})

describe('toParagraphs', () => {
  it('dzieli tekst po pustych liniach', () => {
    expect(toParagraphs('Pierwszy.\n\nDrugi.\n \n\nTrzeci.')).toEqual([
      'Pierwszy.',
      'Drugi.',
      'Trzeci.',
    ])
  })

  it('pojedynczy Enter nie zaczyna nowego akapitu', () => {
    expect(toParagraphs('Linia pierwsza\nlinia druga')).toEqual(['Linia pierwsza\nlinia druga'])
  })

  it('usuwa spacje z brzegów i puste akapity', () => {
    expect(toParagraphs('  Tekst  \n\n   \n\n')).toEqual(['Tekst'])
    expect(toParagraphs('   ')).toEqual([])
  })
})

describe('isImageUrl', () => {
  it.each(['https://example.com/a.jpg', 'http://example.com/a.png?w=100'])(
    'przyjmuje adres internetowy: %s',
    (url) => {
      expect(isImageUrl(url)).toBe(true)
    },
  )

  it.each([
    '',
    'obrazek.jpg',
    'example.com/a.jpg',
    'https://',
    'ftp://example.com/a.jpg',
    'javascript:alert(1)',
    'data:image/png;base64,AAAA',
  ])('odrzuca: "%s"', (text) => {
    expect(isImageUrl(text)).toBe(false)
  })
})

describe('przykładowe artykuły', () => {
  it('są z obrazkami i bez, a adresy obrazków są poprawne', () => {
    const images = seedArticles.flatMap((a) => (a.image ? [a.image] : []))

    expect(images).toHaveLength(2)
    expect(images.every(isImageUrl)).toBe(true)
  })

  it('mają unikalne identyfikatory', () => {
    const ids = seedArticles.map((a) => a.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('mają autorów z listy autorów', () => {
    const names = authors.map((a) => a.name)

    for (const article of seedArticles) {
      expect(names).toContain(article.author)
    }
  })

  it('mają poprawną datę i treść', () => {
    for (const article of seedArticles) {
      expect(Number.isNaN(new Date(article.date).getTime())).toBe(false)
      expect(article.content.length).toBeGreaterThan(0)
    }
  })

  it('są ułożone od najnowszego i obejmują wszystkie dziedziny', () => {
    const dates = seedArticles.map((a) => a.date)

    expect(dates).toEqual([...dates].sort().reverse())
    expect(new Set(seedArticles.map((a) => a.category))).toEqual(new Set(CATEGORIES))
  })
})
