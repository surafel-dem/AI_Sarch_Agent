'use client';

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export function Navbar() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <nav className="fixed top-4 right-4 z-50 flex items-center gap-6">
      {/* Text Menu Items */}
      <div className="flex items-center gap-6">
        <a href="#" className="text-[#A3A5AC] hover:text-white transition-colors duration-200 text-[15px]">
          About
        </a>
        <a href="#" className="text-[#A3A5AC] hover:text-white transition-colors duration-200 text-[15px]">
          Contact
        </a>
      </div>

      {/* Auth Buttons Group */}
      {!isLoaded ? (
        <div className="h-10 w-24 animate-pulse bg-white/5 rounded-lg" />
      ) : !isSignedIn ? (
        <div className="flex items-center gap-2">
          <SignInButton mode="modal">
            <button className="bg-[#1A1A1A] hover:bg-[#2A2A2A] text-gray-300 hover:text-white px-4 py-2 rounded-lg transition duration-200">
              Login
            </button>
          </SignInButton>
          <SignUpButton 
            mode="modal"
            afterSignUpUrl="/dashboard"
            appearance={{
              elements: {
                formButtonPrimary: "bg-white hover:bg-gray-100 text-gray-900",
                formFieldInput: "h-11 px-4 bg-[#1A1A1A] text-white rounded-xl border border-[#2D2D2D]",
                card: "bg-[#1A1A1A] shadow-none p-8 rounded-xl",
                header: "hidden",
                footer: "hidden",
                dividerRow: "hidden",
                socialButtons: "hidden"
              }
            }}
          >
            <button className="bg-white hover:bg-gray-100 text-gray-900 px-4 py-2 rounded-lg transition duration-200 font-medium shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
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
              userButtonPopoverCard: "bg-[#1A1A1A] backdrop-blur-sm border border-[#2D2D2D] rounded-lg w-52 p-1",
              userButtonPopoverActionButton: "hover:bg-[#2A2A2A] text-gray-300 hover:text-white rounded-md px-2 py-1.5",
              userButtonPopoverActionButtonText: "text-sm",
              userPreviewMainIdentifier: "text-sm text-gray-300 truncate max-w-[160px]",
              userButtonPopoverActionButtonIcon: "hidden",
              userButtonPopoverFooter: "hidden",
            }
          }}
        />
      )}
    </nav>
  );
}
