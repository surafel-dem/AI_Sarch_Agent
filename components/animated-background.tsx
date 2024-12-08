'use client';

import { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="fixed inset-0 bg-white" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full max-w-lg">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" />
          <div className="absolute -bottom-8 right-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float-slow" />
          <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float-slower" />
        </div>
      </div>
    </div>
  )
}
