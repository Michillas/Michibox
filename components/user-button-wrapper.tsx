'use client'

import { useEffect } from 'react'
import { UserButton as NeonUserButton } from '@neondatabase/auth/react'
import { useRouter } from 'next/navigation'

export function UserButton({ size }: { size?: 'sm' | 'md' | 'lg' | 'icon' }) {
  const router = useRouter()

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

  return <NeonUserButton size={size} />
}
