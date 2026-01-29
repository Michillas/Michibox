'use client'

import React from "react"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import useSWR, { mutate } from 'swr'
import { ArrowLeft, Popcorn, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { ProfileHeader } from '@/components/profile-header'
import { TopSeriesShowcase } from '@/components/top-series-showcase'
import { ContentSection } from '@/components/content-section'
import { AddSeriesDialog } from '@/components/add-series-dialog'
import { MarkWatchedDialog } from '@/components/mark-watched-dialog'
import { TitleGrid } from '@/components/title-grid'
import { EmailVerificationStatus } from '@/components/email-verification-status'
import { authClient } from '@/lib/auth/client'
import type { IMDBTitle } from '@/lib/imdb'
import type { WatchlistItem, WatchedItem, TopSeries } from '@/lib/db'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ProfilePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<IMDBTitle[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [addSeriesOpen, setAddSeriesOpen] = useState(false)
  const [watchedDialogTitle, setWatchedDialogTitle] = useState<IMDBTitle | null>(null)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)

  const { data: watchlist } = useSWR<WatchlistItem[]>('/api/watchlist', fetcher)
  const { data: watched } = useSWR<WatchedItem[]>('/api/watched', fetcher)
  const { data: topSeries } = useSWR<TopSeries[]>('/api/top-series', fetcher)
  const { data: stats } = useSWR<{ watchlistCount: number; watchedCount: number; topSeriesCount: number }>('/api/stats', fetcher)

  useEffect(() => {
    loadUser()
    loadUserProfile()
  }, [])

  const loadUser = async () => {
    try {
      const { data } = await authClient.getSession()
      if (data?.user) {
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to load user:', error)
    }
  }

  const loadUserProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const profile = await response.json()
        setUserProfile(profile)
      }
    } catch (error) {
      console.error('Failed to load user profile:', error)
    }
  }

  const watchlistIds = new Set(watchlist?.map(w => w.imdb_id) ?? [])
  const watchedIds = new Set(watched?.map(w => w.imdb_id) ?? [])
  const topSeriesIds = topSeries?.map(t => t.imdb_id) ?? []
  const userRatings: Record<string, number | null> = {}
  watched?.forEach(w => { userRatings[w.imdb_id] = w.user_rating })

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    setShowSearch(true)
    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const addToWatchlist = async (title: IMDBTitle) => {
    setLoadingId(title.id)
    try {
      await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imdb_id: title.id,
          title: title.primaryTitle,
          original_title: title.originalTitle,
          type: title.type,
          poster_url: title.primaryImage?.url,
          start_year: title.startYear,
          end_year: title.endYear,
          runtime_seconds: title.runtimeSeconds,
          genres: title.genres,
          rating: title.rating?.aggregateRating,
          vote_count: title.rating?.voteCount,
          plot: title.plot,
        }),
      })
      mutate('/api/watchlist')
      mutate('/api/stats')
    } finally {
      setLoadingId(null)
    }
  }

  const addToWatched = async (title: IMDBTitle, userRating: number | null = null) => {
    setLoadingId(title.id)
    try {
      await fetch('/api/watched', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imdb_id: title.id,
          title: title.primaryTitle,
          original_title: title.originalTitle,
          type: title.type,
          poster_url: title.primaryImage?.url,
          start_year: title.startYear,
          end_year: title.endYear,
          runtime_seconds: title.runtimeSeconds,
          genres: title.genres,
          rating: title.rating?.aggregateRating,
          vote_count: title.rating?.voteCount,
          plot: title.plot,
          user_rating: userRating,
        }),
      })
      mutate('/api/watched')
      mutate('/api/watchlist')
      mutate('/api/stats')
    } finally {
      setLoadingId(null)
      setWatchedDialogTitle(null)
    }
  }

  const removeFromWatchlist = async (imdbId: string) => {
    setLoadingId(imdbId)
    try {
      await fetch(`/api/watchlist?imdbId=${imdbId}`, { method: 'DELETE' })
      mutate('/api/watchlist')
      mutate('/api/stats')
    } finally {
      setLoadingId(null)
    }
  }

  const removeFromWatched = async (imdbId: string) => {
    setLoadingId(imdbId)
    try {
      await fetch(`/api/watched?imdbId=${imdbId}`, { method: 'DELETE' })
      mutate('/api/watched')
      mutate('/api/stats')
    } finally {
      setLoadingId(null)
    }
  }

  const addToTopSeries = async (title: IMDBTitle) => {
    setLoadingId(title.id)
    try {
      const nextRank = (topSeries?.length ?? 0) + 1
      await fetch('/api/top-series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imdb_id: title.id,
          title: title.primaryTitle,
          original_title: title.originalTitle,
          poster_url: title.primaryImage?.url,
          start_year: title.startYear,
          end_year: title.endYear,
          genres: title.genres,
          rating: title.rating?.aggregateRating,
          vote_count: title.rating?.voteCount,
          plot: title.plot,
          rank: nextRank,
        }),
      })
      mutate('/api/top-series')
      mutate('/api/stats')
      setAddSeriesOpen(false)
    } finally {
      setLoadingId(null)
    }
  }

  const removeFromTopSeries = async (imdbId: string) => {
    setLoadingId(imdbId)
    try {
      await fetch(`/api/top-series?imdbId=${imdbId}`, { method: 'DELETE' })
      mutate('/api/top-series')
      mutate('/api/stats')
    } finally {
      setLoadingId(null)
    }
  }

  const reorderTopSeries = async (items: { imdb_id: string; rank: number }[]) => {
    try {
      await fetch('/api/top-series', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      mutate('/api/top-series')
    } catch (error) {
      console.error('Failed to reorder:', error)
    }
  }

  const handleConfirmWatched = (rating: number | null) => {
    if (watchedDialogTitle) {
      addToWatched(watchedDialogTitle, rating)
    }
  }

  // Convert stored items to IMDBTitle format
  const watchlistTitles: IMDBTitle[] = watchlist?.map(item => ({
    id: item.imdb_id,
    type: item.type,
    primaryTitle: item.title,
    originalTitle: item.original_title ?? item.title,
    primaryImage: item.poster_url ? { url: item.poster_url, width: 300, height: 450 } : undefined,
    startYear: item.start_year ?? undefined,
    endYear: item.end_year ?? undefined,
    runtimeSeconds: item.runtime_seconds ?? undefined,
    rating: item.rating ? { aggregateRating: Number(item.rating), voteCount: item.vote_count ?? 0 } : undefined,
    plot: item.plot ?? undefined,
    genres: item.genres ?? undefined,
  })) ?? []

  const watchedTitles: IMDBTitle[] = watched?.map(item => ({
    id: item.imdb_id,
    type: item.type,
    primaryTitle: item.title,
    originalTitle: item.original_title ?? item.title,
    primaryImage: item.poster_url ? { url: item.poster_url, width: 300, height: 450 } : undefined,
    startYear: item.start_year ?? undefined,
    endYear: item.end_year ?? undefined,
    runtimeSeconds: item.runtime_seconds ?? undefined,
    rating: item.rating ? { aggregateRating: Number(item.rating), voteCount: item.vote_count ?? 0 } : undefined,
    plot: item.plot ?? undefined,
    genres: item.genres ?? undefined,
  })) ?? []

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Manga Window Style */}
      <header className="sticky top-0 z-50 bg-background border-b-3 border-border">
        {/* Window Title Bar */}
        <div className="bg-secondary border-b-2 border-border px-3 sm:px-4 lg:px-6 py-1.5">
          <div className="mx-auto max-w-6xl flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              michibox.exe — マイプロフィール
            </span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 border border-border bg-background flex items-center justify-center text-[10px]">−</div>
              <div className="w-4 h-4 border border-border bg-background flex items-center justify-center text-[10px]">□</div>
              <div className="w-4 h-4 border border-border bg-background flex items-center justify-center text-[10px]">×</div>
            </div>
          </div>
        </div>
        
        {/* Main Header */}
        <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between gap-2 sm:gap-4 h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/">
                <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 p-1.5 sm:p-2 shadow-lg shadow-primary/20">
                  <Popcorn className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg lg:text-xl font-bold text-foreground manga-title">michibox</h1>
                  <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">マイプロフィール</p>
                </div>
              </div>
            </div>

            {/* Search - Hidden on small mobile */}
            <div className="hidden sm:flex gap-2 max-w-md flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="SEARCH TO ADD..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10 h-9"
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching} size="sm">
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'SEARCH'}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="icon" 
                className="sm:hidden h-9 w-9"
                onClick={() => setShowSearch(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Email Verification Status */}
        <div className="mb-4 sm:mb-6">
          <EmailVerificationStatus />
        </div>

        {/* Search Results */}
        {showSearch && (
          <div className="mb-6 sm:mb-8 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Search Results</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{searchResults.length} {searchResults.length === 1 ? 'title' : 'titles'} found</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setShowSearch(false); setSearchResults([]); setSearchQuery('') }}>
                Close
              </Button>
            </div>
            <TitleGrid
              titles={searchResults}
              watchlistIds={watchlistIds}
              watchedIds={watchedIds}
              onAddToWatchlist={addToWatchlist}
              onAddToWatched={(title) => setWatchedDialogTitle(title)}
              onRemoveFromWatchlist={removeFromWatchlist}
              onRemoveFromWatched={removeFromWatched}
              loadingId={loadingId}
              loading={isSearching}
              emptyMessage="No results found. Try a different search."
              variant="discover"
            />
          </div>
        )}

        {/* Profile Section */}
        <div className="space-y-8">
          <ProfileHeader
            watchedCount={stats?.watchedCount ?? 0}
            watchlistCount={stats?.watchlistCount ?? 0}
            topSeriesCount={stats?.topSeriesCount ?? 0}
            userName={user?.name}
            userEmail={user?.email}
            userSlug={userProfile?.slug}
            showSettings={true}
          />

          <TopSeriesShowcase
            series={topSeries ?? []}
            onRemove={removeFromTopSeries}
            onReorder={reorderTopSeries}
            onAddClick={() => setAddSeriesOpen(true)}
            loading={!!loadingId}
          />

          <div className="space-y-6 sm:space-y-8">
            <ContentSection
              title="Watched"
              icon="watched"
              titles={watchedTitles}
              userRatings={userRatings}
              onRemove={removeFromWatched}
              loading={!!loadingId}
              loadingId={loadingId}
            />

            <ContentSection
              title="Watchlist"
              icon="watchlist"
              titles={watchlistTitles}
              onRemove={removeFromWatchlist}
              onMarkWatched={(title) => setWatchedDialogTitle(title)}
              loading={!!loadingId}
              loadingId={loadingId}
            />
          </div>
        </div>
      </main>

      <AddSeriesDialog
        open={addSeriesOpen}
        onOpenChange={setAddSeriesOpen}
        onSelect={addToTopSeries}
        existingIds={topSeriesIds}
        loading={!!loadingId}
      />

      <MarkWatchedDialog
        title={watchedDialogTitle}
        open={!!watchedDialogTitle}
        onOpenChange={(open) => !open && setWatchedDialogTitle(null)}
        onConfirm={handleConfirmWatched}
        loading={!!loadingId}
      />
    </div>
  )
}
