'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchOutput } from '@/components/search/search-output';
import { CarSpecs } from '@/types/search';
import { ChatMessage } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { FilterForm } from '@/components/filter-form';
import ReactMarkdown from 'react-markdown';
import { AgentResponse } from '@/components/chat/agent-response';
import { AgentService } from '@/lib/services/agent';
import { Sidebar } from '@/components/sidebar';
import { Input } from '@/components/ui/input';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<CarSpecs>({
    location: '',
    make: '',
    model: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
  });
  const [searchRequestId, setSearchRequestId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState('');

  // Scroll to the latest message smoothly
  const scrollToLatestMessage = (container: HTMLElement | null) => {
    if (!container) return;
    
    // Get all message elements
    const messages = container.querySelectorAll('[data-message]');
    if (messages.length === 0) return;
    
    // Get the latest message
    const latestMessage = messages[messages.length - 1];
    
    // Scroll to the latest message with smooth behavior
    latestMessage.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start'
    });
  };

  useEffect(() => {
    console.log('SearchPage: useEffect triggered');
    const selections = searchParams.get('selections') 
      ? JSON.parse(searchParams.get('selections')!) 
      : {};

    console.log('SearchPage: URL selections:', selections);

    if (Object.keys(selections).length > 0) {
      console.log('SearchPage: Initiating search from URL params');
      handleSearch(selections);
    } else {
      console.log('SearchPage: No selections in URL, skipping initial search');
      setIsLoading(false);
    }
  }, []);

  const handleSessionSelect = async (sessionId: string) => {
    if (!sessionId) return;
    
    setCurrentSessionId(sessionId);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/sessions/${sessionId}/messages`);
      if (response.ok) {
        const messages = await response.json();
        setChatMessages(messages);
        
        // If there are search results in the last message, display them
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.response?.type === 'car_listing') {
          setSearchResults([lastMessage]);
        }
      } else {
        console.error('Failed to fetch session messages:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching session messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (filters: CarSpecs) => {
    setIsLoading(true);
    setCurrentFilters(filters);
    const searchId = uuidv4();

    try {
      // Create a new session first
      const sessionResponse = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `Search for ${filters.make || 'cars'}`,
          filters 
        })
      });

      if (sessionResponse.ok) {
        const { id: sessionId } = await sessionResponse.json();
        setCurrentSessionId(sessionId);
      }

      // Update URL with new filters
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          searchParams.append(key, value.toString());
        }
      });
      window.history.replaceState({}, '', `${window.location.pathname}?${searchParams.toString()}`);

      try {
        console.log('SearchPage: Making API request with searchId:', searchId);
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

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        console.log('SearchPage: Received API response for searchId:', searchId, data);

        const agentMessage = data.agentResponse?.output || 
                           data.agentResponse?.message || 
                           (typeof data.agentResponse === 'string' ? data.agentResponse : '');
        
        console.log('SearchPage: Creating new message with agentMessage:', agentMessage);

        const newMessage: ChatMessage = {
          id: searchId,
          role: 'assistant',
          content: agentMessage,
          timestamp: Date.now(),
          response: {
            type: 'car_listing',
            message: agentMessage,
            results: data.results || [],
            loading: false,
            aiResponse: data.agentResponse
          }
        };

        console.log('SearchPage: Updating state with new message');
        setSearchResults([newMessage]);
        setChatMessages(prev => {
          // Only add the message if it's not already in the chat
          if (prev.some(msg => msg.id === searchId)) {
            console.log('SearchPage: Message already exists in chat, skipping');
            return prev;
          }
          return [...prev, newMessage];
        });
        
        setTimeout(() => {
          console.log('SearchPage: Scrolling to latest message');
          scrollToLatestMessage(chatRef.current);
        }, 100);
        
      } catch (error) {
        console.error('SearchPage: Search failed:', error);
        return;
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
      e.preventDefault();
      
      const messageId = uuidv4();
      const userMessage = inputValue.trim();
      setInputValue('');

      // Get current search context
      const currentFilters = searchParams.get('selections') 
        ? JSON.parse(searchParams.get('selections')!)
        : {};
      const currentResults = searchResults[0]?.response?.results || [];
      const lastSearchMessage = searchResults[0]?.content || '';

      // Add user message to chat
      const newUserMessage: ChatMessage = {
        id: messageId,
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
        response: {
          type: 'text',
          message: userMessage,
          loading: true
        }
      };
      
      setChatMessages(prev => [...prev, newUserMessage]);
      // Scroll to user message
      setTimeout(() => {
        scrollToLatestMessage(chatRef.current);
      }, 100);

      try {
        const agentService = AgentService.getInstance();
        const response = await agentService.invoke(
          messageId,
          currentFilters,
          currentResults,
          userMessage,
          lastSearchMessage
        );

        // Parse the response message ensuring we get a string
        const responseMessage = Array.isArray(response) 
          ? response[0].output 
          : (response.output || response.message || 
             (typeof response === 'string' ? response : ''));

        // Add assistant response to chat
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: responseMessage,
          timestamp: Date.now(),
          response: {
            type: 'text',
            message: responseMessage,
            loading: false,
            aiResponse: response
          }
        };

        setChatMessages(prev => [...prev, assistantMessage]);
        // Scroll to AI response
        setTimeout(() => {
          scrollToLatestMessage(chatRef.current);
        }, 100);
      } catch (error) {
        console.error('Error sending message:', error);
        return;
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] relative">
      <div className="absolute inset-0">
        <div className="absolute top-[5%] -left-[20%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] -right-[20%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px]" />
      </div>
      
      <div className="flex h-screen bg-white">
        {/* Left Panel - Search Results */}
        <div className="w-[65%] relative">
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute top-4 left-4 flex items-center space-x-1">
              <div className="text-sm text-gray-500">
                Searching
                <span className="inline-flex ml-1">
                  <span className="animate-[bounce_1.4s_infinite] [animation-delay:-0.32s]">.</span>
                  <span className="animate-[bounce_1.4s_infinite] [animation-delay:-0.16s]">.</span>
                  <span className="animate-[bounce_1.4s_infinite]">.</span>
                </span>
              </div>
            </div>
          )}

          <div className="h-screen overflow-hidden flex flex-col">
            {/* Active Filters Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
              <div className="pl-16 pr-6 py-3">
                <div className="flex flex-wrap gap-2 items-center h-[42px]">
                  {Object.entries(currentFilters)
                    .filter(([_, value]) => value && value !== '')
                    .map(([key, value]) => {
                      let displayText = '';
                      switch(key) {
                        case 'location':
                          displayText = value.charAt(0).toUpperCase() + value.slice(1);
                          break;
                        case 'make':
                          displayText = value.toUpperCase();
                          break;
                        case 'model':
                          displayText = value.charAt(0).toUpperCase() + value.slice(1);
                          break;
                        case 'minPrice':
                          displayText = `From €${Number(value).toLocaleString()}`;
                          break;
                        case 'maxPrice':
                          displayText = `To €${Number(value).toLocaleString()}`;
                          break;
                        case 'minYear':
                          displayText = `${value}+`;
                          break;
                        case 'maxYear':
                          displayText = `Up to ${value}`;
                          break;
                        default:
                          return null;
                      }
                      return (
                        <span 
                          key={key} 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700"
                        >
                          {displayText}
                        </span>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Search Results Area */}
            <div 
              ref={searchResultsRef}
              className="flex-grow overflow-y-auto pl-16 pr-6"
              style={{ paddingBottom: '120px' }} 
            >
              <SearchOutput 
                message={searchResults[searchResults.length - 1] || { isLoading: true }}
                loading={isLoading}
                results={searchResults}
                loadingText="Searching for cars"
                noResultsText="No results found. Try adjusting your search criteria."
                resultsFoundText={(count) => `Found ${count} ${count === 1 ? 'match' : 'matches'}`}
              />
            </div>

            {/* Filter Form - Fixed at bottom */}
            <div className="fixed bottom-0 left-0 w-[65%] bg-white border-t border-gray-100">
              <div className="px-16 py-3">
                <FilterForm onSearch={handleSearch} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - AI Assistant */}
        <div className="w-[35%] relative bg-gray-50">
          <div className="h-screen flex flex-col">
            <div className="px-6 py-3 border-b border-gray-100 bg-white">
              <h2 className="text-lg font-medium text-gray-800">AI Assistant</h2>
              <p className="text-xs text-gray-500">Ask questions about the search results</p>
            </div>
            
            <div 
              ref={chatRef}
              className="flex-grow overflow-y-auto space-y-4 px-4 py-4"
              style={{ paddingBottom: '120px' }} 
            >
              {chatMessages.map((message) => (
                <div key={message.id} data-message>
                  {message.role === 'user' ? (
                    // User message
                    <div className="flex items-start space-x-3 mb-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">U</span>
                      </div>
                      <div className="flex-1 prose prose-xs max-w-none text-gray-600 bg-white rounded-lg py-2">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    // Assistant message
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-600/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-emerald-600">AI</span>
                      </div>
                      <div className="flex-1 prose prose-xs max-w-none text-gray-600 prose-p:mt-0 prose-p:mb-2 last:prose-p:mb-0 prose-headings:font-medium">
                        <ReactMarkdown>
                          {message.response?.aiResponse?.message || message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="sticky bottom-0 w-full bg-gray-50 border-t border-gray-100">
              <div className="max-w-3xl mx-auto p-3">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about the search results..."
                    className="w-full px-3 py-2 text-sm bg-transparent border-none focus:ring-0 focus:outline-none resize-none placeholder-gray-400"
                    rows={1}
                    style={{
                      minHeight: '40px',
                      maxHeight: '40px'
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
