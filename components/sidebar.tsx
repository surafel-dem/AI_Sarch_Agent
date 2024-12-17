'use client';

import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Plus,
  Heart,
  History,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChatHistory } from './chat/chat-history';
import { useAuth } from '@clerk/nextjs';

interface SidebarProps {
  currentSessionId?: string;
  onSessionSelect?: (sessionId: string) => void;
  messages?: any[];
}

export function Sidebar({ currentSessionId, onSessionSelect, messages = [] }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isSearchPage = pathname === '/search';
  const { userId } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: MessageSquare, label: 'New Chat', href: '/search' },
    { icon: Heart, label: 'Favorites', href: '/favorites' },
  ];

  return (
    <>
      {/* Toggle Button */}
      <button
        type="button"
        className={cn(
          "fixed top-3 left-3 z-50 appearance-none bg-transparent border-0 p-0 outline-none",
          isSearchPage ? "text-purple-600 hover:text-purple-700" : "text-white"
        )}
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
          isOpen ? "w-64" : "w-12",
          "bg-white border-r border-gray-200 flex flex-col"
        )}
      >
        {/* Navigation Menu */}
        <div className="flex-shrink-0 px-2 py-4 mt-12">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center p-2 rounded-lg transition-colors",
                  !isOpen && "justify-center",
                  isSearchPage 
                    ? "text-purple-600 hover:bg-purple-50" 
                    : "text-gray-700 hover:bg-gray-100"
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

        {/* Chat History */}
        {userId && isSearchPage && isOpen && (
          <div className="flex-1 overflow-y-auto px-2 py-2 min-h-0">
            <ChatHistory
              messages={messages}
              currentSessionId={currentSessionId}
              onSessionSelect={onSessionSelect}
              isOpen={isOpen}
            />
          </div>
        )}
      </aside>
    </>
  );
}