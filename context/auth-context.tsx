'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface User {
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = async (email: string, password: string) => {
    // Mock login - replace with actual API call
    if (email && password) {
      const mockUser = {
        name: email.split('@')[0],
        email: email
      }
      setUser(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))
    } else {
      throw new Error('Invalid credentials')
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    // Mock signup - replace with actual API call
    if (email && password && name) {
      const mockUser = {
        name: name,
        email: email
      }
      setUser(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))
    } else {
      throw new Error('Invalid signup data')
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
