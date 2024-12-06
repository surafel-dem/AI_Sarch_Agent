'use client';

import { AIAssistant } from "@/components/ai-assistant"
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { SearchForm } from "@/components/search-form";
import Image from 'next/image';

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

  const handleSuggestionClick = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#f5f3ff] via-[#ede9fe] to-[#f5f3ff]">
      {/* Subtle mesh gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />

      {/* Animated floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Glowing orbs */}
        <div className="absolute left-1/4 top-1/4 w-64 h-64">
          <div className="absolute inset-0 bg-[#818cf8] rounded-full blur-3xl opacity-[0.15] animate-pulse-slower" />
        </div>
        <div className="absolute right-1/4 bottom-1/3 w-96 h-96">
          <div className="absolute inset-0 bg-[#c7d2fe] rounded-full blur-3xl opacity-[0.15] animate-pulse-slow" />
        </div>
        
        {/* Subtle geometric shapes */}
        <div className="absolute left-1/3 top-1/2 w-24 h-24 border border-indigo-200/30 rounded-xl transform rotate-12 animate-float-slow" />
        <div className="absolute right-1/3 top-1/4 w-32 h-32 border border-purple-200/30 rounded-xl transform -rotate-12 animate-float-slower" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        <div className="container mx-auto px-4">
          <SearchForm />
          
          {/* Suggestions */}
          <div className="mt-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.text}
                  onClick={() => handleSuggestionClick(suggestion.query)}
                  className="p-4 text-left bg-white/70 hover:bg-white/90 rounded-xl text-gray-600 text-sm transition-all duration-200 border border-indigo-50 shadow-sm hover:shadow-md backdrop-blur-sm"
                >
                  {suggestion.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-6 right-6">
        <AIAssistant />
      </div>
    </main>
  );
}
