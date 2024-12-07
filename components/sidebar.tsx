'use client';

import { useState } from 'react';
import { Button } from './ui/button';
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
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 h-8 w-8 rounded-lg bg-blue-600/50 hover:bg-blue-700/50 p-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronLeft className="h-4 w-4 text-white/90" />
        ) : (
          <ChevronRight className="h-4 w-4 text-white/90" />
        )}
      </Button>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-16 bg-transparent border-r border-white/5",
          "transition-transform duration-200 ease-in-out",
          "-webkit-transform-style: preserve-3d",
          "transform-style: preserve-3d",
          isOpen ? "translate-x-0 -webkit-translate-x-0" : "-translate-x-full -webkit-translate-x-full"
        )}
      >
        <div className="h-full pt-16 px-2 flex flex-col items-center">
          {/* Navigation */}
          <nav className="space-y-4">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="p-2 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 block"
                title={item.label}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}