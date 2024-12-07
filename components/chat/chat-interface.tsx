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
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const chatInput = inputMessage.trim();
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
      timestamp: Date.now(),
      userId: user?.id || 'anonymous',
      sessionId: sessionId.current
    };

    onMessage(userMessage);
    setInputMessage('');

    try {
      const response = await invokeSearchAgent({
        sessionId: sessionId.current,
        chatInput,
        carSpecs: initialSpecs,
        userId: user?.id || 'anonymous',
        timestamp: Date.now()
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
        userId: user?.id || 'anonymous',
        sessionId: sessionId.current,
        listings: response.listings,
        sources: response.sources
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    await sendMessage();
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
              {message.listings && message.listings.length > 0 && (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {message.listings.map((listing, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      <h3 className="text-lg font-medium mb-2">{listing.title}</h3>
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-blue-600">
                          €{listing.price.toLocaleString()}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {listing.year} • {listing.location}
                        </p>
                        <a 
                          href={listing.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                        >
                          View Details →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-4 text-sm text-gray-500">
                  <p className="font-medium mb-1">Sources:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    {message.sources.map((source, index) => (
                      <li key={index}>
                        <a 
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
        <form onSubmit={handleSubmit} className="flex items-center bg-white rounded-2xl shadow-sm">
          <div className="flex-1 flex items-center pl-4">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask follow up..."
              className="flex-1 px-3 py-3.5 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 placeholder:text-gray-400 text-[15px]"
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading || !inputMessage.trim()}
            className="mx-2 px-6 py-2 rounded-xl bg-[#A7C7FF] hover:bg-[#96B8FF] text-[#2D63E2] font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 relative">
                <div className="absolute inset-0 border-2 border-[#2D63E2]/20 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-r-transparent border-[#2D63E2] animate-spin rounded-full"></div>
              </div>
            ) : (
              'Send'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
