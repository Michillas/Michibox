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
    <Card className="group overflow-hidden border-0 bg-card transition-all duration-200 shadow-sm hover:shadow-md rounded-2xl w-full">
      <div className="relative aspect-[2/3] overflow-hidden">
        {title.primaryImage?.url ? (
          <Image
            src={title.primaryImage.url || "/placeholder.svg"}
            alt={title.primaryTitle}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 180px, (max-width: 1024px) 240px, 280px"
            loading="lazy"
            quality={45}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjAyMDIwIi8+PC9zdmc+"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <span className="text-muted-foreground">No Image</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        
        <div className="absolute bottom-0 left-0 right-0 flex gap-1.5 p-2 opacity-0 transition-opacity group-hover:opacity-100">
          {!isWatched && !inWatchlist && onAddToWatchlist && (
            <Button
              size="sm"
              variant="secondary"
              className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground backdrop-blur-sm border-0 font-medium transition-all rounded-xl text-xs sm:text-sm"
              onClick={onAddToWatchlist}
              disabled={loading}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              <span className="hidden xs:inline">Watchlist</span>
              <span className="xs:hidden">+</span>
            </Button>
          )}
          {inWatchlist && onRemoveFromWatchlist && (
            <Button
              size="sm"
              variant="destructive"
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground border-0 font-medium transition-all rounded-xl text-xs sm:text-sm"
              onClick={onRemoveFromWatchlist}
              disabled={loading}
            >
              <Trash2 className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden xs:inline">Remove</span>
            </Button>
          )}
          {!isWatched && onAddToWatched && (
            <Button
              size="sm"
              variant="default"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground border-0 font-medium transition-all rounded-xl text-xs sm:text-sm"
              onClick={onAddToWatched}
              disabled={loading}
            >
              <Eye className="mr-1 h-3.5 w-3.5" />
              <span className="hidden xs:inline">Watched</span>
              <span className="xs:hidden">✓</span>
            </Button>
          )}
          {isWatched && onRemoveFromWatched && (
            <Button
              size="sm"
              variant="destructive"
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground border-0 font-medium transition-all rounded-xl text-xs sm:text-sm"
              onClick={onRemoveFromWatched}
              disabled={loading}
            >
              <Trash2 className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Remove</span>
            </Button>
          )}
        </div>
        
        {/* Status badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          {inWatchlist && (
            <Badge variant="secondary" className="bg-secondary/95 text-secondary-foreground backdrop-blur-sm border-0 font-medium rounded-full px-2 py-0.5 shadow-sm">
              <Clock className="mr-1 h-3 w-3" />
              <span className="hidden xs:inline text-xs">Watchlist</span>
            </Badge>
          )}
          {isWatched && (
            <Badge className="bg-primary/95 text-primary-foreground backdrop-blur-sm border-0 font-medium rounded-full px-2 py-0.5 shadow-sm">
              <Check className="mr-1 h-3 w-3" />
              <span className="hidden xs:inline text-xs">Watched</span>
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-2.5 sm:p-3">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-xs sm:text-sm font-semibold text-foreground leading-tight" title={title.primaryTitle}>
            {title.primaryTitle}
          </h3>
        </div>
        
        <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
          <span>{title.startYear || 'TBA'}</span>
          <span className="text-border">|</span>
          <span>{formatType(title.type)}</span>
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
              <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-accent text-accent" />
              <span className="text-xs sm:text-sm font-medium text-foreground">{typeof title.rating.aggregateRating === 'number' ? title.rating.aggregateRating.toFixed(1) : title.rating.aggregateRating}</span>
            </div>
          )}
          {userRating && (
            <div className="flex items-center gap-0.5 sm:gap-1 text-primary">
              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-primary" />
              <span className="text-[10px] sm:text-xs font-medium">Your: {userRating}</span>
            </div>
          )}
        </div>
        
        {title.genres && title.genres.length > 0 && (
          <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1">
            {title.genres.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="outline" className="text-[10px] sm:text-xs border-border text-muted-foreground px-1.5 py-0">
                {genre}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
