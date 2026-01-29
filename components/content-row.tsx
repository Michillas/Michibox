'use client'

import { useRef, useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import { ChevronLeft, ChevronRight, Loader2, Plus, Check, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { IMDBTitle } from '@/lib/imdb'

const fetcher = (url: string) => fetch(url).then(r => r.json())

// Throttle function for scroll events
function throttle<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout | null = null
  let lastRan = 0
  return ((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastRan >= delay) {
      func(...args)
      lastRan = now
    } else {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        func(...args)
        lastRan = Date.now()
      }, delay - (now - lastRan))
    }
  }) as T
}

interface ContentRowProps {
  title: string
  category: string
  watchlistIds: Set<string>
  watchedIds: Set<string>
  onAddToWatchlist: (title: IMDBTitle) => void
  onAddToWatched: (title: IMDBTitle) => void
  loadingId: string | null
}

export function ContentRow({
  title,
  category,
  watchlistIds,
  watchedIds,
  onAddToWatchlist,
  onAddToWatched,
  loadingId,
}: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const { data, isLoading } = useSWR<{ results: IMDBTitle[] }>(
    `/api/discover?category=${category}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutes
      fallbackData: { results: [] }, // Prevent undefined errors
    }
  )

  const titles = data?.results || []

  const updateScrollButtons = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }, [])

  const throttledUpdateScrollButtons = useMemo(
    () => throttle(updateScrollButtons, 100),
    [updateScrollButtons]
  )

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = scrollRef.current.clientWidth * 0.8
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground px-1">{title}</h2>
        <div className="flex items-center justify-center py-8 sm:py-12">
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!titles.length) return null

  return (
    <div className="space-y-3 sm:space-y-4 content-row">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground px-1">{title}</h2>
      <div className="group relative gpu-accelerate">
        {/* Scroll Buttons */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-background/80 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100',
            !canScrollLeft && 'hidden'
          )}
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-background/80 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100',
            !canScrollRight && 'hidden'
          )}
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide smooth-scroll pb-2"
          onScroll={throttledUpdateScrollButtons}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {titles.map((item) => {
            const isInWatchlist = watchlistIds.has(item.id)
            const isWatched = watchedIds.has(item.id)
            const isLoading = loadingId === item.id

            return (
              <div
                key={item.id}
                className="group/card relative flex-shrink-0 w-32 sm:w-36 lg:w-40 gpu-accelerate manga-texture"
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-muted shadow-[0_4px_12px_-4px_rgba(0,0,0,0.12)] group-hover/card:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.18)] transition-all duration-300">
                  {item.primaryImage?.url ? (
                    <Image
                      src={item.primaryImage.url}
                      alt={item.primaryTitle}
                      fill
                      sizes="(max-width: 640px) 128px, (max-width: 1024px) 144px, 160px"
                      className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                      loading="lazy"
                      quality={40}
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjAyMDIwIi8+PC9zdmc+"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-secondary">
                      <span className="text-3xl text-muted-foreground">?</span>
                    </div>
                  )}

                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    {/* Rating Badge */}
                    {item.rating && (
                      <div className="absolute top-2 right-2 bg-primary/95 text-primary-foreground text-xs font-medium px-2 py-1 rounded-full shadow-[0_2px_6px_-1px_rgba(0,0,0,0.2)] backdrop-blur-sm">
                        ★ {item.rating.aggregateRating.toFixed(1)}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={isInWatchlist ? 'secondary' : 'default'}
                        className="flex-1 h-8 text-xs border-0 rounded-xl shadow-[0_2px_6px_-2px_rgba(0,0,0,0.15)] hover:shadow-[0_3px_8px_-2px_rgba(0,0,0,0.2)] transition-all"
                        onClick={() => onAddToWatchlist(item)}
                        disabled={isLoading || isInWatchlist}
                      >
                        {isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : isInWatchlist ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Plus className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant={isWatched ? 'secondary' : 'outline'}
                        className="flex-1 h-8 text-xs bg-background/80 backdrop-blur-sm border-0 rounded-xl shadow-[0_2px_6px_-2px_rgba(0,0,0,0.15)] hover:shadow-[0_3px_8px_-2px_rgba(0,0,0,0.2)] transition-all"
                        onClick={() => onAddToWatched(item)}
                        disabled={isLoading || isWatched}
                      >
                        {isWatched ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Status Badges */}
                  {(isWatched || isInWatchlist) && (
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {isWatched && (
                        <div className="bg-primary/95 text-primary-foreground text-xs font-medium px-2 py-1 rounded-full shadow-[0_2px_6px_-1px_rgba(0,0,0,0.2)] backdrop-blur-sm">
                          ✓ Watched
                        </div>
                      )}
                      {isInWatchlist && !isWatched && (
                        <div className="bg-secondary/95 text-secondary-foreground text-xs font-medium px-2 py-1 rounded-full shadow-[0_2px_6px_-1px_rgba(0,0,0,0.2)] backdrop-blur-sm">
                          ⏱ Listed
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Title Info */}
                <div className="mt-2">
                  <h3 className="text-xs sm:text-sm font-medium text-foreground line-clamp-2">
                    {item.primaryTitle}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                    {item.startYear}
                    {item.genres?.length && ` \u2022 ${item.genres[0]}`}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
