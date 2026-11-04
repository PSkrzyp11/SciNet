export const CATEGORIES = [
  'Fizyka',
  'Biologia',
  'Informatyka',
  'Astronomia',
  'Ekologia',
  'Matematyka',
] as const

export type Category = (typeof CATEGORIES)[number]

export interface ArticleComment {
  id: number
  author: string
  text: string
  date: string
}

export interface Article {
  id: number
  title: string
  author: string
  category: Category
  date: string
  content: string[]
  // Tylko adres internetowy: localStorage mieści zwykle około 5 MB
  image?: string
  likes: number
  // Czy ten użytkownik już polubił artykuł
  liked: boolean
  comments: ArticleComment[]
}

// Dane z formularza: resztę pól uzupełnia store
export type ArticleDraft = Pick<Article, 'title' | 'author' | 'category' | 'content' | 'image'>

// Tylko pełne adresy internetowe, bez plików wklejonych jako data: czy javascript:
export function isImageUrl(text: string) {
  try {
    const { protocol } = new URL(text)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

// W formularzu akapity oddziela pusta linia
export function toParagraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

const WORDS_PER_MINUTE = 200

// Szacowany czas czytania w minutach (co najmniej 1)
export function readingTime(article: Article) {
  const words = article.content.join(' ').trim().split(/\s+/).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

export const seedArticles: Article[] = [
  {
    id: 1,
    title: 'Jak działają komputery kwantowe?',
    author: 'Anna Nowak',
    category: 'Fizyka',
    date: '2026-10-28',
    content: [
      'Zwykły komputer przechowuje informacje w bitach, które mają wartość 0 albo 1. Komputer kwantowy używa kubitów, które dzięki superpozycji mogą być jednocześnie w obu stanach, dopóki ich nie zmierzymy.',
      'Drugim kluczowym zjawiskiem jest splątanie. Dwa splątane kubity są ze sobą powiązane tak, że pomiar jednego od razu mówi nam coś o drugim, nawet jeśli dzieli je duża odległość.',
      'Nie oznacza to, że komputery kwantowe są po prostu „szybsze”. Sprawdzają się w konkretnych zadaniach, takich jak symulowanie cząsteczek czy niektóre problemy optymalizacyjne, a w codziennych zastosowaniach zwykły laptop nadal wygrywa.',
    ],
    likes: 24,
    liked: false,
    comments: [],
  },
  {
    id: 2,
    title: 'CRISPR w praktyce',
    author: 'Marek Wiśniewski',
    category: 'Biologia',
    date: '2026-10-21',
    content: [
      'CRISPR-Cas9 to narzędzie, które pozwala precyzyjnie przeciąć DNA w wybranym miejscu. Pierwotnie był to mechanizm obronny bakterii przed wirusami, a naukowcy nauczyli się go wykorzystywać.',
      'Dziś CRISPR stosuje się w badaniach nad chorobami genetycznymi, w rolnictwie do tworzenia odporniejszych odmian roślin oraz w pierwszych zatwierdzonych terapiach, m.in. anemii sierpowatej.',
      'Wraz z możliwościami pojawiają się pytania etyczne: gdzie leży granica między leczeniem a „ulepszaniem” człowieka i kto powinien o tym decydować.',
    ],
    likes: 18,
    liked: false,
    comments: [],
  },
  {
    id: 3,
    title: 'Sieci neuronowe od podstaw',
    author: 'Kasia Zielińska',
    category: 'Informatyka',
    date: '2026-10-14',
    content: [
      'Sieć neuronowa składa się z warstw prostych jednostek, tzw. neuronów. Każdy z nich mnoży dane wejściowe przez wagi, sumuje wynik i przepuszcza go przez funkcję aktywacji.',
      'Uczenie polega na pokazywaniu sieci przykładów i stopniowym poprawianiu wag tak, aby jej odpowiedzi były coraz bliższe prawidłowym. Odpowiada za to algorytm propagacji wstecznej.',
      'Nawet mała sieć z jedną warstwą ukrytą potrafi nauczyć się rozpoznawać odręcznie pisane cyfry z dokładnością powyżej 90%. To dobry pierwszy projekt na start.',
    ],
    likes: 31,
    liked: false,
    comments: [],
  },
  {
    id: 4,
    title: 'Czarne dziury na zdjęciach',
    author: 'Anna Nowak',
    category: 'Astronomia',
    date: '2026-10-05',
    // Ilustracja NASA/CXC/SAO, domena publiczna, Wikimedia Commons
    image:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/Artist%27s_illustration_showing_material_in_a_disk_that_is_falling_towards_a_supermassive_black_hole.jpg/960px-Artist%27s_illustration_showing_material_in_a_disk_that_is_falling_towards_a_supermassive_black_hole.jpg',
    content: [
      'Czarnej dziury nie da się zobaczyć bezpośrednio, bo nie wypuszcza nawet światła. Widać za to gorącą materię, która krąży wokół niej, oraz „cień”, jaki rzuca na to świecące tło.',
      'Aby uzyskać taki obraz, połączono radioteleskopy z całego świata w jeden wirtualny instrument wielkości Ziemi, nazwany Teleskopem Horyzontu Zdarzeń.',
      'Zdjęcia czarnych dziur w galaktyce M87 i w centrum Drogi Mlecznej potwierdziły przewidywania ogólnej teorii względności Einsteina z zaskakującą dokładnością.',
    ],
    likes: 42,
    liked: false,
    comments: [],
  },
  {
    id: 5,
    title: 'Mikroplastik w oceanach',
    author: 'Tomasz Lewandowski',
    category: 'Ekologia',
    date: '2026-09-29',
    // Zdjęcie NOAA Marine Debris Program, domena publiczna, Wikimedia Commons
    image:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/37/Pre-production_plastic_pellets_%287656726070%29.jpg/960px-Pre-production_plastic_pellets_%287656726070%29.jpg',
    content: [
      'Mikroplastik to drobiny tworzyw sztucznych mniejsze niż 5 mm. Powstają z rozpadu większych odpadów, ale też z prania syntetycznych ubrań czy ścierania opon.',
      'Cząstki te trafiają do rzek i oceanów, gdzie zjadają je ryby i plankton. W ten sposób mikroplastik wraca do nas przez łańcuch pokarmowy.',
      'Najskuteczniej działa ograniczanie plastiku u źródła: lepsze filtry w pralkach, mniej jednorazowych opakowań i sprawny recykling.',
    ],
    likes: 12,
    liked: false,
    comments: [],
  },
  {
    id: 6,
    title: 'Matematyka w muzyce',
    author: 'Kasia Zielińska',
    category: 'Matematyka',
    date: '2026-09-18',
    content: [
      'Każdy dźwięk to drganie o określonej częstotliwości. Gdy dwa dźwięki mają częstotliwości w prostym stosunku, np. 2:1 (oktawa) albo 3:2 (kwinta), brzmią razem harmonijnie.',
      'Już Pitagoras zauważył, że długości strun dające przyjemne współbrzmienia układają się w proste proporcje. Na tym opierały się pierwsze systemy strojenia.',
      'Współczesne instrumenty używają stroju równomiernie temperowanego, w którym oktawa jest podzielona na 12 równych części. To kompromis, który pozwala grać w każdej tonacji.',
    ],
    likes: 9,
    liked: false,
    comments: [],
  },
]
