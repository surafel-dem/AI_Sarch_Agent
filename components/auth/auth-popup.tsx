'use client'

import { SignIn, SignUp } from '@clerk/nextjs'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

interface AuthPopupProps {
  isOpen: boolean
  onClose: () => void
  defaultView?: 'login' | 'signup'
}

export function AuthPopup({ isOpen, onClose, defaultView = 'login' }: AuthPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white p-0 gap-0">
        <DialogTitle className="sr-only">
          {defaultView === 'login' ? 'Sign In' : 'Sign Up'}
        </DialogTitle>
        {defaultView === 'login' ? (
          <SignIn
            appearance={{
              elements: {
                rootBox: "mx-auto w-full",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm font-medium",
                formFieldInput: "h-11 px-4 bg-white rounded-xl border border-gray-200",
                footer: "flex items-center justify-center",
                card: "shadow-none p-6",
                dividerLine: "bg-gray-200",
                dividerText: "text-gray-500",
                formFieldLabel: "text-gray-700 font-medium",
                footerActionLink: "text-blue-600 hover:text-blue-700",
                socialButtons: "grid gap-2"
              }
            }}
            redirectUrl={'/'}
            afterSignInUrl={'/'}
          />
        ) : (
          <SignUp
            appearance={{
              elements: {
                rootBox: "mx-auto w-full",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm font-medium",
                formFieldInput: "h-11 px-4 bg-white rounded-xl border border-gray-200",
                footer: "flex items-center justify-center",
                card: "shadow-none p-6",
                dividerLine: "bg-gray-200",
                dividerText: "text-gray-500",
                formFieldLabel: "text-gray-700 font-medium",
                footerActionLink: "text-blue-600 hover:text-blue-700",
                socialButtons: "grid gap-2"
              }
            }}
            redirectUrl={'/'}
            afterSignUpUrl={'/'}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
