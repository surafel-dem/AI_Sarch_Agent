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
    <div className="flex h-screen bg-white">
      {/* Left Panel - Search Results */}
      <div className="w-[65%] border-r border-gray-200 relative">
        {/* Side Panel Icons */}
        <div className="fixed left-0 top-0 bottom-0 w-12 flex flex-col items-center py-4 bg-white z-10">
          <div className="space-y-4">
            {/* Your side panel icons here */}
          </div>
        </div>

        <div className="h-screen flex flex-col pl-12"> 
          <div 
            className="flex-grow overflow-y-auto px-6 pt-4"
            style={{ paddingBottom: '120px' }} 
          >
            <SearchOutput 
              message={messages[messages.length - 1] || { isLoading: false }}
            />
          </div>

          {/* Filter Form - Compact one-line style */}
          <div className="sticky bottom-0 left-0 w-full pl-12">
            <div className="mx-4 mb-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[0_0_24px_rgba(0,0,0,0.05)] border border-gray-100">
                <div className="py-2.5 px-4">
                  <div className="flex items-center gap-3 max-w-full overflow-x-auto no-scrollbar">
                    <FilterForm onSearch={handleSearch} isLoading={isLoading} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - AI Analysis */}
      <div className="w-[35%]">
        <div className="h-screen flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">AI Assistant</h2>
            <p className="text-sm text-gray-600">Ask questions about the search results</p>
          </div>
          
          <div 
            ref={chatRef}
            className="flex-grow overflow-y-auto px-6 py-4 space-y-6"
            style={{ paddingBottom: '120px' }} 
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

          {/* Chat Input - Claude style */}
          <div className="sticky bottom-0 w-full">
            <div className="mx-4 mb-4 bg-white rounded-2xl shadow-[0_0_24px_rgba(0,0,0,0.05)] border border-gray-100">
              <form onSubmit={(e) => { e.preventDefault(); }} className="flex items-center gap-2 py-3 px-4">
                <Input
                  placeholder="Ask me anything about these cars..."
                  value=""
                  onChange={(e) => {}}
                  className="flex-1 bg-transparent border-0 focus:ring-0 focus:border-0 px-0 h-10 text-base outline-none focus:outline-none"
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2 text-sm font-medium transition-colors"
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
