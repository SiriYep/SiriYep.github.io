import type { Publication } from '@/types'

export type PublicationOrder = 'representative' | 'newest' | 'oldest'

const monthOrder: Record<string, number> = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
}

const compareDateNewest = (a: Publication, b: Publication) => {
  if (b.year !== a.year) return b.year - a.year
  const monthDiff = (monthOrder[b.month || ''] || 0) - (monthOrder[a.month || ''] || 0)
  if (monthDiff !== 0) return monthDiff
  return a.id.localeCompare(b.id)
}

export const sortPublications = (
  publications: Publication[],
  order: PublicationOrder,
) => [...publications].sort((a, b) => {
  if (order === 'newest') return compareDateNewest(a, b)
  if (order === 'oldest') return -compareDateNewest(a, b)

  const rankA = a.representativeRank ?? Number.POSITIVE_INFINITY
  const rankB = b.representativeRank ?? Number.POSITIVE_INFINITY
  if (rankA !== rankB) return rankA - rankB
  return compareDateNewest(a, b)
})
