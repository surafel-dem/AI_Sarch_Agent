'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { CarSpecs } from '@/types/search';
import { ChatMessage } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { SearchOutput } from '@/components/search/search-output';
import { FilterForm } from "@/components/filter-form";
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';

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
    const searchId = uuidv4();
    console.log('Frontend: Starting search with filters:', filters);

    try {
      console.log('Frontend: Sending search request to API...');
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          filters,
          searchId 
        }),
      });

      console.log('Frontend: Received response with status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Frontend: Search failed with error:', errorData);
        throw new Error(errorData.error || 'Search failed');
      }

      const data = await response.json();
      console.log('Frontend: Received search results:', data);

      const newMessage: ChatMessage = {
        id: searchId,
        role: 'assistant',
        content: data.message || `Found ${data.results?.length || 0} matching vehicles`,
        timestamp: Date.now(),
        response: {
          type: 'car_listing',
          message: data.message || '',
          results: data.results || [],
          loading: false,
          aiResponse: data.agentResponse
        }
      };

      console.log('Frontend: Updating messages with search results');
      setMessages([newMessage]);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Frontend: Search failed:', errorMessage);
      
      setMessages([{
        id: searchId,
        role: 'system',
        content: 'Search failed. Please try again.',
        timestamp: Date.now(),
        response: {
          type: 'car_listing',
          message: errorMessage,
          results: [],
          loading: false
        }
      }]);
    } finally {
      console.log('Frontend: Search completed');
      setIsLoading(false);
      scrollToBottom(searchResultsRef.current);
    }
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
                {message.response?.aiResponse ? (
                  <div className="bg-white rounded-lg shadow p-4">
                    {message.response.aiResponse.error ? (
                      <div className="text-red-500">
                        {message.response.aiResponse.error}
                      </div>
                    ) : (
                      <div className="prose">
                        <ReactMarkdown>
                          {typeof message.response.aiResponse === 'string' 
                            ? message.response.aiResponse 
                            : typeof message.response.aiResponse.content === 'string'
                              ? message.response.aiResponse.content
                              : JSON.stringify(message.response.aiResponse, null, 2)}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                ) : message.response?.loading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {/* Fixed Chat Input at Bottom */}
          <div className="fixed bottom-4 right-0 w-[50%] px-4 z-10">
            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg shadow-lg p-4">
              <form onSubmit={(e) => { e.preventDefault(); }} className="flex gap-2">
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
