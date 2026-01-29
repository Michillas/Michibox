import { NextResponse } from 'next/server'
import { searchTitles, searchByKeyword, type SearchParams, type TitleType, type SortBy } from '@/lib/imdb'

export const revalidate = 300 // Cache for 5 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    
    // If there's a search query, use keyword search
    if (query) {
      const type = searchParams.get('type')
      const data = await searchByKeyword(query)
      let results = data.titles || []
      
      // Filter by type if specified
      if (type) {
        results = results.filter(t => t.type === type)
      }
      
      return NextResponse.json({ results })
    }
    
    // Otherwise, use filtered search
    const params: SearchParams = {}
    
    const types = searchParams.getAll('types')
    if (types.length) params.types = types as TitleType[]
    
    const genres = searchParams.getAll('genres')
    if (genres.length) params.genres = genres
    
    const startYear = searchParams.get('startYear')
    if (startYear) params.startYear = parseInt(startYear)
    
    const endYear = searchParams.get('endYear')
    if (endYear) params.endYear = parseInt(endYear)
    
    const minRating = searchParams.get('minAggregateRating')
    if (minRating) params.minAggregateRating = parseFloat(minRating)
    
    const sortBy = searchParams.get('sortBy')
    if (sortBy) params.sortBy = sortBy as SortBy
    
    const sortOrder = searchParams.get('sortOrder')
    if (sortOrder) params.sortOrder = sortOrder as 'ASC' | 'DESC'
    
    const pageToken = searchParams.get('pageToken')
    if (pageToken) params.pageToken = pageToken
    
    const results = await searchTitles(params)
    return NextResponse.json(results)
  } catch (error) {
    console.error('Search failed:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
