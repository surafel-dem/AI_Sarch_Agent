AgentService (/lib/services/agent.ts):
Implements a singleton pattern for managing agent communication
Handles:
Rate limiting (10 requests per minute per session)
Payload preparation
Retries with exponential backoff
Response parsing
API Route (/app/api/agent/route.ts):
Provides the HTTP endpoint for agent communication
Acts as a middleware between the frontend and the AgentService
Here's the flow:

Frontend → API Route:
Frontend makes a POST request to /api/agent
Includes payload with user query/filters
API Route → n8n Webhook:
Validates request
Forwards to n8n webhook with auth token
Handles response formatting
AgentService Features:
typescript
CopyInsert
- Rate Limiting:
  - 10 requests per minute per session
  - Prevents abuse of the service

- Payload Preparation:
  - Formats filters and results
  - Structures messages for chat memory
  - Adds metadata and timestamps

- Retry Logic:
  - Exponential backoff
  - Multiple attempts on failure
  - Detailed error logging
Response Handling: Both services handle multiple response formats:
typescript
CopyInsert
{
  // Format 1: Array with output
  [{ output: "response" }]
  
  // Format 2: Direct message
  { message: "response" }
  
  // Format 3: Paired message
  [{ pairedMessage: "response" }]
}
Error Handling:
Network errors
Rate limit exceeded
Invalid response formats
Webhook failures
The integration provides:

Reliable communication with retry logic
Protection against abuse with rate limiting
Consistent response formatting
Robust error handling
Session management
Detailed logging for debugging
