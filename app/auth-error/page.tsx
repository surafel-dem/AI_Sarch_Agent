'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="text-center">
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Authentication Error
        </h1>
        <p className="mt-4 text-base leading-7 text-gray-600">
          {error === 'no_code'
            ? 'No authentication code was provided. Please try signing in again.'
            : error || 'An error occurred during authentication.'}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild>
            <Link href="/">
              Return Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/?signin=true">
              Try Again
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
