'use client'

import { TitleCard } from '@/components/title-card'
import type { IMDBTitle } from '@/lib/imdb'
import { Loader2 } from 'lucide-react'

interface TitleGridProps {
  titles: IMDBTitle[]
  watchlistIds?: Set<string>
  watchedIds?: Set<string>
  userRatings?: Record<string, number | null>
  onAddToWatchlist?: (title: IMDBTitle) => void
  onAddToWatched?: (title: IMDBTitle) => void
  onRemoveFromWatchlist?: (imdbId: string) => void
  onRemoveFromWatched?: (imdbId: string) => void
  onRemove?: (imdbId: string) => void
  onMarkWatched?: (title: IMDBTitle) => void
  loadingId?: string | null
  loading?: boolean
  emptyMessage?: string
  variant?: 'discover' | 'watchlist' | 'watched'
}

export function TitleGrid({
  titles,
  watchlistIds,
  watchedIds,
  userRatings,
  onAddToWatchlist,
  onAddToWatched,
  onRemoveFromWatchlist,
  onRemoveFromWatched,
  onRemove,
  onMarkWatched,
  loadingId,
  loading,
  emptyMessage = 'No titles found',
  variant = 'discover',
}: TitleGridProps) {
  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (titles.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 xs:gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 auto-rows-fr">
      {titles.map((title) => {
        const inWatchlist = watchlistIds?.has(title.id) ?? false
        const isWatched = watchedIds?.has(title.id) ?? variant === 'watched'

        return (
          <TitleCard
            key={title.id}
            title={title}
            inWatchlist={variant === 'watchlist' || inWatchlist}
            isWatched={isWatched}
            userRating={userRatings?.[title.id]}
            onAddToWatchlist={variant === 'discover' ? () => onAddToWatchlist?.(title) : undefined}
            onAddToWatched={variant === 'discover' || variant === 'watchlist' ? () => {
              if (onMarkWatched) {
                onMarkWatched(title)
              } else if (onAddToWatched) {
                onAddToWatched(title)
              }
            } : undefined}
            onRemoveFromWatchlist={variant === 'watchlist' ? () => {
              if (onRemove) {
                onRemove(title.id)
              } else if (onRemoveFromWatchlist) {
                onRemoveFromWatchlist(title.id)
              }
            } : undefined}
            onRemoveFromWatched={variant === 'watched' ? () => {
              if (onRemove) {
                onRemove(title.id)
              } else if (onRemoveFromWatched) {
                onRemoveFromWatched(title.id)
              }
            } : undefined}
            loading={loadingId === title.id}
          />
        )
      })}
    </div>
  )
}
