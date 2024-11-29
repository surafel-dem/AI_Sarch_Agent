'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // The route handler will handle the actual redirection
    // This is just a fallback in case the route handler hasn't completed yet
    const timeout = setTimeout(() => {
      router.push('/')
    }, 2000) // Redirect after 2 seconds if route handler hasn't completed

    return () => clearTimeout(timeout)
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">Completing Login...</h2>
        <p className="text-gray-600">You will be redirected automatically.</p>
      </div>
    </div>
  )
}
