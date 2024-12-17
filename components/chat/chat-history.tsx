'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ChatMessage } from '@/types/chat';
import { ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';

interface ChatHistoryProps {
  messages: ChatMessage[];
  currentSessionId?: string;
  onSessionSelect?: (sessionId: string) => void;
  isOpen: boolean;
}

export function ChatHistory({ messages, currentSessionId, onSessionSelect, isOpen }: ChatHistoryProps) {
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/sessions');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch sessions');
        }
        const data = await response.json();
        setSessions(data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch sessions');
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchSessions();
    }
  }, [currentSessionId, isOpen]);

  const formatSessionTitle = (session: any) => {
    if (session.title) return session.title;
    if (session.last_message?.filters) {
      const { make, model } = session.last_message.filters;
      if (make && model) return `${make} ${model} Search`;
      if (make) return `${make} Search`;
    }
    return 'New Chat';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-sm text-gray-500">
          Loading chats
          <span className="inline-flex ml-1">
            <span className="animate-[bounce_1.4s_infinite] [animation-delay:-0.32s]">.</span>
            <span className="animate-[bounce_1.4s_infinite] [animation-delay:-0.16s]">.</span>
            <span className="animate-[bounce_1.4s_infinite]">.</span>
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-32 space-y-2 text-red-500">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm text-center">{error}</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 space-y-2 text-gray-500">
        <MessageSquare className="h-8 w-8" />
        <p className="text-sm">No chat history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sessions.map((session) => (
        <button
          key={session.id}
          onClick={() => onSessionSelect?.(session.id)}
          className={`w-full text-left p-2 rounded-lg transition-colors ${
            session.id === currentSessionId
              ? 'bg-purple-100 text-purple-900'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium truncate">
                {formatSessionTitle(session)}
              </h3>
              {isOpen && (
                <>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {session.last_message?.content || 'No messages'}
                  </p>
                  <span className="text-xs text-gray-400 mt-0.5">
                    {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                  </span>
                </>
              )}
            </div>
            {!isOpen && <ChevronRight className="h-4 w-4 text-gray-400" />}
          </div>
        </button>
      ))}
    </div>
  );
}
