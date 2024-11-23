'use client'

import Link from 'next/link'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { AiOutlineCar } from 'react-icons/ai'
import { BiLogIn, BiLogOut } from 'react-icons/bi'

export function NavBar() {
  const { user, logout } = useAuth()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(0,7,36,0.8)] backdrop-blur-md border-b border-[rgba(139,92,246,0.2)]">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <AiOutlineCar className="h-6 w-6 text-[#8b5cf6]" />
            <span className="font-bold text-white">CarSearchAI</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-300 text-sm">
                  Welcome, {user.name}
                </span>
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-[rgba(139,92,246,0.2)]"
                  onClick={() => logout()}
                >
                  <BiLogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-gray-300 hover:text-white hover:bg-[rgba(139,92,246,0.2)]"
                  >
                    <BiLogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
