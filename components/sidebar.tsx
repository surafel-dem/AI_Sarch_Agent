'use client';

import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Plus,
  Heart,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Plus, label: 'New Chat', href: '/chat/new' },
    { icon: History, label: 'History', href: '/history' },
    { icon: Heart, label: 'Favorites', href: '/favorites' },
  ];

  return (
    <>
      {/* Toggle Button */}
      <button
        type="button"
        className="fixed top-3 left-3 z-50 text-white appearance-none bg-transparent border-0 p-0 outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronLeft className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
      </button>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-40 h-screen",
          "transition-all duration-300 ease-in-out",
          isOpen ? "w-48" : "w-12"
        )}
      >
        <div className="flex h-full flex-col gap-4 py-4">
          <div className="px-2 py-2">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "flex items-center p-2 text-white hover:text-white/80 transition-colors",
                    !isOpen && "justify-center"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5",
                    isOpen && "mr-2"
                  )} />
                  {isOpen && <span>{item.label}</span>}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}