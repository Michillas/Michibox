'use client'

import React from "react"

import { useState } from 'react'
import Image from 'next/image'
import { Search, Star, Plus, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { IMDBTitle } from '@/lib/imdb'

interface AddSeriesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (title: IMDBTitle) => void
  existingIds: string[]
  loading?: boolean
}

export function AddSeriesDialog({ open, onOpenChange, onSelect, existingIds, loading }: AddSeriesDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<IMDBTitle[]>([])
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(query)}&type=tvSeries`)
      const data = await res.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add to Top Titles</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Search for a movie or series to add to your top 5
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            placeholder="Search for a TV series..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
          />
          <Button onClick={handleSearch} disabled={searching}>
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {results.length === 0 && !searching && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Search className="w-12 h-12 mb-4 opacity-50" />
              <p>Search for TV series to add</p>
            </div>
          )}

          <div className="space-y-3">
            {results.map((title) => {
              const isAlreadyAdded = existingIds.includes(title.id)
              return (
                <div
                  key={title.id}
                  className="flex gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50"
                >
                  <div className="relative w-16 h-24 rounded-md overflow-hidden flex-shrink-0">
                    {title.primaryImage?.url ? (
                      <Image
                        src={title.primaryImage.url || "/placeholder.svg"}
                        alt={title.primaryTitle}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-xs text-muted-foreground text-center">{title.primaryTitle}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground line-clamp-1">{title.primaryTitle}</h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      {title.startYear && <span>{title.startYear}</span>}
                      {title.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span>{title.rating.aggregateRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    {title.genres && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {title.genres.join(', ')}
                      </p>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant={isAlreadyAdded ? 'outline' : 'default'}
                    disabled={isAlreadyAdded || loading}
                    onClick={() => onSelect(title)}
                    className="self-center"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isAlreadyAdded ? (
                      'Added'
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
