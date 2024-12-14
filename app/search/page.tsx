'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { CarSpecs } from '@/types/car';
import { ChatMessage } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { SearchOutput } from '@/components/search/search-output';
import { FilterForm } from "@/components/filter-form";
import { Input } from '@/components/ui/input';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (container: HTMLDivElement | null) => {
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleSearch = async (filters: CarSpecs) => {
    setIsLoading(true);

    try {
      let query = supabase
        .from('car_list')
        .select('*');

      // Apply filters
      if (filters.make?.trim()) {
        query = query.ilike('make', `%${filters.make.trim()}%`);
      }
      
      if (filters.model?.trim()) {
        query = query.ilike('model', `%${filters.model.trim()}%`);
      }
      
      if (filters.minYear) {
        query = query.gte('year', filters.minYear);
      }
      if (filters.maxYear) {
        query = query.lte('year', filters.maxYear);
      }
      
      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      // Execute query
      const { data: cars, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      const newMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: `Found ${cars?.length || 0} matching vehicles`,
        timestamp: Date.now(),
        response: {
          type: 'car_listing',
          message: '',
          results: cars || [],
          loading: false
        }
      };

      setMessages([newMessage]);

    } catch (error) {
      console.error('Search failed:', error);
      
      setMessages([{
        id: uuidv4(),
        role: 'system',
        content: 'Search failed. Please try again.',
        timestamp: Date.now(),
        response: {
          type: 'car_listing',
          message: 'Error occurred',
          results: [],
          loading: false
        }
      }]);
    } finally {
      setIsLoading(false);
      scrollToBottom(searchResultsRef.current);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle chat input submission
  };

  // Run initial search from URL params if present
  useEffect(() => {
    const selections = searchParams.get('selections') 
      ? JSON.parse(searchParams.get('selections')!) 
      : {};

    if (Object.keys(selections).length > 0) {
      handleSearch(selections);
    }
  }, []);

  return (
    <div className="flex h-screen">
      {/* Left Panel - Search Results */}
      <div className="w-1/2 relative">
        <div className="h-screen flex flex-col relative">
          <div 
            ref={searchResultsRef}
            className="flex-grow overflow-y-auto px-4 py-4 pl-16"
            style={{ paddingBottom: '180px' }}
          >
            {messages.map((message) => (
              <div key={message.id} className="mb-4">
                <SearchOutput message={message} />
              </div>
            ))}
          </div>

          {/* Fixed Filter Form at Bottom */}
          <div className="fixed bottom-4 left-0 w-[50%] px-4 z-10">
            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg shadow-lg p-4">
              <FilterForm onSearch={handleSearch} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - AI Analysis */}
      <div className="w-1/2 border-l relative">
        <div className="h-screen flex flex-col relative">
          <div 
            ref={chatRef}
            className="flex-grow overflow-y-auto px-4 py-4"
            style={{ paddingBottom: '100px' }}
          >
            {messages.map((message) => (
              <div key={message.id} className="mb-4">
                {message.response?.aiResponse && (
                  <div className="bg-white rounded-lg shadow p-4">
                    {message.response.aiResponse}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Fixed Chat Input at Bottom */}
          <div className="fixed bottom-4 right-0 w-[50%] px-4 z-10">
            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg shadow-lg p-4">
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <Input
                  placeholder="Ask about the search results..."
                  value=""
                  onChange={(e) => {}}
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={isLoading}>
                  Send
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
