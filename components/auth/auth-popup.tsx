'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInWithMagicLink, signInWithGoogle } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface AuthPopupProps {
  isOpen: boolean
  onClose: () => void
  defaultView?: 'login' | 'signup'
}

export function AuthPopup({ isOpen, onClose, defaultView = 'login' }: AuthPopupProps) {
  const [view, setView] = useState<'login' | 'signup'>(defaultView)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Check if user exists in public.users table
      const { data: existingUser, error: dbError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle()

      if (dbError) {
        console.error('Database error:', dbError)
        throw dbError
      }

      if (view === 'signup' && existingUser) {
        setError('This email is already registered. Please log in instead.')
        setLoading(false)
        return
      }

      const result = await signInWithMagicLink(email)
      if (result.success) {
        setMessage('Check your email for the magic link!')
        setTimeout(() => {
          onClose()
        }, 3000)
      } else {
        throw new Error('Failed to send magic link')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to send magic link. Please try again.')
    }
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    const result = await signInWithGoogle()
    if (!result.success) {
      setError('Failed to sign in with Google. Please try again.')
    } else {
      onClose()
    }
    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-3 shadow-lg">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-xl font-semibold">
              {view === 'login' ? 'Welcome Back' : 'Create Account'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          {message && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 text-sm font-medium">
                Success! We've sent you a secure login link.
              </p>
              <p className="text-blue-600 text-xs mt-1">
                Please check your inbox to continue.
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-500 text-white hover:bg-blue-600 font-medium"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Sending link...</span>
              </div>
            ) : (
              <span>Continue with Email</span>
            )}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>

          <div className="text-center text-sm text-gray-500">
            {view === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setView('signup')}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Log in
                </button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
