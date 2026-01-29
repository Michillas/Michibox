'use client'

import Image from 'next/image'
import { Star, Plus, Check, Eye, Clock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRuntime, formatType, type IMDBTitle } from '@/lib/imdb'
import { cn } from '@/lib/utils'

interface TitleCardProps {
  title: IMDBTitle
  inWatchlist?: boolean
  isWatched?: boolean
  onAddToWatchlist?: () => void
  onAddToWatched?: () => void
  onRemoveFromWatchlist?: () => void
  onRemoveFromWatched?: () => void
  loading?: boolean
  userRating?: number | null
}

export function TitleCard({
  title,
  inWatchlist,
  isWatched,
  onAddToWatchlist,
  onAddToWatched,
  onRemoveFromWatchlist,
  onRemoveFromWatched,
  loading,
  userRating,
}: TitleCardProps) {
  return (
    <Card className="group overflow-hidden border-2 border-border bg-card transition-all duration-200 shadow-[3px_3px_0_var(--border)] hover:shadow-[5px_5px_0_var(--border)] hover:translate-x-[-2px] hover:translate-y-[-2px] w-full">
      <div className="relative aspect-[2/3] overflow-hidden border-b-2 border-border">
        {title.primaryImage?.url ? (
          <Image
            src={title.primaryImage.url || "/placeholder.svg"}
            alt={title.primaryTitle}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105 grayscale-[30%] group-hover:grayscale-0"
            sizes="(max-width: 640px) 180px, (max-width: 1024px) 240px, 280px"
            loading="lazy"
            quality={45}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjAyMDIwIi8+PC9zdmc+"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <span className="text-muted-foreground font-black text-2xl">?</span>
          </div>
        )}
        
        {/* Hover Overlay - Manga Style */}
        <div className="absolute inset-0 bg-background/95 opacity-0 transition-opacity group-hover:opacity-100 flex flex-col justify-end" />
        
        <div className="absolute bottom-0 left-0 right-0 flex gap-1.5 p-2 opacity-0 transition-opacity group-hover:opacity-100">
          {!isWatched && !inWatchlist && onAddToWatchlist && (
            <Button
              size="sm"
              variant="secondary"
              className="flex-1 text-xs sm:text-sm"
              onClick={onAddToWatchlist}
              disabled={loading}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              <span className="hidden xs:inline">LIST</span>
              <span className="xs:hidden">+</span>
            </Button>
          )}
          {inWatchlist && onRemoveFromWatchlist && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs sm:text-sm"
              onClick={onRemoveFromWatchlist}
              disabled={loading}
            >
              <Trash2 className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden xs:inline">REMOVE</span>
            </Button>
          )}
          {!isWatched && onAddToWatched && (
            <Button
              size="sm"
              variant="default"
              className="flex-1 text-xs sm:text-sm"
              onClick={onAddToWatched}
              disabled={loading}
            >
              <Eye className="mr-1 h-3.5 w-3.5" />
              <span className="hidden xs:inline">WATCHED</span>
              <span className="xs:hidden">✓</span>
            </Button>
          )}
          {isWatched && onRemoveFromWatched && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs sm:text-sm"
              onClick={onRemoveFromWatched}
              disabled={loading}
            >
              <Trash2 className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>REMOVE</span>
            </Button>
          )}
        </div>
        
        {/* Status badges - Manga Style */}
        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          {inWatchlist && (
            <Badge variant="secondary" className="text-[10px] uppercase">
              <Clock className="mr-1 h-3 w-3" />
              <span className="hidden xs:inline">LIST</span>
            </Badge>
          )}
          {isWatched && (
            <Badge className="text-[10px] uppercase">
              <Check className="mr-1 h-3 w-3" />
              <span className="hidden xs:inline">SEEN</span>
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-2.5 sm:p-3">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-xs sm:text-sm font-bold text-foreground leading-tight uppercase tracking-wide" title={title.primaryTitle}>
            {title.primaryTitle}
          </h3>
        </div>
        
        <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground font-medium">
          <span>{title.startYear || 'TBA'}</span>
          <span className="text-border">|</span>
          <span className="uppercase">{formatType(title.type)}</span>
          {title.runtimeSeconds && (
            <>
              <span className="text-border">|</span>
              <span>{formatRuntime(title.runtimeSeconds)}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          {title.rating?.aggregateRating && (
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-foreground text-foreground" />
              <span className="text-xs sm:text-sm font-bold text-foreground">{typeof title.rating.aggregateRating === 'number' ? title.rating.aggregateRating.toFixed(1) : title.rating.aggregateRating}</span>
            </div>
          )}
          {userRating && (
            <div className="flex items-center gap-0.5 sm:gap-1 text-foreground">
              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-foreground" />
              <span className="text-[10px] sm:text-xs font-bold uppercase">You: {userRating}</span>
            </div>
          )}
        </div>
        
        {title.genres && title.genres.length > 0 && (
          <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1">
            {title.genres.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0 uppercase">
                {genre}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
