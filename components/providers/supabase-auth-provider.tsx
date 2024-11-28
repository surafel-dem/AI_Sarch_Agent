'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { type Session, type User } from '@supabase/supabase-js'

type SupabaseContext = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
  signInWithEmail: (email: string) => Promise<void>
}

const SupabaseContext = createContext<SupabaseContext>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  signInWithEmail: async () => {},
})

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: activeSession } } = await supabase.auth.getSession()
      setSession(activeSession)
      setUser(activeSession?.user ?? null)
      setIsLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signInWithEmail = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw error
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const value = {
    user,
    session,
    isLoading,
    signOut,
    signInWithEmail,
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}
