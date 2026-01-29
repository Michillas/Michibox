'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { IMDBTitle } from '@/lib/imdb'

interface MarkWatchedDialogProps {
  title: IMDBTitle | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (rating: number | null) => void
  loading?: boolean
}

export function MarkWatchedDialog({
  title,
  open,
  onOpenChange,
  onConfirm,
  loading,
}: MarkWatchedDialogProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)

  const handleConfirm = () => {
    onConfirm(rating)
    setRating(null)
  }

  const displayRating = hoveredRating ?? rating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Mark as Watched</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {title?.primaryTitle ? `Rate "${title.primaryTitle}"` : 'Rate this title'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label className="text-foreground">Your Rating (optional)</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-0.5 transition-transform hover:scale-110"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(null)}
                  onClick={() => setRating(rating === star ? null : star)}
                >
                  <Star
                    className={cn(
                      'h-6 w-6 transition-colors',
                      displayRating && star <= displayRating
                        ? 'fill-accent text-accent'
                        : 'text-muted-foreground'
                    )}
                  />
                </button>
              ))}
              {displayRating && (
                <span className="ml-2 text-lg font-semibold text-accent">{displayRating}/10</span>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border bg-transparent text-foreground">
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading} className="bg-primary text-primary-foreground">
            {loading ? 'Saving...' : 'Mark as Watched'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
