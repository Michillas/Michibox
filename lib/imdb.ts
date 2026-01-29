export interface IMDBTitle {
  id: string
  type: string
  primaryTitle: string
  originalTitle: string
  primaryImage?: {
    url: string
    width: number
    height: number
  }
  startYear?: number
  endYear?: number
  runtimeSeconds?: number
  genres?: string[]
  rating?: {
    aggregateRating: number
    voteCount: number
  }
  plot?: string
}

export interface IMDBSearchResponse {
  titles: IMDBTitle[]
  nextPageToken?: string
}

export interface IMDBDetailResponse extends IMDBTitle {
  releaseDate?: {
    day: number
    month: number
    year: number
  }
  countriesOfOrigin?: string[]
  spokenLanguages?: string[]
  directors?: Array<{ id: string; name: string }>
  writers?: Array<{ id: string; name: string }>
  cast?: Array<{ id: string; name: string; characters?: string[] }>
}

const IMDB_API_BASE = 'https://api.imdbapi.dev'

export type TitleType = 'MOVIE' | 'TV_SERIES' | 'TV_MINI_SERIES' | 'TV_SPECIAL' | 'TV_MOVIE' | 'SHORT' | 'VIDEO' | 'VIDEO_GAME'
export type SortBy = 'SORT_BY_POPULARITY' | 'SORT_BY_RELEASE_DATE' | 'SORT_BY_USER_RATING' | 'SORT_BY_USER_RATING_COUNT' | 'SORT_BY_YEAR'

export interface SearchParams {
  types?: TitleType[]
  genres?: string[]
  startYear?: number
  endYear?: number
  minAggregateRating?: number
  sortBy?: SortBy
  sortOrder?: 'ASC' | 'DESC'
  pageToken?: string
}

export async function searchTitles(params: SearchParams = {}): Promise<IMDBSearchResponse> {
  const searchParams = new URLSearchParams()
  
  if (params.types?.length) {
    params.types.forEach(type => searchParams.append('types', type))
  }
  if (params.genres?.length) {
    params.genres.forEach(genre => searchParams.append('genres', genre))
  }
  if (params.startYear) searchParams.set('startYear', params.startYear.toString())
  if (params.endYear) searchParams.set('endYear', params.endYear.toString())
  if (params.minAggregateRating) searchParams.set('minAggregateRating', params.minAggregateRating.toString())
  if (params.sortBy) searchParams.set('sortBy', params.sortBy)
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
  if (params.pageToken) searchParams.set('pageToken', params.pageToken)
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
  
  try {
    const response = await fetch(`${IMDB_API_BASE}/titles?${searchParams.toString()}`, {
      signal: controller.signal,
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    clearTimeout(timeoutId)
    if (!response.ok) throw new Error('Failed to fetch titles')
    return response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    // Return empty result instead of throwing
    return { titles: [] }
  }
}

export async function getTitleById(id: string): Promise<IMDBDetailResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)
  
  try {
    const response = await fetch(`${IMDB_API_BASE}/title/${id}`, {
      signal: controller.signal,
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    clearTimeout(timeoutId)
    if (!response.ok) throw new Error('Failed to fetch title')
    return response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

export async function searchByKeyword(keyword: string, limit: number = 20): Promise<IMDBSearchResponse> {
  const params = new URLSearchParams({ query: keyword, limit: limit.toString() })
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)
  
  try {
    const response = await fetch(`${IMDB_API_BASE}/search/titles?${params.toString()}`, {
      signal: controller.signal,
      next: { revalidate: 300 }
    })
    clearTimeout(timeoutId)
    if (!response.ok) throw new Error('Failed to search titles')
    return response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    return { titles: [] }
  }
}

export function formatRuntime(seconds?: number): string {
  if (!seconds) return 'N/A'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function formatType(type: string): string {
  const typeMap: Record<string, string> = {
    movie: 'Movie',
    tvSeries: 'TV Series',
    tvMiniSeries: 'Mini Series',
    tvSpecial: 'TV Special',
    tvMovie: 'TV Movie',
    short: 'Short',
    video: 'Video',
    videoGame: 'Video Game',
  }
  return typeMap[type] || type
}
