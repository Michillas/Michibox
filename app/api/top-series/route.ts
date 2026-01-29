import { NextResponse } from 'next/server'
import { getTopSeries, addToTopSeries, removeFromTopSeries, updateTopSeriesRanks } from '@/lib/db'

export async function GET() {
  try {
    const topSeries = await getTopSeries()
    return NextResponse.json(topSeries)
  } catch (error) {
    console.error('Error fetching top series:', error)
    return NextResponse.json({ error: 'Failed to fetch top series' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const item = await addToTopSeries({
      imdb_id: body.imdb_id,
      title: body.title,
      original_title: body.original_title,
      poster_url: body.poster_url,
      start_year: body.start_year,
      end_year: body.end_year,
      genres: body.genres,
      rating: body.rating,
      vote_count: body.vote_count,
      plot: body.plot,
      rank: body.rank,
    })
    return NextResponse.json(item)
  } catch (error) {
    console.error('Error adding to top series:', error)
    const message = error instanceof Error ? error.message : 'Failed to add to top series'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imdbId = searchParams.get('imdbId')
    if (!imdbId) {
      return NextResponse.json({ error: 'Missing imdbId' }, { status: 400 })
    }
    await removeFromTopSeries(imdbId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from top series:', error)
    return NextResponse.json({ error: 'Failed to remove from top series' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    await updateTopSeriesRanks(body.items)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating top series ranks:', error)
    return NextResponse.json({ error: 'Failed to update ranks' }, { status: 500 })
  }
}
