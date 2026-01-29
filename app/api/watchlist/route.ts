import { NextResponse } from 'next/server'
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '@/lib/db'

export const revalidate = 0 // Don't cache user data

export async function GET() {
  try {
    const watchlist = await getWatchlist()
    return NextResponse.json(watchlist)
  } catch (error) {
    console.error('Failed to get watchlist:', error)
    return NextResponse.json([], { status: 200 }) // Return empty array instead of error
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const item = await addToWatchlist({
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
    })
    return NextResponse.json(item)
  } catch (error) {
    console.error('Failed to add to watchlist:', error)
    return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imdbId = searchParams.get('imdbId')
    if (!imdbId) {
      return NextResponse.json({ error: 'imdbId is required' }, { status: 400 })
    }
    await removeFromWatchlist(imdbId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove from watchlist:', error)
    return NextResponse.json({ error: 'Failed to remove from watchlist' }, { status: 500 })
  }
}
