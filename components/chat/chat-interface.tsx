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
    <>
      {/* Messages Area */}
      <div className="w-full h-[calc(100vh-144px)] overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-4 mb-32">
          {messages.map((message, index) => (
            <div key={index} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div className={`max-w-[85%] ${
                message.role === 'user' 
                  ? 'bg-[#2563EB]/10 border-[#2563EB]/20' 
                  : 'bg-[#f8f8f8] border-gray-100'
              } rounded-xl border p-4 my-2 shadow-sm`}>
                {message.role === 'assistant' ? (
                  message.response ? (
                    <SearchOutput response={message.response} />
                  ) : (
                    <p className="text-[#14162E]">{message.content}</p>
                  )
                ) : (
                  <p className="text-[#14162E]">{message.content}</p>
                )}
              </div>
            </div>
          ))}

          {/* AI Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-1 px-4 py-2">
              <div className="w-2 h-2 bg-[#2563EB] rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-[#2563EB] rounded-full animate-pulse delay-75" />
              <div className="w-2 h-2 bg-[#2563EB] rounded-full animate-pulse delay-150" />
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
      </div>
      
      {/* Fixed Chat Input */}
      <div className="fixed inset-x-0 bottom-0 bg-white z-50">
        <div 
          className="absolute inset-x-0 -top-32 h-32 bg-gradient-to-t from-white via-white to-transparent pointer-events-none"
          style={{ maskImage: 'linear-gradient(to top, white, transparent)' }}
        />
        <div className="border-t border-gray-200">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about cars..."
                className="flex-1 rounded-lg border border-gray-100 bg-[#f8f8f8] p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-[#14162E] placeholder:text-[#6B7280]"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#2563EB] hover:bg-[#2563EB]/90 text-white rounded-lg px-4 py-2 transition-colors duration-200"
              >
                Send
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
