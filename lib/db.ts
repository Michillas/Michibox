import { neon } from '@neondatabase/serverless'
import { neonAuth } from '@neondatabase/auth/next/server'

const sql = neon(process.env.DATABASE_URL!)

export interface WatchlistItem {
  id: number
  user_id: string // UUID
  imdb_id: string
  title: string
  original_title: string | null
  type: string
  poster_url: string | null
  start_year: number | null
  end_year: number | null
  runtime_seconds: number | null
  genres: string[] | null
  rating: number | null
  vote_count: number | null
  plot: string | null
  added_at: string
}

export interface WatchedItem extends WatchlistItem {
  watched_at: string
  user_rating: number | null
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const { user } = await neonAuth()
  if (!user) return []
  
  const result = await sql`
    SELECT * FROM watchlist WHERE user_id = ${user.id} ORDER BY added_at DESC
  `
  return result as WatchlistItem[]
}

export async function getWatched(): Promise<WatchedItem[]> {
  const { user } = await neonAuth()
  if (!user) return []
  
  const result = await sql`
    SELECT * FROM watched WHERE user_id = ${user.id} ORDER BY watched_at DESC
  `
  return result as WatchedItem[]
}

export async function addToWatchlist(item: Omit<WatchlistItem, 'id' | 'added_at' | 'user_id'>): Promise<WatchlistItem> {
  const { user } = await neonAuth()
  if (!user) throw new Error('Not authenticated')
  
  const [result] = await sql`
    INSERT INTO watchlist (user_id, imdb_id, title, original_title, type, poster_url, start_year, end_year, runtime_seconds, genres, rating, vote_count, plot)
    VALUES (${user.id}, ${item.imdb_id}, ${item.title}, ${item.original_title}, ${item.type}, ${item.poster_url}, ${item.start_year}, ${item.end_year}, ${item.runtime_seconds}, ${item.genres}, ${item.rating}, ${item.vote_count}, ${item.plot})
    RETURNING *
  `
  return result as WatchlistItem
}

export async function removeFromWatchlist(imdbId: string): Promise<void> {
  const { user } = await neonAuth()
  if (!user) throw new Error('Not authenticated')
  
  await sql`
    DELETE FROM watchlist WHERE user_id = ${user.id} AND imdb_id = ${imdbId}
  `
}

export async function isInWatchlist(imdbId: string): Promise<boolean> {
  const { user } = await neonAuth()
  if (!user) return false
  
  const [result] = await sql`
    SELECT 1 FROM watchlist WHERE user_id = ${user.id} AND imdb_id = ${imdbId}
  `
  return !!result
}

export async function addToWatched(item: Omit<WatchedItem, 'id' | 'watched_at' | 'added_at' | 'user_id'>): Promise<WatchedItem> {
  const { user } = await neonAuth()
  if (!user) throw new Error('Not authenticated')
  
  const [result] = await sql`
    INSERT INTO watched (user_id, imdb_id, title, original_title, type, poster_url, start_year, end_year, runtime_seconds, genres, rating, vote_count, plot, user_rating)
    VALUES (${user.id}, ${item.imdb_id}, ${item.title}, ${item.original_title}, ${item.type}, ${item.poster_url}, ${item.start_year}, ${item.end_year}, ${item.runtime_seconds}, ${item.genres}, ${item.rating}, ${item.vote_count}, ${item.plot}, ${item.user_rating})
    RETURNING *
  `
  return result as WatchedItem
}

export async function removeFromWatched(imdbId: string): Promise<void> {
  const { user } = await neonAuth()
  if (!user) throw new Error('Not authenticated')
  
  await sql`
    DELETE FROM watched WHERE user_id = ${user.id} AND imdb_id = ${imdbId}
  `
}

export async function isWatched(imdbId: string): Promise<boolean> {
  const { user } = await neonAuth()
  if (!user) return false
  
  const [result] = await sql`
    SELECT 1 FROM watched WHERE user_id = ${user.id} AND imdb_id = ${imdbId}
  `
  return !!result
}

export interface TopSeries {
  id: number
  user_id: string // UUID
  imdb_id: string
  title: string
  original_title: string | null
  poster_url: string | null
  start_year: number | null
  end_year: number | null
  genres: string[] | null
  rating: number | null
  vote_count: number | null
  plot: string | null
  rank: number
  added_at: string
}

export async function getTopSeries(): Promise<TopSeries[]> {
  const { user } = await neonAuth()
  if (!user) return []
  
  const result = await sql`
    SELECT * FROM top_series WHERE user_id = ${user.id} ORDER BY rank ASC
  `
  return result as TopSeries[]
}

export async function addToTopSeries(item: Omit<TopSeries, 'id' | 'added_at' | 'user_id'>): Promise<TopSeries> {
  const { user } = await neonAuth()
  if (!user) throw new Error('Not authenticated')
  
  const [result] = await sql`
    INSERT INTO top_series (user_id, imdb_id, title, original_title, poster_url, start_year, end_year, genres, rating, vote_count, plot, rank)
    VALUES (${user.id}, ${item.imdb_id}, ${item.title}, ${item.original_title}, ${item.poster_url}, ${item.start_year}, ${item.end_year}, ${item.genres}, ${item.rating}, ${item.vote_count}, ${item.plot}, ${item.rank})
    RETURNING *
  `
  return result as TopSeries
}

export async function removeFromTopSeries(imdbId: string): Promise<void> {
  const { user } = await neonAuth()
  if (!user) throw new Error('Not authenticated')
  
  await sql`
    DELETE FROM top_series WHERE user_id = ${user.id} AND imdb_id = ${imdbId}
  `
}

export async function updateTopSeriesRanks(updates: Array<{ imdb_id: string; rank: number }>): Promise<void> {
  const { user } = await neonAuth()
  if (!user) throw new Error('Not authenticated')
  
  for (const { imdb_id, rank } of updates) {
    await sql`
      UPDATE top_series 
      SET rank = ${rank} 
      WHERE user_id = ${user.id} AND imdb_id = ${imdb_id}
    `
  }
}

export async function isInTopSeries(imdbId: string): Promise<boolean> {
  const { user } = await neonAuth()
  if (!user) return false
  
  const [result] = await sql`
    SELECT 1 FROM top_series WHERE user_id = ${user.id} AND imdb_id = ${imdbId}
  `
  return !!result
}

// Statistics
export async function getStats() {
  const { user } = await neonAuth()
  if (!user) {
    return {
      watchedCount: 0,
      watchlistCount: 0,
      topSeriesCount: 0,
      averageRating: 0,
      genreDistribution: {},
      yearDistribution: {}
    }
  }
  
  const userId = user.id
  
  const [watchedCount] = await sql`
    SELECT COUNT(*) as count FROM watched WHERE user_id = ${userId}
  `
  const [watchlistCount] = await sql`
    SELECT COUNT(*) as count FROM watchlist WHERE user_id = ${userId}
  `
  const [topSeriesCount] = await sql`
    SELECT COUNT(*) as count FROM top_series WHERE user_id = ${userId}
  `
  const [avgRating] = await sql`
    SELECT AVG(user_rating) as avg FROM watched WHERE user_id = ${userId} AND user_rating IS NOT NULL
  `
  
  return {
    watchedCount: Number(watchedCount.count),
    watchlistCount: Number(watchlistCount.count),
    topSeriesCount: Number(topSeriesCount.count),
    averageRating: Number(avgRating.avg) || 0,
    genreDistribution: {},
    yearDistribution: {}
  }
}
