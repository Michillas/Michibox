import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Get user_id from profile slug
    const profile = await sql`
      SELECT user_id, is_public FROM user_profiles WHERE slug = ${slug} LIMIT 1
    `

    if (profile.length === 0 || !profile[0].is_public) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const userId = profile[0].user_id

    // Get top series for this user
    const result = await sql`
      SELECT * FROM top_series 
      WHERE user_id = ${userId}
      ORDER BY rank ASC
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching top series:', error)
    return NextResponse.json(
      { error: 'Failed to fetch top series' },
      { status: 500 }
    )
  }
}
