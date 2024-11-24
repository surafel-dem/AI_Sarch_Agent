'use client'

import { CarSearchAi } from '@/components/car-search-ai'
import { ProtectedRoute } from '@/components/protected-route'

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-[#000724] to-black">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <CarSearchAi />
        </div>
      </div>
    </ProtectedRoute>
  )
}
