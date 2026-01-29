import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { neonAuth } from '@neondatabase/auth/next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const { user } = await neonAuth()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    // Check if user already has a profile
    const existingProfile = await sql`
      SELECT * FROM user_profiles WHERE user_id = ${userId} LIMIT 1
    `

    if (existingProfile.length > 0) {
      return NextResponse.json(existingProfile[0])
    }

    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await neonAuth()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const body = await request.json()
    const { username, slug, display_name, bio, avatar_url, is_public } = body

    // Validate slug format (lowercase alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      )
    }

    // Check if username or slug already exists
    const existingProfile = await sql`
      SELECT * FROM user_profiles WHERE username = ${username} OR slug = ${slug}
    `

    if (existingProfile.length > 0) {
      return NextResponse.json(
        { error: 'Username or slug already taken' },
        { status: 409 }
      )
    }

    // Create profile
    const result = await sql`
      INSERT INTO user_profiles (user_id, username, slug, display_name, bio, avatar_url, is_public)
      VALUES (${userId}, ${username}, ${slug}, ${display_name || null}, ${bio || null}, ${avatar_url || null}, ${is_public ?? true})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error creating user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { user } = await neonAuth()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const body = await request.json()
    const { display_name, bio, avatar_url, is_public } = body

    // Update profile (username and slug cannot be changed)
    const result = await sql`
      UPDATE user_profiles 
      SET display_name = ${display_name || null}, bio = ${bio || null}, avatar_url = ${avatar_url || null}, is_public = ${is_public ?? true}, updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
