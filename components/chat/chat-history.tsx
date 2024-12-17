'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ChatMessage } from '@/types/chat';
import { ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

interface ChatHistoryProps {
  messages: ChatMessage[];
  currentSessionId?: string;
  onSessionSelect?: (sessionId: string) => void;
  isOpen: boolean;
}

interface Message {
  type: string;
  content: string;
  metadata?: any;
  filters?: {
    make?: string;
    model?: string;
    location?: string;
  };
}

interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message: Message | null;
}

export function ChatHistory({ messages, currentSessionId, onSessionSelect, isOpen }: ChatHistoryProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchSessions = async () => {
      if (!isLoaded || !isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        console.log('Fetching sessions...');
        const response = await fetch('/api/sessions');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('Server response error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          throw new Error(`Server responded with ${response.status}: ${errorData?.error || response.statusText}`);
        }

        const data = await response.json();
        console.log('Received sessions data:', data);

        if (!Array.isArray(data)) {
          console.error('Invalid response format:', data);
          throw new Error('Invalid response format from server');
        }

        const transformedSessions = data.map(session => ({
          ...session,
          last_message: session.last_message ? {
            type: session.last_message.type || 'system',
            content: session.last_message.content || '',
            filters: session.last_message.filters || {},
            metadata: session.last_message.metadata || {}
          } : null
        }));

        console.log('Transformed sessions:', transformedSessions);
        setSessions(transformedSessions);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chat history');
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchSessions();
    }
  }, [isOpen, isLoaded, isSignedIn]);

  const formatSessionTitle = (session: Session) => {
    if (session.title && session.title !== 'New Chat') return session.title;
    
    // Try to get filters from the last message
    if (session.last_message?.filters) {
      const { make, model, location } = session.last_message.filters;
      if (make && model && location) return `${make} ${model} in ${location}`;
      if (make && model) return `${make} ${model} Search`;
      if (make) return `${make} Search`;
      if (location) return `Search in ${location}`;
    }
    
    return session.title || 'New Chat';
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-sm text-gray-500">Please sign in to view chat history</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2 text-red-500">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm text-center">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-500">
        <MessageSquare className="h-8 w-8" />
        <p className="text-sm text-center">No chat history</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {sessions.map((session) => (
        <button
          key={session.id}
          onClick={() => onSessionSelect?.(session.id)}
          className={`w-full px-3 py-2 text-left hover:bg-gray-800/5 transition-colors ${
            session.id === currentSessionId ? 'bg-gray-800/5' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5 flex-grow min-w-0">
              <h3 className="text-sm text-gray-800 truncate">
                {formatSessionTitle(session)}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {session.last_message?.content || 'No messages'}
              </p>
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(session.updated_at || session.created_at), { addSuffix: true })}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
          </div>
        </button>
      ))}
    </div>
  );
}
