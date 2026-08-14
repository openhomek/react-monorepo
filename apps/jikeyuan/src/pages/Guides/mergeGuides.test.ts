import { describe, expect, it } from 'vitest'

import type { Guide } from '../../content/guides'

import { mergeGuides } from './mergeGuides'

function makeGuide(slug: string, reviewedDate: string): Guide {
  return {
    slug,
    path: `/guides/${slug}`,
    category: '交通出行',
    title: slug,
    cardTitle: slug,
    description: '',
    publishedDate: reviewedDate,
    reviewedDate,
    readingTime: '約 1 分鐘',
    imageAlt: '',
    takeaways: [],
    sections: [],
    sources: [],
  }
}

describe('mergeGuides', () => {
  const staticGuides = [makeGuide('static-a', '2026-08-01'), makeGuide('static-b', '2026-07-01')]
  const remoteGuides = [makeGuide('remote-x', '2026-08-14'), makeGuide('remote-y', '2026-06-01')]

  it('merges static and remote guides sorted by reviewedDate desc for latest', () => {
    const merged = mergeGuides(staticGuides, remoteGuides, 'latest')

    expect(merged.map((guide) => guide.slug)).toEqual(['remote-x', 'static-a', 'static-b', 'remote-y'])
  })

  it('keeps static order first and appends remote for useful', () => {
    const merged = mergeGuides(staticGuides, remoteGuides, 'useful')

    expect(merged.map((guide) => guide.slug)).toEqual(['static-a', 'static-b', 'remote-x', 'remote-y'])
  })

  it('drops remote guides whose slug collides with a static guide', () => {
    const colliding = [makeGuide('static-a', '2026-08-14')]

    const merged = mergeGuides(staticGuides, colliding, 'latest')

    expect(merged.filter((guide) => guide.slug === 'static-a')).toHaveLength(1)
    expect(merged[0].reviewedDate).toBe('2026-08-01')
  })

  it('returns static guides untouched when remote is empty', () => {
    const merged = mergeGuides(staticGuides, [], 'latest')

    expect(merged.map((guide) => guide.slug)).toEqual(['static-a', 'static-b'])
  })
})
