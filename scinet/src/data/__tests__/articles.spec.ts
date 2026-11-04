import { describe, expect, it } from 'vitest'
import { articles, readingTime, type Article } from '../articles'
import { authors } from '../authors'

function articleWithWords(count: number): Article {
  return {
    id: 1,
    title: 'Test',
    excerpt: 'Test',
    author: 'Test',
    category: 'Test',
    date: '2026-01-01',
    content: [Array(count).fill('słowo').join(' ')],
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

describe('dane artykułów', () => {
  it('mają unikalne identyfikatory', () => {
    const ids = articles.map((a) => a.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('mają autorów z listy autorów', () => {
    const names = authors.map((a) => a.name)

    for (const article of articles) {
      expect(names).toContain(article.author)
    }
  })

  it('mają poprawną datę i treść', () => {
    for (const article of articles) {
      expect(Number.isNaN(new Date(article.date).getTime())).toBe(false)
      expect(article.content.length).toBeGreaterThan(0)
    }
  })
})
