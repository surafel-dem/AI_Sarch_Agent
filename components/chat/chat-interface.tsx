'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CarSpecs } from '@/types/car';
import { ChatMessage } from '@/types/chat';
import { SearchFilters } from '@/types/search';
import { Chat } from './chat';
import { Button } from '@/components/ui/button';
import { SearchOutput } from '../search/search-output';
import { v4 as uuidv4 } from 'uuid';
import { X, Home, MessageSquarePlus, Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChatHistory } from './chat-history';
import { useAuth } from '@/contexts/auth-context';
import { AgentService } from '@/lib/services/agent';

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
  const [isOpen, setIsOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const chatInput = inputMessage.trim();
    console.log('Submitting chat message:', chatInput);
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
      // Get agent service instance
      const agentService = AgentService.getInstance();
      
      console.log('Invoking agent service with message:', chatInput);
      const response = await agentService.invoke(
        sessionId.current,
        initialSpecs,
        [], // Empty results array for chat-only messages
        chatInput // Pass the user's message
      );

      console.log('Received agent response:', response);

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
      console.error('Error in chat submission:', error);
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
    <div className="flex flex-col h-full">
      <aside
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 z-40 w-64 bg-white border-r border-gray-100 transition-transform duration-200 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          <nav className="flex-1 overflow-y-auto py-2">
            <div className="flex flex-col mb-2">
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-800"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <button
                onClick={() => {
                  setCurrentSessionId(undefined);
                  router.push('/');
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-800 text-left"
              >
                <MessageSquarePlus className="h-4 w-4" />
                <span>New Chat</span>
              </button>
              <Link
                href="/favorites"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-800"
              >
                <Heart className="h-4 w-4" />
                <span>Favorites</span>
              </Link>
            </div>

            <div className="h-px bg-gray-100 mx-3 my-2" />

            <ChatHistory
              messages={messages}
              currentSessionId={currentSessionId}
              onSessionSelect={(id) => {
                setCurrentSessionId(id);
                router.push(`/?session=${id}`);
              }}
              isOpen={isOpen}
            />
          </nav>
        </div>
      </aside>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-6">
          {/* Messages */}
          {messages.map((message, index) => (
            <div key={index} className={`flex items-start gap-2 ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                  AI
                </div>
              )}
              <div className={`rounded-2xl p-4 max-w-[80%] ${
                message.role === 'assistant' 
                  ? 'bg-gray-100 dark:bg-gray-800' 
                  : 'bg-blue-600 text-white'
              }`}>
                {message.content}
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-sm font-medium">
                  U
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                AI
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
      </div>
      
      {/* Fixed Chat Input */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (inputMessage.trim() && !isLoading) {
                    handleSubmit(e as any);
                  }
                }
              }}
              placeholder="Message the AI assistant..."
              className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !inputMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-medium transition-colors duration-200"
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
