'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Lock, Mail, Trash2, Loader2, Globe, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { authClient } from '@/lib/auth/client'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    loading: false,
  })

  // Public profile form state
  const [publicProfileForm, setPublicProfileForm] = useState({
    username: '',
    slug: '',
    display_name: '',
    bio: '',
    is_public: true,
    loading: false,
    exists: false,
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    revokeOtherSessions: false,
    loading: false,
  })

  const loadUser = useCallback(async () => {
    try {
      const { data: sessionData, error } = await authClient.getSession()
      if (error || !sessionData?.user) {
        router.push('/auth/sign-in')
        return
      }
      setUser(sessionData.user)
      setProfileForm(prev => ({ ...prev, name: sessionData.user.name || '' }))
    } catch (error) {
      console.error('Failed to load user:', error)
      router.push('/auth/sign-in')
    } finally {
      setLoading(false)
    }
  }, [router])

  const refreshUser = async () => {
    const { data: sessionData } = await authClient.getSession()
    if (sessionData?.user) {
      setUser(sessionData.user)
    }
  }

  const loadPublicProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const profile = await response.json()
        setPublicProfileForm({
          username: profile.username || '',
          slug: profile.slug || '',
          display_name: profile.display_name || '',
          bio: profile.bio || '',
          is_public: profile.is_public ?? true,
          loading: false,
          exists: true,
        })
      } else {
        // Profile doesn't exist yet
        setPublicProfileForm(prev => ({ ...prev, exists: false }))
      }
    } catch (error) {
      console.error('Failed to load public profile:', error)
    }
  }, [])

  useEffect(() => {
    loadUser()
    loadPublicProfile()
  }, [loadUser, loadPublicProfile])

  const handleUpdatePublicProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    setPublicProfileForm(prev => ({ ...prev, loading: true }))

    try {
      const method = publicProfileForm.exists ? 'PUT' : 'POST'
      const body: any = {
        display_name: publicProfileForm.display_name,
        bio: publicProfileForm.bio,
        is_public: publicProfileForm.is_public,
      }

      // Only include username and slug for new profiles
      if (!publicProfileForm.exists) {
        if (!publicProfileForm.username || !publicProfileForm.slug) {
          throw new Error('Username and slug are required')
        }
        body.username = publicProfileForm.username
        body.slug = publicProfileForm.slug
      }

      const response = await fetch('/api/profile', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }

      await loadPublicProfile()
      setMessage({ type: 'success', text: 'Public profile updated successfully!' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Failed to update public profile' })
    } finally {
      setPublicProfileForm(prev => ({ ...prev, loading: false }))
    }
  }

  const handleSlugChange = (value: string) => {
    // Auto-convert to slug format (lowercase, alphanumeric, hyphens)
    const slug = value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
    setPublicProfileForm(prev => ({ ...prev, slug }))
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    setProfileForm(prev => ({ ...prev, loading: true }))

    try {
      const { error } = await authClient.updateUser({
        name: profileForm.name,
      })
      
      if (error) throw error

      await refreshUser()
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Failed to update profile' })
    } finally {
      setProfileForm(prev => ({ ...prev, loading: false }))
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' })
      return
    }

    setPasswordForm(prev => ({ ...prev, loading: true }))

    try {
      const { error } = await authClient.changePassword({
        newPassword: passwordForm.newPassword,
        currentPassword: passwordForm.currentPassword,
        revokeOtherSessions: passwordForm.revokeOtherSessions,
      })
      
      if (error) throw error

      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        revokeOtherSessions: false,
        loading: false,
      })
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Failed to change password' })
      setPasswordForm(prev => ({ ...prev, loading: false }))
    }
  }

  const handleDeleteAccount = async () => {
    try {
      // Implementation depends on your auth setup
      // This would typically call a delete account endpoint
      setMessage({ type: 'info', text: 'Account deletion is not yet implemented' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Failed to delete account' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/profile">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Messages */}
        {message.text && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-destructive' : message.type === 'success' ? 'border-green-500' : ''}`}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Settings Tabs */}
        <Tabs defaultValue="public-profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="public-profile">
              <Globe className="h-4 w-4 mr-2" />
              Public Profile
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="password">
              <Lock className="h-4 w-4 mr-2" />
              Password
            </TabsTrigger>
            <TabsTrigger value="account">
              <Mail className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Public Profile Tab */}
          <TabsContent value="public-profile">
            <Card>
              <CardHeader>
                <CardTitle>Public Profile</CardTitle>
                <CardDescription>
                  {publicProfileForm.exists 
                    ? 'Manage your public profile that others can see'
                    : 'Create your public profile to share with others'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePublicProfile} className="space-y-6">
                  {!publicProfileForm.exists && (
                    <Alert>
                      <AlertDescription>
                        You haven&apos;t created a public profile yet. Fill out the form below to create one and get your shareable profile URL!
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      type="text"
                      value={publicProfileForm.username}
                      onChange={(e) => setPublicProfileForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="johndoe"
                      disabled={publicProfileForm.exists}
                      required={!publicProfileForm.exists}
                    />
                    {publicProfileForm.exists ? (
                      <p className="text-sm text-muted-foreground">
                        Username cannot be changed after creation
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Choose a unique username (cannot be changed later)
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Profile URL *</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{typeof window !== 'undefined' ? window.location.origin : ''}/u/</span>
                      <Input
                        id="slug"
                        type="text"
                        value={publicProfileForm.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="john-doe"
                        disabled={publicProfileForm.exists}
                        required={!publicProfileForm.exists}
                        pattern="^[a-z0-9-]+$"
                      />
                    </div>
                    {publicProfileForm.exists ? (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground flex-1">
                          Your profile URL (cannot be changed)
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const url = `${window.location.origin}/u/${publicProfileForm.slug}`
                            navigator.clipboard.writeText(url)
                            setMessage({ type: 'success', text: 'Profile URL copied!' })
                          }}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Copy URL
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        URL-friendly version (lowercase, numbers, hyphens only)
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      type="text"
                      value={publicProfileForm.display_name}
                      onChange={(e) => setPublicProfileForm(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="John Doe"
                    />
                    <p className="text-sm text-muted-foreground">
                      Your name as displayed on your profile
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={publicProfileForm.bio}
                      onChange={(e) => setPublicProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell others about yourself and your favorite movies/series..."
                      rows={4}
                    />
                    <p className="text-sm text-muted-foreground">
                      A brief description about you (optional)
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="space-y-0.5">
                      <Label htmlFor="is_public" className="text-base">Public Profile</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to view your profile, watched content, and top titles
                      </p>
                    </div>
                    <Switch
                      id="is_public"
                      checked={publicProfileForm.is_public}
                      onCheckedChange={(checked) => setPublicProfileForm(prev => ({ ...prev, is_public: checked }))}
                    />
                  </div>

                  <Separator />

                  <div className="flex justify-end gap-2">
                    {publicProfileForm.exists && (
                      <Link href={`/u/${publicProfileForm.slug}`}>
                        <Button type="button" variant="outline">
                          View Profile
                        </Button>
                      </Link>
                    )}
                    <Button
                      type="submit"
                      disabled={publicProfileForm.loading}
                    >
                      {publicProfileForm.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {publicProfileForm.exists ? 'Save Changes' : 'Create Profile'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile details and how others see you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      Email address cannot be changed at this time
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userId">User ID</Label>
                    <Input
                      id="userId"
                      type="text"
                      value={user?.id || ''}
                      disabled
                      className="bg-muted font-mono text-sm"
                    />
                    <p className="text-sm text-muted-foreground">
                      Your unique user identifier
                    </p>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={profileForm.loading}
                    >
                      {profileForm.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                      required
                      minLength={8}
                    />
                    <p className="text-sm text-muted-foreground">
                      Must be at least 8 characters long
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                      required
                      minLength={8}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="revokeOtherSessions"
                      checked={passwordForm.revokeOtherSessions}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, revokeOtherSessions: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="revokeOtherSessions" className="font-normal cursor-pointer">
                      Sign out from all other devices
                    </Label>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={passwordForm.loading}
                    >
                      {passwordForm.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Change Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Management</CardTitle>
                <CardDescription>
                  Manage your account status and data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Account Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Account Status</span>
                      <span className="font-medium text-green-600">Active</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Email Verified</span>
                      <span className="font-medium">
                        {user?.emailVerified ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Account Created</span>
                      <span className="font-medium">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-destructive">Danger Zone</h3>
                  <Card className="border-destructive">
                    <CardHeader>
                      <CardTitle className="text-base">Delete Account</CardTitle>
                      <CardDescription>
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your
                              account and remove all your data from our servers including:
                              <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Your profile information</li>
                                <li>Your watchlist</li>
                                <li>Your watched history</li>
                                <li>Your top titles</li>
                              </ul>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAccount}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Yes, delete my account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
