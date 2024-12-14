'use client';

import { AIAssistant } from "@/components/ai-assistant"
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { SearchForm } from "@/components/search-form";
import Image from 'next/image';
import { QuickLinks } from "@/components/quick-links";

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
    <main className="flex-1 pt-16">
      {/* Hero Section */}
      <div className="relative px-6 lg:px-8">
        <div className="mx-auto max-w-4xl py-12">
          <div className="text-center">
            <h1 className="text-[3.5rem] font-bold tracking-tight leading-tight">
              <span className="bg-gradient-to-b from-white to-gray-300 text-transparent bg-clip-text">Control Spend With</span>
              <br />
              <span className="bg-gradient-to-b from-gray-300 to-gray-500 text-transparent bg-clip-text">AI Assisted Intake</span>
            </h1>
            <p className="mt-6 text-lg leading-7 text-gray-400 max-w-2xl mx-auto">
              Axe is your AI-powered procurement assistant that streamlines requests through a simple chat interface.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full -mt-4">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <SearchForm />
            <QuickLinks />
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant />
    </main>
  );
}
