'use client';

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export function Navbar() {
  const { isSignedIn } = useUser();

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#1e293b]/70 backdrop-blur-lg border-b border-[#334155]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-white font-semibold text-xl">
          <span className="bg-gradient-to-r from-[#3b82f6] to-[#2563eb] bg-clip-text text-transparent">
            Car Sales Agent
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <button className="text-white/80 hover:text-white transition">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-2 rounded-lg transition duration-200">
                  Get Started
                </button>
              </SignUpButton>
            </>
          ) : (
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                  userButtonPopoverCard: "bg-[#1e293b]/70 backdrop-blur-lg border border-[#334155]",
                  userButtonPopoverActionButton: "hover:bg-[#334155] text-white",
                  userButtonPopoverActionButtonText: "text-white",
                }
              }}
            />
          )}
        </div>
      </div>
    </nav>
  );
}
