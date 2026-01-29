'use client'

import React from "react"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR, { mutate } from 'swr'
import { Search, User, Loader2, Popcorn, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserButton } from '@/components/user-button-wrapper'
import { HeroSection } from '@/components/hero-section'
import { ContentRow } from '@/components/content-row'
import { TitleGrid } from '@/components/title-grid'
import { MarkWatchedDialog } from '@/components/mark-watched-dialog'
import { authClient } from '@/lib/auth/client'
import type { IMDBTitle } from '@/lib/imdb'
import type { WatchlistItem, WatchedItem } from '@/lib/db'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<IMDBTitle[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [watchedDialogTitle, setWatchedDialogTitle] = useState<IMDBTitle | null>(null)
  const router = useRouter()

  const session = authClient.useSession()

  const { data: watchlist } = useSWR<WatchlistItem[]>('/api/watchlist', fetcher, {
    revalidateOnFocus: false,
    fallbackData: [],
  })
  const { data: watched } = useSWR<WatchedItem[]>('/api/watched', fetcher, {
    revalidateOnFocus: false,
    fallbackData: [],
  })

  const watchlistIds = new Set(watchlist?.map(w => w.imdb_id) ?? [])
  const watchedIds = new Set(watched?.map(w => w.imdb_id) ?? [])

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

  const handleConfirmWatched = (rating: number | null) => {
    if (watchedDialogTitle) {
      addToWatched(watchedDialogTitle, rating)
    }
  }

  const handleLogout = async () => {
    await authClient.signOut()
    router.push('/auth/sign-in')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.1)]">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between gap-2 sm:gap-4 h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-1.5 sm:p-2 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.15)]">
                <Popcorn className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold text-foreground leading-none manga-title">michibox</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">手描きスタイル</span>
              </div>
            </Link>

            {/* Search - Hidden on mobile, shown as icon */}
            <div className="hidden md:flex flex-1 max-w-md lg:max-w-xl">
              <div className="relative flex gap-2 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search movies, series..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10 h-9 bg-secondary/30 border-0 hover:bg-secondary/50 transition-colors text-foreground placeholder:text-muted-foreground rounded-2xl shadow-[inset_0_2px_6px_-2px_rgba(0,0,0,0.1)]"
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching} size="sm" className="rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.15)]">
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                </Button>
              </div>
            </div>

            {/* Mobile Search + Theme + Profile */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden rounded-2xl h-9 w-9 hover:shadow-[0_2px_6px_-2px_rgba(0,0,0,0.1)]"
                onClick={() => setShowSearch(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
              <ThemeToggle />
              <UserButton size="icon" />
            </div>
          </div>
        </div>
      </header>

      {/* Search Results Overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-40 bg-background/98 backdrop-blur-xl pt-14 sm:pt-16 overflow-auto manga-grain">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
            {/* Mobile Search Bar */}
            <div className="md:hidden mb-4 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search movies, series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="pl-10 h-11 bg-secondary/30 border-0 rounded-2xl shadow-[inset_0_2px_6px_-2px_rgba(0,0,0,0.1)]"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Search Results</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {searchResults.length} {searchResults.length === 1 ? 'title' : 'titles'} found{searchQuery && ` for "${searchQuery}"`}
                </p>
              </div>
              <Button variant="outline" size="sm" className="rounded-2xl shadow-[0_2px_6px_-2px_rgba(0,0,0,0.1)]" onClick={() => { setShowSearch(false); setSearchResults([]); setSearchQuery('') }}>
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
        </div>
      )}

      {/* Hero Section */}
      <div className="mt-14 sm:mt-16">
        <HeroSection
          watchlistIds={watchlistIds}
          onAddToWatchlist={addToWatchlist}
          onAddToWatched={(title) => setWatchedDialogTitle(title)}
          loadingId={loadingId}
        />
      </div>

      {/* Content Sections */}
      <main className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12 space-y-8 sm:space-y-10 lg:space-y-12">
        <ContentRow
          title="Trending TV Series"
          category="trending-series"
          watchlistIds={watchlistIds}
          watchedIds={watchedIds}
          onAddToWatchlist={addToWatchlist}
          onAddToWatched={(title) => setWatchedDialogTitle(title)}
          loadingId={loadingId}
        />

        <ContentRow
          title="Top Rated Movies"
          category="top-rated-movies"
          watchlistIds={watchlistIds}
          watchedIds={watchedIds}
          onAddToWatchlist={addToWatchlist}
          onAddToWatched={(title) => setWatchedDialogTitle(title)}
          loadingId={loadingId}
        />

        <ContentRow
          title="Top Rated Series"
          category="top-rated-series"
          watchlistIds={watchlistIds}
          watchedIds={watchedIds}
          onAddToWatchlist={addToWatchlist}
          onAddToWatched={(title) => setWatchedDialogTitle(title)}
          loadingId={loadingId}
        />

        <ContentRow
          title="New Releases"
          category="new-releases"
          watchlistIds={watchlistIds}
          watchedIds={watchedIds}
          onAddToWatchlist={addToWatchlist}
          onAddToWatched={(title) => setWatchedDialogTitle(title)}
          loadingId={loadingId}
        />

        <ContentRow
          title="Classic Movies"
          category="classic-movies"
          watchlistIds={watchlistIds}
          watchedIds={watchedIds}
          onAddToWatchlist={addToWatchlist}
          onAddToWatched={(title) => setWatchedDialogTitle(title)}
          loadingId={loadingId}
        />

        <ContentRow
          title="Action & Adventure"
          category="action"
          watchlistIds={watchlistIds}
          watchedIds={watchedIds}
          onAddToWatchlist={addToWatchlist}
          onAddToWatched={(title) => setWatchedDialogTitle(title)}
          loadingId={loadingId}
        />

        <ContentRow
          title="Sci-Fi"
          category="sci-fi"
          watchlistIds={watchlistIds}
          watchedIds={watchedIds}
          onAddToWatchlist={addToWatchlist}
          onAddToWatched={(title) => setWatchedDialogTitle(title)}
          loadingId={loadingId}
        />

        <ContentRow
          title="Drama"
          category="drama"
          watchlistIds={watchlistIds}
          watchedIds={watchedIds}
          onAddToWatchlist={addToWatchlist}
          onAddToWatched={(title) => setWatchedDialogTitle(title)}
          loadingId={loadingId}
        />

        <ContentRow
          title="Comedy"
          category="comedy"
          watchlistIds={watchlistIds}
          watchedIds={watchedIds}
          onAddToWatchlist={addToWatchlist}
          onAddToWatched={(title) => setWatchedDialogTitle(title)}
          loadingId={loadingId}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-secondary/30 mt-12 sm:mt-16">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 p-2 shadow-lg shadow-primary/20">
                  <Popcorn className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <span className="text-lg font-bold text-foreground block">Michibox</span>
                  <span className="text-xs text-muted-foreground">Your Personal Series and Movies Box</span>
                </div>
              </div>
              <Link href="/profile" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="gap-2 rounded-xl w-full sm:w-auto">
                  <User className="h-4 w-4" />
                  View Profile
                </Button>
              </Link>
            </div>
            <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Track your favorite movies and TV shows. Data provided by IMDB.
              </p>
              <p className="text-xs text-muted-foreground">
                © 2026 Michibox. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

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
