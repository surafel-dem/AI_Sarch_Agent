'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { BiLogIn } from 'react-icons/bi'
import { FcGoogle } from 'react-icons/fc'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')

  async function handleEmailLogin(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
      alert('Check your email for the login link!')
    } catch (error) {
      console.error('Error:', error)
      alert('Error sending magic link email')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleLogin() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Error:', error)
      alert('Error signing in with Google')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(0,7,36)] via-[rgb(0,14,72)] to-[rgb(0,21,108)]">
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <BiLogIn className="mx-auto h-6 w-6 text-[#8b5cf6]" />
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Welcome to Car Search AI
            </h1>
            <p className="text-sm text-gray-400">
              Sign in to access AI-powered car recommendations
            </p>
          </div>

          <div className="bg-[rgba(0,7,36,0.6)] backdrop-blur-md rounded-xl border border-[rgba(139,92,246,0.2)] p-4 space-y-4">
            <Button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 flex items-center justify-center gap-2"
              variant="outline"
            >
              <FcGoogle className="h-5 w-5" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[rgba(0,7,36,0.6)] px-2 text-gray-400">Or continue with</span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[rgba(139,92,246,0.1)] border-[rgba(139,92,246,0.2)] text-gray-200 placeholder:text-gray-400"
                  />
                </div>
                <Button 
                  disabled={isLoading}
                  className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white transition-colors"
                >
                  {isLoading && (
                    <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Send Magic Link
                </Button>
              </div>
            </form>
          </div>

          <p className="px-8 text-center text-sm text-gray-400">
            <Link
              href="/signup"
              className="hover:text-[#8b5cf6] underline underline-offset-4"
            >
              Don&apos;t have an account? Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
