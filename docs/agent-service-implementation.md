# Car Sales Agent Service Implementation Guide

## Overview

The Car Sales Agent Service is a robust, production-ready implementation that handles AI-powered car recommendations and user interactions. This document outlines the architecture, implementation details, and best practices used in the service.

## Architecture

The agent service follows these key architectural principles:
1. Singleton Pattern for resource management
2. Rate Limiting for API protection
3. Exponential backoff for retries
4. Clean separation of concerns
5. Type safety
6. Error handling and logging

## Components

### 1. Agent Service (`lib/services/agent.ts`)

#### Core Features

```typescript
class AgentService {
  private static instance: AgentService;
  private readonly maxRetries = 3;
  private readonly limiter: RateLimiter;
}
```

- **Singleton Pattern**: Ensures single instance for resource management
- **Rate Limiting**: Prevents API abuse (100 unique tokens per minute)
- **Retry Logic**: Implements exponential backoff (max 3 retries)

#### Key Methods

1. **getInstance()**
   - Implements thread-safe singleton pattern
   - Creates service instance if not exists
   - Returns existing instance if already created

2. **invoke(sessionId, filters, results, userMessage?)**
   - Entry point for agent interactions
   - Handles rate limiting
   - Prepares payload
   - Makes API request

3. **preparePayload()**
   - Sanitizes input data
   - Removes empty/null values
   - Structures data for API consumption
   - Maps car results to consistent format

4. **makeRequest()**
   - Handles HTTP requests to agent API
   - Implements retry logic with exponential backoff
   - Comprehensive error handling

### 2. Agent API (`app/api/agent/route.ts`)

#### Features

- Next.js API Route implementation
- Secure webhook integration with n8n
- Robust error handling
- Response validation
- Detailed logging

#### Security Measures

1. Authentication:
   ```typescript
   headers: {
     'Authorization': `Bearer ${config.n8n.agentToken}`
   }
   ```

2. Input Validation:
   - Request body validation
   - Response format validation

3. Error Handling:
   - HTTP status code handling
   - Detailed error messages
   - Error logging

## Implementation Details

### Rate Limiting

```typescript
private readonly limiter = rateLimit({
  interval: 60000, // 1 minute
  uniqueTokenPerInterval: 100,
});
```

- Implements token bucket algorithm
- 100 unique tokens per minute
- Per-session rate limiting

### Retry Strategy

```typescript
private async makeRequest(payload: any, attempt = 1): Promise<any> {
  // ... error handling
  if (attempt < this.maxRetries) {
    const delay = Math.pow(2, attempt) * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    return this.makeRequest(payload, attempt + 1);
  }
}
```

- Maximum 3 retry attempts
- Exponential backoff: 2^n seconds
- Prevents overwhelming system during issues

### Data Transformation

```typescript
private preparePayload(sessionId: string, filters: CarSpecs, results: any[], userMessage?: string) {
  // Filter out empty values
  const selectedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);

  // ... rest of payload preparation
}
```

- Removes undefined/null values
- Standardizes data format
- Type-safe transformations

## API Integration (n8n)

### Webhook Configuration

```typescript
const response = await fetch(config.n8n.webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.n8n.agentToken}`
  },
  body: JSON.stringify(payload)
});
```

### Response Handling

```typescript
if (Array.isArray(data) && data.length > 0) {
  const firstItem = data[0];
  return NextResponse.json({
    message: firstItem.output || firstItem.pairedMessage || firstItem,
    error: false
  });
}
```

## Error Handling

### Types of Errors Handled

1. Network Errors
2. Rate Limit Exceeded
3. Invalid Response Format
4. Authentication Errors
5. Timeout Errors

### Error Response Format

```typescript
{
  error: string;
  status: number;
  details?: any;
}
```

## Logging

- Request payload logging
- Response logging
- Error logging with stack traces
- Performance metrics

## Type Definitions

```typescript
interface CarSpecs {
  make?: string;
  features?: string[];
  priorities?: string[];
  mustHaveFeatures?: string[];
  location?: string;
}

interface AgentResponse {
  message: string;
  error: boolean;
  details?: any;
}
```

## Best Practices

1. **Error Handling**
   - Always catch and log errors
   - Provide meaningful error messages
   - Include error context for debugging

2. **Rate Limiting**
   - Implement per-session limits
   - Use token bucket algorithm
   - Configure reasonable limits

3. **Security**
   - Use environment variables for secrets
   - Implement proper authentication
   - Validate input data

4. **Performance**
   - Implement caching where appropriate
   - Use connection pooling
   - Optimize payload size

5. **Monitoring**
   - Log important events
   - Track performance metrics
   - Monitor error rates

## Production Considerations

### 1. Scaling

- Horizontal scaling through stateless design
- Rate limiting per instance
- Distributed caching if needed

### 2. Monitoring

- Implement health checks
- Track response times
- Monitor error rates
- Set up alerts

### 3. Security

- Regular security audits
- API key rotation
- Input sanitization
- Rate limiting

### 4. Performance

- Response time monitoring
- Payload optimization
- Connection pooling
- Caching strategies

## Testing

### Unit Tests

```typescript
describe('AgentService', () => {
  it('should handle rate limiting')
  it('should retry failed requests')
  it('should transform payload correctly')
  it('should handle errors appropriately')
})
```

### Integration Tests

```typescript
describe('Agent API', () => {
  it('should handle valid requests')
  it('should handle invalid tokens')
  it('should handle rate limiting')
  it('should handle n8n errors')
})
```

## Deployment Checklist

1. Environment Variables
   - `N8N_WEBHOOK_URL`
   - `N8N_AGENT_TOKEN`
   - `RATE_LIMIT_TOKENS`
   - `RATE_LIMIT_INTERVAL`

2. Dependencies
   - Next.js
   - Rate limiting package
   - Logging service

3. Monitoring Setup
   - Error tracking
   - Performance monitoring
   - API metrics

4. Security
   - API key rotation plan
   - Rate limit configuration
   - Input validation

## Maintenance

1. Regular Tasks
   - Log rotation
   - API key rotation
   - Performance monitoring
   - Error rate monitoring

2. Updates
   - Dependency updates
   - Security patches
   - Feature updates

3. Backup
   - Configuration backup
   - Log backup
   - Database backup if applicable

## Troubleshooting Guide

### Common Issues

1. Rate Limit Exceeded
   ```
   Solution: Check rate limit configuration and adjust if needed
   ```

2. n8n Connection Failed
   ```
   Solution: Verify webhook URL and token
   ```

3. Invalid Response Format
   ```
   Solution: Check n8n workflow output format
   ```

### Debug Steps

1. Check logs for error messages
2. Verify rate limit configuration
3. Test n8n webhook connection
4. Validate request payload
5. Check response format

## Future Improvements

1. Implement caching layer
2. Add more sophisticated retry strategies
3. Enhance monitoring and metrics
4. Add circuit breaker pattern
5. Implement request queuing

## Support

For issues and support:
1. Check logs first
2. Verify configuration
3. Test rate limits
4. Check n8n workflow
5. Contact support team
