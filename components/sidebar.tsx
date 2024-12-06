'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Plus, LogIn, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SignIn, SignUp } from '@clerk/nextjs';

const authAppearance = {
  baseTheme: {
    variables: {
      colorBackground: '#0a0a0a',
      colorInputBackground: '#1a1a1a',
      colorInputText: 'white',
      colorText: 'white',
      colorTextSecondary: '#a0a0a0',
      colorPrimary: '#3b82f6',
      borderRadius: '0.375rem'
    },
    elements: {
      formButtonPrimary: {
        fontSize: '14px',
        textTransform: 'none',
        backgroundColor: '#3b82f6',
        '&:hover': {
          backgroundColor: '#2563eb'
        }
      },
      formFieldInput: {
        borderColor: '#333',
        '&:focus': {
          borderColor: '#3b82f6',
          outline: 'none'
        }
      },
      card: {
        boxShadow: 'none',
        backgroundColor: 'transparent'
      }
    }
  }
};

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  const handleAuthClick = (view: 'login' | 'signup') => {
    setAuthView(view);
    setShowAuth(true);
    setIsOpen(true);
  };

  return (
    <div className={cn(
      "fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-[#0a0a0a] border-r border-[#1a1a1a]",
      isOpen ? "w-52" : "w-14"
    )}>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-3 h-6 w-6 rounded-full border border-[#1a1a1a] bg-[#0a0a0a] hover:bg-[#1a1a1a] p-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronLeft className="h-3 w-3 text-gray-400" />
        ) : (
          <ChevronRight className="h-3 w-3 text-gray-400" />
        )}
      </Button>

      {/* Content Container */}
      <div className="relative h-full overflow-hidden">
        {/* Main Sidebar Content */}
        <div className={cn(
          "absolute inset-0 transition-transform duration-300 flex flex-col p-3",
          showAuth ? "-translate-y-full" : "translate-y-0"
        )}>
          {/* New Chat Button */}
          <Button
            variant="ghost"
            className={cn(
              "mb-2 justify-start gap-2 transition-all duration-300 text-blue-500 hover:text-blue-400 hover:bg-[#1a1a1a]",
              isOpen ? "px-3" : "px-2"
            )}
          >
            <Plus className="h-4 w-4" />
            {isOpen && <span className="text-sm font-medium">New Chat</span>}
          </Button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Auth Buttons */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 transition-all duration-300 text-gray-400 hover:text-gray-300 hover:bg-[#1a1a1a]",
                isOpen ? "px-3" : "px-2"
              )}
              onClick={() => handleAuthClick('login')}
            >
              <LogIn className="h-4 w-4" />
              {isOpen && <span className="text-sm font-medium">Sign In</span>}
            </Button>
            {isOpen && (
              <Button
                variant="default"
                className="w-full bg-blue-600 hover:bg-blue-500 text-sm font-medium"
                onClick={() => handleAuthClick('signup')}
              >
                Sign Up
              </Button>
            )}
          </div>
        </div>

        {/* Auth Panel */}
        <div className={cn(
          "absolute inset-0 transition-transform duration-300 bg-[#0a0a0a]",
          showAuth ? "translate-y-0" : "translate-y-full"
        )}>
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6 text-gray-400 hover:text-gray-300 z-50"
            onClick={() => setShowAuth(false)}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Auth Content */}
          <div className="h-full pt-10 px-2 pb-4">
            {authView === 'login' ? (
              <SignIn 
                appearance={authAppearance}
                afterSignInUrl="/"
                signUpUrl="#signup"
                redirectUrl="/"
              />
            ) : (
              <SignUp 
                appearance={authAppearance}
                afterSignUpUrl="/"
                signInUrl="#signin"
                redirectUrl="/"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
