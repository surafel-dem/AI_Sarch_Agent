'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { CarSpecs, ChatMessage } from '@/types/search';
import { invokeSearchAgent } from '@/lib/search-api';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { v4 as uuidv4 } from 'uuid';

interface ChatInterfaceProps {
  initialSpecs: CarSpecs;
  initialQuery?: string;
  messages: ChatMessage[];
  isLoading: boolean;
}

export function ChatInterface({ initialSpecs, initialQuery, messages: initialMessages, isLoading: initialLoadingState }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(initialLoadingState);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(uuidv4());
  const hasInitialSearchRun = useRef(false);

  useEffect(() => {
    // Run initial search if there's a query or specs
    if (!hasInitialSearchRun.current && (initialQuery || (initialSpecs && Object.keys(initialSpecs).length > 0))) {
      handleInitialSearch();
      hasInitialSearchRun.current = true;
    }
  }, [initialQuery, initialSpecs]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
        }
      }
    });
    
    return filterParts.join(', ');
  };

  const handleInitialSearch = async () => {
    setIsLoading(true);
    try {
      const payload = {
        sessionId: sessionId.current,
        chatInput: initialQuery || formatFilterText(initialSpecs),
        carSpecs: initialSpecs
      };

      console.log('Initial search payload:', payload);
      const response = await invokeSearchAgent(payload);

      setMessages([{
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      }]);
    } catch (error) {
      console.error('Error in initial search:', error);
      setMessages([{
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      const payload = {
        sessionId: sessionId.current,
        chatInput: content,
        carSpecs: initialSpecs
      };

      console.log('Sending chat message:', payload);
      const response = await invokeSearchAgent(payload);

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response,
          timestamp: Date.now(),
        },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your request. Please try again.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: inputMessage,
      timestamp: Date.now(),
    }]);
    setInputMessage('');
    await sendMessage(inputMessage);
  };

  return (
    <div className="relative">
      {/* Messages */}
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div key={index} className="flex justify-start">
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2 ${
                message.role === 'assistant'
                  ? 'bg-gray-50 text-gray-900'
                  : 'bg-purple-50 text-purple-900'
              }`}
            >
              <ReactMarkdown
                className={`prose max-w-none ${message.role === 'assistant' ? 'text-gray-900' : 'text-purple-900'}`}
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} className="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer" />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 p-4">
            <div className="w-1.5 h-1.5 bg-purple-300 rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-purple-300 rounded-full animate-bounce delay-100" />
            <div className="w-1.5 h-1.5 bg-purple-300 rounded-full animate-bounce delay-200" />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <div className="fixed bottom-6 left-0 right-0 mx-auto max-w-4xl px-4">
        <div className="bg-white ring-1 ring-gray-200 rounded-2xl shadow-sm">
          <form onSubmit={handleSubmit} className="flex items-center">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a follow-up question..."
              className="flex-1 px-4 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-400 text-sm"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !inputMessage.trim()}
              className="mr-2 px-4 py-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 relative">
                  <div className="absolute inset-0 border-2 border-purple-200 border-opacity-20 rounded-full"></div>
                  <div className="absolute inset-0 border-2 border-r-transparent border-purple-600 animate-spin rounded-full"></div>
                </div>
              ) : (
                'Send'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
