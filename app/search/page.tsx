'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchOutput } from '@/components/search/search-output';
import { CarSpecs } from '@/types/search';
import { ChatMessage } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { FilterForm } from "@/components/filter-form";
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import { AgentResponse } from '@/components/chat/agent-response';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState('');

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Handle send message logic here
    }
  };

  // Run initial search from URL params if present
  useEffect(() => {
    const selections = searchParams.get('selections') 
      ? JSON.parse(searchParams.get('selections')!) 
      : {};

    if (Object.keys(selections).length > 0) {
      handleSearch(selections);
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] relative">
      <div className="absolute inset-0">
        <div className="absolute top-[5%] -left-[20%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] -right-[20%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px]" />
      </div>
      
      <div className="relative">
        <div className="flex h-screen bg-white">
          {/* Left Panel - Search Results */}
          <div className="w-[65%] border-r border-gray-200 relative">
            <div className="h-screen flex flex-col pt-6"> 
              {/* Search Results Area */}
              <div 
                ref={searchResultsRef}
                className="flex-grow overflow-y-auto pl-16 pr-6"
                style={{ paddingBottom: '120px' }} 
              >
                <SearchOutput 
                  message={messages[messages.length - 1] || { isLoading: true }}
                  loading={isLoading}
                />
              </div>

              {/* Filter Form - Fixed at bottom */}
              <div className="sticky bottom-0 left-0 w-full pl-16">
                <div className="mx-4 mb-4">
                  <div className="bg-white border-t border-gray-200 shadow-sm">
                    <div className="py-2.5 px-4">
                      <div className="flex items-center gap-2 max-w-full overflow-x-auto no-scrollbar">
                        <FilterForm onSearch={handleSearch} isLoading={isLoading} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - AI Assistant */}
          <div className="w-[35%] relative">
            <div className="h-screen flex flex-col pt-6 px-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">AI Assistant</h2>
                <p className="text-sm text-gray-600">Ask questions about the search results</p>
              </div>
              
              <div 
                ref={chatRef}
                className="flex-grow overflow-y-auto"
                style={{ paddingBottom: '120px' }} 
              >
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    {message.response?.aiResponse && (
                      <AgentResponse response={message.response.aiResponse} />
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="sticky bottom-0 w-full bg-white border-t border-gray-100 p-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about the search results..."
                    className="w-full px-4 py-3 text-sm bg-transparent border-none focus:ring-0 resize-none"
                    rows={1}
                    style={{
                      minHeight: '44px',
                      maxHeight: '44px'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
