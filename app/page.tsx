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
            <h1 className="text-[2.75rem] font-bold tracking-tight leading-tight">
              <span className="[color:rgb(17,24,39)]">Find Your Best Car </span>
              <br />
              <span className="text-[#2563EB]">With AI Search Assistant</span>
            </h1>
            <p className="mt-4 text-lg leading-7 text-[#6B7280] max-w-3xl mx-auto">
              Let Agents support your search and get the right car for you.
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

      <div className="fixed bottom-6 right-6">
        <AIAssistant />
      </div>
    </main>
  );
}
