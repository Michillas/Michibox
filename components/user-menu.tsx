'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth/client'
import { signOut } from '@/app/auth/sign-out/actions'
import { useRouter } from 'next/navigation'

export function UserMenu() {
  const [showMenu, setShowMenu] = useState(false)
  const session = authClient.useSession()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
  }

  if (!session.data?.user) {
    return null
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-9 w-9"
        onClick={() => router.push('/profile')}
        onContextMenu={(e) => {
          e.preventDefault()
          setShowMenu(!showMenu)
        }}
        title="Click: Go to profile | Right-click: Open menu"
      >
        <User className="h-4 w-4" />
      </Button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-56 rounded-xl border-2 border-border bg-card shadow-lg z-50">
            <div className="p-3 border-b-2 border-border">
              <p className="text-sm font-medium text-foreground truncate">
                {session.data.user.email}
              </p>
            </div>
            <div className="p-2">
              <Link 
                href="/profile" 
                onClick={() => setShowMenu(false)}
              >
                <button className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </button>
              </Link>
              <Link 
                href="/account/settings" 
                onClick={() => setShowMenu(false)}
              >
                <button className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </Link>
              <button
                onClick={() => {
                  setShowMenu(false)
                  handleLogout()
                }}
                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive transition-colors flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
