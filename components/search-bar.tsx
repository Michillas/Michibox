'use client'

import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { TitleType, SortBy } from '@/lib/imdb'

interface SearchBarProps {
  query: string
  onQueryChange: (query: string) => void
  selectedType: TitleType | 'ALL'
  onTypeChange: (type: TitleType | 'ALL') => void
  sortBy: SortBy
  onSortChange: (sort: SortBy) => void
  minRating: number | null
  onMinRatingChange: (rating: number | null) => void
  onSearch: () => void
}

const TYPE_OPTIONS: Array<{ value: TitleType | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All Types' },
  { value: 'MOVIE', label: 'Movies' },
  { value: 'TV_SERIES', label: 'TV Series' },
  { value: 'TV_MINI_SERIES', label: 'Mini Series' },
  { value: 'TV_MOVIE', label: 'TV Movies' },
]

const SORT_OPTIONS: Array<{ value: SortBy; label: string }> = [
  { value: 'SORT_BY_POPULARITY', label: 'Most Popular' },
  { value: 'SORT_BY_USER_RATING', label: 'Highest Rated' },
  { value: 'SORT_BY_RELEASE_DATE', label: 'Release Date' },
  { value: 'SORT_BY_YEAR', label: 'Year' },
]

const RATING_OPTIONS = [
  { value: null, label: 'Any Rating' },
  { value: 6, label: '6+' },
  { value: 7, label: '7+' },
  { value: 8, label: '8+' },
  { value: 9, label: '9+' },
]

export function SearchBar({
  query,
  onQueryChange,
  selectedType,
  onTypeChange,
  sortBy,
  onSortChange,
  minRating,
  onMinRatingChange,
  onSearch,
}: SearchBarProps) {
  const hasFilters = selectedType !== 'ALL' || sortBy !== 'SORT_BY_POPULARITY' || minRating !== null

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search movies & TV shows..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          className="bg-input pl-10 text-foreground placeholder:text-muted-foreground"
        />
      </div>
      
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative border-border bg-transparent text-foreground">
              <Filter className="h-4 w-4" />
              {hasFilters && (
                <span className="absolute -right-1 -top-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-popover text-popover-foreground border-border" align="end">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none text-foreground">Filters</h4>
                <p className="text-sm text-muted-foreground">Refine your search results</p>
              </div>
              
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="type" className="text-foreground">Type</Label>
                  <Select value={selectedType} onValueChange={(v) => onTypeChange(v as TitleType | 'ALL')}>
                    <SelectTrigger id="type" className="bg-input text-foreground border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground border-border">
                      {TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-1.5">
                  <Label htmlFor="sort" className="text-foreground">Sort By</Label>
                  <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortBy)}>
                    <SelectTrigger id="sort" className="bg-input text-foreground border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground border-border">
                      {SORT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-1.5">
                  <Label htmlFor="rating" className="text-foreground">Minimum Rating</Label>
                  <Select 
                    value={minRating?.toString() ?? 'any'} 
                    onValueChange={(v) => onMinRatingChange(v === 'any' ? null : parseInt(v))}
                  >
                    <SelectTrigger id="rating" className="bg-input text-foreground border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground border-border">
                      {RATING_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value ?? 'any'} value={opt.value?.toString() ?? 'any'}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    onTypeChange('ALL')
                    onSortChange('SORT_BY_POPULARITY')
                    onMinRatingChange(null)
                  }}
                >
                  <X className="mr-1 h-4 w-4" />
                  Clear filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
        
        <Button onClick={onSearch} className="bg-primary text-primary-foreground hover:bg-primary/90">
          Search
        </Button>
      </div>
      
      {hasFilters && (
        <div className="flex flex-wrap gap-1 sm:hidden">
          {selectedType !== 'ALL' && (
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
              {TYPE_OPTIONS.find(o => o.value === selectedType)?.label}
            </Badge>
          )}
          {minRating && (
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
              {minRating}+ Rating
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
