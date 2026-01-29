'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { ArrowLeft, User, Lock, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { useToast } from '@/hooks/use-toast'
import { ProfileHeader } from '@/components/profile-header'
import { TopSeriesShowcase } from '@/components/top-series-showcase'
import { ContentSection } from '@/components/content-section'
import type { WatchlistItem, WatchedItem, TopSeries } from '@/lib/db'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface UserProfile {
  id: number
  user_id: string
  username: string
  slug: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  is_public: boolean
}

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { toast } = useToast()

  const { data: profile, error: profileError } = useSWR<UserProfile>(
    slug ? `/api/profiles/${slug}` : null,
    fetcher
  )
  
  const { data: watched } = useSWR<WatchedItem[]>(
    profile?.user_id ? `/api/profiles/${slug}/watched` : null,
    fetcher
  )
  
  const { data: topSeries } = useSWR<TopSeries[]>(
    profile?.user_id ? `/api/profiles/${slug}/top-series` : null,
    fetcher
  )
  
  const { data: stats } = useSWR<{ watchedCount: number; topSeriesCount: number }>(
    profile?.user_id ? `/api/profiles/${slug}/stats` : null,
    fetcher
  )

  if (profileError || (profile && !profile.is_public)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Lock className="h-16 w-16 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Profile Not Found</h1>
          <p className="text-muted-foreground">
            This profile doesn't exist or is private.
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  const watchedIds = new Set(watched?.map(w => w.imdb_id) ?? [])
  const topSeriesIds = topSeries?.map(t => t.imdb_id) ?? []
  const userRatings: Record<string, number | null> = {}
  watched?.forEach(w => { userRatings[w.imdb_id] = w.user_rating })

  // Transform WatchedItem[] to IMDBTitle[] format
  const watchedTitles = watched?.map(item => ({
    id: item.imdb_id,
    type: item.type,
    primaryTitle: item.title,
    originalTitle: item.original_title || item.title,
    primaryImage: item.poster_url ? {
      url: item.poster_url,
      width: 300,
      height: 450
    } : undefined,
    startYear: item.start_year || undefined,
    endYear: item.end_year || undefined,
    runtimeSeconds: item.runtime_seconds || undefined,
    genres: item.genres || undefined,
    rating: item.rating && item.vote_count ? {
      aggregateRating: item.rating,
      voteCount: item.vote_count
    } : undefined,
    plot: item.plot || undefined
  })) ?? []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to michibox
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
          {/* Profile Header */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl sm:text-4xl font-black text-primary-foreground border-3 border-foreground shadow-[4px_4px_0_hsl(var(--foreground))]">
                {profile.display_name?.[0] || profile.username[0]}
              </div>
              <div className="flex-1 space-y-2 w-full">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black">
                      {profile.display_name || profile.username}
                    </h1>
                    <p className="text-muted-foreground text-sm sm:text-base">@{profile.username}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-2 self-start border-2 border-foreground font-bold shadow-[3px_3px_0_hsl(var(--foreground))] hover:shadow-[5px_5px_0_hsl(var(--foreground))] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                  onClick={async () => {
                    const profileUrl = `${window.location.origin}/u/${profile.slug}`
                    try {
                      await navigator.clipboard.writeText(profileUrl)
                      toast({
                        title: "Link copied!",
                        description: "Profile URL copied to clipboard",
                      })
                    } catch (err) {
                      toast({
                        title: "Failed to copy",
                        description: "Could not copy link to clipboard",
                        variant: "destructive"
                      })
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                </div>
                {profile.bio && (
                  <p className="text-foreground text-sm sm:text-base mt-2">{profile.bio}</p>
                )}
                <div className="flex gap-4 sm:gap-6 text-sm">
                  <div>
                    <span className="font-black text-foreground text-base sm:text-lg">{stats?.watchedCount || 0}</span>
                    <span className="text-muted-foreground ml-1">Watched</span>
                  </div>
                  <div>
                    <span className="font-black text-foreground text-base sm:text-lg">{stats?.topSeriesCount || 0}</span>
                    <span className="text-muted-foreground ml-1">Top Series</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Series */}
          {topSeries && topSeries.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Top Series</h2>
              <TopSeriesShowcase
                series={topSeries}
                onRemove={() => {}}
                onReorder={() => {}}
                readonly={true}
              />
            </div>
          )}

          {/* Recently Watched */}
          {watchedTitles && watchedTitles.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Recently Watched</h2>
              <ContentSection
                title="Recently Watched"
                icon="watched"
                titles={watchedTitles.slice(0, 12)}
                userRatings={userRatings}
                onRemove={() => {}}
                loading={false}
                loadingId={null}
              />
            </div>
          )}

          {watched?.length === 0 && topSeries?.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p>This user hasn't added any content yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
