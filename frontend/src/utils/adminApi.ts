import axios from 'axios'
import { API_BASE } from './adminConfig'

export interface PaginatedResponse<T> {
  results: T[]
  count: number
  next: string | null
  previous: string | null
}

export function extractList<T>(data: T[] | PaginatedResponse<T>): T[] {
  if (Array.isArray(data)) return data
  return data.results ?? []
}

export function extractPageInfo(data: unknown) {
  if (Array.isArray(data)) {
    return { count: data.length, hasNext: false, hasPrev: false }
  }
  const paginated = data as PaginatedResponse<unknown>
  return {
    count: paginated.count ?? 0,
    hasNext: Boolean(paginated.next),
    hasPrev: Boolean(paginated.previous),
  }
}

export async function downloadAuthenticatedFile(
  path: string,
  params: Record<string, string>,
  filename: string
) {
  const res = await axios.get(`${API_BASE}${path}`, {
    params,
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(new Blob([res.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
