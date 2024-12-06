'use client';

import { useEffect, useRef } from 'react';

export function AnimatedBackground() {
  return (
    <>
      {/* Modern gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
      
      {/* Subtle grid overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Animated elements */}
      <div className="fixed inset-0 overflow-hidden">
        {/* Car silhouettes */}
        <div className="absolute -left-8 top-1/4 w-12 h-6 bg-white/[0.02] rounded-lg transform rotate-12 animate-float-slow">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
        </div>
        <div className="absolute right-1/4 top-1/3 w-16 h-8 bg-white/[0.02] rounded-lg transform -rotate-12 animate-float-slower">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
        </div>
        
        {/* AI circuit patterns */}
        <div className="absolute left-1/3 bottom-1/4 w-32 h-32 border border-blue-500/10 rounded-full animate-pulse-slow">
          <div className="absolute inset-2 border border-blue-400/5 rounded-full" />
          <div className="absolute inset-4 border border-blue-300/5 rounded-full" />
        </div>
        <div className="absolute right-1/3 top-1/4 w-40 h-40 border border-blue-500/10 rounded-full animate-pulse-slower">
          <div className="absolute inset-2 border border-blue-400/5 rounded-full" />
          <div className="absolute inset-4 border border-blue-300/5 rounded-full" />
        </div>
        
        {/* Floating dots */}
        <div className="absolute left-1/4 top-1/2 w-2 h-2 bg-blue-400/20 rounded-full animate-float-slow" />
        <div className="absolute right-1/2 bottom-1/3 w-2 h-2 bg-blue-300/20 rounded-full animate-float-slower" />
        <div className="absolute left-2/3 top-1/3 w-2 h-2 bg-blue-500/20 rounded-full animate-float" />
      </div>
      
      {/* Radial gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900/80" />
    </>
  );
}
