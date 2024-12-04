'use client';

import { useState } from 'react';
import { Menu, Home, Search, Compass, Clock, Settings, LogIn, UserPlus, ChevronLeft, ChevronRight, Car } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { AuthPopup } from '@/components/auth/auth-popup';

export function SidePanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const router = useRouter();
  const { user } = useAuth();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Discover', href: '/discover', icon: Compass },
  ];

  return (
    <aside className={`fixed top-0 left-0 h-screen z-50 transition-all duration-300 border-r border-white/5 bg-gradient-to-b from-gray-900 to-black
      ${isOpen ? 'w-48' : 'w-12'}`}>
      <div className="flex flex-col h-full">
        {/* Header with logo and toggle */}
        <div className="h-12 flex items-center justify-between px-2 border-b border-white/5">
          <div className="flex items-center gap-2 text-white/70">
            <Car size={20} />
            {isOpen && (
              <span className="text-sm font-medium whitespace-nowrap">
                Car Search
              </span>
            )}
          </div>
          {/* Toggle button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-white/10 rounded-sm transition-colors"
            aria-label={isOpen ? 'Collapse menu' : 'Expand menu'}
          >
            {isOpen ? (
              <ChevronLeft size={14} className="text-white/70" />
            ) : (
              <ChevronRight size={14} className="text-white/70" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 px-2 py-2 text-sm text-white/70 hover:bg-white/10 transition-colors
                ${router.pathname === item.href ? 'bg-white/10' : ''}`}
            >
              <item.icon size={20} />
              {isOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-2 border-t border-white/5">
          {user ? (
            <div className="flex items-center gap-2 px-2 py-2 text-sm text-white/70">
              <div className="w-6 h-6 rounded-full bg-blue-500/60 flex items-center justify-center">
                <span className="text-xs font-medium">{user.email[0].toUpperCase()}</span>
              </div>
              {isOpen && <span className="truncate">{user.email}</span>}
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => {
                  setAuthView('login');
                  setShowAuthPopup(true);
                }}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm text-white/70 hover:bg-white/10 transition-colors rounded-sm"
              >
                <LogIn size={20} />
                {isOpen && <span>Login</span>}
              </button>
              <button
                onClick={() => {
                  setAuthView('signup');
                  setShowAuthPopup(true);
                }}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm text-white/70 hover:bg-white/10 transition-colors rounded-sm"
              >
                <UserPlus size={20} />
                {isOpen && <span>Sign Up</span>}
              </button>
            </div>
          )}
        </div>
      </div>
      {showAuthPopup && (
        <AuthPopup
          view={authView}
          onClose={() => setShowAuthPopup(false)}
          onViewChange={setAuthView}
        />
      )}
    </aside>
  );
}
