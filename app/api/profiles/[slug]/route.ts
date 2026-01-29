import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Get profile by slug
    const profile = await sql`
      SELECT id, user_id, username, slug, display_name, bio, avatar_url, is_public
      FROM user_profiles
      WHERE slug = ${slug}
      LIMIT 1
    `

    if (profile.length === 0) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const profileData = profile[0]

    if (!profileData.is_public) {
      return NextResponse.json(
        { error: 'Profile is private' },
        { status: 403 }
      )
    }

    return NextResponse.json(profileData)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
