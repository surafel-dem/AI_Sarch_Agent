'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth-context'
import { Button } from './button'
import { LogOut, Upload } from 'lucide-react'

function getInitials(email: string): string {
  return email
    .split('@')[0]
    .split('.')
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

function getRandomColor(email: string): string {
  const colors = [
    'bg-red-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500'
  ]
  const index = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  return colors[index]
}

export function UserAvatar({ user }: { user: User }) {
  const { logout } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const initials = getInitials(user.email || '')
  const bgColor = getRandomColor(user.email || '')

  useEffect(() => {
    if (user?.id) {
      getExistingAvatar()
    }
  }, [user?.id])

  async function getExistingAvatar() {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', user.id)
        .single()

      if (userData?.avatar_url) {
        const { data } = await supabase.storage
          .from('avatars')
          .getPublicUrl(userData.avatar_url)
        
        setAvatarUrl(data.publicUrl)
      }
    } catch (error) {
      console.error('Error fetching avatar:', error)
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setIsUploading(true)
      const file = event.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/avatar.${fileExt}`

      // Upload image
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = await supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update user record
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: filePath })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(data.publicUrl)
    } catch (error) {
      console.error('Error uploading avatar:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl || undefined} alt={user.email || ''} />
            <AvatarFallback className={`${bgColor} text-white text-xs`}>
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-gray-900 leading-none">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer text-gray-700 hover:bg-gray-100">
          <label className="flex w-full cursor-pointer items-center">
            <Upload className="mr-2 h-4 w-4" />
            <span>{isUploading ? 'Uploading...' : 'Change avatar'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={uploadAvatar}
              disabled={isUploading}
            />
          </label>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => logout()} 
          className="cursor-pointer text-gray-700 hover:bg-gray-100"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
