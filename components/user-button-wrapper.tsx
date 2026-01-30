'use client'

import { useEffect, useState } from 'react'
import { UserButton as NeonUserButton } from '@neondatabase/auth/react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth/client'

export function UserButton({ size }: { size?: "default" | "sm" | "lg" | "icon" }) {
  const router = useRouter()
  const [forceUpdate, setForceUpdate] = useState(0)
  
  // Use the session hook to ensure we have the latest session data
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    // Aggressive session refresh with retry mechanism
    const refreshSession = async (retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const { data } = await authClient.getSession()
          if (data?.session?.user) {
            // Force a re-render by updating state
            setForceUpdate(prev => prev + 1)
            break
          }
          // If no user data yet, wait a bit before retrying
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 300))
          }
        } catch (error) {
          console.error('Failed to refresh session:', error)
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 300))
          }
        }
      }
    }
    
    refreshSession()
    
    // Also refresh when the page becomes visible (e.g., after tab switch)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshSession(1) // Single attempt on visibility change
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Check if clicked element is within the user info card (the part with email)
      const userCard = target.closest('[data-radix-menu-content] > div:first-child')
      if (userCard && !target.closest('button')) {
        router.push('/profile')
      }
    }

    // Add a small delay to ensure the dropdown is rendered
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClick)
    }, 100)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleClick)
    }
  }, [router])

  // Don't render until we have attempted to load session
  if (isPending) {
    return null
  }

  return <NeonUserButton size={size} key={forceUpdate} />
}
