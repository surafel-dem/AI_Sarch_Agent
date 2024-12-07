'use client';

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

export function Navbar() {
  const { isSignedIn } = useUser();

  return (
    <nav className="fixed top-4 right-4 z-50 bg-purple-100/20 backdrop-blur-sm border border-purple-100/20 rounded-lg">
      {!isSignedIn ? (
        <SignInButton mode="modal">
          <button className="bg-white/5 hover:bg-white/10 backdrop-blur-sm text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg transition duration-200">
            Sign in
          </button>
        </SignInButton>
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
