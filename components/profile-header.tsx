'use client'

import Link from 'next/link'
import { User, Film, Tv, Heart, Settings, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface ProfileHeaderProps {
  watchedCount: number
  watchlistCount: number
  topSeriesCount: number
  userName?: string
  userEmail?: string
  userSlug?: string
  showSettings?: boolean
}

export function ProfileHeader({ 
  watchedCount, 
  watchlistCount, 
  topSeriesCount, 
  userName, 
  userEmail,
  userSlug,
  showSettings = true
}: ProfileHeaderProps) {
  const { toast } = useToast()

  const handleShare = async () => {
    if (!userSlug) {
      toast({
        title: "Cannot share",
        description: "Profile slug not available",
        variant: "destructive"
      })
      return
    }

    const profileUrl = `${window.location.origin}/u/${userSlug}`
    
    try {
      await navigator.clipboard.writeText(profileUrl)
      toast({
        title: "Link copied!",
        description: "Profile URL copied to clipboard",
      })
    } catch {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-secondary border border-border">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl">
              <User className="w-12 h-12 md:w-16 md:h-16 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-4 border-card">
              <Film className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{userName || 'Movie Enthusiast'}</h1>
                <p className="text-muted-foreground mt-1">{userEmail || 'Tracking my cinematic journey'}</p>
              </div>
              <div className="flex items-center gap-2">
                {userSlug && (
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                )}
                {showSettings && (
                  <Link href="/account/settings">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline">Settings</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8">
          <div className="bg-background/50 backdrop-blur rounded-xl p-3 sm:p-4 text-center border border-border/50">
            <div className="flex items-center justify-center gap-2 text-primary mb-1">
              <Film className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{watchedCount}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Watched</div>
          </div>
          
          <div className="bg-background/50 backdrop-blur rounded-xl p-3 sm:p-4 text-center border border-border/50">
            <div className="flex items-center justify-center gap-2 text-accent mb-1">
              <Tv className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{watchlistCount}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Watchlist</div>
          </div>
          
          <div className="bg-background/50 backdrop-blur rounded-xl p-3 sm:p-4 text-center border border-border/50">
            <div className="flex items-center justify-center gap-2 text-red-500 mb-1">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{topSeriesCount}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Top Titles</div>
          </div>
        </div>
      </div>
    </div>
  )
}
