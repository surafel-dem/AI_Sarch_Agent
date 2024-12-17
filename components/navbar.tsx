'use client';

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from 'next/navigation';

export function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const isSearchPage = pathname === '/search';

  const authAppearance = {
    elements: {
      formButtonPrimary: "bg-white hover:bg-gray-100 text-gray-900",
      formFieldInput: "h-11 px-4 bg-[#1A1A1A] text-white rounded-xl border border-[#2D2D2D]",
      card: "bg-[#1A1A1A] shadow-xl p-8 rounded-xl max-w-[400px] w-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
      header: "hidden",
      footer: "hidden",
      dividerRow: "hidden",
      socialButtons: "hidden",
      formFieldLabel: "text-gray-400",
      formFieldLabelRow: "mb-2",
      identityPreviewText: "text-gray-300",
      formFieldInputShowPasswordButton: "text-gray-400",
      footerActionLink: "text-blue-500 hover:text-blue-400",
      alert: "bg-red-500/10 border border-red-500/20 text-red-500",
      alertText: "text-red-500 text-sm",
      modalBackdrop: "!bg-black/50 backdrop-blur-sm",
    }
  };

  return (
    <nav className="fixed top-4 right-4 z-50 flex items-center gap-6">
      {/* Text Menu Items - Hide on search page */}
      {!isSearchPage && (
        <div className="flex items-center gap-6">
          <a href="#" className="text-[#A3A5AC] hover:text-white transition-colors duration-200 text-[15px]">
            About
          </a>
          <a href="#" className="text-[#A3A5AC] hover:text-white transition-colors duration-200 text-[15px]">
            Contact
          </a>
        </div>
      )}

      {/* Auth Buttons Group */}
      {!isLoaded ? (
        <div className="h-10 w-24 animate-pulse bg-white/5 rounded-lg" />
      ) : !isSignedIn ? (
        <div className="flex items-center gap-2">
          <SignInButton mode="modal" appearance={authAppearance}>
            <button className="bg-[#1A1A1A] hover:bg-[#2A2A2A] text-gray-300 hover:text-white px-4 py-2 rounded-lg transition duration-200">
              Login
            </button>
          </SignInButton>
          <SignUpButton 
            mode="modal"
            afterSignUpUrl="/dashboard"
            appearance={authAppearance}
          >
            <button className="bg-white hover:bg-gray-100 text-gray-900 px-4 py-2 rounded-lg transition duration-200 font-medium shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
              Sign up
            </button>
          </SignUpButton>
        </div>
      ) : (
        <div className="relative">
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
                userButtonPopoverCard: "absolute right-0 mt-2 bg-[#1A1A1A] shadow-xl border border-[#2D2D2D] rounded-lg w-48 p-1",
                userButtonPopoverActionButton: "block w-full text-left px-2 py-1.5 text-gray-300 hover:text-white hover:bg-[#2A2A2A] rounded-md transition-colors duration-200",
                userButtonPopoverActionButtonText: "text-sm",
                userPreviewTextContainer: "px-2 py-1.5 border-b border-[#2D2D2D] mb-1",
                userPreviewMainIdentifier: "text-sm text-gray-300 truncate",
                userPreviewSecondaryIdentifier: "text-xs text-gray-500 truncate",
                userButtonPopoverActionButtonIcon: "hidden",
                userButtonPopoverFooter: "mt-1 pt-1 border-t border-[#2D2D2D]",
                userPreviewAvatarContainer: "hidden",
                userPreviewAvatarBox: "hidden",
              }
            }}
          />
        </div>
      )}
    </nav>
  );
}
