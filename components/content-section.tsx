'use client'

import { useState } from 'react'
import { Film, Tv, ChevronRight, Star, Calendar, Eye, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TitleGrid } from '@/components/title-grid'
import type { IMDBTitle } from '@/lib/imdb'

interface ContentSectionProps {
  title: string
  icon: 'watched' | 'watchlist'
  titles: IMDBTitle[]
  userRatings?: Record<string, number | null>
  onRemove: (id: string) => void
  onMarkWatched?: (title: IMDBTitle) => void
  loading?: boolean
  loadingId?: string | null
}

export function ContentSection({
  title,
  icon,
  titles = [],
  userRatings,
  onRemove,
  onMarkWatched,
  loading,
  loadingId,
}: ContentSectionProps) {
  const [showAll, setShowAll] = useState(false)
  const displayTitles = showAll ? titles : titles.slice(0, 6)
  const hasMore = titles.length > 6

  const Icon = icon === 'watched' ? Eye : List

  return (
    <div className="bg-card rounded-2xl border-0 shadow-sm p-4 sm:p-6 w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-md ${
            icon === 'watched' 
              ? 'bg-gradient-to-br from-primary to-primary/80' 
              : 'bg-gradient-to-br from-secondary to-secondary/80'
          }`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 ${icon === 'watched' ? 'text-primary-foreground' : 'text-secondary-foreground'}" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">{title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {titles.length} {titles.length === 1 ? 'title' : 'titles'}
            </p>
          </div>
        </div>

        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="gap-1 text-foreground hover:text-foreground font-medium rounded-xl self-start sm:self-auto"
          >
            {showAll ? 'Show Less' : 'View All'}
            <ChevronRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-90' : ''}`} />
          </Button>
        )}
      </div>

      {titles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-muted-foreground">
          <Icon className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 opacity-30" />
          <p className="font-semibold text-sm sm:text-base">No titles yet</p>
          <p className="text-xs sm:text-sm mt-1 text-center px-4">
            {icon === 'watched' ? 'Mark titles as watched to see them here' : 'Add titles to your watchlist'}
          </p>
        </div>
      ) : (
        <TitleGrid
          titles={displayTitles}
          variant={icon === 'watched' ? 'watched' : 'watchlist'}
          userRatings={userRatings}
          onRemove={onRemove}
          onMarkWatched={onMarkWatched}
          loading={loading}
          loadingId={loadingId}
        />
      )}
    </div>
  )
}
