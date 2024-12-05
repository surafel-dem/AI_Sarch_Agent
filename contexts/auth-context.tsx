'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  checkUser: () => Promise<void>
  signOut: () => Promise<{ success: boolean; error?: any }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  checkUser: async () => {},
  signOut: async () => ({ success: false }),
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const checkUser = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      // Clear any auth-related local storage
      window.localStorage.removeItem('supabase.auth.token');
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, checkUser, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
