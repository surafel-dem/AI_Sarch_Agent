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
    const sessionId = uuidv4();
    const params = new URLSearchParams({
      sessionId,
      chatInput: query
    });
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative h-screen">
        <div className="absolute inset-0">
          <Image
            src="/images/hero/hero-bg.jpg"
            alt="Car Search Hero"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 to-gray-900/40" />
        </div>
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6 text-white">
          <h1 className="text-6xl font-bold mb-6">
            Find Your Perfect Car
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mb-12">
            Tell us what you're looking for and our AI will help you find the ideal car that matches your needs
          </p>
          <div className="w-full max-w-2xl">
            <SearchForm />
          </div>
        </div>
      </div>

      {/* Suggestions Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion.query)}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all text-left"
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {suggestion.text}
              </h3>
            </button>
          ))}
        </div>
      </div>

      <div className="fixed bottom-6 right-6">
        <AIAssistant />
      </div>
    </div>
  );
}
