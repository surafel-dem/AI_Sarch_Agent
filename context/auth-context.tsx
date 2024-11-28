'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  updateLastSeen: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  updateLastSeen: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const updateLastSeen = async () => {
    if (user) {
      await supabase
        .from('users')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', user.id)
    }
  }

  useEffect(() => {
    // Update last_seen_at every 5 minutes while the user is active
    if (user) {
      updateLastSeen()
      const interval = setInterval(updateLastSeen, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [user])

  const logout = async () => {
    await updateLastSeen()
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateLastSeen }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
