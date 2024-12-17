# Chat History Implementation Guide

Hi! This guide will help you add chat history functionality to the car sales agent app. I'll break it down into clear steps.

## Database Changes

First, we need to add these tables to Supabase:

```sql
-- Chat Sessions table
CREATE TABLE chat_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message JSONB,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Chat Memory table (for storing messages)
CREATE TABLE chat_memory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id),
  user_id UUID REFERENCES users(id),
  message JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES chat_sessions(id),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add indexes for better query performance
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_memory_session_id ON chat_memory(session_id);
```

## Type Definitions

Add these types to your `/types/chat.ts`:

```typescript
export interface LastMessage {
  type: string;
  content?: string;
  filters?: any;
  timestamp: string;
  role?: 'user' | 'assistant';
}

export interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message: LastMessage;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  response?: {
    type: string;
    results?: any[];
    filters?: any;
    message?: string;
    timestamp?: string;
  };
}
```

## API Routes

Create these API endpoints:

### 1. `/api/sessions/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createServerSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerSupabase();
    
    // Get user's UUID from clerk_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all sessions for the user
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userData.id)
      .order('updated_at', { ascending: false });

    if (sessionsError) {
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 2. `/api/sessions/[sessionId]/messages/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerSupabase();

    // Get user's UUID from clerk_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', params.sessionId)
      .eq('user_id', userData.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('chat_memory')
      .select('*')
      .eq('session_id', params.sessionId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Components

### 1. Create ChatHistory Component
Create `/components/chat/chat-history.tsx`:

```typescript
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ChatMessage } from '@/types/chat';

interface ChatHistoryProps {
  messages: ChatMessage[];
  currentSessionId?: string;
  onSessionSelect?: (sessionId: string) => void;
}

export function ChatHistory({ messages, currentSessionId, onSessionSelect }: ChatHistoryProps) {
  const [sessions, setSessions] = React.useState<Session[]>([]);

  React.useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/sessions');
        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }
        const data = await response.json();
        setSessions(data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setSessions([]);
      }
    };

    fetchSessions();
  }, [currentSessionId]);

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              session.id === currentSessionId
                ? 'bg-blue-100 hover:bg-blue-200'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => onSessionSelect?.(session.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-900">
                {session.title || 'Untitled Search'}
              </h3>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
              </span>
            </div>
            {session.last_message && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {session.last_message.content || 'No messages'}
              </p>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
```

### 2. Update Search Page
In your search page, add these state variables:

```typescript
const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
```

Add the session selection handler:

```typescript
const handleSessionSelect = async (sessionId: string) => {
  if (!sessionId) return;
  
  setCurrentSessionId(sessionId);
  setIsLoading(true);

  try {
    const response = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}/messages`);
    if (response.ok) {
      const messages = await response.json();
      setSearchResults([]);
      setChatMessages(messages);
    } else {
      console.error('Failed to fetch session messages:', await response.text());
    }
  } catch (error) {
    console.error('Error fetching session messages:', error);
  } finally {
    setIsLoading(false);
  }
};
```

Add the ChatHistory component to your sidebar:

```tsx
{/* Sidebar */}
<div className="w-64 bg-white border-r border-gray-200 p-4">
  <ChatHistory
    messages={chatMessages}
    currentSessionId={currentSessionId}
    onSessionSelect={handleSessionSelect}
  />
</div>
```

## Dependencies

Make sure you have these packages installed:

```bash
npm install date-fns @radix-ui/react-scroll-area
```

## Styling

Add these Tailwind classes to your `globals.css`:

```css
@layer utilities {
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
```

## Important Notes

1. Make sure you have Clerk authentication set up
2. The Supabase client should be properly configured
3. All database operations should check user ownership
4. Handle loading states and errors appropriately
5. Test the session creation and message retrieval thoroughly

## Testing

Test these scenarios:
1. Creating a new search session
2. Loading existing sessions
3. Switching between sessions
4. Error handling when sessions/messages fail to load
5. UI responsiveness with many sessions

Need any clarification on any part? Let me know!
