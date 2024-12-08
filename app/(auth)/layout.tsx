'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      router.back();
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-zinc-900/50 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div 
        className="relative z-50 w-full max-w-[400px] mx-4 animate-in slide-in-from-bottom-4 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-white shadow-2xl">
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}