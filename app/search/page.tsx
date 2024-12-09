'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { SearchOutput } from '@/components/search/search-output';
import { FilterForm } from "@/components/filter-form";
import { SearchDivider } from '@/components/search/search-divider';
import { ChatMessage, CarSpecs } from '@/types/search';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';

const generateCleanId = () => uuidv4().replace(/-/g, '');

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const [sessionId] = useState(() => generateCleanId());
  const [tempUserId] = useState(() => generateCleanId());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const aiAnalysisRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (container: HTMLDivElement | null) => {
    if (container) {
      (container as HTMLDivElement).scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleSearch = async (filters: CarSpecs) => {
    setIsLoading(true);
    let searchResults = null;

    try {
      // Create a new message for this search with loading state
      const newMessage: ChatMessage = {
        id: generateCleanId(),
        role: 'user',
        content: 'Search initiated',
        timestamp: Date.now(),
        userId: user?.id || tempUserId,
        sessionId,
        carSpecs: filters,
        isLoading: true,
        response: {
          type: 'car_listing',
          message: '',
          results: [],
          loading: true
        }
      };

      // Add the new message to the list
      setMessages(prev => [...prev, newMessage]);

      // Scroll to show the loading state
      setTimeout(() => scrollToBottom(searchResultsRef.current), 100);

      // Build Supabase query based on car specs
      let query = supabase
        .from('car_list')
        .select('*');  // Start with selecting all columns for debugging

      console.log('Initial query built');

      // Debug log the filters
      console.log('Raw filters received:', filters);

      if (filters) {
        // Add filters based on carSpecs
        if (filters.make && filters.make !== 'all') {
          console.log('Adding make filter:', filters.make);
          query = query.ilike('make', `%${filters.make}%`);
        }
        if (filters.model && filters.model !== 'all') {
          console.log('Adding model filter:', filters.model);
          query = query.ilike('model', `%${filters.model}%`);
        }
        if (filters.location && filters.location !== 'all') {
          console.log('Adding location filter:', filters.location);
          query = query.ilike('location', `%${filters.location}%`);
        }
        if (filters.minYear) {
          const minYear = parseInt(filters.minYear);
          if (!isNaN(minYear)) {
            console.log('Adding minYear filter:', minYear);
            query = query.gte('year', minYear);
          }
        }
        if (filters.maxYear) {
          const maxYear = parseInt(filters.maxYear);
          if (!isNaN(maxYear)) {
            console.log('Adding maxYear filter:', maxYear);
            query = query.lte('year', maxYear);
          }
        }
        if (filters.minPrice) {
          const minPrice = parseFloat(filters.minPrice);
          if (!isNaN(minPrice)) {
            console.log('Adding minPrice filter:', minPrice);
            query = query.gte('price', minPrice);
          }
        }
        if (filters.maxPrice) {
          const maxPrice = parseFloat(filters.maxPrice);
          if (!isNaN(maxPrice)) {
            console.log('Adding maxPrice filter:', maxPrice);
            query = query.lte('price', maxPrice);
          }
        }
      }

      // Execute query
      console.log('Executing Supabase query...');
      const { data: cars, error: supabaseError } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (supabaseError) {
        console.error('Supabase query error:', {
          message: supabaseError.message,
          details: supabaseError.details,
          hint: supabaseError.hint,
          code: supabaseError.code
        });
        throw new Error(`Supabase query failed: ${supabaseError.message}`);
      }

      // Debug log the results
      console.log('Query results:', {
        count: cars?.length || 0,
        firstResult: cars?.[0],
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      });

      searchResults = cars;

      // Update the message with the response
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? {
              ...msg,
              response: {
                type: 'car_listing',
                message: `Found ${cars?.length || 0} matching vehicles`,
                results: cars || [],
                loading: false
              },
              isLoading: false
            }
          : msg
      ));

      try {
        // Trigger AI analysis
        console.log('Sending AI analysis request with data:', {
          sessionId,
          resultsCount: cars?.length,
          userId: user?.id || tempUserId,
          filters
        });

        const aiResponse = await fetch('https://n8n.yotor.co/webhook/invoke_agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AGENT_TOKEN}`,
            'X-Session-ID': sessionId
          },
          body: JSON.stringify({
            sessionId,
            searchResults: cars,
            userId: user?.id || tempUserId,
            timestamp: Date.now(),
            carSpecs: filters,
            token: process.env.NEXT_PUBLIC_AGENT_TOKEN
          }),
        });

        if (!aiResponse.ok) {
          console.error('AI analysis failed:', {
            status: aiResponse.status,
            statusText: aiResponse.statusText,
            url: aiResponse.url,
            token: process.env.NEXT_PUBLIC_AGENT_TOKEN ? 'Present' : 'Missing'
          });
          
          // Add a message to inform the user
          setMessages(prev => prev.map(msg => 
            msg.id === newMessage.id 
              ? {
                  ...msg,
                  content: `Found ${cars?.length || 0} matching vehicles. AI analysis is currently unavailable.`
                }
              : msg
          ));
          return;
        }

        const aiData = await aiResponse.json();
        console.log('AI analysis response:', aiData);

        // Update the message with AI analysis
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id 
            ? {
                ...msg,
                content: aiData.content || `Found ${cars?.length || 0} matching vehicles`
              }
            : msg
        ));
      } catch (aiError) {
        console.error('AI analysis error:', aiError);
        // Don't throw the error, just log it
      }

    } catch (error) {
      console.error('Search failed:', error);
      // Handle error state
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? {
              ...msg,
              content: 'Search failed. Please try again.',
              response: {
                type: 'car_listing',
                message: 'Search failed',
                results: [],
                loading: false
              },
              isLoading: false
            }
          : msg
      ));
    } finally {
      setIsLoading(false);
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
    <main className="flex min-h-screen flex-col">
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Search Results and Filter */}
        <div className="w-[60%] border-r border-gray-200 flex flex-col relative">
          {/* Search Results */}
          <div 
            ref={searchResultsRef}
            className="flex-1 overflow-y-auto pb-32"
          >
            <div className="container mx-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div key={message.id || index}>
                  {message.response && (
                    <>
                      <SearchDivider 
                        filters={message.carSpecs || {}} 
                        timestamp={message.timestamp}
                      />
                      <SearchOutput message={message} />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Search Filter Form - Floating at Bottom */}
          <div className="absolute bottom-4 left-0 right-0 mx-4">
            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg shadow-sm">
              <FilterForm onSubmit={handleSearch} isLoading={isLoading} />
            </div>
          </div>
        </div>

        {/* Right Panel - AI Analysis */}
        <div className="w-[40%] flex flex-col relative">
          <div 
            ref={aiAnalysisRef}
            className="flex-1 overflow-y-auto pb-32"
          >
            <div className="container mx-auto p-4">
              {messages.map((message, index) => (
                message.response?.type === 'car_listing' ? (
                  <div key={`analysis-${index}`} className="space-y-4">
                    {message.response.loading ? (
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#f8f8f8] rounded-lg p-4">
                        <h3 className="font-medium text-[#14162E] mb-2">Analysis</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>• {message.response.message}</p>
                          {message.content && <p>{message.content}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null
              ))}
            </div>
          </div>

          {/* Chat Input - Floating at Bottom */}
          <div className="absolute bottom-4 left-0 right-0 mx-4">
            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg shadow-sm p-4">
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <Input
                  placeholder="Ask about the search results..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
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
    </main>
  );
}
