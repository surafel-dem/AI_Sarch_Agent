'use client';

import { SignUp } from "@clerk/nextjs";
import { clerkConfig } from "@/lib/clerk-config";
import { X } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <>
      {/* Close button */}
      <Link 
        href="/" 
        className="absolute -right-2 -top-2 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md text-gray-400 hover:text-gray-600 z-50"
      >
        <X className="w-4 h-4" />
      </Link>

      <div>
        <SignUp 
          {...clerkConfig}
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          afterSignUpUrl="/"
          redirectUrl="/"
        />
      </div>
    </>
  );
}
