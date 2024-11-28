# Car Search AI API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Webhooks](#webhooks)
5. [Error Handling](#error-handling)

## Overview

The Car Search AI API is built using Next.js 14 API routes and integrates with Supabase for authentication and data storage. It provides endpoints for user authentication, car search functionality, and email services.

## Authentication

### Supabase Authentication

Our application uses Supabase's passwordless authentication with magic links. The authentication flow follows the PKCE (Proof Key for Code Exchange) protocol for enhanced security.

```typescript
// Authentication Flow
1. User enters email
2. System generates magic link
3. User clicks magic link
4. PKCE verification
5. Session established
```

### Session Management

Sessions are managed automatically by Supabase client:

```typescript
// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Session handling is automatic
const {
  data: { session },
} = await supabase.auth.getSession()
```

## API Endpoints

### 1. Email Service

#### Test Email
```typescript
POST /api/email/test
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Test Email",
  "text": "This is a test email"
}

Response:
{
  "success": true,
  "messageId": "..."
}
```

### 2. Authentication Callback

```typescript
GET /auth/callback
Query Parameters:
- code: string
- next: string (optional)

Response: Redirects to homepage or specified next URL
```

### 3. Car Search

The car search functionality is implemented through the main chat interface component, which processes natural language queries and returns structured car data.

Message Types:
```typescript
interface Message {
  id: number
  type: 'text' | 'markdown' | 'filter_selection'
  content: string
  sender: 'user' | 'bot'
}

interface CarSpecs {
  make: string
  model: string
  year: string
  county: string
  minPrice: string
  maxPrice: string
}

interface Car {
  id: string
  make: string
  model: string
  year: string
  price: string
  location: string
  dealerStatus: string
  description: string
  url?: string
}
```

## Webhooks

### 1. Agent Invocation Webhook

#### Endpoint
```typescript
POST https://n8n.yotor.co/webhook/invoke_agent
```

#### Headers
```typescript
{
  "Authorization": "Bearer ${NEXT_PUBLIC_AGENT_TOKEN}",
  "Content-Type": "application/json"
}
```

#### Request Body
```typescript
interface InvokeAgentRequest {
  sessionId: string;     // Unique session identifier
  chatInput: string;     // User's message
  resetContext: boolean; // Whether to reset conversation context
}
```

#### Response Format
```typescript
{
  success: boolean;
  data?: {
    response: string;
    // Additional response data
  };
  error?: string;
}
```

#### Usage Example
```typescript
const invokeAgent = async (text: string, fullText: string) => {
  try {
    // Update user stats if first message
    if (!sessionStarted && user) {
      await updateUserStats();
      setSessionStarted(true);
    }

    // Update last seen timestamp
    if (user) {
      await updateLastSeen();
    }

    const response = await fetch('https://n8n.yotor.co/webhook/invoke_agent', {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_AGENT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: sessionId,
        chatInput: fullText,
        resetContext: false
      })
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    // Handle response...
  } catch (error) {
    // Error handling...
  }
};
```

#### Features
1. **Session Management**
   - Unique session ID per conversation
   - Context preservation between messages
   - Optional context reset

2. **User Tracking**
   - Updates user statistics
   - Tracks conversation history
   - Maintains last seen timestamp

3. **Error Handling**
   - Network error handling
   - Response validation
   - Error message propagation

### 2. Email Service Webhooks

#### 1. Test Email Webhook
```typescript
GET /api/email/test

Response Success:
{
  "success": true,
  "data": {
    "id": "string",
    "to": "recipient@email.com"
  }
}

Response Error:
{
  "success": false,
  "error": "Failed to send test email"
}
```

#### 2. Email Service Configuration
```typescript
// Email Service Integration
interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

// Response Type
interface EmailResponse {
  success: boolean;
  data?: {
    id: string;
    to: string;
  };
  error?: string;
}
```

### Webhook Security
1. **Authentication**
   - Bearer token authentication (`NEXT_PUBLIC_AGENT_TOKEN`)
   - Environment-based token management
   - Session validation

2. **Rate Limiting**
   - Request throttling
   - Concurrent session limits
   - User-based quotas

3. **Data Validation**
   - Input sanitization
   - Session verification
   - Response validation

### Implementation Guidelines
1. **Session Handling**
   - Generate unique session IDs using `nanoid()`
   - Maintain session state
   - Handle session expiry

2. **Error Management**
   - Implement retry logic
   - Log error details
   - Provide user feedback

3. **Performance Optimization**
   - Request debouncing
   - Response caching
   - Connection pooling

### Monitoring and Analytics
1. **Usage Tracking**
   - Message counts via Supabase
   - Session duration tracking
   - User engagement metrics

2. **Error Tracking**
   - Error rates monitoring
   - Response times logging
   - Success/failure metrics

3. **Performance Metrics**
   - API latency monitoring
   - Success rate tracking
   - Resource utilization metrics

### Database Schema
```sql
-- User Statistics Table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  total_conversations INTEGER DEFAULT 0,
  total_searches INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  last_seen_at TIMESTAMP WITH TIME ZONE
);

-- Trigger for updating last_seen
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_seen_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Stats Update Example
```typescript
const updateUserStats = async () => {
  if (!user) return;

  try {
    const { data: userData } = await supabase
      .from('users')
      .select('total_conversations, total_searches, message_count')
      .eq('id', user.id)
      .single();

    if (userData) {
      await supabase
        .from('users')
        .update({
          total_conversations: userData.total_conversations + 1,
          total_searches: userData.total_searches + 1,
          message_count: (userData.message_count || 0) + 1,
          last_seen_at: new Date().toISOString()
        })
        .eq('id', user.id);
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};
```

## Error Handling

### Authentication Errors

```typescript
// Common authentication error types
- InvalidCredentials
- SessionExpired
- InvalidEmail
- RateLimitExceeded

// Error response format
{
  "error": {
    "code": "string",
    "message": "string",
    "details": object (optional)
  }
}
```

### API Error Responses

All API endpoints follow a consistent error response format:

```typescript
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "status": 400 | 401 | 403 | 404 | 500
}
```

Common HTTP Status Codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Development Guidelines

### Environment Variables

Required environment variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_email_service_key
OPENAI_API_KEY=your_openai_api_key
```

### API Security

1. Authentication
   - All authenticated routes are protected by Supabase middleware
   - PKCE flow for enhanced security
   - Automatic session management

2. Data Protection
   - Input validation on all endpoints
   - Rate limiting on authentication attempts
   - Row Level Security (RLS) in Supabase

3. Error Handling
   - Consistent error response format
   - Detailed error messages in development
   - Sanitized error messages in production
