import { WebhookPayload } from '@/types/search';

export async function invokeSearchAgent(payload: WebhookPayload) {
  console.log('Sending search payload:', payload);
  
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: payload.sessionId,
        chatInput: payload.chatInput,
        carSpecs: payload.carSpecs || {}
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Search API error response:', errorText);
      throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Search API response:', data);
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Handle array response format from n8n
    if (Array.isArray(data) && data.length > 0) {
      const response = data[0];
      return {
        message: response.output || response.message || 'No response from the agent.',
        listings: response.listings || [],
        sources: response.sources || []
      };
    }

    // Handle object response format
    return {
      message: data.output || data.message || 'No response from the agent.',
      listings: data.listings || [],
      sources: data.sources || []
    };
  } catch (error) {
    console.error('Error in search request:', error);
    throw error;
  }
}
