'use client';

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export function Navbar() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <nav className="fixed top-4 right-4 z-50 bg-purple-100/20 backdrop-blur-sm border border-purple-100/20 rounded-lg">
      {!isLoaded ? (
        // Loading state
        <div className="h-10 w-24 animate-pulse bg-white/5 rounded-lg" />
      ) : !isSignedIn ? (
        <div className="flex gap-2 p-1">
          <SignInButton mode="modal">
            <button className="bg-white/5 hover:bg-white/10 backdrop-blur-sm text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg transition duration-200">
              Sign in
            </button>
          </SignInButton>
          <SignUpButton 
            mode="modal"
            afterSignUpUrl="/dashboard"
            appearance={{
              elements: {
                formButtonPrimary: "bg-purple-500 hover:bg-purple-600 text-white",
                formFieldInput: "h-11 px-4 bg-white rounded-xl border border-gray-200",
                card: "bg-white shadow-none p-8 rounded-xl",
                header: "hidden",
                footer: "hidden",
                dividerRow: "hidden",
                socialButtons: "hidden"
              }
            }}
          >
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition duration-200">
              Sign up
            </button>
          </SignUpButton>
        </div>
      ) : (
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
              userButtonPopoverCard: "bg-white/5 backdrop-blur-sm border border-purple-100/20 rounded-lg w-52 p-1",
              userButtonPopoverActionButton: "hover:bg-white/10 text-slate-700 hover:text-slate-900 rounded-md px-2 py-1.5",
              userButtonPopoverActionButtonText: "text-sm",
              userPreviewMainIdentifier: "text-sm truncate max-w-[160px]",
              userButtonPopoverActionButtonIcon: "hidden",
              userButtonPopoverFooter: "hidden",
            }
          }}
        />
      )}
    </nav>
  );
}
