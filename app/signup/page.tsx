'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { MdOutlineAlternateEmail } from 'react-icons/md'
import { RiLockPasswordFill } from 'react-icons/ri'
import { BsPersonFill } from 'react-icons/bs'
import { useAuth } from '@/context/auth-context'

export default function SignUpPage() {
  const router = useRouter()
  const { signup } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      await signup(formData.name, formData.email, formData.password)
      router.push('/login')
    } catch (error) {
      console.error('Signup failed:', error)
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
            <BsPersonFill className="mx-auto h-6 w-6 text-[#8b5cf6]" />
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Create an account
            </h1>
            <p className="text-sm text-gray-400">
              Enter your details below to create your account
            </p>
          </div>

          <div className="bg-[rgba(0,7,36,0.6)] backdrop-blur-md rounded-xl border border-[rgba(139,92,246,0.2)] p-4">
            <form onSubmit={onSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Input
                    id="name"
                    placeholder="Full Name"
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    disabled={isLoading}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-[rgba(139,92,246,0.1)] border-[rgba(139,92,246,0.2)] text-gray-200 placeholder:text-gray-400"
                    icon={<BsPersonFill />}
                  />
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
                    icon={<MdOutlineAlternateEmail />}
                  />
                  <Input
                    id="password"
                    placeholder="Password"
                    type="password"
                    autoComplete="new-password"
                    disabled={isLoading}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="bg-[rgba(139,92,246,0.1)] border-[rgba(139,92,246,0.2)] text-gray-200 placeholder:text-gray-400"
                    icon={<RiLockPasswordFill />}
                  />
                  <Input
                    id="confirmPassword"
                    placeholder="Confirm Password"
                    type="password"
                    autoComplete="new-password"
                    disabled={isLoading}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="bg-[rgba(139,92,246,0.1)] border-[rgba(139,92,246,0.2)] text-gray-200 placeholder:text-gray-400"
                    icon={<RiLockPasswordFill />}
                  />
                </div>
                <Button 
                  disabled={isLoading}
                  className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white transition-colors"
                >
                  {isLoading && (
                    <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Account
                </Button>
              </div>
            </form>
          </div>

          <p className="px-8 text-center text-sm text-gray-400">
            <Link
              href="/login"
              className="hover:text-[#8b5cf6] underline underline-offset-4"
            >
              Already have an account? Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
