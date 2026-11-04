export interface Author {
  id: string
  name: string
  field: string
  color: string
  bio: string
}

// `as const` zachowuje dokładne wartości, a `satisfies` sprawdza, czy każdy autor ma wszystkie pola
export const authors = [
  {
    id: 'anna-nowak',
    name: 'Anna Nowak',
    field: 'Fizyka i astronomia',
    color: '#4f46e5',
    bio: 'Fizyczka teoretyczna. Pisze o kosmosie i mechanice kwantowej tak, żeby dało się to zrozumieć przy porannej kawie.',
  },
  {
    id: 'marek-wisniewski',
    name: 'Marek Wiśniewski',
    field: 'Biologia molekularna',
    color: '#059669',
    bio: 'Pracuje w laboratorium genetycznym. Interesuje go, jak nowe technologie zmieniają medycynę i rolnictwo.',
  },
  {
    id: 'kasia-zielinska',
    name: 'Kasia Zielińska',
    field: 'Informatyka i matematyka',
    color: '#d97706',
    bio: 'Programistka i nauczycielka matematyki. Lubi pokazywać, że algorytmy i liczby są wszędzie, także w muzyce.',
  },
  {
    id: 'tomasz-lewandowski',
    name: 'Tomasz Lewandowski',
    field: 'Ekologia',
    color: '#0891b2',
    bio: 'Biolog morski. Bada wpływ zanieczyszczeń na ekosystemy i podpowiada, co każdy z nas może zrobić inaczej.',
  },
] as const satisfies readonly Author[]

// Typ powstaje z listy powyżej: 'anna-nowak' | 'marek-wisniewski' | ...
export type AuthorId = (typeof authors)[number]['id']

// AuthorId pochodzi z tej samej listy, więc autor zawsze się znajdzie
export function authorName(id: AuthorId) {
  return authors.find((author) => author.id === id)!.name
}
