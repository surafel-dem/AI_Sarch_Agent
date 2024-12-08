'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { CarSpecs, ChatMessage, SearchResponse } from '@/types/search';
import { invokeSearchAgent } from '@/lib/search-api';
import { Button } from '@/components/ui/button';
import { SearchOutput } from '../search/search-output';
import { v4 as uuidv4 } from 'uuid';

interface ChatInterfaceProps {
  initialSpecs: CarSpecs;
  messages: ChatMessage[];
  isLoading: boolean;
  onMessage: (message: ChatMessage) => void;
}

export function ChatInterface({ 
  initialSpecs, 
  messages, 
  isLoading,
  onMessage 
}: ChatInterfaceProps) {
  const { user } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const sessionId = useRef(uuidv4());
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const chatInput = inputMessage.trim();
    setInputMessage('');
    
    // Send user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
      timestamp: Date.now(),
      userId: user?.id || 'anonymous',
      sessionId: sessionId.current
    };
    onMessage(userMessage);

    try {
      // Get response from API
      const response = await invokeSearchAgent({
        sessionId: sessionId.current,
        chatInput,
        carSpecs: initialSpecs,
        userId: user?.id || 'anonymous',
        timestamp: Date.now()
      });

      // Transform webhook response to SearchResponse type
      let searchResponse: SearchResponse;
      if (response.type === 'car_listing' && response.results?.length > 0) {
        searchResponse = {
          type: 'car_listing',
          status: 'success',
          matches: response.results.length,
          results: response.results
        };
      } else {
        searchResponse = {
          type: 'text',
          content: response.message || 'No results found'
        };
      }

      // Create assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
        userId: user?.id || 'anonymous',
        sessionId: sessionId.current,
        response: searchResponse
      };

      onMessage(assistantMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      onMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: Date.now(),
        userId: user?.id || 'anonymous',
        sessionId: sessionId.current
      });
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pb-36">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {messages.map((message, index) => (
            <div key={index} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div className={`max-w-[85%] ${message.role === 'user' ? 'bg-blue-50' : 'bg-white'} rounded-xl border border-gray-200 p-4 my-2`}>
                {message.role === 'assistant' ? (
                  message.response ? (
                    <SearchOutput response={message.response} />
                  ) : (
                    <p className="text-gray-700">{message.content}</p>
                  )
                ) : (
                  <p className="text-gray-700">{message.content}</p>
                )}
              </div>
            </div>
          ))}

          {/* AI Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-white rounded-xl border border-gray-200 p-4 my-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-75" />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
      </div>
      
      {/* Fixed Chat Input */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-gradient-to-t from-white via-white to-transparent h-32 pointer-events-none absolute inset-x-0 -top-32" />
        <div className="bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about cars..."
                className="flex-1 rounded-lg border border-gray-200 p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-colors duration-200"
              >
                Send
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
