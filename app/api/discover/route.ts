import { NextRequest, NextResponse } from 'next/server'
import { searchTitles, type SortBy, type TitleType } from '@/lib/imdb'

// Enable caching for 5 minutes
export const revalidate = 300

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'trending'
    
    let params: {
      types?: TitleType[]
      sortBy?: SortBy
      sortOrder?: 'ASC' | 'DESC'
      minAggregateRating?: number
      startYear?: number
      endYear?: number
      genres?: string[]
    } = {}
    
    const currentYear = new Date().getFullYear()
    
    switch (category) {
      case 'trending-series':
        params = {
          types: ['TV_SERIES'],
          sortBy: 'SORT_BY_POPULARITY',
          sortOrder: 'ASC',
          startYear: currentYear - 2,
          minAggregateRating: 7,
        }
        break
      case 'trending-movies':
        params = {
          types: ['MOVIE'],
          sortBy: 'SORT_BY_POPULARITY',
          sortOrder: 'ASC',
          startYear: currentYear - 1,
          minAggregateRating: 6,
        }
        break
      case 'top-rated-movies':
        params = {
          types: ['MOVIE'],
          sortBy: 'SORT_BY_USER_RATING',
          sortOrder: 'DESC',
          minAggregateRating: 8,
        }
        break
      case 'top-rated-series':
        params = {
          types: ['TV_SERIES'],
          sortBy: 'SORT_BY_USER_RATING',
          sortOrder: 'DESC',
          minAggregateRating: 8,
        }
        break
      case 'new-releases':
        params = {
          types: ['MOVIE'],
          sortBy: 'SORT_BY_RELEASE_DATE',
          sortOrder: 'DESC',
          startYear: currentYear,
          minAggregateRating: 5,
        }
        break
      case 'classic-movies':
        params = {
          types: ['MOVIE'],
          sortBy: 'SORT_BY_USER_RATING',
          sortOrder: 'DESC',
          endYear: 2000,
          minAggregateRating: 8,
        }
        break
      case 'action':
        params = {
          genres: ['Action'],
          sortBy: 'SORT_BY_POPULARITY',
          sortOrder: 'ASC',
          minAggregateRating: 6,
        }
        break
      case 'comedy':
        params = {
          genres: ['Comedy'],
          sortBy: 'SORT_BY_POPULARITY',
          sortOrder: 'ASC',
          minAggregateRating: 6,
        }
        break
      case 'drama':
        params = {
          genres: ['Drama'],
          sortBy: 'SORT_BY_USER_RATING',
          sortOrder: 'DESC',
          minAggregateRating: 7,
        }
        break
      case 'sci-fi':
        params = {
          genres: ['Sci-Fi'],
          sortBy: 'SORT_BY_USER_RATING',
          sortOrder: 'DESC',
          minAggregateRating: 7,
        }
        break
      default:
        params = {
          sortBy: 'SORT_BY_POPULARITY',
          sortOrder: 'ASC',
          minAggregateRating: 7,
        }
    }
    
    const data = await searchTitles(params)
    return NextResponse.json({ results: data.titles?.slice(0, 12) || [] })
  } catch (error) {
    console.error('Discover API error:', error)
    // Return empty results instead of error to prevent UI breaking
    return NextResponse.json({ results: [] })
  }
}
