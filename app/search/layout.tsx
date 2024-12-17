'use client';

import { Sidebar } from '@/components/sidebar';
import { useState } from 'react';

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const handleSessionSelect = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        currentSessionId={currentSessionId}
        onSessionSelect={handleSessionSelect}
        messages={messages}
      />
      <div className="flex-1 ml-12 transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
