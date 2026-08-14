import { beforeEach, describe, expect, it, vi } from 'vitest'

import { publicHttp } from './http'

import { fetchGuideBySlug, fetchGuides } from './guides'

vi.mock('./http', () => ({
  publicHttp: { get: vi.fn() },
}))

const mockedGet = vi.mocked(publicHttp.get)

beforeEach(() => {
  mockedGet.mockReset()
})

describe('fetchGuides', () => {
  it('calls GET /guides with pagination params and unwraps envelope', async () => {
    const page = { items: [], total: 0, page: 1, page_size: 20 }
    mockedGet.mockResolvedValueOnce({ data: { data: page } })

    const result = await fetchGuides({ page: 2, page_size: 10 })

    expect(mockedGet).toHaveBeenCalledWith('/guides', { params: { page: 2, page_size: 10 } })
    expect(result).toEqual(page)
  })

  it('defaults to no params', async () => {
    mockedGet.mockResolvedValueOnce({ data: { data: { items: [], total: 0, page: 1, page_size: 20 } } })

    await fetchGuides()

    expect(mockedGet).toHaveBeenCalledWith('/guides', { params: {} })
  })
})

describe('fetchGuideBySlug', () => {
  it('calls GET /guides/:slug and unwraps envelope', async () => {
    const guide = { slug: 'demo', path: '/guides/demo' }
    mockedGet.mockResolvedValueOnce({ data: { data: guide } })

    const result = await fetchGuideBySlug('demo')

    expect(mockedGet).toHaveBeenCalledWith('/guides/demo')
    expect(result).toEqual(guide)
  })
})
