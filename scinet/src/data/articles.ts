export interface Article {
  id: number
  title: string
  excerpt: string
  author: string
  category: string
  date: string
}

export const articles: Article[] = [
  {
    id: 1,
    title: 'Jak działają komputery kwantowe?',
    excerpt: 'Kubity, superpozycja i splątanie wyjaśnione bez skomplikowanej matematyki.',
    author: 'Anna Nowak',
    category: 'Fizyka',
    date: '2026-10-28',
  },
  {
    id: 2,
    title: 'CRISPR w praktyce',
    excerpt: 'Edycja genów przestaje być science fiction. Gdzie jesteśmy dziś?',
    author: 'Marek Wiśniewski',
    category: 'Biologia',
    date: '2026-10-21',
  },
  {
    id: 3,
    title: 'Sieci neuronowe od podstaw',
    excerpt: 'Budujemy prosty model krok po kroku i sprawdzamy, czego się uczy.',
    author: 'Kasia Zielińska',
    category: 'Informatyka',
    date: '2026-10-14',
  },
  {
    id: 4,
    title: 'Czarne dziury na zdjęciach',
    excerpt: 'Jak astronomowie sfotografowali coś, czego z definicji nie widać.',
    author: 'Anna Nowak',
    category: 'Astronomia',
    date: '2026-10-05',
  },
  {
    id: 5,
    title: 'Mikroplastik w oceanach',
    excerpt: 'Skąd się bierze, gdzie trafia i co możemy z tym zrobić.',
    author: 'Tomasz Lewandowski',
    category: 'Ekologia',
    date: '2026-09-29',
  },
  {
    id: 6,
    title: 'Matematyka w muzyce',
    excerpt: 'Proporcje, częstotliwości i to, dlaczego niektóre akordy brzmią dobrze.',
    author: 'Kasia Zielińska',
    category: 'Matematyka',
    date: '2026-09-18',
  },
]
