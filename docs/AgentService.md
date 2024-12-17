# Agent Service Documentation

## Overview
The Agent Service is a core component of the Car Sales Agent application that handles communication with the n8n AI agent webhook. It provides a secure, reliable, and rate-limited interface for AI-assisted car search functionality.

## Architecture

### Service Layer
The Agent Service follows the Singleton pattern and implements a three-tier architecture:
1. Service Interface (`invoke` method)
2. Payload Preparation (`preparePayload` method)
3. Request Handling (`makeRequest` method)

### API Route
A dedicated Next.js API route (`/api/agent`) handles the secure communication with the n8n webhook, keeping sensitive information server-side.

## Implementation Details

### AgentService Class

#### Initialization
```typescript
const agentService = AgentService.getInstance();
```

#### Rate Limiting
- 10 requests per minute per session
- Implemented using a token bucket algorithm
- Configurable through the rate limit utility

#### Retry Mechanism
- Maximum 3 retry attempts
- Exponential backoff delay: 2^attempt * 1000ms
- Automatic retry on network errors

### Payload Structure

#### Request Payload
```typescript
{
  sessionId: string;
  chatInput: string;
  carSpecs: {
    make: string;
    features: string[];
    priorities: string[];
    mustHaveFeatures: string[];
    location: string;
  };
  results: Array<{
    id: string;
    title: string;
    price: number;
    details: {
      make: string;
      model: string;
      year: number;
      price: number;
      location: string;
      transmission: string | null;
      description: string;
    };
  }>;
}
```

#### Response Format
```typescript
{
  message: string;
  error: boolean;
}
```

### Error Handling

#### Types of Errors
1. Rate Limiting Errors
   - Error: "Too many requests. Please try again later."
   - Status: 429

2. API Errors
   - Network errors (retried automatically)
   - Invalid response format
   - n8n webhook errors

3. Validation Errors
   - Invalid payload format
   - Missing required fields

### Usage Examples

#### Basic Usage
```typescript
try {
  const response = await agentService.invoke(
    sessionId,
    filters,
    searchResults,
    userMessage
  );
  console.log(response.message);
} catch (error) {
  console.error('Agent error:', error);
}
```

#### With Error Handling
```typescript
try {
  const response = await agentService.invoke(
    sessionId,
    filters,
    searchResults,
    userMessage
  );
  
  if (response.error) {
    // Handle error response
    console.error('Agent error:', response.message);
    return;
  }

  // Handle successful response
  console.log('Agent response:', response.message);
} catch (error) {
  // Handle unexpected errors
  console.error('Unexpected error:', error);
}
```

## Security Considerations

### API Security
- Authentication token stored server-side
- Rate limiting to prevent abuse
- Input validation and sanitization

### Error Handling
- No sensitive information in error messages
- Proper logging of errors
- Graceful degradation

## Testing

### Unit Tests
Located in `lib/services/__tests__/agent.test.ts`
- Tests basic functionality
- Tests error handling
- Tests retry mechanism
- Tests rate limiting

### Manual Testing Steps
1. Test basic search functionality
2. Test rate limiting by making multiple requests
3. Test error handling with invalid inputs
4. Test retry mechanism by temporarily disabling the n8n webhook

## Monitoring and Debugging

### Logging
The service includes comprehensive logging:
- Request payloads
- Response data
- Error details
- Retry attempts

### Debugging Tips
1. Check the browser console for client-side logs
2. Check server logs for API route errors
3. Verify n8n webhook connectivity
4. Monitor rate limiting counters

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_AGENT_TOKEN=your_token_here
```

### Rate Limiting Configuration
```typescript
{
  interval: 60000,  // 1 minute
  uniqueTokenPerInterval: 100
}
```

### Retry Configuration
```typescript
{
  maxRetries: 3,
  baseDelay: 1000  // 1 second
}
```
