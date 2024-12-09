'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { CarSpecs } from '@/types/car';
import { ChatMessage } from '@/types/chat';
import { generateCleanId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SearchOutput } from '@/components/search/search-output';
import { FilterForm } from "@/components/filter-form";
import { SearchDivider } from '@/components/search/search-divider';
import { Input } from '@/components/ui/input';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const [sessionId] = useState(generateCleanId);  // Use function reference
  const [tempUserId] = useState(generateCleanId); // Use function reference
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const aiAnalysisRef = useRef<HTMLDivElement>(null);

  // Helper function to get user identifier
  const getUserIdentifier = () => {
    console.log('Current user:', user);
    console.log('User ID:', user?.id);
    console.log('User email:', user?.emailAddresses?.[0]?.emailAddress);

    if (user?.id) {
      const userInfo = {
        clerk_id: user.id,
        user_type: 'authenticated' as const,
        email: user.emailAddresses?.[0]?.emailAddress
      };
      console.log('Returning user info:', userInfo);
      return userInfo;
    }
    
    const anonymousInfo = {
      clerk_id: tempUserId,
      user_type: 'anonymous' as const,
      email: null
    };
    console.log('Returning anonymous info:', anonymousInfo);
    return anonymousInfo;
  };

  useEffect(() => {
    const updateAuth = async () => {
      if (user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          try {
            await supabase.auth.setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token || ''
            });
            console.log('Auth session updated');
          } catch (error) {
            console.error('Failed to set auth session:', error);
          }
        }
      }
    };
    
    updateAuth();
  }, [user]);

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
    let searchSessionId = null;

    try {
      console.log('Starting search with filters:', filters);

      // Get user identifier
      const userInfo = getUserIdentifier();
      console.log('Search initiated by:', userInfo);

      // Build the query for car search
      let query = supabase
        .from('car_list')
        .select('*');

      // Apply filters
      if (filters.make) {
        query = query.ilike('make', `%${filters.make}%`);
      }
      if (filters.model) {
        query = query.ilike('model', `%${filters.model}%`);
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
        console.error('Query error:', queryError);
        throw queryError;
      }

      console.log('Query results:', {
        count: cars?.length || 0,
        firstResult: cars?.[0],
        filters
      });

      // Create initial search session
      const initialSession = {
        clerk_id: userInfo.clerk_id,
        user_type: userInfo.user_type,
        user_email: userInfo.email,
        search_params: filters,
        status: 'completed',
        total_results: cars?.length || 0,
        results: cars || [],
        ai_insights: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Create search session - for anonymous users or when user exists
      const { data: sessionData, error: sessionError } = await supabase
        .from('search_sessions')
        .insert([initialSession])
        .select()
        .single();

      if (sessionError) {
        console.error('Session creation error:', sessionError);
        // If the error is about the user not existing, we can ignore it for anonymous users
        if (userInfo.user_type === 'anonymous' || sessionError.code !== '23503') {
          throw sessionError;
        }
      } else {
        searchSessionId = sessionData.session_id;
        console.log('Search session created:', { 
          session_id: searchSessionId,
          user_type: userInfo.user_type,
          clerk_id: userInfo.clerk_id
        });
      }

      // Create and add message
      const newMessage: ChatMessage = {
        id: generateCleanId(),
        role: 'user',
        content: `Found ${cars?.length || 0} matching vehicles`,
        timestamp: Date.now(),
        userId: userInfo.clerk_id,
        sessionId: searchSessionId,
        carSpecs: filters,
        isLoading: false,
        response: {
          type: 'car_listing',
          message: '',
          results: cars || [],
          loading: false
        }
      };

      setMessages(prev => [...prev, newMessage]);
      searchResults = cars;

    } catch (error) {
      console.error('Search failed:', error);
      const userInfo = getUserIdentifier();
      
      setMessages(prev => [
        ...prev,
        {
          id: generateCleanId(),
          role: 'system',
          content: 'Search failed. Please try again.',
          timestamp: Date.now(),
          userId: userInfo.clerk_id,
          sessionId: null,
          carSpecs: filters,
          isLoading: false,
          response: {
            type: 'car_listing',
            message: 'Error occurred',
            results: [],
            loading: false
          }
        }
      ]);
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
    <div className="flex h-screen">
      {/* Left Panel - Search Results */}
      <div className="w-1/2 relative">
        <div className="h-screen flex flex-col relative">
          {/* Scrollable Results */}
          <div 
            ref={searchResultsRef}
            className="flex-grow overflow-y-auto px-4 py-4"
            style={{ paddingBottom: '180px' }} // Space for the filter form
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
            ref={aiAnalysisRef}
            className="flex-grow overflow-y-auto px-4 py-4"
            style={{ paddingBottom: '100px' }} // Space for the chat input
          >
            {messages.map((message) => (
              <div key={message.id} className="mb-4">
                {message.response?.aiResponse && (
                  <div className="bg-white rounded-lg shadow p-4">
                    {/* <ReactMarkdown>
                      {message.response.aiResponse}
                    </ReactMarkdown> */}
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
