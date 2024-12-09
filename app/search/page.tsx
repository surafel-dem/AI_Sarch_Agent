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
      console.log('=== Starting new search ===');
      console.log('Filters received:', JSON.stringify(filters, null, 2));

      // Get user identifier
      const userInfo = getUserIdentifier();
      console.log('User info:', JSON.stringify(userInfo, null, 2));

      // Build the query for car search
      let query = supabase
        .from('car_list')
        .select('*');

      // Apply non-empty filters
      const appliedFilters: Record<string, any> = {};

      if (filters.make && filters.make.trim() !== '') {
        appliedFilters.make = filters.make.trim();
        query = query.ilike('make', `%${appliedFilters.make}%`);
      }
      
      if (filters.model && filters.model.trim() !== '') {
        appliedFilters.model = filters.model.trim();
        query = query.ilike('model', `%${appliedFilters.model}%`);
      }
      
      if (filters.minYear && !isNaN(Number(filters.minYear))) {
        appliedFilters.minYear = Number(filters.minYear);
        query = query.gte('year', appliedFilters.minYear);
      }
      
      if (filters.maxYear && !isNaN(Number(filters.maxYear))) {
        appliedFilters.maxYear = Number(filters.maxYear);
        query = query.lte('year', appliedFilters.maxYear);
      }
      
      if (filters.minPrice && !isNaN(Number(filters.minPrice))) {
        appliedFilters.minPrice = Number(filters.minPrice);
        query = query.gte('price', appliedFilters.minPrice);
      }
      
      if (filters.maxPrice && !isNaN(Number(filters.maxPrice))) {
        appliedFilters.maxPrice = Number(filters.maxPrice);
        query = query.lte('price', appliedFilters.maxPrice);
      }

      console.log('Applied filters:', JSON.stringify(appliedFilters, null, 2));

      // Execute query
      const { data: cars, error: queryError } = await query;

      if (queryError) {
        console.error('Query error:', queryError);
        throw queryError;
      }

      console.log('Query results:', {
        totalResults: cars?.length || 0,
        appliedFilters: Object.keys(appliedFilters),
        results: cars?.map(car => ({
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          price: car.price
        }))
      });

      // Create initial search session
      try {
        const userInfo = getUserIdentifier();
        console.log('User info for session:', userInfo);
        
        // Skip session creation for anonymous users for now
        if (userInfo.user_type === 'anonymous') {
          console.log('Skipping session creation for anonymous user');
          searchResults = cars;
          return;
        }

        // Prepare session data with proper typing
        const sessionData = {
          id: crypto.randomUUID(), // Add an id field
          clerk_id: userInfo.clerk_id,
          filters: appliedFilters || {},
          results_count: cars?.length || 0,
          created_at: new Date().toISOString(),
          status: 'completed' as const // Add status field
        };

        console.log('Creating search session with data:', JSON.stringify(sessionData, null, 2));

        // Create the search session
        const { data: session, error: sessionError } = await supabase
          .from('search_sessions')
          .insert([sessionData]) // Wrap in array as per Supabase requirements
          .select('*')
          .single();

        if (sessionError) {
          console.error('Error creating search session:', {
            error: sessionError,
            data: sessionData
          });
          // Continue execution even if session creation fails
        } else {
          searchSessionId = session.id;
          console.log('Search session created successfully:', {
            sessionId: session.id,
            filters: appliedFilters,
            resultsCount: cars?.length || 0
          });
        }
      } catch (error) {
        console.error('Error in session creation:', error);
      }

      // Set the results regardless of session creation success
      searchResults = cars;

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
