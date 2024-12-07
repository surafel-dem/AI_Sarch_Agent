'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchParams } from '@/components/search/search-params';
import { useRouter } from 'next/navigation';
import { ChatInterface } from '@/components/chat/chat-interface';
import { ChatMessage, CarSpecs } from '@/types/search';
import { invokeSearchAgent } from '@/lib/search-api';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/auth-context';
import { getOrCreateTempUserId } from '@/lib/utils/temp-user';

// Helper to generate clean UUID without hyphens
const generateCleanId = () => uuidv4().replace(/-/g, '');

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [sessionId] = useState(() => generateCleanId());
  const [tempUserId] = useState(() => generateCleanId());

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialSearchRun, setHasInitialSearchRun] = useState(false);

  // Parse selections from URL
  const selections = searchParams.get('selections') 
    ? JSON.parse(searchParams.get('selections')!) 
    : {};

  // Format the selections into a readable string
  const formatFilterText = (specs: CarSpecs): string => {
    const filterParts: string[] = [];
    
    Object.entries(specs).forEach(([key, value]) => {
      if (value) {
        switch(key) {
          case 'make':
            filterParts.push(`Make: ${value}`);
            break;
          case 'model':
            filterParts.push(`Model: ${value}`);
            break;
          case 'minYear':
            filterParts.push(`Min Year: ${value}`);
            break;
          case 'maxYear':
            filterParts.push(`Max Year: ${value}`);
            break;
          case 'minPrice':
            filterParts.push(`Min Price: €${value}`);
            break;
          case 'maxPrice':
            filterParts.push(`Max Price: €${value}`);
            break;
          case 'bodyType':
            filterParts.push(`Body Type: ${value}`);
            break;
          case 'transmission':
            filterParts.push(`Transmission: ${value}`);
            break;
          case 'mileage':
            filterParts.push(`Max Mileage: ${value}km`);
            break;
          case 'features':
            if (Array.isArray(value) && value.length > 0) {
              filterParts.push(`Features: ${value.join(', ')}`);
            }
            break;
          case 'priorities':
            if (Array.isArray(value) && value.length > 0) {
              filterParts.push(`Priorities: ${value.join(', ')}`);
            }
            break;
          case 'mustHaveFeatures':
            if (Array.isArray(value) && value.length > 0) {
              filterParts.push(`Must Have: ${value.join(', ')}`);
            }
            break;
          case 'usage':
            filterParts.push(`Usage: ${value}`);
            break;
          case 'customFeature':
            filterParts.push(`Custom Feature: ${value}`);
            break;
        }
      }
    });
    
    return filterParts.join(', ');
  };

  // Run initial search when component mounts
  useEffect(() => {
    const runInitialSearch = async () => {
      if (hasInitialSearchRun || !Object.keys(selections).length) return;

      setIsLoading(true);
      setHasInitialSearchRun(true);

      const chatInput = formatFilterText(selections);
      
      try {
        const response = await invokeSearchAgent({
          sessionId,
          chatInput,
          carSpecs: selections,
          userId: user?.id || tempUserId,
          timestamp: Date.now()
        });

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.message,
          timestamp: Date.now(),
          userId: user?.id || tempUserId,
          sessionId,
          listings: response.listings,
          sources: response.sources
        };

        setMessages([assistantMessage]);
      } catch (error) {
        console.error('Error in initial search:', error);
        setMessages([{
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your request. Please try again.',
          timestamp: Date.now(),
          userId: user?.id || tempUserId,
          sessionId
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    runInitialSearch();
  }, [selections, sessionId, user, tempUserId, hasInitialSearchRun]);

  const handleMessage = async (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
    setIsLoading(message.role === 'user');
    if (message.role === 'assistant') {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-4xl mx-auto px-4 flex flex-col min-h-full">
          {/* Search Params - Always Visible */}
          <div className="sticky top-0 z-10 bg-white pt-6 pb-4 border-b">
            <SearchParams 
              selections={selections}
              onEdit={() => router.push('/')}
            />
          </div>

          {/* Chat Interface */}
          <div className="flex-1 pt-4">
            <ChatInterface
              initialSpecs={selections}
              messages={messages}
              isLoading={isLoading}
              onMessage={handleMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
