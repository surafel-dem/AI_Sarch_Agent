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
        userId: payload.userId,
        sessionId: payload.sessionId,
        chatInput: payload.chatInput,
        carSpecs: payload.carSpecs || {},
        timestamp: payload.timestamp
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

    return data;
  } catch (error) {
    console.error('Error in search request:', error);
    throw error;
  }
}
