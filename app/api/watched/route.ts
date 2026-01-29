import { NextResponse } from 'next/server'
import { getWatched, addToWatched, removeFromWatched, isInWatchlist, removeFromWatchlist } from '@/lib/db'

export const revalidate = 0 // Don't cache user data

export async function GET() {
  try {
    const watched = await getWatched()
    return NextResponse.json(watched)
  } catch (error) {
    console.error('Failed to get watched:', error)
    return NextResponse.json([], { status: 200 }) // Return empty array instead of error
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // If moving from watchlist
    if (body.fromWatchlist && body.imdb_id) {
      const inWatchlist = await isInWatchlist(body.imdb_id)
      if (!inWatchlist) {
        return NextResponse.json({ error: 'Item not found in watchlist' }, { status: 404 })
      }
      await removeFromWatchlist(body.imdb_id)
    }
    
    // Direct add to watched
    const item = await addToWatched({
      imdb_id: body.imdb_id,
      title: body.title,
      original_title: body.original_title,
      type: body.type,
      poster_url: body.poster_url,
      start_year: body.start_year,
      end_year: body.end_year,
      runtime_seconds: body.runtime_seconds,
      genres: body.genres,
      rating: body.rating,
      vote_count: body.vote_count,
      plot: body.plot,
      user_rating: body.user_rating,
    })
    return NextResponse.json(item)
  } catch (error) {
    console.error('Failed to add to watched:', error)
    return NextResponse.json({ error: 'Failed to add to watched' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imdbId = searchParams.get('imdbId')
    if (!imdbId) {
      return NextResponse.json({ error: 'imdbId is required' }, { status: 400 })
    }
    await removeFromWatched(imdbId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove from watched:', error)
    return NextResponse.json({ error: 'Failed to remove from watched' }, { status: 500 })
  }
}
