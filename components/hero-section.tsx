'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import { Play, Plus, Check, Star, Info, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { IMDBTitle } from '@/lib/imdb'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface HeroSectionProps {
  watchlistIds: Set<string>
  onAddToWatchlist: (title: IMDBTitle) => void
  onAddToWatched: (title: IMDBTitle) => void
  loadingId: string | null
}

export function HeroSection({
  watchlistIds,
  onAddToWatchlist,
  onAddToWatched,
  loadingId,
}: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { data } = useSWR<{ results: IMDBTitle[] }>(
    '/api/discover?category=trending-movies',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
      fallbackData: { results: [] },
    }
  )

  const featured = data?.results?.slice(0, 5) || []
  const current = featured[currentIndex]

  useEffect(() => {
    if (!featured.length) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [featured.length])

  if (!current) {
    return (
      <div className="relative h-[280px] sm:h-[400px] lg:h-[500px] xl:h-[600px] bg-gradient-to-b from-secondary to-background animate-pulse" />
    )
  }

  const isInWatchlist = watchlistIds.has(current.id)
  const isLoading = loadingId === current.id

  return (
    <div className="relative h-[280px] sm:h-[400px] lg:h-[500px] xl:h-[600px] overflow-hidden group">
      {/* Background Image */}
      <div className="absolute inset-0">
        {current.primaryImage?.url && (
          <Image
            src={current.primaryImage.url}
            alt={current.primaryTitle}
            fill
            sizes="100vw"
            className="object-cover object-center opacity-30 sm:opacity-40 scale-105 transition-transform duration-[8000ms] group-hover:scale-100"
            priority
            quality={50}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjAyMDIwIi8+PC9zdmc+"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 sm:via-background/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-end">
        <div className="mx-auto max-w-7xl w-full px-3 sm:px-4 lg:px-6 pb-6 sm:pb-10 lg:pb-16">
          <div className="max-w-3xl space-y-3 sm:space-y-4 lg:space-y-6">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {current.rating && (
              <div className="flex items-center gap-1.5 bg-primary/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-[0_4px_12px_-2px_rgba(0,0,0,0.2)]">
                <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary-foreground fill-primary-foreground" />
                <span className="text-xs sm:text-sm font-semibold text-primary-foreground">
                  {current.rating.aggregateRating.toFixed(1)}
                </span>
              </div>
            )}
            {current.startYear && (
              <span className="text-xs sm:text-sm font-medium text-muted-foreground bg-secondary/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-[0_2px_8px_-2px_rgba(0,0,0,0.15)]">
                {current.startYear}
              </span>
            )}
            {current.genres?.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="text-[10px] sm:text-xs bg-accent/90 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-full text-accent-foreground shadow-[0_2px_8px_-2px_rgba(0,0,0,0.15)]"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
            {current.primaryTitle}
          </h1>

          {/* Plot */}
          {current.plot && (
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground line-clamp-2 sm:line-clamp-3 max-w-2xl">
              {current.plot}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button
              size="lg"
              onClick={() => onAddToWatched(current)}
              disabled={isLoading}
              className="gap-2 text-sm sm:text-base font-semibold shadow-lg shadow-primary/30 rounded-xl w-full sm:w-auto"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : (
                <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
              )}
              Mark as Watched
            </Button>
            <Button
              size="lg"
              variant={isInWatchlist ? "secondary" : "outline"}
              onClick={() => onAddToWatchlist(current)}
              disabled={isLoading || isInWatchlist}
              className="gap-2 text-sm sm:text-base font-semibold rounded-xl bg-background/80 backdrop-blur-sm w-full sm:w-auto"
            >
              {isInWatchlist ? (
                <Check className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
              {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="gap-2 text-sm sm:text-base rounded-xl bg-background/50 backdrop-blur-sm w-full sm:w-auto"
            >
              <Info className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">More Info</span>
              <span className="sm:hidden">Info</span>
            </Button>
          </div>
        </div>
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-3 sm:bottom-4 lg:bottom-6 right-3 sm:right-6 lg:right-8 z-20 flex gap-1.5 sm:gap-2">
        {featured.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "h-1 sm:h-1.5 rounded-full transition-all duration-300",
              index === currentIndex
                ? "w-6 sm:w-8 bg-primary"
                : "w-1 sm:w-1.5 bg-muted-foreground/50 hover:bg-muted-foreground"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows - Hidden on mobile */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length)}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6" />
      </button>
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % featured.length)}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6" />
      </button>
    </div>
  )
}
