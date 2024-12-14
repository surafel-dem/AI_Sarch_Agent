'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { CarSpecs } from '@/types/search';
import { ChatMessage } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { SearchOutput } from '@/components/search/search-output';
import { FilterForm } from "@/components/filter-form";
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import { AgentResponse } from '@/components/chat/agent-response';

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
        <div className="h-screen flex flex-col">
          <div 
            className="flex-grow overflow-y-auto"
            style={{ paddingBottom: '120px' }} 
          >
            <SearchOutput 
              message={messages[messages.length - 1] || { isLoading: false }}
            />
          </div>

          {/* Sticky Filter Form */}
          <div className="fixed bottom-0 left-0 w-[50%] border-t bg-white/80 backdrop-blur-sm">
            <div className="p-3 max-w-[95%] mx-auto">
              <FilterForm onSearch={handleSearch} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - AI Analysis */}
      <div className="w-1/2 border-l relative bg-gray-50">
        <div className="h-screen flex flex-col relative">
          <div className="px-4 py-3 border-b bg-white">
            <h2 className="text-lg font-semibold text-gray-700">AI Assistant</h2>
            <p className="text-sm text-gray-500">Ask questions about the search results</p>
          </div>
          
          <div 
            ref={chatRef}
            className="flex-grow overflow-y-auto px-4 py-4 space-y-6"
            style={{ paddingBottom: '100px' }}
          >
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                {message.response?.aiResponse && (
                  <AgentResponse 
                    response={message.response.aiResponse}
                    isLoading={message.response.loading}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Fixed Chat Input at Bottom */}
          <div className="fixed bottom-4 right-0 w-[50%] px-4 z-10">
            <div className="bg-white border rounded-lg shadow-lg p-4">
              <form onSubmit={(e) => { e.preventDefault(); }} className="flex gap-2">
                <Input
                  placeholder="Ask me anything about these cars..."
                  value=""
                  onChange={(e) => {}}
                  className="flex-1 bg-transparent"
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
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
