import type { Guide } from '../../content/guides'

export type GuidesSort = 'latest' | 'useful'

export function mergeGuides(
  staticGuides: Guide[],
  remoteGuides: Guide[],
  sort: GuidesSort,
): Guide[] {
  const staticSlugs = new Set(staticGuides.map((guide) => guide.slug))
  const dedupedRemote = remoteGuides.filter((guide) => !staticSlugs.has(guide.slug))

  if (sort === 'useful') {
    return [...staticGuides, ...dedupedRemote]
  }

  return [...staticGuides, ...dedupedRemote].sort((a, b) =>
    b.reviewedDate.localeCompare(a.reviewedDate),
  )
}
