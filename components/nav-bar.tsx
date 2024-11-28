'use client'

import Link from 'next/link'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { AiOutlineCar } from 'react-icons/ai'
import { BiLogIn, BiLogOut } from 'react-icons/bi'
import { usePathname, useRouter } from 'next/navigation'
import { Send, Home, PlusCircle, Clock, ChevronLeft, Menu, X } from 'lucide-react'
import { ArrowRight, Search, Zap, Brain, ThumbsUp, Info } from "lucide-react"
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FcGoogle } from 'react-icons/fc'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { HiOutlineUserAdd } from 'react-icons/hi'
import { UserAvatar } from './ui/user-avatar'

interface NavBarProps {
  onReset?: () => void;
}

export function NavBar({ onReset }: NavBarProps) {
  const { user, login, signup, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const [authError, setAuthError] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const resetForm = () => {
    setEmail('')
    setAuthError('')
    setErrorMsg('')
    setSuccessMsg('')
    setIsLoading(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      // First check if user exists
      const { data: userExists } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single()

      if (!userExists) {
        toast.error('No account found', {
          description: 'Please sign up instead.',
        })
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email,
          }
        },
      })

      if (error) throw error
      
      toast.success('Magic link sent!', {
        description: 'Check your email for the login link.',
      })
      setIsLoginOpen(false)
      resetForm()
    } catch (error) {
      toast.error('Authentication error', {
        description: error.message || 'Error sending magic link email',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email,
            timestamp: new Date().toISOString()
          }
        },
      })

      if (signInError) {
        console.error('SignIn error:', signInError)
        throw signInError
      }
      
      toast.success('Magic link sent!', {
        description: 'Check your email to complete your registration.',
      })
      setIsSignupOpen(false)
      resetForm()
    } catch (error) {
      console.error('Authentication error:', error)
      toast.error('Authentication error', {
        description: error.message || 'Error sending magic link email',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      toast.success('Redirecting to Google...', {
        description: 'Please complete the authentication process.',
      })
    } catch (error) {
      toast.error('Google authentication error', {
        description: error.message || 'Error signing in with Google',
      })
    }
  }

  const handleHomeClick = () => {
    if (onReset) {
      onReset()
    }
    router.push('/')
  }

  const handleNewChat = () => {
    if (onReset) {
      onReset()
    }
    router.push('/')
  }

  const isMainPage = pathname === '/'
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  return (
    <div className="flex">
      {/* Left Sidebar */}
      <div className="w-16 fixed left-0 top-0 h-screen bg-white border-r border-purple-100 flex flex-col items-center pt-4 gap-4 shadow-sm">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-600 hover:bg-purple-50 hover:text-[#8A2BE2] transition-colors duration-200"
          onClick={handleHomeClick}
        >
          <Home className="h-6 w-6" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-600 hover:bg-purple-50 hover:text-[#8A2BE2] transition-colors duration-200"
          onClick={handleNewChat}
        >
          <PlusCircle className="h-6 w-6" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-600 hover:bg-purple-50 hover:text-[#8A2BE2] transition-colors duration-200"
        >
          <Clock className="h-6 w-6" />
        </Button>
      </div>

      {/* Top Header */}
      <header className="fixed top-0 left-16 right-0 z-50">
        <div className="w-full bg-white border-b border-purple-100 shadow-sm">
          <div className="flex items-center justify-between w-full max-w-6xl mx-auto px-4 h-16">
            <button 
              onClick={handleHomeClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <AiOutlineCar className="h-6 w-6 text-[#8A2BE2]" />
              <span className="text-xl font-bold text-gray-900">CarSearchAI</span>
            </button>

            <nav className="hidden md:flex items-center space-x-8 text-left">
              <a href="#how-it-works" className="text-gray-600 hover:text-[#8A2BE2] text-sm font-medium transition-colors duration-200 flex items-center">
                <ArrowRight className="h-4 w-4 mr-1" />
                How It Works
              </a>
              <a href="#about-us" className="text-gray-600 hover:text-[#8A2BE2] text-sm font-medium transition-colors duration-200 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                About Us
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <UserAvatar user={user} />
              ) : (
                <>
                  {/* Login Dialog */}
                  <Dialog open={isLoginOpen} onOpenChange={(open) => {
                    setIsLoginOpen(open)
                    if (!open) resetForm()
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="text-gray-600 hover:text-[#8A2BE2] hover:bg-purple-50 text-sm font-medium transition-colors duration-200">
                        <BiLogIn className="mr-2" />
                        Login
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-white border border-purple-100">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900">Login to CarSearchAI</DialogTitle>
                        <DialogDescription className="text-gray-600">
                          Access AI-powered car recommendations
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 py-4">
                        <Button
                          onClick={handleGoogleAuth}
                          disabled={isLoading}
                          className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 flex items-center justify-center gap-2 transition-colors duration-200"
                          variant="outline"
                        >
                          <FcGoogle className="h-5 w-5" />
                          Continue with Google
                        </Button>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-300" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">Or continue with</span>
                          </div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                          <div className="grid gap-2">
                            <Label htmlFor="email" className="text-gray-700">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="name@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              disabled={isLoading}
                              className="bg-gray-50 border-purple-100 text-gray-900 focus:border-[#8A2BE2] focus:ring-[#8A2BE2]"
                            />
                          </div>
                          {authError && <p className="text-red-500 text-sm">{authError}</p>}
                          {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
                          {successMsg && <p className="text-green-500 text-sm">{successMsg}</p>}
                          <Button 
                            type="submit" 
                            disabled={isLoading} 
                            className="w-full bg-[#8A2BE2] hover:bg-[#7B1FA2] text-white transition-colors duration-200"
                          >
                            {isLoading && (
                              <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Send Magic Link
                          </Button>
                        </form>
                      </div>

                      <DialogFooter className="sm:justify-start">
                        <p className="text-sm text-gray-600">
                          Don&apos;t have an account?{' '}
                          <Button
                            variant="link"
                            className="p-0 text-[#8A2BE2] hover:text-[#7B1FA2]"
                            onClick={() => {
                              setIsLoginOpen(false)
                              setIsSignupOpen(true)
                            }}
                          >
                            Sign up
                          </Button>
                        </p>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Signup Dialog */}
                  <Dialog open={isSignupOpen} onOpenChange={(open) => {
                    setIsSignupOpen(open)
                    if (!open) resetForm()
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#8A2BE2] hover:bg-[#7B1FA2] text-white
                        h-10 rounded-full transition-all duration-300 text-[15px] font-medium
                        hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]
                        active:scale-[0.98]">
                        <HiOutlineUserAdd className="mr-2" />
                        Sign Up
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-white border border-purple-100">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900">Create an Account</DialogTitle>
                        <DialogDescription className="text-gray-600">
                          Join CarSearchAI to start your car search journey
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 py-4">
                        <Button
                          onClick={handleGoogleAuth}
                          disabled={isLoading}
                          className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 flex items-center justify-center gap-2 transition-colors duration-200"
                          variant="outline"
                        >
                          <FcGoogle className="h-5 w-5" />
                          Continue with Google
                        </Button>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-300" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">Or continue with</span>
                          </div>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-4">
                          <div className="grid gap-2">
                            <Label htmlFor="signup-email" className="text-gray-700">Email</Label>
                            <Input
                              id="signup-email"
                              type="email"
                              placeholder="name@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              disabled={isLoading}
                              className="bg-gray-50 border-purple-100 text-gray-900 focus:border-[#8A2BE2] focus:ring-[#8A2BE2]"
                            />
                          </div>
                          {authError && <p className="text-red-500 text-sm">{authError}</p>}
                          {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
                          {successMsg && <p className="text-green-500 text-sm">{successMsg}</p>}
                          <Button 
                            type="submit" 
                            disabled={isLoading} 
                            className="w-full bg-[#8A2BE2] hover:bg-[#7B1FA2] text-white transition-colors duration-200"
                          >
                            {isLoading && (
                              <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Get Started
                          </Button>
                        </form>
                      </div>

                      <DialogFooter className="sm:justify-start">
                        <p className="text-sm text-gray-600">
                          Already have an account?{' '}
                          <Button
                            variant="link"
                            className="p-0 text-[#8A2BE2] hover:text-[#7B1FA2]"
                            onClick={() => {
                              setIsSignupOpen(false)
                              setIsLoginOpen(true)
                            }}
                          >
                            Login
                          </Button>
                        </p>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              <Button variant="ghost" size="icon" className="text-gray-600 md:hidden" onClick={toggleMobileMenu}>
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-purple-100">
              <div className="px-4 py-3 space-y-3">
                <a href="#how-it-works" className="block text-gray-600 hover:text-[#8A2BE2] text-sm font-medium transition-colors duration-200">
                  How It Works
                </a>
                <a href="#about-us" className="block text-gray-600 hover:text-[#8A2BE2] text-sm font-medium transition-colors duration-200">
                  About Us
                </a>
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  )
}
