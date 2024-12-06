'use client';

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

export function Navbar() {
  const { isSignedIn } = useUser();

  return (
    <nav className="fixed top-4 right-4 z-50">
      {!isSignedIn ? (
        <SignInButton mode="modal">
          <button className="bg-white/5 hover:bg-white/10 backdrop-blur-sm text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg border border-white/10 transition duration-200">
            Sign in
          </button>
        </SignInButton>
      ) : (
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
              userButtonPopoverCard: "bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg w-52 p-1",
              userButtonPopoverActionButton: "hover:bg-white/10 text-muted-foreground hover:text-foreground rounded-md px-2 py-1.5",
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
