import { SignIn } from "@clerk/nextjs";
import { clerkConfig } from "@/lib/clerk-config";
import { X } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/* Close button */}
      <Link 
        href="/" 
        className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center bg-[#111111] rounded-full text-gray-400 hover:text-gray-300 border border-gray-800"
      >
        <X className="w-4 h-4" />
      </Link>

      <div className="w-full max-w-md">
        <SignIn 
          {...clerkConfig}
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          afterSignInUrl="/"
        />
      </div>
    </div>
  );
}
