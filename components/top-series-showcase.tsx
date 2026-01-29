'use client'

import React from "react"

import { useState } from 'react'
import Image from 'next/image'
import { Crown, Star, X, GripVertical, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TopSeriesItem } from '@/lib/db'

interface TopSeriesShowcaseProps {
  series?: TopSeriesItem[]
  onRemove: (imdbId: string) => void
  onReorder: (items: { imdb_id: string; rank: number }[]) => void
  onAddClick?: () => void
  loading?: boolean
  readonly?: boolean
}

export function TopSeriesShowcase({ series = [], onRemove, onReorder, onAddClick, loading, readonly }: TopSeriesShowcaseProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newSeries = [...series]
      const [removed] = newSeries.splice(draggedIndex, 1)
      newSeries.splice(dragOverIndex, 0, removed)
      
      const updatedRanks = newSeries.map((item, index) => ({
        imdb_id: item.imdb_id,
        rank: index + 1,
      }))
      onReorder(updatedRanks)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const emptySlots = 5 - series.length

  return (
    <div className="bg-card rounded-2xl border-0 shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-md">
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Top 5 Series</h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold">My all-time favorites</p>
          </div>
        </div>
        {!readonly && series.length < 5 && onAddClick && (
          <Button onClick={onAddClick} size="sm" className="gap-2 shadow-sm hover:shadow-md active:scale-[0.98] transition-all self-start sm:self-auto">
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Add Series</span>
            <span className="xs:hidden">Add</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {series.map((item, index) => (
          <div
            key={item.imdb_id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "group relative aspect-[2/3] rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-200 shadow-sm hover:shadow-md",
              draggedIndex === index && "opacity-50 scale-95",
              dragOverIndex === index && draggedIndex !== index && "ring-2 ring-primary"
            )}
          >
            {item.poster_url ? (
              <Image
                src={item.poster_url || "/placeholder.svg"}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
              />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center">
                <span className="text-muted-foreground text-xs text-center px-2">{item.title}</span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            
            <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center font-bold text-accent-foreground text-sm shadow-md">
              {index + 1}
            </div>
            
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(item.imdb_id)
                }}
                disabled={loading}
                className="w-7 h-7 rounded-full bg-red-500/90 hover:bg-red-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur flex items-center justify-center cursor-grab">
                <GripVertical className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="font-semibold text-white text-sm line-clamp-2 leading-tight">{item.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                {item.start_year && (
                  <span className="text-xs text-white/70">{item.start_year}</span>
                )}
                {item.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-white/70">{Number(item.rating).toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {Array.from({ length: emptySlots }).map((_, index) => (
          <button
            key={`empty-${index}`}
            onClick={onAddClick}
            className="aspect-[2/3] rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 transition-colors bg-secondary/20"
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">Add #{series.length + index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
