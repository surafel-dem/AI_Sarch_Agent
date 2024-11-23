'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { BiLogIn } from 'react-icons/bi'
import { useAuth } from '@/context/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)

    try {
      await login(formData.email, formData.password)
      router.push('/')
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(0,7,36)] via-[rgb(0,14,72)] to-[rgb(0,21,108)]">
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <BiLogIn className="mx-auto h-6 w-6 text-[#8b5cf6]" />
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="text-sm text-gray-400">
              Enter your email to sign in to your account
            </p>
          </div>

          <div className="bg-[rgba(0,7,36,0.6)] backdrop-blur-md rounded-xl border border-[rgba(139,92,246,0.2)] p-4">
            <form onSubmit={onSubmit}>
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
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-[rgba(139,92,246,0.1)] border-[rgba(139,92,246,0.2)] text-gray-200 placeholder:text-gray-400"
                  />
                  <Input
                    id="password"
                    placeholder="Password"
                    type="password"
                    autoComplete="current-password"
                    disabled={isLoading}
                    value={formData.password}
                    onChange={handleInputChange}
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
                  Sign In
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
