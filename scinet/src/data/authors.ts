export interface Author {
  name: string
  field: string
  color: string
  bio: string
}

export const authors: Author[] = [
  {
    name: 'Anna Nowak',
    field: 'Fizyka i astronomia',
    color: '#4f46e5',
    bio: 'Fizyczka teoretyczna. Pisze o kosmosie i mechanice kwantowej tak, żeby dało się to zrozumieć przy porannej kawie.',
  },
  {
    name: 'Marek Wiśniewski',
    field: 'Biologia molekularna',
    color: '#059669',
    bio: 'Pracuje w laboratorium genetycznym. Interesuje go, jak nowe technologie zmieniają medycynę i rolnictwo.',
  },
  {
    name: 'Kasia Zielińska',
    field: 'Informatyka i matematyka',
    color: '#d97706',
    bio: 'Programistka i nauczycielka matematyki. Lubi pokazywać, że algorytmy i liczby są wszędzie, także w muzyce.',
  },
  {
    name: 'Tomasz Lewandowski',
    field: 'Ekologia',
    color: '#0891b2',
    bio: 'Biolog morski. Bada wpływ zanieczyszczeń na ekosystemy i podpowiada, co każdy z nas może zrobić inaczej.',
  },
]
