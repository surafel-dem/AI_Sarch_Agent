'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { AuthPopup } from "@/components/auth/auth-popup"
import { useAuth } from '@/contexts/auth-context'

export function Navigation() {
  const [showAuthPopup, setShowAuthPopup] = useState(false)
  const [authView, setAuthView] = useState<'login' | 'signup'>('login')
  const { user } = useAuth()

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="z-[50] flex items-center justify-between px-6 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent h-20 backdrop-blur-[2px] text-white">
      {/* Centered menu items */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-8">
        <button 
          onClick={() => scrollToSection('about')}
          className="hover:text-blue-400 transition-colors text-sm font-medium"
        >
          About
        </button>
        <button 
          onClick={() => scrollToSection('contact')}
          className="hover:text-blue-400 transition-colors text-sm font-medium"
        >
          Contact
        </button>
      </div>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        defaultView={authView}
      />
    </nav>
  )
}
