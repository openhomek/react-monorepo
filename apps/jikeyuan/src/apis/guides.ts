import type { Guide } from '../content/guides'

import { publicHttp } from './http'

export interface RemoteGuidesPage {
  items: Guide[]
  total: number
  page: number
  page_size: number
}

export interface FetchGuidesParams {
  page?: number
  page_size?: number
}

interface GuidesListResponse {
  data: RemoteGuidesPage
}

interface GuideDetailResponse {
  data: Guide
}

export async function fetchGuides(params: FetchGuidesParams = {}): Promise<RemoteGuidesPage> {
  const response = await publicHttp.get<GuidesListResponse>('/guides', { params })
  return response.data.data
}

export async function fetchGuideBySlug(slug: string): Promise<Guide> {
  const response = await publicHttp.get<GuideDetailResponse>(`/guides/${slug}`)
  return response.data.data
}
