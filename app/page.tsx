'use client';

import { AIAssistant } from "@/components/ai-assistant"
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { SearchForm } from "@/components/search-form";
import Image from 'next/image';
import { QuickLinks } from "@/components/quick-links";
import { useAuth } from "@clerk/nextjs";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

const suggestions = [
  { text: "Popular used cars under €15,000", query: "Popular used cars under €15,000" },
  { text: "Best family SUVs", query: "Best family SUVs" },
  { text: "Electric vehicles in Ireland", query: "Electric vehicles in Ireland" },
  { text: "Top-rated dealerships", query: "Top-rated dealerships" },
  { text: "Latest car reviews", query: "Latest car reviews" },
  { text: "Car buying guide", query: "Car buying guide" },
];

export default function Home() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const handleSuggestionClick = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <main className="flex-1 pt-16">
      {/* Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-end h-16">
            <div className="flex items-center space-x-8">
              {!isSignedIn && (
                <>
                  <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
                  <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
                </>
              )}
              {!isSignedIn ? (
                <>
                  <SignInButton mode="modal">
                    <button className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors">
                      Sign Up
                    </button>
                  </SignUpButton>
                </>
              ) : (
                <UserButton afterSignOutUrl="/" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Section - Hero + Search + Quick Links */}
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-8 relative">
        {/* Hero Content */}
        <div className="mx-auto max-w-4xl w-full mb-12">
          <div className="text-center">
            <h1 className="text-[3.5rem] font-bold tracking-tight leading-tight">
              <span className="bg-gradient-to-b from-white via-gray-200 to-gray-400 text-transparent bg-clip-text">Find Your Car With</span>
              <br />
              <span className="bg-gradient-to-b from-gray-300 via-gray-500 to-gray-700 text-transparent bg-clip-text">AI Assisted Search</span>
            </h1>
            <p className="mt-6 text-base leading-7 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400 text-transparent bg-clip-text max-w-2xl mx-auto">
              Your AI-powered car finder that helps you discover the perfect vehicle through a simple and intuitive interface.
            </p>
          </div>
        </div>

        {/* Search Form and Quick Links */}
        <div className="w-full max-w-4xl mx-auto">
          <SearchForm />
          <div className="mt-8">
            <QuickLinks />
          </div>
        </div>
      </div>

      {/* About and Contact sections - Only show for non-logged in users */}
      {!isSignedIn && (
        <>
          {/* Gradient Divider */}
          <div className="w-full flex justify-center px-6 lg:px-8">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>

          {/* About Section */}
          <section id="about" className="min-h-screen flex flex-col justify-center items-center px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-8">Our Story</h2>
            <div className="prose prose-lg prose-invert max-w-xl mx-auto text-center">
              <p className="text-gray-300 text-lg leading-relaxed">
                Axe started as an <span className="text-white">open source</span> project in 2023. 
                We were <span className="text-white">frustrated</span> by how difficult it was to manage
                <span className="text-white"> procurement requests</span> that <span className="text-white">worked well</span> across the organization.
              </p>
              <p className="text-gray-300 mt-6 text-lg leading-relaxed">
                As we started to dig deeper, <span className="text-white">it became clear</span> that this
                was just the tip of the iceberg. We realized that managing spend that <span className="text-white">reach the business goals</span> was 
                the biggest pain point, so we started to <span className="text-white">explore something new</span>.
              </p>
              <p className="text-gray-300 mt-6 text-lg leading-relaxed">
                In 2024, we launched an entire procurement management
                platform and joined <span className="text-white">Y Combinator's</span> winter batch.
                We're creating something special here, and we're excited to build it with you.
              </p>
            </div>
          </section>
          
          {/* Gradient Divider */}
          <div className="w-full flex justify-center px-6 lg:px-8">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
          
          {/* Contact Section */}
          <section id="contact" className="min-h-screen flex flex-col justify-center items-center">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-8">Get in touch</h2>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 w-full max-w-2xl">
              <form className="mt-12 space-y-6 text-left">
                <div className="space-y-2">
                  <label className="block text-gray-400 text-sm">Email address</label>
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-gray-400 text-sm">How can we help?</label>
                  <textarea 
                    rows={4}
                    placeholder="I'd like to know how Axe can help me with..."
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-6 w-28 bg-white/10 hover:bg-white/20 text-white rounded-full px-6 py-3 text-sm font-medium transition-colors duration-200"
                >
                  Submit
                </button>
              </form>
            </div>
          </section>
        </>
      )}
      
      {/* AI Assistant */}
      <AIAssistant />
    </main>
  );
}
