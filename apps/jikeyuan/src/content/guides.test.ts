import { describe, expect, it } from 'vitest'

import { getGuideByPath, getGuideBySlug, guides } from './guides'

describe('guides', () => {
  it('uses unique, stable slugs and paths', () => {
    expect(new Set(guides.map((guide) => guide.slug)).size).toBe(guides.length)
    expect(new Set(guides.map((guide) => guide.path)).size).toBe(guides.length)

    for (const guide of guides) {
      expect(guide.path).toBe(`/guides/${guide.slug}`)
      expect(getGuideBySlug(guide.slug)).toBe(guide)
      expect(getGuideByPath(guide.path)).toBe(guide)
    }
  })

  it('keeps every published guide useful and source-backed', () => {
    for (const guide of guides) {
      expect(guide.takeaways.length).toBeGreaterThanOrEqual(3)
      expect(guide.sections.length).toBeGreaterThanOrEqual(4)
      expect(guide.sources.length).toBeGreaterThanOrEqual(3)
      expect(guide.sources.every((source) => source.url.startsWith('https://'))).toBe(true)
    }
  })
})
