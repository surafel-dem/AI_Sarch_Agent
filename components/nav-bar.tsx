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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setAuthError('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(formData.email, formData.password)
      setIsLoginOpen(false)
      setFormData({ email: '', password: '', name: '' })
    } catch (error) {
      setAuthError('Invalid email or password')
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signup(formData.email, formData.password, formData.name)
      setIsSignupOpen(false)
      setFormData({ email: '', password: '', name: '' })
    } catch (error) {
      setAuthError('Error creating account')
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
      <div className="w-16 fixed left-0 top-0 h-screen bg-gradient-to-b from-[rgba(0,7,36,0.8)] to-[rgba(0,21,108,0.8)] backdrop-blur-sm border-r border-[rgba(255,255,255,0.1)] flex flex-col items-center pt-4 gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors duration-200"
          onClick={handleHomeClick}
        >
          <Home className="h-6 w-6" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors duration-200"
          onClick={handleNewChat}
        >
          <PlusCircle className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors duration-200">
          <Clock className="h-6 w-6" />
        </Button>
      </div>

      {/* Top Header */}
      <header className="fixed top-0 left-16 right-0 z-50">
        <div className="w-full bg-gradient-to-b from-[rgba(0,7,36,0.8)] to-[rgba(0,21,108,0.8)] backdrop-blur-sm border-b border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center justify-between w-full max-w-6xl mx-auto px-4 h-16">
            <button 
              onClick={handleHomeClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <AiOutlineCar className="h-6 w-6 text-[#8b5cf6]" />
              <span className="text-xl font-bold text-white">CarSearchAI</span>
            </button>

            <nav className="hidden md:flex items-center space-x-8 text-left">
              <a href="#how-it-works" className="text-[#ffffffcc] hover:text-white text-sm font-medium transition-colors duration-200 flex items-center">
                <ArrowRight className="h-4 w-4 mr-1" />
                How It Works
              </a>
              <a href="#about-us" className="text-[#ffffffcc] hover:text-white text-sm font-medium transition-colors duration-200 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                About Us
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300 text-sm hidden md:inline">
                    Welcome, {user.name}
                  </span>
                  <Button
                    variant="ghost"
                    className="text-gray-300 hover:text-white hover:bg-[rgba(139,92,246,0.2)]"
                    onClick={() => logout()}
                  >
                    <BiLogOut className="mr-2 h-4 w-4" />
                    <span className="hidden md:inline">Sign Out</span>
                  </Button>
                </div>
              ) : (
                <>
                  {/* Login Dialog */}
                  <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="text-[#ffffffcc] hover:text-white text-sm font-medium transition-colors duration-200">
                        Login
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-[rgb(0,14,72)] text-white border-[rgba(255,255,255,0.1)]">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Login to CarSearchAI</DialogTitle>
                        <DialogDescription className="text-[#ffffffcc]">
                          Enter your credentials to access your account
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleLogin} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="bg-[rgba(0,7,36,0.6)] border-[rgba(255,255,255,0.1)] text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="bg-[rgba(0,7,36,0.6)] border-[rgba(255,255,255,0.1)] text-white"
                          />
                        </div>
                        {authError && <p className="text-red-500 text-sm">{authError}</p>}
                        <Button type="submit" className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed]">
                          Login
                        </Button>
                        <p className="text-sm text-center text-[#ffffffcc]">
                          Don't have an account?{' '}
                          <button
                            type="button"
                            className="text-[#8b5cf6] hover:text-[#7c3aed]"
                            onClick={() => {
                              setIsLoginOpen(false)
                              setIsSignupOpen(true)
                            }}
                          >
                            Sign up
                          </button>
                        </p>
                      </form>
                    </DialogContent>
                  </Dialog>

                  {/* Signup Dialog */}
                  <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white
                        h-10 rounded-full transition-all duration-300 text-[15px] font-medium
                        hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]
                        active:scale-[0.98]">
                        Sign Up
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-[rgb(0,14,72)] text-white border-[rgba(255,255,255,0.1)]">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Create an Account</DialogTitle>
                        <DialogDescription className="text-[#ffffffcc]">
                          Join CarSearchAI to get personalized car recommendations
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSignup} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-name">Name</Label>
                          <Input
                            id="signup-name"
                            name="name"
                            type="text"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="bg-[rgba(0,7,36,0.6)] border-[rgba(255,255,255,0.1)] text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input
                            id="signup-email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="bg-[rgba(0,7,36,0.6)] border-[rgba(255,255,255,0.1)] text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <Input
                            id="signup-password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="bg-[rgba(0,7,36,0.6)] border-[rgba(255,255,255,0.1)] text-white"
                          />
                        </div>
                        {authError && <p className="text-red-500 text-sm">{authError}</p>}
                        <Button type="submit" className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed]">
                          Create Account
                        </Button>
                        <p className="text-sm text-center text-[#ffffffcc]">
                          Already have an account?{' '}
                          <button
                            type="button"
                            className="text-[#8b5cf6] hover:text-[#7c3aed]"
                            onClick={() => {
                              setIsSignupOpen(false)
                              setIsLoginOpen(true)
                            }}
                          >
                            Login
                          </button>
                        </p>
                      </form>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              <Button variant="ghost" size="icon" className="text-white md:hidden" onClick={toggleMobileMenu}>
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-[rgba(0,7,36,0.95)] border-t border-[rgba(255,255,255,0.1)]">
              <div className="px-4 py-3 space-y-3">
                <a href="#how-it-works" className="block text-[#ffffffcc] hover:text-white text-sm font-medium transition-colors duration-200">
                  How It Works
                </a>
                <a href="#about-us" className="block text-[#ffffffcc] hover:text-white text-sm font-medium transition-colors duration-200">
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
