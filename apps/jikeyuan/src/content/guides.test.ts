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

  it('maps categories onto the site-wide task taxonomy', () => {
    const taskCategories = new Set([
      '入境證件',
      '租房住宿',
      '銀行支付',
      '交通出行',
      '電話網絡',
      '校園生活',
    ])

    for (const guide of guides) {
      expect(taskCategories.has(guide.category)).toBe(true)
    }
  })

  it('marks at most one guide as featured', () => {
    expect(guides.filter((guide) => guide.featured).length).toBeLessThanOrEqual(1)
  })

  it('gives every section a phase label for the task axis', () => {
    for (const guide of guides) {
      for (const section of guide.sections) {
        expect(section.phase.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('keeps structured blocks well-formed', () => {
    for (const guide of guides) {
      for (const section of guide.sections) {
        if (section.table !== undefined) {
          expect(section.table.columns.length).toBeGreaterThanOrEqual(2)
          for (const row of section.table.rows) {
            expect(row).toHaveLength(section.table.columns.length)
          }
        }

        if (section.steps !== undefined) {
          expect(section.steps.length).toBeGreaterThanOrEqual(2)
        }

        for (const figure of section.figures ?? []) {
          expect(figure.alt.trim().length).toBeGreaterThan(0)
          expect(figure.caption.trim().length).toBeGreaterThan(0)
        }
      }

      for (const item of guide.faq ?? []) {
        expect(item.question.trim().length).toBeGreaterThan(0)
        expect(item.answer.trim().length).toBeGreaterThan(0)
      }
    }
  })
})
